import copy
from datetime import datetime, timedelta
from .auth import hash_password

# Default demo password hashed
DEFAULT_PW_HASH = hash_password("ResqHub@123")

USERS_DATA = [
    {
        "id": "USR-101",
        "name": "Dr. Rajesh Sharma",
        "email": "admin@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "ADMIN",
        "phone": "+91 98765 43210",
        "is_active": True,
        "created_at": "2026-08-01T08:00:00Z"
    },
    {
        "id": "USR-102",
        "name": "Priya Reddy",
        "email": "dispatcher@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "DISPATCHER",
        "phone": "+91 98765 43211",
        "is_active": True,
        "created_at": "2026-08-02T09:30:00Z"
    },
    {
        "id": "USR-103",
        "name": "Kavitha Nair",
        "email": "hospital@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "HOSPITAL_STAFF",
        "phone": "+91 98765 43212",
        "is_active": True,
        "created_at": "2026-08-03T10:15:00Z"
    },
    {
        "id": "USR-104",
        "name": "Rahul Verma",
        "email": "citizen@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "CITIZEN",
        "phone": "+91 98765 43213",
        "is_active": True,
        "created_at": "2026-08-04T11:45:00Z"
    },
    {
        "id": "USR-105",
        "name": "Ananya Rao",
        "email": "ananya.rao@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "DISPATCHER",
        "phone": "+91 98765 43214",
        "is_active": True,
        "created_at": "2026-08-05T12:00:00Z"
    },
    {
        "id": "USR-106",
        "name": "Dr. Suresh Kumar",
        "email": "suresh.k@apollo.org",
        "password_hash": DEFAULT_PW_HASH,
        "role": "HOSPITAL_STAFF",
        "phone": "+91 98765 43215",
        "is_active": True,
        "created_at": "2026-08-06T14:20:00Z"
    },
    {
        "id": "USR-107",
        "name": "Vikram Sethi",
        "email": "vikram.citizen@gmail.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "CITIZEN",
        "phone": "+91 98765 43216",
        "is_active": True,
        "created_at": "2026-08-07T15:10:00Z"
    },
    {
        "id": "USR-108",
        "name": "Sneha Patel",
        "email": "sneha.kims@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "HOSPITAL_STAFF",
        "phone": "+91 98765 43217",
        "is_active": True,
        "created_at": "2026-08-08T16:00:00Z"
    },
    {
        "id": "USR-109",
        "name": "Karthik Goud",
        "email": "karthik.hyd@yahoo.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "CITIZEN",
        "phone": "+91 98765 43218",
        "is_active": True,
        "created_at": "2026-08-09T17:25:00Z"
    },
    {
        "id": "USR-110",
        "name": "Manish Joshi",
        "email": "manish.admin@resqhub.com",
        "password_hash": DEFAULT_PW_HASH,
        "role": "ADMIN",
        "phone": "+91 98765 43219",
        "is_active": True,
        "created_at": "2026-08-10T18:00:00Z"
    }
]

AMBULANCES_DATA = [
    {
        "id": "AMB-101",
        "vehicle_number": "TS 09 UA 1011",
        "driver": "Mohammad Rizwan",
        "status": "AVAILABLE",
        "latitude": 17.5385,
        "longitude": 78.3860,
        "phone": "+91 99001 12231",
        "base_location": "Bachupally Emergency Station",
        "current_incident_id": None
    },
    {
        "id": "AMB-102",
        "vehicle_number": "TS 08 EA 2022",
        "driver": "Ramesh Chary",
        "status": "AVAILABLE",
        "latitude": 17.4849,
        "longitude": 78.4138,
        "phone": "+91 99001 12232",
        "base_location": "Kukatpally Y-Junction Depot",
        "current_incident_id": None
    },
    {
        "id": "AMB-103",
        "vehicle_number": "TS 07 ZA 3033",
        "driver": "K. Venkatesh",
        "status": "ASSIGNED",
        "latitude": 17.4968,
        "longitude": 78.3588,
        "phone": "+91 99001 12233",
        "base_location": "Miyapur Metro Station Point",
        "current_incident_id": "INC-1002"
    },
    {
        "id": "AMB-104",
        "vehicle_number": "TS 10 DA 4044",
        "driver": "Gurpreet Singh",
        "status": "BUSY",
        "latitude": 17.4399,
        "longitude": 78.4983,
        "phone": "+91 99001 12234",
        "base_location": "Secunderabad Clock Tower Post",
        "current_incident_id": "INC-1003"
    },
    {
        "id": "AMB-105",
        "vehicle_number": "TS 09 RA 5055",
        "driver": "Sai Kiran",
        "status": "AVAILABLE",
        "latitude": 17.4401,
        "longitude": 78.3489,
        "phone": "+91 99001 12235",
        "base_location": "Gachibowli Stadium Base",
        "current_incident_id": None
    },
    {
        "id": "AMB-106",
        "vehicle_number": "TS 09 QA 6066",
        "driver": "Syed Farhan",
        "status": "AVAILABLE",
        "latitude": 17.4474,
        "longitude": 78.3762,
        "phone": "+91 99001 12236",
        "base_location": "Hitech City Cyber Towers Point",
        "current_incident_id": None
    }
]

HOSPITALS_DATA = [
    {
        "id": "HOSP-201",
        "name": "Apollo Emergency & Trauma Center",
        "location": "Jubilee Hills / Hitech City Road, Hyderabad",
        "available_beds": 28,
        "icu_beds": 9,
        "total_beds": 120,
        "emergency_capacity": "HIGH",
        "status": "AVAILABLE",
        "latitude": 17.4319,
        "longitude": 78.4073,
        "contact_number": "+91 40 2360 7777",
        "medical_resources": ["Trauma Suite", "Cardiac ICU", "Blood Bank", "Burn Unit", "CT/MRI"]
    },
    {
        "id": "HOSP-202",
        "name": "KIMS Hospital Emergency Wing",
        "location": "Minister Road, Secunderabad",
        "available_beds": 18,
        "icu_beds": 5,
        "total_beds": 100,
        "emergency_capacity": "HIGH",
        "status": "AVAILABLE",
        "latitude": 17.4399,
        "longitude": 78.4983,
        "contact_number": "+91 40 4488 5000",
        "medical_resources": ["Critical Care Unit", "Pediatric Trauma", "Hyperbaric Oxygen"]
    },
    {
        "id": "HOSP-203",
        "name": "Continental Hospitals Acute Care",
        "location": "Financial District, Nanakramguda, Gachibowli",
        "available_beds": 34,
        "icu_beds": 12,
        "total_beds": 150,
        "emergency_capacity": "HIGH",
        "status": "AVAILABLE",
        "latitude": 17.4182,
        "longitude": 78.3448,
        "contact_number": "+91 40 6700 0000",
        "medical_resources": ["Stroke Unit", "Coronary Care", "Level 1 Trauma Center"]
    },
    {
        "id": "HOSP-204",
        "name": "Pranaam Multi-Speciality Hospital",
        "location": "Madinaguda, Miyapur, Hyderabad",
        "available_beds": 6,
        "icu_beds": 2,
        "total_beds": 50,
        "emergency_capacity": "LIMITED",
        "status": "LIMITED",
        "latitude": 17.4968,
        "longitude": 78.3588,
        "contact_number": "+91 40 2304 4444",
        "medical_resources": ["Emergency OT", "Neonatal ICU", "Dialysis Support"]
    },
    {
        "id": "HOSP-205",
        "name": "Omni Hospitals Trauma Unit",
        "location": "Kukatpally Housing Board Colony, Hyderabad",
        "available_beds": 0,
        "icu_beds": 0,
        "total_beds": 60,
        "emergency_capacity": "FULL",
        "status": "FULL",
        "latitude": 17.4849,
        "longitude": 78.4138,
        "contact_number": "+91 40 4466 7788",
        "medical_resources": ["Trauma Ward", "Ambulatory Surgery", "Cardiology"]
    }
]

INCIDENTS_DATA = [
    {
        "id": "INC-1001",
        "emergency_type": "Accident",
        "description": "Multi-vehicle collision near Forum Mall flyover with multiple injuries reported.",
        "priority": "CRITICAL",
        "status": "IN_PROGRESS",
        "location": "Kukatpally Y-Junction Flyover, Hyderabad",
        "latitude": 17.4849,
        "longitude": 78.4138,
        "caller_phone": "+91 98850 12345",
        "reported_by_id": "USR-104",
        "reported_by_name": "Rahul Verma",
        "assigned_ambulance_id": "AMB-102",
        "assigned_ambulance_vehicle": "TS 08 EA 2022",
        "assigned_ambulance_driver": "Ramesh Chary",
        "assigned_hospital_id": "HOSP-201",
        "assigned_hospital_name": "Apollo Emergency & Trauma Center",
        "created_at": "2026-09-10T07:15:00Z",
        "updated_at": "2026-09-10T07:45:00Z",
        "response_time_minutes": 8,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Emergency Reported",
                "description": "Citizen Rahul Verma reported multi-vehicle collision via platform.",
                "timestamp": "2026-09-10T07:15:00Z",
                "updated_by": "Rahul Verma"
            },
            {
                "stage": "VERIFIED",
                "title": "Incident Verified",
                "description": "Dispatcher confirmed scene severity via police patrol coordination.",
                "timestamp": "2026-09-10T07:18:00Z",
                "updated_by": "Priya Reddy"
            },
            {
                "stage": "ASSIGNED",
                "title": "Ambulance Assigned",
                "description": "Dispatched nearest unit AMB-102 (driver Ramesh Chary).",
                "timestamp": "2026-09-10T07:22:00Z",
                "updated_by": "Priya Reddy"
            },
            {
                "stage": "IN_PROGRESS",
                "title": "En Route to Scene",
                "description": "Ambulance navigating heavy traffic near Kukatpally junction.",
                "timestamp": "2026-09-10T07:30:00Z",
                "updated_by": "Ramesh Chary"
            }
        ]
    },
    {
        "id": "INC-1002",
        "emergency_type": "Cardiac Emergency",
        "description": "Elderly patient collapsed with acute chest pain and shortness of breath.",
        "priority": "CRITICAL",
        "status": "HOSPITAL_REACHED",
        "location": "Miyapur Metro Station Gate 2, Hyderabad",
        "latitude": 17.4968,
        "longitude": 78.3588,
        "caller_phone": "+91 97760 98765",
        "reported_by_id": "USR-107",
        "reported_by_name": "Vikram Sethi",
        "assigned_ambulance_id": "AMB-103",
        "assigned_ambulance_vehicle": "TS 07 ZA 3033",
        "assigned_ambulance_driver": "K. Venkatesh",
        "assigned_hospital_id": "HOSP-204",
        "assigned_hospital_name": "Pranaam Multi-Speciality Hospital",
        "created_at": "2026-09-10T06:40:00Z",
        "updated_at": "2026-09-10T07:12:00Z",
        "response_time_minutes": 6,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Emergency Reported",
                "description": "Caller requested cardiac life support unit.",
                "timestamp": "2026-09-10T06:40:00Z",
                "updated_by": "Vikram Sethi"
            },
            {
                "stage": "ASSIGNED",
                "title": "Ambulance Assigned",
                "description": "AMB-103 dispatched with defibrillator kit.",
                "timestamp": "2026-09-10T06:43:00Z",
                "updated_by": "Priya Reddy"
            },
            {
                "stage": "HOSPITAL_REACHED",
                "title": "Patient Admitted",
                "description": "Patient handed over to cardiology emergency team at Pranaam.",
                "timestamp": "2026-09-10T07:12:00Z",
                "updated_by": "K. Venkatesh"
            }
        ]
    },
    {
        "id": "INC-1003",
        "emergency_type": "Fire",
        "description": "Commercial kitchen electrical fire with smoke trapped in basement area.",
        "priority": "HIGH",
        "status": "ASSIGNED",
        "location": "Secunderabad Clock Tower Commercial Plaza",
        "latitude": 17.4399,
        "longitude": 78.4983,
        "caller_phone": "+91 94411 22334",
        "reported_by_id": "USR-109",
        "reported_by_name": "Karthik Goud",
        "assigned_ambulance_id": "AMB-104",
        "assigned_ambulance_vehicle": "TS 10 DA 4044",
        "assigned_ambulance_driver": "Gurpreet Singh",
        "assigned_hospital_id": "HOSP-202",
        "assigned_hospital_name": "KIMS Hospital Emergency Wing",
        "created_at": "2026-09-10T07:35:00Z",
        "updated_at": "2026-09-10T07:42:00Z",
        "response_time_minutes": 7,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Fire Emergency Reported",
                "description": "Fire hazard and smoke inhalation symptoms noted.",
                "timestamp": "2026-09-10T07:35:00Z",
                "updated_by": "Karthik Goud"
            },
            {
                "stage": "ASSIGNED",
                "title": "Unit Dispatched",
                "description": "AMB-104 assigned for casualty support alongside fire department.",
                "timestamp": "2026-09-10T07:42:00Z",
                "updated_by": "Ananya Rao"
            }
        ]
    },
    {
        "id": "INC-1004",
        "emergency_type": "Medical Emergency",
        "description": "Severe asthma attack and acute oxygen desaturation in student hostel.",
        "priority": "HIGH",
        "status": "RESOLVED",
        "location": "Bachupally Engineering Campus Hostel 3",
        "latitude": 17.5385,
        "longitude": 78.3860,
        "caller_phone": "+91 98480 55667",
        "reported_by_id": "USR-104",
        "reported_by_name": "Rahul Verma",
        "assigned_ambulance_id": "AMB-101",
        "assigned_ambulance_vehicle": "TS 09 UA 1011",
        "assigned_ambulance_driver": "Mohammad Rizwan",
        "assigned_hospital_id": "HOSP-201",
        "assigned_hospital_name": "Apollo Emergency & Trauma Center",
        "created_at": "2026-09-09T22:10:00Z",
        "updated_at": "2026-09-09T23:30:00Z",
        "response_time_minutes": 5,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Emergency Reported",
                "description": "Student hostel warden raised distress ticket.",
                "timestamp": "2026-09-09T22:10:00Z",
                "updated_by": "Rahul Verma"
            },
            {
                "stage": "RESOLVED",
                "title": "Stabilized and Discharged",
                "description": "Oxygen therapy administered on site and patient cleared by medical staff.",
                "timestamp": "2026-09-09T23:30:00Z",
                "updated_by": "Dr. Suresh Kumar"
            }
        ]
    },
    {
        "id": "INC-1005",
        "emergency_type": "Accident",
        "description": "Motorcycle skid on wet road near Mindspace tech park entrance.",
        "priority": "MEDIUM",
        "status": "REPORTED",
        "location": "Hitech City Mindspace Circle, Hyderabad",
        "latitude": 17.4474,
        "longitude": 78.3762,
        "caller_phone": "+91 93930 11223",
        "reported_by_id": "USR-107",
        "reported_by_name": "Vikram Sethi",
        "assigned_ambulance_id": None,
        "assigned_ambulance_vehicle": None,
        "assigned_ambulance_driver": None,
        "assigned_hospital_id": None,
        "assigned_hospital_name": None,
        "created_at": "2026-09-10T08:10:00Z",
        "updated_at": "2026-09-10T08:10:00Z",
        "response_time_minutes": None,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Emergency Logged",
                "description": "Bystander reported rider conscious with arm fracture and abrasions.",
                "timestamp": "2026-09-10T08:10:00Z",
                "updated_by": "Vikram Sethi"
            }
        ]
    },
    {
        "id": "INC-1006",
        "emergency_type": "Natural Disaster",
        "description": "Urban flash flooding causing car trap near Gachibowli ORR underpass.",
        "priority": "HIGH",
        "status": "VERIFIED",
        "location": "Gachibowli ORR Junction Underpass, Hyderabad",
        "latitude": 17.4401,
        "longitude": 78.3489,
        "caller_phone": "+91 91234 56780",
        "reported_by_id": "USR-109",
        "reported_by_name": "Karthik Goud",
        "assigned_ambulance_id": None,
        "assigned_ambulance_vehicle": None,
        "assigned_ambulance_driver": None,
        "assigned_hospital_id": None,
        "assigned_hospital_name": None,
        "created_at": "2026-09-10T07:55:00Z",
        "updated_at": "2026-09-10T08:02:00Z",
        "response_time_minutes": None,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Flooding Reported",
                "description": "Water level reaching vehicle windows.",
                "timestamp": "2026-09-10T07:55:00Z",
                "updated_by": "Karthik Goud"
            },
            {
                "stage": "VERIFIED",
                "title": "Disaster Response Alerted",
                "description": "Disaster response unit and medical standby mobilized.",
                "timestamp": "2026-09-10T08:02:00Z",
                "updated_by": "Priya Reddy"
            }
        ]
    },
    {
        "id": "INC-1007",
        "emergency_type": "Cardiac Emergency",
        "description": "Sudden syncope and bradycardia in corporate cafeteria.",
        "priority": "CRITICAL",
        "status": "RESOLVED",
        "location": "Cyber Pearl, Hitech City, Hyderabad",
        "latitude": 17.4460,
        "longitude": 78.3750,
        "caller_phone": "+91 95500 88991",
        "reported_by_id": "USR-104",
        "reported_by_name": "Rahul Verma",
        "assigned_ambulance_id": "AMB-106",
        "assigned_ambulance_vehicle": "TS 09 QA 6066",
        "assigned_ambulance_driver": "Syed Farhan",
        "assigned_hospital_id": "HOSP-203",
        "assigned_hospital_name": "Continental Hospitals Acute Care",
        "created_at": "2026-09-08T14:15:00Z",
        "updated_at": "2026-09-08T15:40:00Z",
        "response_time_minutes": 6,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Incident Logged",
                "description": "Corporate HR called emergency helpline.",
                "timestamp": "2026-09-08T14:15:00Z",
                "updated_by": "Rahul Verma"
            },
            {
                "stage": "RESOLVED",
                "title": "Patient Stable in ICU",
                "description": "Pacemaker adjusted and vitals normal.",
                "timestamp": "2026-09-08T15:40:00Z",
                "updated_by": "Dr. Rajesh Sharma"
            }
        ]
    },
    {
        "id": "INC-1008",
        "emergency_type": "Crime",
        "description": "Physical assault injury with knife laceration near bus terminal.",
        "priority": "HIGH",
        "status": "RESOLVED",
        "location": "Jubilee Bus Station, Secunderabad",
        "latitude": 17.4450,
        "longitude": 78.4980,
        "caller_phone": "+91 97000 44556",
        "reported_by_id": "USR-107",
        "reported_by_name": "Vikram Sethi",
        "assigned_ambulance_id": "AMB-104",
        "assigned_ambulance_vehicle": "TS 10 DA 4044",
        "assigned_ambulance_driver": "Gurpreet Singh",
        "assigned_hospital_id": "HOSP-202",
        "assigned_hospital_name": "KIMS Hospital Emergency Wing",
        "created_at": "2026-09-07T21:00:00Z",
        "updated_at": "2026-09-07T22:20:00Z",
        "response_time_minutes": 9,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Police & Medic Call",
                "description": "Bystander alerted police and ResQ Hub.",
                "timestamp": "2026-09-07T21:00:00Z",
                "updated_by": "Vikram Sethi"
            },
            {
                "stage": "RESOLVED",
                "title": "Suturing Completed",
                "description": "Patient stable and police statement recorded.",
                "timestamp": "2026-09-07T22:20:00Z",
                "updated_by": "Sneha Patel"
            }
        ]
    },
    {
        "id": "INC-1009",
        "emergency_type": "Medical Emergency",
        "description": "Severe pediatric allergic anaphylaxis reaction after peanut ingestion.",
        "priority": "CRITICAL",
        "status": "RESOLVED",
        "location": "Kukatpally Phase 3 Residential Colony",
        "latitude": 17.4890,
        "longitude": 78.4100,
        "caller_phone": "+91 98888 11223",
        "reported_by_id": "USR-104",
        "reported_by_name": "Rahul Verma",
        "assigned_ambulance_id": "AMB-102",
        "assigned_ambulance_vehicle": "TS 08 EA 2022",
        "assigned_ambulance_driver": "Ramesh Chary",
        "assigned_hospital_id": "HOSP-201",
        "assigned_hospital_name": "Apollo Emergency & Trauma Center",
        "created_at": "2026-09-06T11:20:00Z",
        "updated_at": "2026-09-06T12:15:00Z",
        "response_time_minutes": 5,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Anaphylaxis Alert",
                "description": "Epinephrine auto-injector required.",
                "timestamp": "2026-09-06T11:20:00Z",
                "updated_by": "Rahul Verma"
            },
            {
                "stage": "RESOLVED",
                "title": "Airway Secured",
                "description": "Child breathing normally and vitals stable.",
                "timestamp": "2026-09-06T12:15:00Z",
                "updated_by": "Dr. Suresh Kumar"
            }
        ]
    },
    {
        "id": "INC-1010",
        "emergency_type": "Other",
        "description": "Construction scaffolding collapse with trapped laborer.",
        "priority": "MEDIUM",
        "status": "CANCELLED",
        "location": "Nanakramguda Financial District Site 4",
        "latitude": 17.4160,
        "longitude": 78.3420,
        "caller_phone": "+91 96666 33221",
        "reported_by_id": "USR-109",
        "reported_by_name": "Karthik Goud",
        "assigned_ambulance_id": None,
        "assigned_ambulance_vehicle": None,
        "assigned_ambulance_driver": None,
        "assigned_hospital_id": None,
        "assigned_hospital_name": None,
        "created_at": "2026-09-05T16:00:00Z",
        "updated_at": "2026-09-05T16:25:00Z",
        "response_time_minutes": None,
        "timeline": [
            {
                "stage": "REPORTED",
                "title": "Accident Logged",
                "description": "Scaffolding dislodged on lower terrace.",
                "timestamp": "2026-09-05T16:00:00Z",
                "updated_by": "Karthik Goud"
            },
            {
                "stage": "CANCELLED",
                "title": "False Alarm Cancelled",
                "description": "Site safety supervisor confirmed zero injuries, minor debris only.",
                "timestamp": "2026-09-05T16:25:00Z",
                "updated_by": "Priya Reddy"
            }
        ]
    }
]

RESOURCES_DATA = [
    {
        "id": "RES-301",
        "name": "Medical Oxygen Cylinders (47L)",
        "category": "Oxygen",
        "quantity": 42,
        "unit": "Cylinders",
        "hospital_id": "HOSP-201",
        "hospital_name": "Apollo Emergency & Trauma Center",
        "status": "ADEQUATE",
        "last_updated": "2026-09-10T08:00:00Z"
    },
    {
        "id": "RES-302",
        "name": "O-Negative Emergency Blood Units",
        "category": "Blood Units",
        "quantity": 14,
        "unit": "Units",
        "hospital_id": "HOSP-201",
        "hospital_name": "Apollo Emergency & Trauma Center",
        "status": "ADEQUATE",
        "last_updated": "2026-09-10T07:30:00Z"
    },
    {
        "id": "RES-303",
        "name": "Mechanical ICU Ventilators",
        "category": "Ventilators",
        "quantity": 8,
        "unit": "Units",
        "hospital_id": "HOSP-202",
        "hospital_name": "KIMS Hospital Emergency Wing",
        "status": "ADEQUATE",
        "last_updated": "2026-09-10T06:15:00Z"
    },
    {
        "id": "RES-304",
        "name": "Rapid Trauma Hemorrhage Kits",
        "category": "Emergency Kits",
        "quantity": 25,
        "unit": "Kits",
        "hospital_id": "HOSP-203",
        "hospital_name": "Continental Hospitals Acute Care",
        "status": "ADEQUATE",
        "last_updated": "2026-09-09T18:00:00Z"
    },
    {
        "id": "RES-305",
        "name": "Cardiac Defibrillator Pads & Kits",
        "category": "Emergency Kits",
        "quantity": 30,
        "unit": "Sets",
        "hospital_id": "HOSP-203",
        "hospital_name": "Continental Hospitals Acute Care",
        "status": "ADEQUATE",
        "last_updated": "2026-09-09T20:30:00Z"
    },
    {
        "id": "RES-306",
        "name": "Liquid Medical Oxygen Tank Buffer",
        "category": "Oxygen",
        "quantity": 12,
        "unit": "kL",
        "hospital_id": "HOSP-202",
        "hospital_name": "KIMS Hospital Emergency Wing",
        "status": "ADEQUATE",
        "last_updated": "2026-09-10T04:45:00Z"
    },
    {
        "id": "RES-307",
        "name": "AB-Positive Blood Plasma Units",
        "category": "Blood Units",
        "quantity": 6,
        "unit": "Units",
        "hospital_id": "HOSP-204",
        "hospital_name": "Pranaam Multi-Speciality Hospital",
        "status": "LOW",
        "last_updated": "2026-09-09T14:20:00Z"
    },
    {
        "id": "RES-308",
        "name": "High Flow Burn Dressing Packs",
        "category": "Medical Supplies",
        "quantity": 55,
        "unit": "Packs",
        "hospital_id": "HOSP-201",
        "hospital_name": "Apollo Emergency & Trauma Center",
        "status": "ADEQUATE",
        "last_updated": "2026-09-09T11:00:00Z"
    },
    {
        "id": "RES-309",
        "name": "Portable Transport Ventilators",
        "category": "Ventilators",
        "quantity": 3,
        "unit": "Units",
        "hospital_id": "HOSP-204",
        "hospital_name": "Pranaam Multi-Speciality Hospital",
        "status": "LIMITED",
        "last_updated": "2026-09-08T19:15:00Z"
    },
    {
        "id": "RES-310",
        "name": "Advanced Pediatric First Aid Kits",
        "category": "First Aid Kits",
        "quantity": 18,
        "unit": "Kits",
        "hospital_id": "HOSP-205",
        "hospital_name": "Omni Hospitals Trauma Unit",
        "status": "ADEQUATE",
        "last_updated": "2026-09-08T09:00:00Z"
    }
]

NOTIFICATIONS_DATA = [
    {
        "id": "NOTIF-401",
        "title": "Critical Emergency Reported",
        "message": "Multi-vehicle collision near Forum Mall flyover reported. Immediate dispatcher attention required.",
        "type": "CRITICAL",
        "incident_id": "INC-1001",
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T07:15:00Z"
    },
    {
        "id": "NOTIF-402",
        "title": "Ambulance Dispatched",
        "message": "Ambulance AMB-102 (TS 08 EA 2022) assigned to INC-1001.",
        "type": "ASSIGNED",
        "incident_id": "INC-1001",
        "target_role": None,
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T07:22:00Z"
    },
    {
        "id": "NOTIF-403",
        "title": "Hospital Alert: Incoming Cardiac Patient",
        "message": "Pranaam Hospital: AMB-103 is transporting a critical cardiac patient.",
        "type": "HOSPITAL",
        "incident_id": "INC-1002",
        "target_role": "HOSPITAL_STAFF",
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T06:50:00Z"
    },
    {
        "id": "NOTIF-404",
        "title": "Hospital Capacity Alert",
        "message": "Omni Hospitals Trauma Unit has reached FULL capacity. Bed allocation paused.",
        "type": "WARNING",
        "incident_id": None,
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T07:00:00Z"
    },
    {
        "id": "NOTIF-405",
        "title": "Incident Resolved: INC-1004",
        "message": "Medical emergency at Bachupally Hostel resolved. Patient stabilized.",
        "type": "SUCCESS",
        "incident_id": "INC-1004",
        "target_role": None,
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-09T23:30:00Z"
    },
    {
        "id": "NOTIF-406",
        "title": "Fire Emergency Reported",
        "message": "Kitchen fire reported at Secunderabad Clock Tower plaza.",
        "type": "HIGH",
        "incident_id": "INC-1003",
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T07:35:00Z"
    },
    {
        "id": "NOTIF-407",
        "title": "Ambulance En Route",
        "message": "AMB-104 en route to Secunderabad fire incident.",
        "type": "ASSIGNED",
        "incident_id": "INC-1003",
        "target_role": None,
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T07:42:00Z"
    },
    {
        "id": "NOTIF-408",
        "title": "Hospital Selected: Apollo Emergency",
        "message": "Apollo Emergency & Trauma Center allocated for INC-1001 casualties.",
        "type": "HOSPITAL",
        "incident_id": "INC-1001",
        "target_role": "HOSPITAL_STAFF",
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-10T07:25:00Z"
    },
    {
        "id": "NOTIF-409",
        "title": "Blood Units Low Alert",
        "message": "Pranaam Multi-Speciality Hospital has low supply of AB-Positive Blood Units.",
        "type": "WARNING",
        "incident_id": None,
        "target_role": "ADMIN",
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-09T14:20:00Z"
    },
    {
        "id": "NOTIF-410",
        "title": "Flash Flood Alert: Gachibowli",
        "message": "Severe water logging near ORR junction underpass. Dispatched rescue advisory.",
        "type": "HIGH",
        "incident_id": "INC-1006",
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T08:02:00Z"
    },
    {
        "id": "NOTIF-411",
        "title": "Incident Resolved: INC-1007",
        "message": "Cardiac emergency at Cyber Pearl resolved. Patient stable in ICU.",
        "type": "SUCCESS",
        "incident_id": "INC-1007",
        "target_role": None,
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-08T15:40:00Z"
    },
    {
        "id": "NOTIF-412",
        "title": "Ambulance Maintenance Complete",
        "message": "AMB-101 has completed scheduled inspection and is now AVAILABLE at Bachupally.",
        "type": "INFO",
        "incident_id": None,
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-08T10:00:00Z"
    },
    {
        "id": "NOTIF-413",
        "title": "Incident Resolved: INC-1009",
        "message": "Pediatric anaphylaxis at Kukatpally Phase 3 resolved successfully.",
        "type": "SUCCESS",
        "incident_id": "INC-1009",
        "target_role": None,
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-06T12:15:00Z"
    },
    {
        "id": "NOTIF-414",
        "title": "New Hospital Bed Capacity Updated",
        "message": "Continental Hospitals reported 34 beds available in emergency trauma ward.",
        "type": "INFO",
        "incident_id": None,
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": True,
        "created_at": "2026-09-09T18:10:00Z"
    },
    {
        "id": "NOTIF-415",
        "title": "Emergency Call Logged: INC-1005",
        "message": "Road skid reported at Hitech City Mindspace. Awaiting ambulance dispatch.",
        "type": "INFO",
        "incident_id": "INC-1005",
        "target_role": "DISPATCHER",
        "target_user_id": None,
        "is_read": False,
        "created_at": "2026-09-10T08:10:00Z"
    }
]

# In-memory database repositories
# These lists are mutated by our service layers
users_db = copy.deepcopy(USERS_DATA)
ambulances_db = copy.deepcopy(AMBULANCES_DATA)
hospitals_db = copy.deepcopy(HOSPITALS_DATA)
incidents_db = copy.deepcopy(INCIDENTS_DATA)
resources_db = copy.deepcopy(RESOURCES_DATA)
notifications_db = copy.deepcopy(NOTIFICATIONS_DATA)
