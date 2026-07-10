# AI Chatbot Web Application - Project Summary

## 📌 Project Overview
This is a full-stack AI chatbot web application built as a college project and interview portfolio piece. The application allows users to interact with an AI chatbot while providing admin monitoring capabilities.

### 🎯 Key Features
- **User Authentication**: Registration, login, logout, password reset
- **AI Chat Interface**: Streaming (token-by-token) AI responses over Server-Sent Events
- **Message Management**: Edit and delete your own messages
- **Chat History**: View, continue, rename, and delete previous conversations
- **Admin Dashboard**: Monitor users and conversations, manage roles, delete records
- **Profile Management**: Edit user profile information
- **Dark Mode**: Full light/dark theme support

### 🛠 Tech Stack
| Category       | Technologies Used                          |
|---------------|--------------------------------------------|
| **Frontend**  | React.js, Vite, Tailwind CSS, Lucide Icons |
| **Backend**   | Node.js, Express.js, express-rate-limit     |
| **Database**  | Supabase (PostgreSQL + Authentication)     |
| **AI**        | Google Gemini (`gemini-2.5-flash`) via `@google/genai` (free tier); falls back to a mock reply when no API key is set |

---

## ✅ Completed Work

### 1️⃣ Project Setup
- [x] Created project folder structure (`frontend` and `backend`)
- [x] Initialized frontend with Vite + React
- [x] Initialized backend with Node.js + Express
- [x] Installed all required dependencies

### 2️⃣ Supabase Configuration
- [x] Created Supabase project
- [x] Set up database tables:
  - `profiles` (user information)
  - `conversations` (chat sessions)
  - `messages` (chat messages)
- [x] Configured Row Level Security (RLS) policies
- [x] Set up authentication

### 3️⃣ Frontend Development
#### User Interface
- [x] **Login Page** (`/login`)
- [x] **Registration Page** (`/register`)
- [x] **Chat Interface** (`/chat`)
  - Message bubbles with timestamps
  - Token-by-token streaming AI responses (SSE)
  - Edit and delete your own messages
  - AI response copying functionality
  - Suggestion cards for new conversations
  - "AI is typing..." indicator (before the first token arrives)
- [x] **Profile Page** (`/profile`)
- [x] **Dark Mode** across the app
- [x] **Sidebar Navigation**
  - New chat button
  - Conversation history (rename / delete)
  - Profile and logout links

#### Admin Interface
- [x] **Admin Login** (`/admin/login`)
- [x] **Admin Dashboard** (`/admin/dashboard`)
  - Statistics cards (users, conversations, messages)
  - Recent users and conversations tables
- [x] **Users Management** (`/admin/users`)
  - Searchable user table
  - Change user roles (user/admin) and delete users
- [x] **Conversations Monitoring** (`/admin/conversations`)
  - Searchable conversation table
  - View conversation details and delete conversations

### 4️⃣ Backend Development
- [x] **Server Setup** (`server.js`)
- [x] **API Routes**
  - `/api/chat` - Streams AI responses over Server-Sent Events (real Gemini when `GEMINI_API_KEY` is set, mock otherwise)
  - `/api/admin/stats` - Dashboard statistics
  - `/api/admin/users` - List users, update roles, delete users
  - `/api/admin/conversations` - List conversations, view details, delete
- [x] **Middleware**
  - Authentication verification (`requireAuth`)
  - Admin role verification (`requireAdmin`)
  - Rate limiting (global + per-chat)
- [x] **Supabase Integration**
  - Database operations
  - Authentication handling
- [x] **Gemini Integration**
  - Streaming via `genAI.models.generateContentStream()`
  - Aborts generation when the client disconnects

### 5️⃣ Authentication & Security
- [x] User registration with email/password
- [x] User login/logout functionality
- [x] Protected routes for authenticated users
- [x] Admin-only routes with role verification
- [x] Row Level Security (RLS) policies in Supabase
- [x] Environment variables for sensitive data

### 6️⃣ Testing
- [x] User flow testing (registration → login → chat → logout)
- [x] Admin flow testing (login → dashboard → users → conversations)
- [x] Responsive design testing
- [x] Error handling verification

---

## ✅ Recently Completed (previously pending)

- [x] **Real AI integration** — Google Gemini (`gemini-2.5-flash`, free tier) with streaming; mock fallback when no key is configured
- [x] **Message editing/deletion** — users can edit and delete their own messages
- [x] **Conversation renaming & deletion** — from the sidebar
- [x] **Dark mode** — light/dark theme across the app
- [x] **Password reset** — recovery flow via Supabase Auth
- [x] **Admin user management** — change roles, delete users (auth-user deletion requires the service role key)
- [x] **Admin conversation deletion**
- [x] **Rate limiting** — global (100/15min) and per-chat (20/5min)

---

## ❌ Pending Work / Limitations

### 1️⃣ Database Enhancements
- [ ] **Pagination** — admin tables lack pagination for large datasets

### 2️⃣ User Experience Improvements
- [ ] **Mobile Responsiveness** — some admin tables may not display well on mobile
- [ ] **Loading States** — more comprehensive loading indicators

### 3️⃣ Admin Features
- [ ] **Export Functionality** — no way to export user/conversation data
- [ ] **Analytics** — no advanced analytics or charts

### 4️⃣ Performance & Scalability
- [ ] **Caching** — no caching for frequent queries
- [ ] **Optimized Queries** — some database queries could be optimized

### 5️⃣ Deployment
- [ ] **Production Deployment** — not yet deployed to a hosting service
- [ ] **CI/CD Pipeline** — no automated deployment setup

### 6️⃣ Additional Features (Future Scope)
- [ ] **File Uploads** — users cannot upload files to chat
- [ ] **Multi-language Support** — only English supported
- [ ] **Custom AI Personalities** — no option to choose different AI personalities
- [ ] **Notifications** — no email or in-app notifications

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Supabase account

### Setup Instructions
1. **Clone the project** (if not already done)
2. **Install dependencies**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. **Set up Supabase**
   - Create a new project in Supabase
   - Run the SQL from `STEP 2` of the project setup
   - Enable email/password authentication
4. **Configure environment variables**
   - Create `.env` files in both `frontend` and `backend` folders
   - Add Supabase credentials (see below)

### Environment Variables
#### Frontend (`.env`)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

#### Backend (`.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000
# Enables real AI responses (free key at https://aistudio.google.com/apikey):
# GEMINI_API_KEY=...
# Optional: enables admin auth-user deletion:
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Running the Application
1. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - User interface: [http://localhost:5173](http://localhost:5173)
   - Admin interface: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## 📝 Project Structure
```
ai-chatbot-project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   └── AdminSidebar.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Conversations.jsx
│   │   │   └── ConversationDetails.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── Profile.jsx
│   │   ├── lib/
│   │   │   └── supabase.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/
    ├── config/
    │   └── supabase.js
    ├── routes/
    │   ├── chatRoutes.js
    │   └── adminRoutes.js
    ├── .env
    ├── package.json
    └── server.js
```

---

## 🎓 Interview Preparation Guide

### Key Points to Explain
1. **Project Architecture**
   - Frontend (React) → Backend (Node.js) → Database (Supabase)
   - Separation of concerns (user vs admin interfaces)

2. **Authentication Flow**
   - Supabase Auth for user registration/login
   - JWT token management
   - Protected routes for authenticated users
   - Admin role verification

3. **Database Design**
   - Three main tables: `profiles`, `conversations`, `messages`
   - Relationships: User → Conversations → Messages
   - Row Level Security (RLS) policies

4. **Chat Functionality**
   - Message storage and retrieval
   - Conversation management (rename, delete)
   - Real Gemini integration with SSE streaming (mock fallback when no key)

5. **Admin Features**
   - Separate admin interface
   - Monitoring plus management (roles, deletions)
   - Statistics and reporting

### Common Interview Questions
1. **Why did you choose this tech stack?**
   - React for frontend (popular, component-based)
   - Node.js/Express for backend (simple, JavaScript consistency)
   - Supabase for database/auth (free tier, easy setup)

2. **How does authentication work?**
   - Supabase Auth handles registration/login
   - JWT tokens for session management
   - Protected routes verify authentication

3. **How does the AI streaming work?**
   - Backend calls `genAI.models.generateContentStream()` and forwards text chunks as SSE (`data: {...}`)
   - Frontend reads the stream with `fetch` + `response.body.getReader()` and renders tokens as they arrive
   - Falls back to a mock response when no `GEMINI_API_KEY` is configured

4. **How is security handled?**
   - Environment variables for sensitive data
   - Row Level Security in Supabase
   - Admin role verification
   - Protected routes
   - Rate limiting on the API

5. **What would you improve?**
   - Add pagination for admin tables
   - Improve mobile responsiveness
   - Add export/analytics for admins
   - Deploy to production with CI/CD

---

## 📅 Future Roadmap
1. **Short-term (1-2 weeks)**
   - Add pagination for admin tables
   - Improve mobile responsiveness
   - Add export functionality for admins

2. **Medium-term (1 month)**
   - Implement file uploads
   - Add basic analytics/charts
   - Add caching and query optimization

3. **Long-term (3+ months)**
   - Deploy to production
   - Set up CI/CD pipeline
   - Add multi-language support
   - Implement custom AI personalities
   - Add user notifications

---

## 📚 Resources
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/)