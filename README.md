<div align="center">

# 🇮🇳 BharatSeva AI
### AI-Powered Citizen Copilot for Government Welfare & Public Services

<img src="https://img.shields.io/badge/IBM-watsonx.ai-blue?style=for-the-badge&logo=ibm" />
<img src="https://img.shields.io/badge/IBM-Granite-052FAD?style=for-the-badge&logo=ibm" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
<img src="https://img.shields.io/badge/Flask-3.0-black?style=for-the-badge&logo=flask" />
<img src="https://img.shields.io/badge/TailwindCSS-38BDF8?style=for-the-badge&logo=tailwindcss" />
<img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python" />

---

### 🚀 Empowering Every Citizen with AI

**BharatSeva AI** is an intelligent digital public service platform that helps citizens discover government schemes, verify eligibility, generate personalized action plans, track applications, manage documents, and interact with an AI-powered assistant built using **IBM watsonx.ai** and **IBM Granite Models**.

> "Making Government Services Simple, Accessible and Intelligent."

</div>

---

# 📖 Table of Contents

- Overview
- Features
- Architecture
- Technology Stack
- IBM Technologies Used
- AI Workflow
- Project Structure
- Installation
- Environment Variables
- Running Locally
- Screenshots
- API Overview
- Security Features
- Future Scope
- Contributors
- License

---

# 🌟 Overview

Every year millions of eligible citizens fail to receive government benefits simply because they don't know which schemes exist or how to apply.

BharatSeva AI solves this problem by acting as an intelligent **AI Citizen Copilot**.

Instead of manually searching government websites, users simply describe their goal in natural language.

Example:

> "I want to start a dairy farm."

The AI automatically:

- Understands the goal
- Finds relevant government schemes
- Checks eligibility
- Explains why schemes were selected
- Generates a personalized roadmap
- Lists required documents
- Tracks applications
- Answers follow-up questions

---

# ✨ Key Features

## 🤖 AI Citizen Copilot

- Natural language goal input
- Personalized action plans
- Government scheme recommendations
- Explainable AI responses
- IBM Granite powered

---

## 🎯 Eligibility Checker

- AI-powered eligibility analysis
- Confidence score
- Reasoning panel
- Government source references

---

## 💬 AI Chat Assistant

Ask questions like:

- Which schemes are available for farmers?
- How do I apply for PM-KISAN?
- Which documents are required?
- Explain MSME registration.

Powered by IBM Granite.

---

## 📄 Document Vault

- Secure document management
- Categorized uploads
- Scheme-wise organization

---

## 📅 Deadline Calendar

Never miss important dates.

Tracks:

- Applications
- Deadlines
- Renewals
- Follow-ups

---

## 📊 Application Tracker

Monitor every application through stages:

- Not Started
- In Progress
- Submitted
- Approved
- Rejected

---

## ❤️ Saved Schemes

Bookmark schemes for later.

---

## 🔔 Smart Notifications

Receive reminders for:

- Deadlines
- Missing documents
- New recommendations

---

## 🌍 Multi-language Support

Supports:

- English
- Hindi

(Architecture prepared for additional Indian languages.)

---

# 🏗 System Architecture

```
                 +---------------------------+
                 |      React Frontend       |
                 +-------------+-------------+
                               |
                               |
                      Axios REST APIs
                               |
                               ▼
                +----------------------------+
                |      Flask Backend         |
                +----------------------------+
                   |        |         |
                   |        |         |
          Authentication   AI    Database
                   |        |         |
                   ▼        ▼         ▼

           JWT      IBM watsonx.ai   SQLite

                          │
                          ▼

                 IBM Granite Foundation Model

```

---

# 🤖 AI Workflow

```
Citizen Goal

↓

AI Copilot

↓

IBM Granite

↓

Government Scheme Analysis

↓

Eligibility Reasoning

↓

Personalized Action Plan

↓

Document Checklist

↓

Application Tracker

↓

Notifications
```

---

# 💻 Technology Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios
- Framer Motion
- Recharts
- Lucide Icons

---

## Backend

- Flask
- SQLAlchemy
- Marshmallow
- JWT Authentication
- Flask Limiter
- REST APIs

---

## AI

- IBM watsonx.ai
- IBM Granite Foundation Models
- Prompt Engineering
- Explainable AI
- AI Confidence Scoring

---

## Database

- SQLite
- SQLAlchemy ORM

---

## Authentication

- JWT
- Refresh Tokens
- RBAC
- Secure Password Hashing (bcrypt)

---

# ☁ IBM Technologies Used

✅ IBM watsonx.ai

✅ IBM Granite Foundation Models

✅ IBM Cloud

✅ IBM Watson Machine Learning Runtime

---

# 📂 Project Structure

```
bharatseva-ai/

├── backend/
│   ├── ai/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── app/
│   ├── run.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── assets/
│   └── main.jsx
│
├── docs/
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/bharatseva-ai.git

cd bharatseva-ai
```

---

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt
```

---

## Frontend

```bash
cd frontend

npm install
```

---

# 🔑 Environment Variables

Backend `.env`

```env
SECRET_KEY=your_secret_key

JWT_SECRET_KEY=your_jwt_secret

DATABASE_URL=sqlite:///bharatseva.db

WATSONX_API_KEY=your_api_key

WATSONX_PROJECT_ID=your_project_id

WATSONX_URL=https://us-south.ml.cloud.ibm.com

WATSONX_MODEL_CHAT=ibm/granite-4-h-small
```

Frontend `.env.local`

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

# ▶ Running the Project

Backend

```bash
python run.py
```

Frontend

```bash
npm run dev
```

Backend

```
http://localhost:5000
```

Frontend

```
http://localhost:5173
```

---

# 🔐 Security Features

- JWT Authentication
- Refresh Token Rotation
- Password Hashing (bcrypt)
- Rate Limiting
- Role-Based Access Control
- Input Validation
- API Versioning
- Secure Environment Variables

---

# 📡 API Overview

Authentication

```
POST /api/v1/auth/signup

POST /api/v1/auth/login

POST /api/v1/auth/refresh
```

AI

```
POST /api/v1/chat

POST /api/v1/goals

POST /api/v1/eligibility/check
```

Citizen

```
GET /api/v1/profile

PUT /api/v1/profile

GET /api/v1/schemes

GET /api/v1/notifications

GET /api/v1/applications
```

---

# 📸 Screenshots

> Add screenshots here

- Landing Page

- Dashboard

- AI Copilot

- AI Chat

- Eligibility Checker

- Application Tracker

- Admin Dashboard

---

# 🚀 Future Scope

- Voice Assistant
- Regional Language Support
- OCR Document Verification
- WhatsApp Integration
- SMS Notifications
- Aadhaar Integration
- DigiLocker Integration
- UPI-based Application Fees
- AI-powered Form Filling
- Predictive Eligibility Engine
- Mobile App (React Native)

---

# 🤝 Contributors

**Rohit Sah**

Computer Science Engineering

Lovely Professional University

---

# ⭐ Support

If you found this project useful,

please consider giving it a ⭐ on GitHub.

---

<div align="center">

### Built with ❤️ using IBM watsonx.ai + IBM Granite + React + Flask

**Making Government Services Intelligent for Every Citizen**

</div>
