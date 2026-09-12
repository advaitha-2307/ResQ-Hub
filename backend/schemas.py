from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class IncidentBase(BaseModel):
    """
    Base Pydantic model with shared incident fields.
    Pydantic ensures data validation and type checking for requests and responses.
    """
    incident_type: str = Field(..., description="Category of emergency (Medical, Fire, Flood, Accident, Disaster)")
    location: str = Field(..., description="Address or GPS location")
    priority: str = Field(..., description="Priority (Low, Medium, High, Critical)")
    description: str = Field(..., description="Detailed description of the emergency")
    status: str = Field(default="Pending", description="Status (Pending, In Progress, Resolved, Cancelled)")

class IncidentCreate(IncidentBase):
    """
    Schema for creating a new incident (POST request payload).
    Inherits all fields from IncidentBase.
    """
    pass

class IncidentUpdate(BaseModel):
    """
    Schema for updating an existing incident (PUT request payload).
    All fields are optional to allow partial updates.
    """
    incident_type: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class IncidentResponse(IncidentBase):
    """
    Schema for returning incident records in API responses.
    Includes database-generated fields like id, created_at, updated_at.
    """
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to convert SQLAlchemy ORM models into JSON
