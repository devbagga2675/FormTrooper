# FormTrooper

## Intelligent Form Generation & Analysis



**Hosted Project Link :** Project hasnt been hosted yet 😔

---

## 🚀 Project Overview

FormTrooper revolutionizes form creation and data analysis by leveraging cutting-edge AI. It transforms the traditionally manual, time-consuming process of designing surveys and analyzing responses into an instant, intelligent workflow. From a simple text prompt, FormTrooper generates complete, editable forms, then uses AI to analyze collected responses, providing deep, actionable insights.

Our vision is to empower professionals to not just ask questions, but to truly understand the answers, making FormTrooper the essential agentic tool for smarter data collection and analysis.

---

## ✨ Features

### Core Functionality
* **AI-Powered Form Generation:** Create entire forms from a single text prompt or by uploading a document.
* **Intuitive Form Editor:**
    * Edit form titles, descriptions, and individual questions.
    * Modify question types (Multiple Choice, Short Answer, Paragraph, Checkboxes, Linear Scale).
    * Add, remove, and reorder options for choice-based questions.
    * Define correct answers for gradable questions.
* **Secure Authentication:** User login and signup via Google OAuth.

### AI-Powered Data Analysis
* **AI Co-pilot for Question Refinement:** Regenerate or improve questions with AI suggestions directly in the editor.
* **Dynamic AI Analysis Dashboard:**
    * Receive AI-suggested analysis actions tailored to your form's data.
    * Trigger comprehensive analyses (e.g., sentiment analysis, trend identification) on collected responses.
    * Ask natural language questions about your data and get AI-generated answers.
* **Response Management:**
    * Store and retrieve all submitted form responses.
    * View individual responses in a detailed, user-friendly modal.

### Developer & Testing Tools
* **AI-Generated Dummy Data:** Quickly populate forms with realistic, AI-generated responses for robust testing and development.
* **Excel Export:** Download all responses for a form in Excel format.

---

Frontend (formtrooper-frontend): A React.js application powered by Vite, providing the user interface and interactions. Deployed on Vercel.

Backend (formtrooper-backend): An Express.js (Node.js) server acting as the central API gateway. It handles user authentication, data persistence with Prisma and PostgreSQL, and orchestrates calls to the AI Service. Deployed on Render.

AI Service (ai-service): A FastAPI (Python) microservice dedicated to complex AI operations. It integrates with LangChain for interactions with Google Gemini, Jina AI for embeddings, and Pinecone for vector storage. Deployed on Render.

🛠️ Technical Stack
Frontend: React.js, Vite, react-router-dom, Tailwind CSS, Headless UI, lucide-react, react-textarea-autosize, react-markdown.

Backend: Node.js, Express.js, Prisma ORM, PostgreSQL.

AI Service: Python, FastAPI, LangChain, uvicorn.

AI Models:

Generative: Google Gemini 1.5 Flash

Embeddings: Jina AI Embeddings v2

External Services:

Authentication: Google OAuth

File Storage: Cloudinary

Vector Database: Pinecone

Deployment: Vercel (Frontend), Render (Backend, AI Service, PostgreSQL).

🚀 Getting Started (Local Development)
To run FormTrooper locally, follow these steps:

1. Prerequisites
Node.js (LTS version)

Python 3.9+

npm or yarn

Docker (recommended for PostgreSQL setup)

Google Cloud Project (for Google OAuth and Gemini API)

Cloudinary Account

Pinecone Account

2. Clone the Repository
Bash

git clone [https://github.com/your-username/FormTrooper.git](https://github.com/your-username/FormTrooper.git)
cd FormTrooper
3. Backend Setup (formtrooper-backend)
Bash

cd formtrooper-backend
npm install
# Create a .env file based on .env.example with your credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/formtrooperdb"
# JWT_SECRET="your_jwt_secret"
# GOOGLE_CLIENT_ID="your_google_client_id"
# GOOGLE_CLIENT_SECRET="your_google_client_secret"
# CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
# CLOUDINARY_API_KEY="your_cloudinary_api_key"
# CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
npx prisma migrate dev --name init # Apply database migrations
npm start
4. AI Service Setup (ai-service)
Bash

cd ../ai-service
pip install -r requirements.txt
# Create a .env file based on .env.example with your credentials
# GOOGLE_API_KEY="your_gemini_api_key"
# PINECONE_API_KEY="your_pinecone_api_key"
# PINECONE_ENVIRONMENT="your_pinecone_environment"
# CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
# CLOUDINARY_API_KEY="your_cloudinary_api_key"
# CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
uvicorn app.main:app --reload --port 8000
Note: Ensure the CLOUDINARY credentials match between backend and AI service if both are interacting with Cloudinary directly.

5. Frontend Setup (formtrooper-frontend)
Bash

cd ../formtrooper-frontend
npm install
# Create a .env file based on .env.example
# VITE_API_URL="http://localhost:3000/api" # Or your backend's URL
npm run dev
The frontend will typically run on http://localhost:5173.

🤝 Contributing
We welcome contributions to FormTrooper! Please refer to our CONTRIBUTING.md (if available) for guidelines on how to submit issues, features, or pull requests.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Credits
Developed by: Dev Bagga (22000737)
