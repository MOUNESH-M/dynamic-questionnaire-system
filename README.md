# Enterprise Dynamic Questionnaire System (EDQS)

A full-stack, logic-driven assessment platform that enables administrators to create dynamic, context-aware questionnaires with conditional branching. It allows users to answer workflows that adapt in real-time based on their inputs, making it ideal for project scoping, requirement gathering, and effort estimation.

Unlike standard linear surveys, this system features a **Branching Logic Engine** and **Automated Effort Tracking**, ensuring users only see relevant questions and automatically calculating time requirements.

---

## Core Features

### Security & Authentication
- JWT-based authentication
- Role-Based Access Control (RBAC) for Admin and User roles
- Protected API endpoints with automatic token validation

### Admin Dashboard & Builder
- **Live Embedded Preview** — Test-drive logic trees directly inside the builder using a toggleable split-view.
- **Cascading Deletes** — Deleting a parent Questionnaire safely purges all orphaned Questions, Options, Rules, and Submissions to maintain database hygiene.
- **Context-Aware Taxonomy** — Tag questions with `Platform`, `Module`, and `Sub Module` for precise data categorization.

### Branching Logic Engine
- **Conditional Routing** — Define specific next-steps based on selected options or input values.
- **Deadlock Prevention** — UI automatically filters options to enforce forward-only routing, preventing infinite loops.
- **Early Termination** — Route specific answers directly to a "🛑 End Assessment & Submit" token to truncate irrelevant workflows.

### Supported Question Types & Effort Tracking
- `SINGLE_CHOICE` — Standard radio-button selection.
- `TEXT` — Open-ended string input.
- `NUMBER` — Quantitative input.
- `COMPLEXITY` *(Automated)* — A specialized business-logic dropdown (High, Medium, Low) that automatically allocates estimated effort hours (e.g., High = 8 hrs, Low = 2 hrs).
- **Granular Hour Tracking** — Users can manually log or automatically generate "Hours Spent/Estimated" alongside every single answer.

---

## System Architecture

```
Frontend (React.js)
        │
        ├─▶ [Axios / REST API]
        │
Backend (FastAPI)
        │
        ├─▶ [PyMongo / Motor]
        │
Database (MongoDB)
```

---

## Technology Stack

### Frontend
- **Core:** React, React Router DOM
- **Styling:** CSS / Tailwind CSS
- **Network:** Axios

### Backend
- **Core:** FastAPI, Python 3.9+
- **Validation:** Pydantic
- **Auth:** JWT (JSON Web Tokens), passlib

### Database & Tools
- **Database:** MongoDB
- **API Testing:** Postman, Swagger UI (built-in)
- **Version Control:** Git, GitHub

---

## Database Schema

### Questions Collection
```json
{
    "_id": "ObjectId",
    "questionnaireId": "ObjectId",
    "platform": "Salesforce",
    "module": "CRM",
    "subModule": "Data Migration",
    "questionText": "Rate the complexity of the historical data migration.",
    "questionType": "COMPLEXITY",
    "isStartQuestion": true,
    "isActive": true
}
```

### Rules Collection
```json
{
    "_id": "ObjectId",
    "questionId": "ObjectId",
    "optionId": "ObjectId (or 'ANY' / 'High')",
    "nextQuestionId": "ObjectId (or 'SUBMIT')"
}
```

### Responses Collection (Final Payload)
```json
{
    "_id": "ObjectId",
    "userId": "ObjectId",
    "questionnaireId": "ObjectId",
    "answers": [
        {
            "questionId": "ObjectId",
            "platform": "Salesforce",
            "module": "CRM",
            "subModule": "Data Migration",
            "answer": "High",
            "hours": 8.0
        }
    ]
}
```

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd dynamic-questionnaire-system
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `/backend`:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=questionnaire_db
JWT_SECRET_KEY=your_super_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Start the backend server:
```bash
uvicorn app.main:app --reload
```
- API URL: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Start the frontend server:
```bash
npm run dev
```
- App URL: `http://localhost:5173`

---

## Example Workflow (Project Scoping)

```text
Start: "What type of project is this?" (SINGLE_CHOICE)
 │
 ├─▶ [New Implementation] ──▶ "Select Migration Complexity" (COMPLEXITY)
 │                             │
 │                             ├─▶ [High] ──▶ (Auto-logs 8 Hours) ──▶ Next Q...
 │                             └─▶ [Low]  ──▶ (Auto-logs 2 Hours) ──▶ Next Q...
 │
 └─▶ [System Upgrade] ──────▶ "Describe upgrade risks" (TEXT)
                               │
                               └─▶ [Any Answer] ──▶ 🛑 END ASSESSMENT & SUBMIT
```

---

## Future Enhancements
- **AI-Driven Predictive Scoping** — Implement Machine Learning models to predict required effort hours based on historical text inputs and complexity selections.
- **Visual Graph Builder** — Drag-and-drop node-based interface for visualizing complex branching logic.
- **Advanced Analytics Dashboard** — Aggregated metrics for total project hours and resource requirements.
- **Export Capabilities** — Export logic flows and submission data to CSV/PDF.

---

## Author
**Mounesh M**
SRM Madurai College for Engineering and Technology

B.E Computer Science and Engineering (Artificial Intelligence and Machine Learning)
SRM Madurai College for Engineering and Technology
