# ProctoAI — Online Exam System

An AI-powered online examination platform with real-time proctoring using face detection, gaze tracking, and object detection.

---

## What Was Done (Repo Cleanup)

This repository was restructured and cleaned up from a flat/mixed layout into a professional monorepo structure:

- **Separated all code** into `backend/`, `frontend/`, and `database/` folders
- **Removed** the leftover empty `FYP/` folder (artifact from original upload)
- **Fixed `.gitignore`** — had UTF-16 null-byte corruption in several entries; rewrote it cleanly
- **Added biometric data exclusions** to `.gitignore` so captured face images, screenshots, evidence photos, and face enrollment data (`.npy`, `face_db/`, `enrolled_faces/`, etc.) are never committed
- **Verified** no captured photos or biometric data exist anywhere in the repository — only UI background assets are tracked

---

## Project Structure

```
codefilesbeforedriveworking/
├── backend/
│   ├── api/                  # REST API server (Flask/FastAPI)
│   │   ├── server.py
│   │   ├── db.py
│   │   └── apiintegration.py
│   ├── proctoring/           # AI proctoring engine
│   │   ├── detect_faces.py
│   │   ├── detect_gaz_andlog.py
│   │   ├── look_away.py
│   │   ├── object.py
│   │   ├── log_and_checks.py
│   │   ├── utils.py
│   │   └── merged_code.py
│   ├── scripts/
│   │   └── enroll_cli.py     # Face enrollment CLI tool
│   ├── tests/
│   │   ├── cam_test.py
│   │   ├── test_face.py
│   │   └── test_utils.py
│   ├── models/               # ML model weights (gitignored)
│   ├── data/
│   │   ├── evidence_images/  # Runtime captures (gitignored)
│   │   └── screenshots/      # Runtime screenshots (gitignored)
│   └── requirements.txt
│
├── frontend/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Login, Signup, Admin Login
│   │   │   ├── admin/        # Admin Dashboard, Add Question, Check Exam/Marks
│   │   │   ├── student/      # Student Dashboard, Attendance, View Result
│   │   │   └── exam/         # Exam Instructions, Objective, Subjective, Select
│   │   ├── assets/           # UI background images, logo
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   ├── proctorai.sql          # Local MySQL schema
│   └── proctorai_supabase.sql # Supabase schema
│
└── .gitignore
```

---

## Planned Features (In Progress)

- Landing page
- Sign up / Sign in pages
- Student dashboard
- Admin dashboard
- Complete exam flow (objective + subjective)
- Real-time AI proctoring during exams

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React, Vite, TypeScript, CSS      |
| Backend  | Python, Flask/FastAPI             |
| AI/ML    | YOLOv8, OpenCV, face_recognition  |
| Database | MySQL / Supabase (PostgreSQL)     |
