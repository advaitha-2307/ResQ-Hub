# ResQ Hub – Intelligent Emergency Response & Resource Coordination Platform

**ResQ Hub** is a mission-critical, real-time emergency response and healthcare resource coordination platform. It bridges the critical time-gap between emergency reporting and field paramedic response by interconnecting **Citizens**, **Emergency Dispatchers**, **Ambulance Fleets**, and **Network Hospitals**.

---

## 🚀 Key Features

- **Multi-Role Coordination Matrix**:
  - **Citizen**: Instant emergency reporting with automated GPS coordinates, live response tracking, and notifications.
  - **Dispatcher**: Command operations dashboard, nearest-ambulance proximity dispatch, and dynamic hospital allocation.
  - **Hospital Staff**: Real-time bed occupancy, ICU telemetry updates, diversion status, and incoming casualty notifications.
  - **Administrator**: Comprehensive oversight, fleet configuration, hospital registry, resource distribution, and user role management.

- **Intelligent Geolocation Allocation**:
  - Proximity calculation using the Earth-radius Haversine algorithm.
  - Recommends the nearest available ambulance to the caller's coordinates (in km).
  - Scores destination hospitals dynamically based on travel distance, available emergency beds, and trauma capability.

- **Real-Time WebSocket Pipeline**:
  - Bi-directional telemetry over `/ws`.
  - Immediate operational broadcasts whenever incidents are created, ambulances are dispatched, or hospital diversion status changes.
  - Non-blocking client-side toast notifications and live view re-synchronization without manual reloads.

- **Visual Operations Analytics**:
  - Powered by Recharts.
  - Daily emergency trends, category distributions, triage priority breakdowns, and hospital capacity comparison charts.

- **Database-Ready Clean Architecture**:
  - Strict separation of business logic (`services/`), data transfer schemas (`schemas.py`), route endpoints (`routers/`), and mock datasets (`data.py`).
  - Seamless migration path to PostgreSQL, MongoDB, and Redis without modifying API contracts.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 with Vite (Pure JavaScript, No TypeScript) |
| **Routing & Client** | React Router v6 & Axios with JWT Interceptors |
| **Visual Design** | Pure Modern CSS (Glassmorphic cards, responsive grid, emergency accents) |
| **Analytics & Icons** | Recharts & Lucide React |
| **Backend Framework** | Python 3.10+ / FastAPI / Uvicorn |
| **Data Validation** | Pydantic v2 & Email Validator |
| **Security** | JSON Web Tokens (python-jose) & Password Hashing (bcrypt) |
| **Real-Time Stream** | Native FastAPI WebSocket Protocol |

---

## 📂 Project Structure

```
DBMS project/
│
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                     # FastAPI application & WebSocket endpoint
│       ├── auth.py                     # Password hashing & JWT management
│       ├── models.py                   # Enums & core model representations
│       ├── schemas.py                  # Pydantic request & response validation
│       ├── data.py                     # Realistic Hyderabad demonstration datasets
│       ├── websocket.py                # WebSocket client connection manager
│       ├── dependencies.py             # Auth dependencies & RBAC security guards
│       │
│       ├── routers/
│       │   ├── auth.py                 # /api/auth (login, register, me)
│       │   ├── incidents.py            # /api/incidents (CRUD & triage)
│       │   ├── ambulances.py           # /api/ambulances (fleet status)
│       │   ├── hospitals.py            # /api/hospitals (bed capacity)
│       │   ├── resources.py            # /api/resources (supplies & oxygen)
│       │   ├── analytics.py            # /api/analytics (charts & metrics)
│       │   ├── notifications.py        # /api/notifications (broadcasts)
│       │   └── users.py                # /api/users (role management)
│       │
│       └── services/
│           ├── ambulance_service.py    # Haversine nearest-ambulance algorithm
│           ├── hospital_service.py     # Multi-metric hospital scoring algorithm
│           └── notification_service.py # System alerts & notification generator
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx              # Navigation header with live alerts
│       │   ├── Sidebar.jsx             # Role-tailored collapsible navigation
│       │   ├── StatCard.jsx            # Operational KPI metric card
│       │   ├── StatusBadge.jsx         # Pipeline lifecycle pill
│       │   ├── PriorityBadge.jsx       # Severity priority indicator
│       │   ├── IncidentTable.jsx       # Sortable & filterable incident table
│       │   ├── AmbulanceCard.jsx       # Vehicle fleet unit card
│       │   ├── HospitalCard.jsx        # Bed capacity & occupancy meter
│       │   ├── NotificationPanel.jsx   # Live alert drop-down list
│       │   └── ProtectedRoute.jsx      # Authentication & RBAC guard
│       │
│       ├── pages/
│       │   ├── Login.jsx               # Sign in with 1-click demo accounts
│       │   ├── Register.jsx            # Multi-role account onboarding
│       │   ├── Dashboard.jsx           # Command operations center
│       │   ├── Incidents.jsx           # Filterable emergency queue
│       │   ├── CreateIncident.jsx      # Emergency dispatch with Hyderabad presets
│       │   ├── IncidentDetails.jsx     # Live incident lifecycle & assignment
│       │   ├── Ambulances.jsx          # Ambulance fleet tracking & deployment
│       │   ├── Hospitals.jsx           # Network hospital bed management
│       │   ├── Resources.jsx           # Critical medical inventory (oxygen, blood)
│       │   ├── Notifications.jsx       # Full notification feed
│       │   ├── Analytics.jsx           # Recharts visual operational metrics
│       │   ├── Profile.jsx             # User credentials & privilege matrix
│       │   ├── Users.jsx               # Admin role authorization console
│       │   └── NotFound.jsx            # 404 handler
│       │
│       ├── services/
│       │   └── api.js                  # Axios client & REST services
│       │
│       ├── context/
│       │   └── AuthContext.jsx         # Global user state & WebSocket listener
│       │
│       ├── App.jsx                     # Router config & layout shell
│       ├── main.jsx                    # React entry point
│       └── styles/
│           └── global.css              # Emergency operations theme & tokens
│
└── README.md
```

---

## 🔑 Demo Accounts

All pre-configured demo accounts share the password:

```
ResqHub@123
```

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **System Administrator** | `admin@resqhub.com` | `ResqHub@123` | Full dashboard, user roles, ambulances, hospitals, resources |
| **Emergency Dispatcher** | `dispatcher@resqhub.com` | `ResqHub@123` | All incidents, proximity dispatch, hospital selection, analytics |
| **Hospital Staff** | `hospital@resqhub.com` | `ResqHub@123` | Incoming emergencies, bed capacity updater, resource inventory |
| **Citizen** | `citizen@resqhub.com` | `ResqHub@123` | Report emergency, track status, view own incidents |

*(Note: The login page includes 1-click demo buttons to automatically populate these credentials).*

---

## 💻 Local Setup & Run Commands (Windows / VS Code)

### 1. Backend Setup

Open a terminal in the root project directory:

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
venv\Scripts\activate

# If PowerShell script execution policy prevents activation, run:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server with reload
uvicorn app.main:app --reload
```

The backend server will run at `http://127.0.0.1:8000`.  
API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

Open a second terminal window in the root directory:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend application will launch at `http://localhost:5173`.

---

## 📡 REST API Specifications

### Authentication
- `POST /api/auth/register`: Create user account and receive JWT.
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/auth/me`: Retrieve currently authenticated user profile.

### Emergencies & Incidents
- `GET /api/incidents`: List incidents with priority, status, and search filters.
- `POST /api/incidents`: Report emergency (triggers nearest ambulance calculation).
- `GET /api/incidents/{id}`: Full incident details and timeline logs.
- `PUT /api/incidents/{id}`: Update incident status, notes, or severity.
- `POST /api/incidents/{id}/assign-ambulance`: Assign ambulance unit to incident.
- `POST /api/incidents/{id}/assign-hospital`: Assign destination hospital to incident.
- `GET /api/incidents/{id}/recommended-ambulances`: List available ambulances sorted by distance.
- `GET /api/incidents/{id}/recommended-hospitals`: List hospitals ranked by capacity & distance.
- `DELETE /api/incidents/{id}`: Delete incident (Admin only).

### Ambulance Fleet
- `GET /api/ambulances`: List all ambulances.
- `GET /api/ambulances/available`: List only available units.
- `POST /api/ambulances`: Deploy new ambulance vehicle.
- `PUT /api/ambulances/{id}`: Update ambulance details, driver, or location.
- `POST /api/ambulances/{id}/assign`: Assign ambulance directly to an incident.

### Network Hospitals
- `GET /api/hospitals`: List hospitals with bed and ICU occupancy.
- `POST /api/hospitals`: Register new hospital facility.
- `PUT /api/hospitals/{id}`: Update facility contact or resources.
- `PUT /api/hospitals/{id}/capacity`: Update available beds, ICU count, and diversion status.

### Medical Resources
- `GET /api/resources`: List resources with category filtering.
- `POST /api/resources`: Add medical resource item.
- `PUT /api/resources/{id}`: Update quantity or stock status.

### System Notifications
- `GET /api/notifications`: Retrieve notifications for user role.
- `PUT /api/notifications/{id}/read`: Mark notification as read.
- `PUT /api/notifications/read-all/mark`: Mark all notifications as read.

### User Roles
- `GET /api/users`: List all platform users (Admin only).
- `GET /api/users/{id}`: View specific user.
- `PUT /api/users/{id}`: Change user role (Admin only).

### Analytics
- `GET /api/analytics/overview`: High-level counts, response velocity, and utilization.
- `GET /api/analytics/emergency-types`: Category distribution.
- `GET /api/analytics/priority`: Severity breakdown.
- `GET /api/analytics/status`: Pipeline stage distribution.
- `GET /api/analytics/trends`: Past 7 days volume & resolution progression.

---

## ⚡ WebSocket Real-Time Telemetry

- **Endpoint**: `ws://127.0.0.1:8000/ws`
- **Supported Events**:
  - `INCIDENT_CREATED`: Broadcasts new emergency to dispatchers.
  - `AMBULANCE_ASSIGNED`: Alerts field unit and caller of ambulance en route.
  - `HOSPITAL_ASSIGNED`: Alerts hospital triage team of incoming casualty.
  - `HOSPITAL_CAPACITY_UPDATED`: Broadcasts diversion or bed availability changes.
  - `RESOURCE_UPDATED`: Updates inventory stock alerts.

---

## 🔮 Future Database Integration (PostgreSQL / MongoDB / Redis)

The codebase is pre-engineered for database connectivity without rewriting APIs or frontend components:
1. **Repository Pattern**: Swap out the in-memory collections in `backend/app/data.py` with SQLAlchemy or AsyncPG sessions pointing to PostgreSQL tables.
2. **Schemas Preservation**: All Pydantic request and response models in `backend/app/schemas.py` are strictly typed and decoupled from database ORMs.
3. **Caching & Redis Pub/Sub**: Replace the in-memory WebSocket manager with Redis Channels (`aioredis`) to scale across multiple server instances.
