from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from .models import (
    UserRole, EmergencyType, Priority, IncidentStatus,
    AmbulanceStatus, HospitalStatus, ResourceCategory
)

# -------------------- Auth & User Schemas --------------------
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: UserRole = UserRole.CITIZEN
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: str
    is_active: bool = True
    created_at: str

class UserUpdateRole(BaseModel):
    role: UserRole

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

# -------------------- Incident Schemas --------------------
class TimelineEntry(BaseModel):
    stage: str
    title: str
    description: str
    timestamp: str
    updated_by: Optional[str] = None

class IncidentCreate(BaseModel):
    emergency_type: EmergencyType
    description: str = Field(..., min_length=5)
    priority: Priority = Priority.HIGH
    location: str = Field(..., min_length=2)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    caller_phone: Optional[str] = None

class IncidentUpdate(BaseModel):
    priority: Optional[Priority] = None
    status: Optional[IncidentStatus] = None
    assigned_ambulance_id: Optional[str] = None
    assigned_hospital_id: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    notes: Optional[str] = None

class IncidentAssignAmbulance(BaseModel):
    ambulance_id: str

class IncidentAssignHospital(BaseModel):
    hospital_id: str

class IncidentOut(BaseModel):
    id: str
    emergency_type: EmergencyType
    description: str
    priority: Priority
    status: IncidentStatus
    location: str
    latitude: float
    longitude: float
    caller_phone: Optional[str] = None
    reported_by_id: Optional[str] = None
    reported_by_name: Optional[str] = None
    assigned_ambulance_id: Optional[str] = None
    assigned_ambulance_vehicle: Optional[str] = None
    assigned_ambulance_driver: Optional[str] = None
    assigned_hospital_id: Optional[str] = None
    assigned_hospital_name: Optional[str] = None
    created_at: str
    updated_at: str
    timeline: List[TimelineEntry] = []
    response_time_minutes: Optional[int] = None

# -------------------- Ambulance Schemas --------------------
class AmbulanceBase(BaseModel):
    vehicle_number: str
    driver: str
    status: AmbulanceStatus = AmbulanceStatus.AVAILABLE
    latitude: float
    longitude: float
    phone: Optional[str] = None
    base_location: Optional[str] = None

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    driver: Optional[str] = None
    status: Optional[AmbulanceStatus] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    current_incident_id: Optional[str] = None
    base_location: Optional[str] = None

class AmbulanceAssign(BaseModel):
    incident_id: str

class AmbulanceOut(AmbulanceBase):
    id: str
    current_incident_id: Optional[str] = None
    distance_km: Optional[float] = None

# -------------------- Hospital Schemas --------------------
class HospitalBase(BaseModel):
    name: str
    location: str
    available_beds: int = Field(..., ge=0)
    icu_beds: int = Field(..., ge=0)
    total_beds: int = Field(..., ge=0)
    emergency_capacity: str = "HIGH"
    status: HospitalStatus = HospitalStatus.AVAILABLE
    latitude: float
    longitude: float
    contact_number: Optional[str] = None
    medical_resources: List[str] = []

class HospitalCreate(HospitalBase):
    pass

class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    available_beds: Optional[int] = None
    icu_beds: Optional[int] = None
    total_beds: Optional[int] = None
    emergency_capacity: Optional[str] = None
    status: Optional[HospitalStatus] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_number: Optional[str] = None
    medical_resources: Optional[List[str]] = None

class HospitalCapacityUpdate(BaseModel):
    available_beds: int = Field(..., ge=0)
    icu_beds: int = Field(..., ge=0)
    emergency_capacity: Optional[str] = "HIGH"
    status: Optional[HospitalStatus] = HospitalStatus.AVAILABLE

class HospitalOut(HospitalBase):
    id: str
    distance_km: Optional[float] = None
    match_score: Optional[float] = None

# -------------------- Resource Schemas --------------------
class ResourceBase(BaseModel):
    name: str
    category: ResourceCategory
    quantity: int = Field(..., ge=0)
    unit: str = "Units"
    hospital_id: str
    hospital_name: str
    status: str = "ADEQUATE"

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    quantity: Optional[int] = None
    status: Optional[str] = None

class ResourceOut(ResourceBase):
    id: str
    last_updated: str

# -------------------- Notification Schemas --------------------
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "INFO"
    incident_id: Optional[str] = None

class NotificationCreate(NotificationBase):
    target_role: Optional[str] = None
    target_user_id: Optional[str] = None

class NotificationOut(NotificationBase):
    id: str
    target_role: Optional[str] = None
    target_user_id: Optional[str] = None
    is_read: bool = False
    created_at: str

# -------------------- Analytics Schemas --------------------
class OverviewStats(BaseModel):
    total_emergencies: int
    active_emergencies: int
    critical_emergencies: int
    available_ambulances: int
    busy_ambulances: int
    available_hospital_beds: int
    resolved_emergencies: int
    average_response_time_minutes: float
    ambulance_utilization_rate: float

class EmergencyTypeStat(BaseModel):
    name: str
    count: int

class PriorityStat(BaseModel):
    priority: str
    count: int

class StatusStat(BaseModel):
    status: str
    count: int

class TrendStat(BaseModel):
    date: str
    emergencies: int
    resolved: int
