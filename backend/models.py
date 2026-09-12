from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Incident(Base):
    """
    SQLAlchemy Model representing the 'incidents' table in PostgreSQL.
    This model defines the table structure stored in the database.
    """
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_type = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    priority = Column(String(20), nullable=False, index=True)
    description = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
