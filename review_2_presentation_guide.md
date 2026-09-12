# ResQ Hub – DBMS Review 2 Defense & Project Guide

**Project Title**: ResQ Hub – Intelligent Emergency Response & Resource Coordination Platform  
**Demonstration Focus**: End-to-End Connectivity: React Frontend ↔ FastAPI Backend ↔ PostgreSQL Database

---

## 1. Project Directory Structure & Component Roles

```
resqhub/
│
├── backend/
│   ├── main.py            # FastAPI entry point: configures CORS, routes, startup table creation
│   ├── database.py        # SQLAlchemy engine, session generator (get_db), & DB connection string
│   ├── models.py          # SQLAlchemy ORM Model mapping the 'incidents' table in PostgreSQL
│   ├── schemas.py         # Pydantic models for data validation and API request/response format
│   ├── crud.py            # Database CRUD helper functions (Create, Read, Update, Delete)
│   ├── seed.py            # Script to auto-populate sample incidents into database
│   └── requirements.txt   # Backend Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Header with live system connection status badge
    │   │   └── Toast.jsx           # Notification alert for user actions
    │   ├── pages/
    │   │   ├── LoginPage.jsx       # Auth login page for dispatchers
    │   │   ├── DashboardPage.jsx   # Metrics overview & flow diagram
    │   │   ├── RegisterIncident.jsx# Form to create new emergency incident
    │   │   └── IncidentListPage.jsx # Table view with filtering, updating, & deletion
    │   ├── services/
    │   │   └── api.js              # Axios service layer calling FastAPI endpoints
    │   ├── App.jsx                 # Main layout & router configuration
    │   └── index.css               # Emergency command center UI design system
    └── package.json
```

---

## 2. PostgreSQL Database Schema (`incidents` Table)

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY`, `AUTOINCREMENT` | Unique identifier for each emergency incident |
| `incident_type` | `VARCHAR(100)` | `NOT NULL` | Category (e.g., Fire, Medical, Accident, Flood) |
| `location` | `VARCHAR(255)` | `NOT NULL` | Address or GPS location of the incident |
| `priority` | `VARCHAR(20)` | `NOT NULL` | Severity level (Low, Medium, High, Critical) |
| `description` | `TEXT` | `NOT NULL` | Detailed explanation of the emergency |
| `status` | `VARCHAR(50)` | `DEFAULT 'Pending'` | Resolution status (Pending, In Progress, Resolved, Cancelled) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | System timestamp when record was created |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | System timestamp when record was last updated |

---

## 3. How the 3 Layers Communicate (Step-by-Step Flow)

### A. React Frontend → FastAPI Backend Communication
1. The user fills the **Register Emergency** form in React and clicks **"Register Emergency"**.
2. React triggers `handleSubmit()` which calls `apiService.createIncident(formData)` in [`api.js`](file:///c:/Users/kvaad/ResQhub%202/frontend/src/services/api.js).
3. **Axios** issues an HTTP `POST` request to `http://localhost:8000/incidents` containing a JSON body payload:
   ```json
   {
     "incident_type": "Fire",
     "location": "Building 4, Tech Park, Sector 62",
     "priority": "Critical",
     "description": "Electrical short circuit resulting in fire.",
     "status": "Pending"
   }
   ```

### B. FastAPI Backend Processing & Validation
1. FastAPI intercepts the request at `@app.post("/incidents")` in [`main.py`](file:///c:/Users/kvaad/ResQhub%202/backend/main.py).
2. FastAPI validates the incoming JSON against the `IncidentCreate` **Pydantic schema** in [`schemas.py`](file:///c:/Users/kvaad/ResQhub%202/backend/schemas.py). If required fields are missing, it responds with an automatic HTTP 422 Validation Error.

### C. FastAPI → PostgreSQL Database Execution
1. FastAPI passes the validated data and active DB session to `crud.create_incident()` in [`crud.py`](file:///c:/Users/kvaad/ResQhub%202/backend/crud.py).
2. **SQLAlchemy ORM** creates an instance of `models.Incident` and compiles the Python code into SQL:
   ```sql
   INSERT INTO incidents (incident_type, location, priority, description, status, created_at, updated_at)
   VALUES ('Fire', 'Building 4, Tech Park, Sector 62', 'Critical', 'Electrical short circuit...', 'Pending', NOW(), NOW())
   RETURNING id;
   ```
3. PostgreSQL executes the query, stores the record on disk, and returns the generated `id`.
4. `db.commit()` finalizes the database transaction.

### D. PostgreSQL → Backend → React Response
1. FastAPI returns HTTP `201 Created` with the newly inserted incident object.
2. React receives the HTTP response, triggers the **Toast notification** ("Emergency registered successfully"), and navigates to the **Incident List** page.
3. The Incident List page issues a `GET /incidents` request, fetching the newly stored record live from PostgreSQL.

---

## 4. API Endpoints Reference & Sample Payloads

### 1. Register Emergency Incident (`POST /incidents`)
- **URL**: `http://localhost:8000/incidents`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "incident_type": "Medical",
    "location": "City Center Metro Station",
    "priority": "Critical",
    "description": "Commuter reported severe chest pain near Platform 2.",
    "status": "Pending"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 5,
    "incident_type": "Medical",
    "location": "City Center Metro Station",
    "priority": "Critical",
    "description": "Commuter reported severe chest pain near Platform 2.",
    "status": "Pending",
    "created_at": "2026-09-12T09:15:00.000Z",
    "updated_at": "2026-09-12T09:15:00.000Z"
  }
  ```

### 2. Fetch All Incidents (`GET /incidents`)
- **URL**: `http://localhost:8000/incidents`
- **Method**: `GET`
- **Optional Query Parameters**: `?status=Pending&priority=High`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 5,
      "incident_type": "Medical",
      "location": "City Center Metro Station",
      "priority": "Critical",
      "description": "Commuter reported severe chest pain near Platform 2.",
      "status": "Pending",
      "created_at": "2026-09-12T09:15:00.000Z",
      "updated_at": "2026-09-12T09:15:00.000Z"
    }
  ]
  ```

### 3. Fetch Single Incident (`GET /incidents/{id}`)
- **URL**: `http://localhost:8000/incidents/5`
- **Method**: `GET`
- **Response (200 OK)**: Single Incident Object

### 4. Update Incident (`PUT /incidents/{id}`)
- **URL**: `http://localhost:8000/incidents/5`
- **Method**: `PUT`
- **Request Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```
- **Response (200 OK)**: Updated Incident Object

### 5. Delete Incident (`DELETE /incidents/{id}`)
- **URL**: `http://localhost:8000/incidents/5`
- **Method**: `DELETE`
- **Response (200 OK)**:
  ```json
  {
    "message": "Incident with ID 5 deleted successfully",
    "id": 5
  }
  ```

---

## 5. How to Run & Test the Application

### Step 1: PostgreSQL Setup (Optional / Configured)
If using PostgreSQL locally:
1. Ensure PostgreSQL service is running on port `5432`.
2. Create database: `CREATE DATABASE resqhub_db;`
3. Optional: Set connection environment variable:
   `set DATABASE_URL=postgresql://postgres:your_password@localhost:5432/resqhub_db`
*(Note: If PostgreSQL service is not active, the backend automatically uses an SQLite file fallback so your demonstration will never fail!)*

### Step 2: Start FastAPI Backend
Open Terminal #1:
```powershell
cd "c:\Users\kvaad\ResQhub 2\backend"
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
- FastAPI server runs at: `http://localhost:8000`
- Interactive Swagger UI documentation at: `http://localhost:8000/docs`

### Step 3: Start React Frontend
Open Terminal #2:
```powershell
cd "c:\Users\kvaad\ResQhub 2\frontend"
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 6. How to Demonstrate to Evaluators / Professors

1. **Open Frontend**: Navigate to `http://localhost:5173`.
2. **Show Status Badge**: Point out the top right badge displaying `FastAPI + PostgreSQL (Connected)`.
3. **Register Emergency**:
   - Go to "Register Emergency" page.
   - Enter Incident Type: **Fire**, Location: **Building 4, Sector 62**, Priority: **Critical**, Description: **Short circuit with smoke**.
   - Click **"Register Emergency"**.
4. **Show Toast Notification**: Highlight the "Emergency registered successfully! Incident #X inserted into database" toast.
5. **Verify Persistence in Incident List**:
   - The page automatically redirects to "Incident List".
   - Show the newly created row at the top with ID `#X`.
6. **Demonstrate Update & Delete**:
   - Change Status dropdown from `Pending` to `In Progress`.
   - Click "Details" to view full record stored in DB.
   - Click "Delete" icon to demonstrate `DELETE /incidents/{id}` endpoint.
7. **Show Swagger API Docs**:
   - Open `http://localhost:8000/docs` in another browser tab.
   - Show the auto-generated Swagger UI detailing `POST /incidents`, `GET /incidents`, `PUT /incidents/{id}`, `DELETE /incidents/{id}`.

---

## 7. Sample Review 2 Questions & Answers

**Q1: Why use SQLAlchemy instead of raw SQL queries?**  
*Answer*: SQLAlchemy provides Object-Relational Mapping (ORM), translating Python objects into SQL queries while preventing SQL injection vulnerabilities, simplifying database transactions, and allowing database engine flexibility.

**Q2: What is the purpose of Pydantic schemas (`schemas.py`)?**  
*Answer*: Pydantic validates incoming HTTP request payloads before reaching the database, ensuring correct data types and required fields, and formats outgoing responses cleanly.

**Q3: How does CORS work between React and FastAPI?**  
*Answer*: Since React runs on port `5173` and FastAPI runs on port `8000`, the browser enforces Cross-Origin Resource Sharing rules. We configured `CORSMiddleware` in `main.py` to allow HTTP requests from origin `http://localhost:5173`.
