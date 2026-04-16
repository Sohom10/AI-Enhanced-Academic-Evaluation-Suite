<div align="center">
  <img src="./assets/project_banner.png" width="100%" alt="AI Academic Evaluation Suite Banner" />
</div>

# AI-Enhanced Academic Evaluation Suite 🎓🤖

[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-API-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

A sophisticated, enterprise-grade academic evaluation platform that leverages Generative AI and OCR to streamline examination workflows, automate grading for handwritten scripts, and provide deep analytical insights for educational institutions.

## ✨ Key Features

### 👨‍🎓 Student Portal
- **Cinematic Dashboard**: Track academic performance with beautiful glassmorphic visualizations.
- **Exam Interface**: Seamlessly access and attempt scheduled examinations.
- **Results Tracking**: Instant feedback on graded submissions with AI-driven insights.

### 👩‍🏫 Teacher Portal
- **Exam Orchestration**: Create and manage detailed examinations with ease.
- **AI-Assisted Grading**: Automate the grading of handwritten Scripts using Tesseract OCR and Gemini Pro Vision.
- **Submission Management**: Real-time tracking of student submissions and grading status.

### 🛡️ Admin Portal
- **Institutional Governance**: Manage users, roles, and system-wide configurations.
- **Advanced Analytics**: Holistic view of academic performance across the institution.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database/Auth**: [Firebase Admin SDK](https://firebase.google.com/)
- **Intelligence**: [Google Gemini AI API](https://ai.google.dev/)
- **Computer Vision**: [Tesseract.js](https://tesseract.projectnaptha.com/) (OCR)
- **Media Hosting**: [Cloudinary](https://cloudinary.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- Firebase Project & Service Account Key
- Gemini API Key
- Cloudinary Account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/academic-eval-suite.git
   cd academic-eval-suite
   ```

2. **Backend Setup**:
   - Navigate to the `backend` directory: `cd backend`
   - Install dependencies: `npm install`
   - Create a `.env` file from `.env.example`:
     ```env
     PORT=5000
     JWT_SECRET=your_secret_key
     GEMINI_API_KEY=your_gemini_key
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     FIREBASE_PROJECT_ID=your_project_id
     ```
   - Place your `serviceAccountKey.json` in the `backend` root.

3. **Frontend Setup**:
   - Navigate to the `frontend` directory: `cd ../frontend`
   - Install dependencies: `npm install`

### 🏗️ Project Structure
```text
.
├── backend/            # Express.js API & AI Services
│   ├── controllers/    # Business Logic
│   ├── routes/         # API Endpoints
│   ├── models/         # Data Schemas
│   └── utils/          # Helper Services (Cloudinary, Firebase)
├── frontend/           # Next.js Application
│   └── src/app/        # App Router Pages & UI Components
└── start.bat           # Multi-process Start Script
```

### Running Locally

You can use the root `start.bat` (Windows) or run the servers manually:

**Root Execution:**
```bash
npm start
```

**Manual Execution:**
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`

---

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/32210738-9a1c-4f5a-b6f3-4d79d3f60949" width="48%" alt="Dashboard Overview" />
  <img src="https://github.com/user-attachments/assets/2223ce24-60a6-444a-91d0-3022f9aa7bbb" width="48%" alt="AI Analysis View" />
  <br />
  <img src="https://github.com/user-attachments/assets/ff4110e9-2914-4800-9390-8ffde0c7378f" width="48%" alt="Teacher Portal" />
  <img src="https://github.com/user-attachments/assets/66ad3fa3-713a-4e72-8a7b-5b0c0c60daac" width="48%" alt="Exam Management" />
  <br />
  <img src="https://github.com/user-attachments/assets/6c6400a7-3f06-45f4-8d62-070f724097e7" width="48%" alt="Student Interface" />
  <img src="https://github.com/user-attachments/assets/e0519ae7-f890-4f86-9eba-af28aefdf984" width="48%" alt="Results & Grading" />
  <br />
  <img src="https://github.com/user-attachments/assets/47dbb2bf-7b01-4a54-bfd9-d9436921ee1e" width="48%" alt="OCR Processing" />
  <img src="https://github.com/user-attachments/assets/105ddbd2-62b8-402a-bd5b-42f99f1c5c70" width="48%" alt="Admin Governance" />
  <br />
  <img src="https://github.com/user-attachments/assets/e18827ac-5052-4935-9ff7-0a2324b3e460" width="48%" alt="System Settings" />
  <img src="https://github.com/user-attachments/assets/4cd84810-5fab-4daf-a1c1-f6028fcb5625" width="48%" alt="Analytics Report" />
</div>

---

## 📄 License
This project is licensed under the ISC License.

---

Built with ❤️ for Modern Education.
