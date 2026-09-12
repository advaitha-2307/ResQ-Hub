from database import SessionLocal, engine, Base
from models import Incident
import crud
import schemas

def seed_database():
    """
    Populates initial sample emergency incidents into the database if empty.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    count = db.query(Incident).count()
    if count == 0:
        print("[SEED] Seeding initial emergency incidents into database...")
        sample_incidents = [
            schemas.IncidentCreate(
                incident_type="Fire",
                location="Building 4, Tech Park, Sector 62",
                priority="Critical",
                description="Electrical short circuit resulting in severe fire on 3rd floor.",
                status="In Progress"
            ),
            schemas.IncidentCreate(
                incident_type="Medical",
                location="Crossroads Mall, Main Atrium",
                priority="High",
                description="Elderly visitor collapsed with cardiac symptoms. First aid team dispatched.",
                status="Pending"
            ),
            schemas.IncidentCreate(
                incident_type="Accident",
                location="Highway Interchange 14",
                priority="Medium",
                description="Multi-vehicle traffic collision causing lane blockage.",
                status="Resolved"
            ),
            schemas.IncidentCreate(
                incident_type="Flood",
                location="Low-lying residential Area, Zone 3",
                priority="High",
                description="Waterlogging following heavy rainfall damaging local drainage.",
                status="Pending"
            )
        ]
        
        for inc in sample_incidents:
            crud.create_incident(db, inc)
        print("[SEED] Database seeded successfully with sample incidents!")
    else:
        print(f"[SEED] Database already contains {count} incidents.")
    
    db.close()

if __name__ == "__main__":
    seed_database()
