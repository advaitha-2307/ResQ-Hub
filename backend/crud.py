from sqlalchemy.orm import Session
from models import Incident
from schemas import IncidentCreate, IncidentUpdate
from datetime import datetime

def get_incidents(db: Session, skip: int = 0, limit: int = 100, status: str = None, priority: str = None):
    """
    Fetch all incidents from the database with optional filtering and pagination.
    """
    query = db.query(Incident)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if priority and priority != "All":
        query = query.filter(Incident.priority == priority)
    return query.order_by(Incident.id.desc()).offset(skip).limit(limit).all()

def get_incident_by_id(db: Session, incident_id: int):
    """
    Fetch a single incident by its primary key ID.
    """
    return db.query(Incident).filter(Incident.id == incident_id).first()

def create_incident(db: Session, incident: IncidentCreate):
    """
    Insert a new incident record into PostgreSQL database.
    """
    db_incident = Incident(
        incident_type=incident.incident_type,
        location=incident.location,
        priority=incident.priority,
        description=incident.description,
        status=incident.status
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

def update_incident(db: Session, incident_id: int, incident_update: IncidentUpdate):
    """
    Update fields of an existing incident in PostgreSQL.
    """
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        return None
    
    update_data = incident_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_incident, key, value)
    
    db_incident.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_incident)
    return db_incident

def delete_incident(db: Session, incident_id: int):
    """
    Delete an incident record from PostgreSQL.
    """
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        return False
    
    db.delete(db_incident)
    db.commit()
    return True
