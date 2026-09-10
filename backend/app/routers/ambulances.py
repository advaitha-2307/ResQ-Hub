from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..schemas import (
    AmbulanceCreate, AmbulanceUpdate, AmbulanceOut, AmbulanceAssign
)
from ..data import ambulances_db, incidents_db
from ..dependencies import get_current_user, require_roles
from ..websocket import manager

router = APIRouter(prefix="/api/ambulances", tags=["Ambulances"])

@router.get("", response_model=List[AmbulanceOut])
async def get_ambulances(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user)
):
    if status_filter:
        return [amb for amb in ambulances_db if amb["status"].upper() == status_filter.upper()]
    return ambulances_db

@router.get("/available", response_model=List[AmbulanceOut])
async def get_available_ambulances(current_user: dict = Depends(get_current_user)):
    return [amb for amb in ambulances_db if amb["status"] == "AVAILABLE"]

@router.post("", response_model=AmbulanceOut, status_code=status.HTTP_201_CREATED)
async def create_ambulance(
    amb_in: AmbulanceCreate,
    current_user: dict = Depends(require_roles("ADMIN", "DISPATCHER"))
):
    amb_id = f"AMB-{len(ambulances_db) + 101}"
    new_amb = {
        "id": amb_id,
        "vehicle_number": amb_in.vehicle_number,
        "driver": amb_in.driver,
        "status": amb_in.status.value,
        "latitude": amb_in.latitude,
        "longitude": amb_in.longitude,
        "phone": amb_in.phone or "",
        "base_location": amb_in.base_location or "Central Emergency Base",
        "current_incident_id": None
    }
    ambulances_db.append(new_amb)

    await manager.broadcast({
        "type": "AMBULANCE_CREATED",
        "ambulance": new_amb
    })

    return new_amb

@router.get("/{id}", response_model=AmbulanceOut)
async def get_ambulance(id: str, current_user: dict = Depends(get_current_user)):
    amb = next((a for a in ambulances_db if a["id"] == id), None)
    if not amb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ambulance not found.")
    return amb

@router.put("/{id}", response_model=AmbulanceOut)
async def update_ambulance(
    id: str,
    amb_update: AmbulanceUpdate,
    current_user: dict = Depends(require_roles("ADMIN", "DISPATCHER"))
):
    amb = next((a for a in ambulances_db if a["id"] == id), None)
    if not amb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ambulance not found.")

    if amb_update.vehicle_number is not None:
        amb["vehicle_number"] = amb_update.vehicle_number
    if amb_update.driver is not None:
        amb["driver"] = amb_update.driver
    if amb_update.status is not None:
        amb["status"] = amb_update.status.value
    if amb_update.latitude is not None:
        amb["latitude"] = amb_update.latitude
    if amb_update.longitude is not None:
        amb["longitude"] = amb_update.longitude
    if amb_update.phone is not None:
        amb["phone"] = amb_update.phone
    if amb_update.base_location is not None:
        amb["base_location"] = amb_update.base_location
    if amb_update.current_incident_id is not None:
        amb["current_incident_id"] = amb_update.current_incident_id

    await manager.broadcast({
        "type": "AMBULANCE_UPDATED",
        "ambulance": amb
    })

    return amb

@router.post("/{id}/assign")
async def assign_ambulance_action(
    id: str,
    payload: AmbulanceAssign,
    current_user: dict = Depends(require_roles("ADMIN", "DISPATCHER"))
):
    amb = next((a for a in ambulances_db if a["id"] == id), None)
    if not amb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ambulance not found.")
    incident = next((i for i in incidents_db if i["id"] == payload.incident_id), None)
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    amb["status"] = "ASSIGNED"
    amb["current_incident_id"] = payload.incident_id

    incident["assigned_ambulance_id"] = amb["id"]
    incident["assigned_ambulance_vehicle"] = amb["vehicle_number"]
    incident["assigned_ambulance_driver"] = amb["driver"]
    incident["status"] = "ASSIGNED"

    await manager.broadcast({
        "type": "AMBULANCE_ASSIGNED",
        "ambulance_id": amb["id"],
        "incident_id": payload.incident_id
    })

    return {"success": True, "ambulance": amb, "incident": incident}
