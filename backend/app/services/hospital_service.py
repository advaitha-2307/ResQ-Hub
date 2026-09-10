import math
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..data import hospitals_db, incidents_db
from ..websocket import manager
from .notification_service import create_notification
from .ambulance_service import haversine_distance

def get_recommended_hospitals(lat: float, lon: float, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Recommend hospitals scored by distance, bed availability, and status.
    """
    scored = []
    for hosp in hospitals_db:
        dist = haversine_distance(lat, lon, hosp["latitude"], hosp["longitude"])
        hosp_copy = hosp.copy()
        hosp_copy["distance_km"] = dist

        # Scoring heuristic:
        # Distance weight: closer is better (100 - dist * 3)
        # Beds weight: 2 points per available bed
        # Status weight: AVAILABLE: +50, LIMITED: +10, FULL: -100
        dist_score = max(0, 100 - (dist * 4))
        bed_score = min(50, hosp["available_beds"] * 2)
        status_score = 50 if hosp["status"] == "AVAILABLE" else (15 if hosp["status"] == "LIMITED" else -100)
        
        total_score = round(dist_score + bed_score + status_score, 1)
        hosp_copy["match_score"] = total_score
        scored.append(hosp_copy)

    # Sort descending by match score
    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:limit]

async def assign_hospital_to_incident(incident_id: str, hospital_id: str, user_name: str = "Dispatcher") -> Dict[str, Any]:
    incident = next((inc for inc in incidents_db if inc["id"] == incident_id), None)
    if not incident:
        raise ValueError("Incident not found")
    hospital = next((hosp for hosp in hospitals_db if hosp["id"] == hospital_id), None)
    if not hospital:
        raise ValueError("Hospital not found")
    if hospital["status"] == "FULL" or hospital["available_beds"] <= 0:
        raise ValueError(f"Hospital {hospital['name']} has no emergency beds available")

    # Assign hospital
    incident["assigned_hospital_id"] = hospital["id"]
    incident["assigned_hospital_name"] = hospital["name"]
    incident["updated_at"] = datetime.utcnow().isoformat() + "Z"

    # Add timeline step
    timeline_entry = {
        "stage": "HOSPITAL_SELECTED",
        "title": "Hospital Selected",
        "description": f"Allocated destination to {hospital['name']} (Available Beds: {hospital['available_beds']}).",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "updated_by": user_name
    }
    incident["timeline"].append(timeline_entry)

    # Create notifications for hospital staff and dispatcher
    await create_notification(
        title=f"Hospital Selected: {hospital['name']}",
        message=f"Incident {incident['id']} casualties redirected to {hospital['name']}.",
        notif_type="HOSPITAL",
        incident_id=incident_id,
        target_role="HOSPITAL_STAFF"
    )

    await manager.broadcast({
        "type": "HOSPITAL_ASSIGNED",
        "incident_id": incident_id,
        "hospital_id": hospital_id,
        "hospital_name": hospital["name"],
        "timestamp": incident["updated_at"]
    })

    return incident
