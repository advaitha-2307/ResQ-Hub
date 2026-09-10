from typing import List, Dict, Any
from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from ..schemas import (
    OverviewStats, EmergencyTypeStat, PriorityStat, StatusStat, TrendStat
)
from ..data import incidents_db, ambulances_db, hospitals_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=OverviewStats)
async def get_overview(current_user: dict = Depends(get_current_user)):
    total = len(incidents_db)
    active = len([i for i in incidents_db if i["status"] not in ["RESOLVED", "CANCELLED"]])
    critical = len([i for i in incidents_db if i["priority"] == "CRITICAL" and i["status"] != "CANCELLED"])
    resolved = len([i for i in incidents_db if i["status"] == "RESOLVED"])

    avail_amb = len([a for a in ambulances_db if a["status"] == "AVAILABLE"])
    busy_amb = len([a for a in ambulances_db if a["status"] in ["ASSIGNED", "BUSY"]])
    total_amb = len(ambulances_db) or 1
    utilization = round((busy_amb / total_amb) * 100, 1)

    avail_beds = sum(h["available_beds"] for h in hospitals_db)

    # Average response time
    response_times = [i["response_time_minutes"] for i in incidents_db if i.get("response_time_minutes")]
    avg_response = round(sum(response_times) / len(response_times), 1) if response_times else 6.5

    return {
        "total_emergencies": total,
        "active_emergencies": active,
        "critical_emergencies": critical,
        "available_ambulances": avail_amb,
        "busy_ambulances": busy_amb,
        "available_hospital_beds": avail_beds,
        "resolved_emergencies": resolved,
        "average_response_time_minutes": avg_response,
        "ambulance_utilization_rate": utilization
    }

@router.get("/emergency-types", response_model=List[EmergencyTypeStat])
async def get_emergency_types(current_user: dict = Depends(get_current_user)):
    counts = Counter(i["emergency_type"] for i in incidents_db)
    return [{"name": k, "count": v} for k, v in counts.items()]

@router.get("/priority", response_model=List[PriorityStat])
async def get_priority_distribution(current_user: dict = Depends(get_current_user)):
    counts = Counter(i["priority"] for i in incidents_db)
    order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    return [{"priority": p, "count": counts.get(p, 0)} for p in order if counts.get(p, 0) > 0]

@router.get("/status", response_model=List[StatusStat])
async def get_status_distribution(current_user: dict = Depends(get_current_user)):
    counts = Counter(i["status"] for i in incidents_db)
    order = ["REPORTED", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "HOSPITAL_REACHED", "RESOLVED", "CANCELLED"]
    return [{"status": s, "count": counts.get(s, 0)} for s in order if counts.get(s, 0) > 0]

@router.get("/trends", response_model=List[TrendStat])
async def get_trends(current_user: dict = Depends(get_current_user)):
    # Generate past 7 days trend data
    trends = [
        {"date": "Sep 04", "emergencies": 3, "resolved": 3},
        {"date": "Sep 05", "emergencies": 4, "resolved": 3},
        {"date": "Sep 06", "emergencies": 6, "resolved": 5},
        {"date": "Sep 07", "emergencies": 5, "resolved": 4},
        {"date": "Sep 08", "emergencies": 8, "resolved": 7},
        {"date": "Sep 09", "emergencies": 9, "resolved": 8},
        {"date": "Sep 10", "emergencies": len([i for i in incidents_db if "2026-09-10" in i.get("created_at", "")]), "resolved": len([i for i in incidents_db if "2026-09-10" in i.get("created_at", "") and i["status"] == "RESOLVED"])}
    ]
    return trends
