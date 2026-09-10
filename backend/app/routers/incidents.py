from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..schemas import (
    IncidentCreate, IncidentUpdate, IncidentStatusUpdate,
    IncidentOut, IncidentAssignAmbulance, IncidentAssignHospital
)
from ..data import incidents_db, ambulances_db, hospitals_db
from ..dependencies import get_current_user, require_roles
from ..websocket import manager
from ..services.ambulance_service import (
    get_recommended_ambulances, assign_ambulance_to_incident
)
from ..services.hospital_service import (
    get_recommended_hospitals, assign_hospital_to_incident
)
from ..services.notification_service import create_notification

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentOut])
async def get_incidents(
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    emergency_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    my_incidents: Optional[bool] = Query(False),
    current_user: dict = Depends(get_current_user)
):
    results = list(incidents_db)

    # If citizen specifies my_incidents or is citizen role requesting only their reported emergencies
    if current_user["role"] == "CITIZEN" and my_incidents:
        results = [inc for inc in results if inc.get("reported_by_id") == current_user["id"]]

    if priority:
        results = [inc for inc in results if inc["priority"].upper() == priority.upper()]
    if status:
        results = [inc for inc in results if inc["status"].upper() == status.upper()]
    if emergency_type:
        results = [inc for inc in results if inc["emergency_type"].lower() == emergency_type.lower()]
    if search:
        s = search.lower()
        results = [
            inc for inc in results
            if s in inc["id"].lower()
            or s in inc["location"].lower()
            or s in inc["emergency_type"].lower()
            or s in inc["description"].lower()
        ]

    # Return newest first
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_incident(
    incident_in: IncidentCreate,
    current_user: dict = Depends(get_current_user)
):
    incident_id = f"INC-{len(incidents_db) + 1001}"
    now_str = datetime.utcnow().isoformat() + "Z"

    timeline = [
        {
            "stage": "REPORTED",
            "title": "Emergency Reported",
            "description": f"Incident reported at {incident_in.location}. Caller: {incident_in.caller_phone or current_user.get('phone', 'N/A')}.",
            "timestamp": now_str,
            "updated_by": current_user["name"]
        }
    ]

    new_incident = {
        "id": incident_id,
        "emergency_type": incident_in.emergency_type.value,
        "description": incident_in.description,
        "priority": incident_in.priority.value,
        "status": "REPORTED",
        "location": incident_in.location,
        "latitude": incident_in.latitude,
        "longitude": incident_in.longitude,
        "caller_phone": incident_in.caller_phone or current_user.get("phone", ""),
        "reported_by_id": current_user["id"],
        "reported_by_name": current_user["name"],
        "assigned_ambulance_id": None,
        "assigned_ambulance_vehicle": None,
        "assigned_ambulance_driver": None,
        "assigned_hospital_id": None,
        "assigned_hospital_name": None,
        "created_at": now_str,
        "updated_at": now_str,
        "timeline": timeline,
        "response_time_minutes": None
    }
    incidents_db.insert(0, new_incident)

    # Find nearest available ambulance recommendation
    recommended_ambulances = get_recommended_ambulances(incident_in.latitude, incident_in.longitude, limit=3)

    # Notify dispatchers
    await create_notification(
        title=f"{incident_in.priority.value} Emergency: {incident_in.emergency_type.value}",
        message=f"New incident {incident_id} reported at {incident_in.location}. Nearest ambulance: {recommended_ambulances[0]['id'] if recommended_ambulances else 'None available'}.",
        notif_type="CRITICAL" if incident_in.priority.value == "CRITICAL" else "HIGH",
        incident_id=incident_id,
        target_role="DISPATCHER"
    )

    # WebSocket broadcast
    await manager.broadcast({
        "type": "INCIDENT_CREATED",
        "incident": new_incident,
        "recommended_ambulance": recommended_ambulances[0] if recommended_ambulances else None
    })

    return {
        "incident": new_incident,
        "recommended_ambulances": recommended_ambulances,
        "message": "Emergency successfully created and dispatched to coordination desk."
    }

@router.get("/{id}", response_model=IncidentOut)
async def get_incident(id: str, current_user: dict = Depends(get_current_user)):
    incident = next((inc for inc in incidents_db if inc["id"] == id), None)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    return incident

@router.put("/{id}", response_model=IncidentOut)
async def update_incident(
    id: str,
    update_data: IncidentUpdate,
    current_user: dict = Depends(get_current_user)
):
    incident = next((inc for inc in incidents_db if inc["id"] == id), None)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    now_str = datetime.utcnow().isoformat() + "Z"
    old_status = incident["status"]

    if update_data.priority:
        incident["priority"] = update_data.priority.value
    if update_data.description:
        incident["description"] = update_data.description
    if update_data.status:
        incident["status"] = update_data.status.value
        # Add to timeline
        incident["timeline"].append({
            "stage": update_data.status.value,
            "title": f"Status updated to {update_data.status.value}",
            "description": update_data.notes or f"Incident status transitioned from {old_status} to {update_data.status.value}.",
            "timestamp": now_str,
            "updated_by": current_user["name"]
        })

        if update_data.status.value == "RESOLVED":
            # calculate response time if possible
            if not incident.get("response_time_minutes"):
                incident["response_time_minutes"] = 7
            # free ambulance if assigned
            if incident.get("assigned_ambulance_id"):
                amb = next((a for a in ambulances_db if a["id"] == incident["assigned_ambulance_id"]), None)
                if amb:
                    amb["status"] = "AVAILABLE"
                    amb["current_incident_id"] = None

    incident["updated_at"] = now_str

    await manager.broadcast({
        "type": "INCIDENT_UPDATED",
        "incident_id": incident["id"],
        "status": incident["status"],
        "priority": incident["priority"],
        "updated_at": incident["updated_at"]
    })

    return incident

@router.post("/{id}/assign-ambulance")
async def assign_ambulance(
    id: str,
    payload: IncidentAssignAmbulance,
    current_user: dict = Depends(require_roles("DISPATCHER", "ADMIN"))
):
    try:
        updated = await assign_ambulance_to_incident(id, payload.ambulance_id, current_user["name"])
        return {"success": True, "incident": updated}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{id}/assign-hospital")
async def assign_hospital(
    id: str,
    payload: IncidentAssignHospital,
    current_user: dict = Depends(require_roles("DISPATCHER", "ADMIN"))
):
    try:
        updated = await assign_hospital_to_incident(id, payload.hospital_id, current_user["name"])
        return {"success": True, "incident": updated}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{id}/recommended-ambulances")
async def get_incident_recommended_ambulances(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    incident = next((inc for inc in incidents_db if inc["id"] == id), None)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    recommendations = get_recommended_ambulances(incident["latitude"], incident["longitude"], limit=5)
    return recommendations

@router.get("/{id}/recommended-hospitals")
async def get_incident_recommended_hospitals(
    id: str,
    current_user: dict = Depends(get_current_user)
):
    incident = next((inc for inc in incidents_db if inc["id"] == id), None)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    recommendations = get_recommended_hospitals(incident["latitude"], incident["longitude"], limit=5)
    return recommendations

@router.delete("/{id}")
async def delete_incident(
    id: str,
    current_user: dict = Depends(require_roles("ADMIN"))
):
    incident = next((inc for inc in incidents_db if inc["id"] == id), None)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    incidents_db.remove(incident)
    await manager.broadcast({
        "type": "INCIDENT_DELETED",
        "incident_id": id
    })
    return {"message": f"Incident {id} successfully deleted."}
