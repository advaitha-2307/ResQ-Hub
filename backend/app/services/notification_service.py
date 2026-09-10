import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from ..data import notifications_db
from ..websocket import manager

async def create_notification(
    title: str,
    message: str,
    notif_type: str = "INFO",
    incident_id: Optional[str] = None,
    target_role: Optional[str] = None,
    target_user_id: Optional[str] = None
) -> Dict[str, Any]:
    notif_id = f"NOTIF-{len(notifications_db) + 401}"
    new_notif = {
        "id": notif_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "incident_id": incident_id,
        "target_role": target_role,
        "target_user_id": target_user_id,
        "is_read": False,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    # Prepend to keep newest first
    notifications_db.insert(0, new_notif)

    # Broadcast notification to connected clients
    await manager.broadcast({
        "type": "NOTIFICATION_ADDED",
        "notification": new_notif
    })

    return new_notif
