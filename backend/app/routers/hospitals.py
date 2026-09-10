from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..schemas import (
    HospitalCreate, HospitalUpdate, HospitalCapacityUpdate, HospitalOut
)
from ..data import hospitals_db
from ..dependencies import get_current_user, require_roles
from ..websocket import manager
from ..services.notification_service import create_notification

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

@router.get("", response_model=List[HospitalOut])
async def get_hospitals(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user)
):
    if status_filter:
        return [h for h in hospitals_db if h["status"].upper() == status_filter.upper()]
    return hospitals_db

@router.get("/{id}", response_model=HospitalOut)
async def get_hospital(id: str, current_user: dict = Depends(get_current_user)):
    hosp = next((h for h in hospitals_db if h["id"] == id), None)
    if not hosp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found.")
    return hosp

@router.post("", response_model=HospitalOut, status_code=status.HTTP_201_CREATED)
async def create_hospital(
    hosp_in: HospitalCreate,
    current_user: dict = Depends(require_roles("ADMIN"))
):
    hosp_id = f"HOSP-{len(hospitals_db) + 201}"
    new_hosp = {
        "id": hosp_id,
        "name": hosp_in.name,
        "location": hosp_in.location,
        "available_beds": hosp_in.available_beds,
        "icu_beds": hosp_in.icu_beds,
        "total_beds": hosp_in.total_beds,
        "emergency_capacity": hosp_in.emergency_capacity,
        "status": hosp_in.status.value,
        "latitude": hosp_in.latitude,
        "longitude": hosp_in.longitude,
        "contact_number": hosp_in.contact_number or "",
        "medical_resources": hosp_in.medical_resources or []
    }
    hospitals_db.append(new_hosp)

    await manager.broadcast({
        "type": "HOSPITAL_CREATED",
        "hospital": new_hosp
    })

    return new_hosp

@router.put("/{id}", response_model=HospitalOut)
async def update_hospital(
    id: str,
    hosp_update: HospitalUpdate,
    current_user: dict = Depends(require_roles("ADMIN", "HOSPITAL_STAFF"))
):
    hosp = next((h for h in hospitals_db if h["id"] == id), None)
    if not hosp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found.")

    if hosp_update.name is not None:
        hosp["name"] = hosp_update.name
    if hosp_update.location is not None:
        hosp["location"] = hosp_update.location
    if hosp_update.available_beds is not None:
        hosp["available_beds"] = hosp_update.available_beds
    if hosp_update.icu_beds is not None:
        hosp["icu_beds"] = hosp_update.icu_beds
    if hosp_update.total_beds is not None:
        hosp["total_beds"] = hosp_update.total_beds
    if hosp_update.emergency_capacity is not None:
        hosp["emergency_capacity"] = hosp_update.emergency_capacity
    if hosp_update.status is not None:
        hosp["status"] = hosp_update.status.value
    if hosp_update.latitude is not None:
        hosp["latitude"] = hosp_update.latitude
    if hosp_update.longitude is not None:
        hosp["longitude"] = hosp_update.longitude
    if hosp_update.contact_number is not None:
        hosp["contact_number"] = hosp_update.contact_number
    if hosp_update.medical_resources is not None:
        hosp["medical_resources"] = hosp_update.medical_resources

    await manager.broadcast({
        "type": "HOSPITAL_UPDATED",
        "hospital": hosp
    })

    return hosp

@router.put("/{id}/capacity", response_model=HospitalOut)
async def update_hospital_capacity(
    id: str,
    capacity_in: HospitalCapacityUpdate,
    current_user: dict = Depends(require_roles("ADMIN", "HOSPITAL_STAFF"))
):
    hosp = next((h for h in hospitals_db if h["id"] == id), None)
    if not hosp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found.")

    hosp["available_beds"] = capacity_in.available_beds
    hosp["icu_beds"] = capacity_in.icu_beds

    # Auto-adjust status if available beds is 0
    if capacity_in.status:
        hosp["status"] = capacity_in.status.value
    elif hosp["available_beds"] == 0:
        hosp["status"] = "FULL"
    elif hosp["available_beds"] < 5:
        hosp["status"] = "LIMITED"
    else:
        hosp["status"] = "AVAILABLE"

    if capacity_in.emergency_capacity:
        hosp["emergency_capacity"] = capacity_in.emergency_capacity

    # Notify dispatchers if status is FULL
    if hosp["status"] == "FULL":
        await create_notification(
            title=f"Hospital Capacity Alert: {hosp['name']}",
            message=f"{hosp['name']} has reached maximum emergency bed capacity.",
            notif_type="WARNING",
            target_role="DISPATCHER"
        )

    await manager.broadcast({
        "type": "HOSPITAL_CAPACITY_UPDATED",
        "hospital_id": hosp["id"],
        "available_beds": hosp["available_beds"],
        "icu_beds": hosp["icu_beds"],
        "status": hosp["status"],
        "emergency_capacity": hosp["emergency_capacity"]
    })

    return hosp
