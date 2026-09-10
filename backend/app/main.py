import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .routers import (
    auth, incidents, ambulances, hospitals,
    resources, notifications, users, analytics
)
from .websocket import manager

load_dotenv()

app = FastAPI(
    title="ResQ Hub API",
    description="Intelligent Emergency Response & Resource Coordination Platform Backend API",
    version="1.0.0"
)

# Parse allowed origins from environment
env_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [o.strip() for o in env_origins.split(",") if o.strip()]
if "http://localhost:5173" not in origins:
    origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in origins:
    origins.append("http://127.0.0.1:5173")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(ambulances.router)
app.include_router(hospitals.router)
app.include_router(resources.router)
app.include_router(notifications.router)
app.include_router(users.router)
app.include_router(analytics.router)

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Keep connection open and listen for any heartbeat or client pings
        while True:
            data = await websocket.receive_text()
            # If client sends ping, respond with pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "app": "ResQ Hub API",
        "status": "Online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ResQ Hub"}
