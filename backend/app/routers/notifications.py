from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..schemas import NotificationOut
from ..data import notifications_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
async def get_notifications(
    unread_only: Optional[bool] = Query(False),
    current_user: dict = Depends(get_current_user)
):
    results = []
    user_role = current_user.get("role")
    user_id = current_user.get("id")

    for notif in notifications_db:
        # Check target audience
        target_role = notif.get("target_role")
        target_user_id = notif.get("target_user_id")

        if target_user_id and target_user_id != user_id:
            continue
        if target_role and target_role != user_role and user_role != "ADMIN":
            continue

        if unread_only and notif.get("is_read"):
            continue

        results.append(notif)

    return results

@router.put("/{id}/read", response_model=NotificationOut)
async def mark_as_read(id: str, current_user: dict = Depends(get_current_user)):
    notif = next((n for n in notifications_db if n["id"] == id), None)
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notif["is_read"] = True
    return notif

@router.put("/read-all/mark")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    count = 0
    for notif in notifications_db:
        target_role = notif.get("target_role")
        target_user_id = notif.get("target_user_id")
        if target_user_id and target_user_id != user_id:
            continue
        if target_role and target_role != user_role and user_role != "ADMIN":
            continue
        if not notif.get("is_read"):
            notif["is_read"] = True
            count += 1
    return {"message": f"{count} notifications marked as read."}
