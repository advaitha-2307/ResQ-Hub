import math
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..data import ambulances_db, incidents_db
from ..websocket import manager
from .notification_service import create_notification

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the earth in kilometers.
    """
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def get_recommended_ambulances(lat: float, lon: float, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Return available ambulances sorted by geographic proximity to the incident location.
    """
    available = [amb for amb in ambulances_db if amb["status"] == "AVAILABLE"]
    results = []
    for amb in available:
        dist = haversine_distance(lat, lon, amb["latitude"], amb["longitude"])
        amb_copy = amb.copy()
        amb_copy["distance_km"] = dist
        results.append(amb_copy)
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]

async def assign_ambulance_to_incident(incident_id: str, ambulance_id: str, user_name: str = "Dispatcher") -> Dict[str, Any]:
    incident = next((inc for inc in incidents_db if inc["id"] == incident_id), None)
    if not incident:
        raise ValueError("Incident not found")
    ambulance = next((amb for amb in ambulances_db if amb["id"] == ambulance_id), None)
    if not ambulance:
        raise ValueError("Ambulance not found")
    if ambulance["status"] not in ["AVAILABLE", "ASSIGNED"]:
        raise ValueError(f"Ambulance is currently {ambulance['status']} and cannot be assigned")

    # If ambulance was already assigned to another incident, unassign previous or handle
    ambulance["status"] = "ASSIGNED"
    ambulance["current_incident_id"] = incident_id

    # Update incident
    incident["assigned_ambulance_id"] = ambulance["id"]
    incident["assigned_ambulance_vehicle"] = ambulance["vehicle_number"]
    incident["assigned_ambulance_driver"] = ambulance["driver"]
    if incident["status"] in ["REPORTED", "VERIFIED"]:
        incident["status"] = "ASSIGNED"
    incident["updated_at"] = datetime.utcnow().isoformat() + "Z"

    # Add timeline step
    timeline_entry = {
        "stage": "ASSIGNED",
        "title": "Ambulance Assigned",
        "description": f"Assigned ambulance {ambulance['id']} ({ambulance['vehicle_number']}) driven by {ambulance['driver']}.",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "updated_by": user_name
    }
    incident["timeline"].append(timeline_entry)

    # Trigger notification & websocket
    await create_notification(
        title=f"Ambulance Assigned: {ambulance['id']}",
        message=f"Ambulance {ambulance['vehicle_number']} dispatched to {incident['location']} for {incident['id']}.",
        notif_type="ASSIGNED",
        incident_id=incident_id
    )

    await manager.broadcast({
        "type": "AMBULANCE_ASSIGNED",
        "incident_id": incident_id,
        "ambulance_id": ambulance_id,
        "status": incident["status"],
        "timestamp": incident["updated_at"]
    })

    return incident
