from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..schemas import ResourceCreate, ResourceUpdate, ResourceOut
from ..data import resources_db, hospitals_db
from ..dependencies import get_current_user, require_roles
from ..websocket import manager

router = APIRouter(prefix="/api/resources", tags=["Resources"])

@router.get("", response_model=List[ResourceOut])
async def get_resources(
    category: Optional[str] = Query(None),
    hospital_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    results = list(resources_db)
    if category:
        results = [r for r in results if r["category"].lower() == category.lower()]
    if hospital_id:
        results = [r for r in results if r["hospital_id"] == hospital_id]
    return results

@router.get("/{id}", response_model=ResourceOut)
async def get_resource(id: str, current_user: dict = Depends(get_current_user)):
    res = next((r for r in resources_db if r["id"] == id), None)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    return res

@router.post("", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
async def create_resource(
    res_in: ResourceCreate,
    current_user: dict = Depends(require_roles("ADMIN", "HOSPITAL_STAFF"))
):
    res_id = f"RES-{len(resources_db) + 301}"
    now_str = datetime.utcnow().isoformat() + "Z"
    new_res = {
        "id": res_id,
        "name": res_in.name,
        "category": res_in.category.value,
        "quantity": res_in.quantity,
        "unit": res_in.unit,
        "hospital_id": res_in.hospital_id,
        "hospital_name": res_in.hospital_name,
        "status": res_in.status,
        "last_updated": now_str
    }
    resources_db.append(new_res)

    await manager.broadcast({
        "type": "RESOURCE_CREATED",
        "resource": new_res
    })

    return new_res

@router.put("/{id}", response_model=ResourceOut)
async def update_resource(
    id: str,
    res_update: ResourceUpdate,
    current_user: dict = Depends(require_roles("ADMIN", "HOSPITAL_STAFF"))
):
    res = next((r for r in resources_db if r["id"] == id), None)
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    if res_update.quantity is not None:
        res["quantity"] = res_update.quantity
        if res["quantity"] <= 5:
            res["status"] = "CRITICAL_LOW"
        elif res["quantity"] <= 15:
            res["status"] = "LOW"
        else:
            res["status"] = "ADEQUATE"

    if res_update.status is not None:
        res["status"] = res_update.status

    res["last_updated"] = datetime.utcnow().isoformat() + "Z"

    await manager.broadcast({
        "type": "RESOURCE_UPDATED",
        "resource": res
    })

    return res
