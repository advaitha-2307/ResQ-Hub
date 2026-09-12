import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database connection settings
# Default PostgreSQL URL for local setup: postgresql://username:password@localhost:5432/database_name
# Change user/password if needed via environment variable DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/resqhub_db")

# Fallback SQLite database for offline or local testing if PostgreSQL service is not active
SQLITE_FALLBACK_URL = "sqlite:///./resqhub.db"

def get_engine():
    """
    Creates SQLAlchemy database engine.
    Tries PostgreSQL connection first. If unavailable, falls back to local SQLite
    to guarantee that your Review 2 live demonstration always works seamlessly!
    """
    if DATABASE_URL.startswith("postgresql"):
        try:
            engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            # Test direct connection
            with engine.connect() as conn:
                pass
            print(f"[DATABASE SUCCESS] Connected to PostgreSQL: {DATABASE_URL}")
            return engine, "PostgreSQL"
        except Exception as err:
            print(f"[DATABASE WARNING] PostgreSQL unavailable ({err}). Using SQLite fallback for Review 2 demo.")
    
    # SQLite engine fallback
    engine = create_engine(SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False})
    print(f"[DATABASE SUCCESS] Connected to SQLite database: {SQLITE_FALLBACK_URL}")
    return engine, "SQLite"

engine, DB_TYPE = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    FastAPI Dependency: Yields a database session per request and closes it afterwards.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
