from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    DISPATCHER = "DISPATCHER"
    HOSPITAL_STAFF = "HOSPITAL_STAFF"
    ADMIN = "ADMIN"

class EmergencyType(str, Enum):
    ACCIDENT = "Accident"
    FIRE = "Fire"
    MEDICAL = "Medical Emergency"
    CARDIAC = "Cardiac Emergency"
    DISASTER = "Natural Disaster"
    CRIME = "Crime"
    OTHER = "Other"

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentStatus(str, Enum):
    REPORTED = "REPORTED"
    VERIFIED = "VERIFIED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    HOSPITAL_REACHED = "HOSPITAL_REACHED"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"

class AmbulanceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    BUSY = "BUSY"
    MAINTENANCE = "MAINTENANCE"

class HospitalStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LIMITED = "LIMITED"
    FULL = "FULL"

class ResourceCategory(str, Enum):
    MEDICAL_SUPPLIES = "Medical Supplies"
    OXYGEN = "Oxygen"
    BLOOD_UNITS = "Blood Units"
    EMERGENCY_KITS = "Emergency Kits"
    VENTILATORS = "Ventilators"
    FIRST_AID_KITS = "First Aid Kits"
