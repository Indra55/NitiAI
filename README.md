# SkillSphere - AI Career Guidance Platform 🚀

SkillSphere is an intelligent career acceleration platform that helps users analyze their resumes, gain market insights, and generate professional portfolios using AI.

## 🌟 Key Features

*   **📄 AI Resume Parsing**: Automatically extracts professional details (skills, experience, education) from PDF resumes using Google Gemini AI.
*   **🎭 Career Persona**: Generates a detailed professional persona summarizing your strengths, weaknesses, and unique value proposition based on deep resume analysis.
*   **🤖 AI Career Coach**: Interactive chat interface providing personalized career advice, role recommendations, and skill gap analysis.
*   **💼 LinkedIn Job Tracker**: Browser extension integration that allows you to save jobs directly from LinkedIn, track application status, and get AI-match scores instantly.
*   **👥 Peer Learning**: Connect with peers aiming for similar roles to share resources, conduct study sessions, and track progress together.
*   **📚 Personalized Learning**: Curated learning paths and resource recommendations tailored to close your specific skill gaps.
*   **💻 Mock Interview Arena**: Full-featured coding interview environment with **P2P Video/Audio** (WebRTC) and a real-time code compiler hosted on **GCP Computer Engine**.
*   **📝 AI Performance Reports**: Detailed post-interview feedback analyzing code quality, efficiency, and interview performance.
*   **📊 Job Market Trends**: Visualizes trending roles, fast-growing industries, and salary insights tailored to your profile.
*   **🌐 Dynamic Portfolio Builder**: Generates a stunning, downloadable personal portfolio website based on your resume data.
*   **🔒 Secure Authentication**: Robust user authentication system using JWT.

## 🛠️ Tech Stack

### Client (Frontend)
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Real-time**: [Socket.io Client](https://socket.io/) (for signaling)
*   **Video**: WebRTC (Peer-to-Peer)

### Server (Backend)
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **AI**: [Google Generative AI (Gemini)](https://ai.google.dev/)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Real-time**: [Socket.io](https://socket.io/)
*   **Infrastructure**: [Google Cloud Platform (GCP)](https://cloud.google.com/) (Compute Engine for Code Execution)
*   **File Handling**: Multer, PDF-Parse

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [PostgreSQL](https://www.postgresql.org/) (Local or Cloud instance)
*   [Git](https://git-scm.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillsphere.git
cd skillsphere
```

### 2. Backend Setup (`/server`)

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
# Database Configuration
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=skillsphere_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Security
JWT_SECRET=your_super_secret_jwt_key

# AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend server:

```bash
npm run dev
```
*The server will start on http://localhost:5000*

### 3. Frontend Setup (`/client`)

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```
*The application will be accessible at http://localhost:3000*

## 🗄️ Database Schema

Make sure your PostgreSQL database has the following tables (or use the provided migration script if available):

*   `users`: Stores user credentials and profile info.
*   `resume_info`: Stores parsed resume data and AI insights.

## 🧪 Usage Guide

1.  **Sign Up/Login**: Create an account to access the dashboard.
2.  **Upload Resume**: Upload your PDF resume. The AI will parse it and populate your profile.
3.  **Explore Dashboard**: View your skills analysis and career trajectory.
4.  **Job Trends**: Check the "Job Trends" page for AI-driven market insights.
5.  **Chat with AI**: Use the chat feature to ask specific career questions (e.g., "What skills should I learn next?").
6.  **Generate Portfolio**: Go to "Portfolio," customize your settings, and download a standalone HTML portfolio file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
