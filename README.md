# 📚 VPad - Student Notes Management Application

A full-stack MERN application for students to organize, write, share, and collaboratively edit academic notes.

## 🌟 Features

### Core Features

- **Academic Structure**: Organize notes by Institution → Semester → Subject → Notes
- **Rich Text Editor**: Full-featured editor with support for:
  - English and Urdu (RTL) languages
  - Math equations (LaTeX/MathJax)
  - Code blocks with syntax highlighting
  - Image attachments
- **Real-time Collaboration**: Work together on notes with Socket.IO live updates
- **Sharing System**: Share notes with other users with view/edit permissions
- **Comments & Discussions**: Threaded comments with mentions and reactions

### AI Features

- **AI Summarization**: Summarize notes using OpenAI or Gemini
- **Handwritten OCR**: Extract text from handwritten note images
- **Quiz Generation**: Auto-generate practice quizzes from notes

### Additional Features

- **Notifications**: Real-time notifications for shares, comments, and updates
- **User Profiles**: Customizable profiles with preferences
- **Admin Panel**: Full admin dashboard with user management and announcements

## 🛠 Tech Stack

### Frontend

- React.js 18
- React Router v6
- Zustand (State Management)
- TailwindCSS + MUI
- TipTap (Rich Text Editor)
- Socket.IO Client
- Framer Motion

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO
- Nodemailer

### AI Integration

- OpenAI API
- Google Gemini API

## 📁 Project Structure

```
VPad/
├── client/                 # User-facing React application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   └── store/         # Zustand stores
│   └── ...
├── admin-client/          # Admin panel React application
│   ├── src/
│   │   ├── api/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── store/
│   └── ...
└── server/                # Express.js backend
    ├── config/            # Database & service configs
    ├── controllers/       # Route controllers
    ├── middlewares/       # Custom middlewares
    ├── models/            # Mongoose models
    ├── routes/            # API routes
    ├── services/          # Business logic services
    ├── sockets/           # Socket.IO handlers
    ├── utils/             # Utility functions
    ├── app.js            # Express app setup
    └── server.js         # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
cd VPad
```

2. **Install server dependencies**

```bash
cd server
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/vpad

# JWT Secrets (use strong random strings)
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI (Optional - use one or both)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **Install and configure client**

```bash
cd ../client
npm install
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_API_BASE_PATH=/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=VPad
```

5. **Install and configure admin-client**

```bash
cd ../admin-client
npm install
cp .env.example .env
```

Edit `admin-client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_API_BASE_PATH=/api/v1
VITE_APP_NAME=VPad Admin
```

### Running the Application

1. **Start the server** (from `/server`)

```bash
npm run dev
```

Server runs on `http://localhost:5000`

2. **Start the client** (from `/client`)

```bash
npm run dev
```

Client runs on `http://localhost:3000`

3. **Start the admin panel** (from `/admin-client`)

```bash
npm run dev
```

Admin panel runs on `http://localhost:3001`

## 📖 API Documentation

### Authentication

| Method | Endpoint                             | Description            |
| ------ | ------------------------------------ | ---------------------- |
| POST   | `/api/v1/auth/register`              | Register new user      |
| POST   | `/api/v1/auth/login`                 | Login user             |
| GET    | `/api/v1/auth/verify-email/:token`   | Verify email           |
| POST   | `/api/v1/auth/forgot-password`       | Request password reset |
| POST   | `/api/v1/auth/reset-password/:token` | Reset password         |
| POST   | `/api/v1/auth/refresh-token`         | Refresh access token   |
| GET    | `/api/v1/auth/me`                    | Get current user       |

### Institutions

| Method | Endpoint                   | Description          |
| ------ | -------------------------- | -------------------- |
| GET    | `/api/v1/institutions`     | Get all institutions |
| POST   | `/api/v1/institutions`     | Create institution   |
| GET    | `/api/v1/institutions/:id` | Get institution      |
| PATCH  | `/api/v1/institutions/:id` | Update institution   |
| DELETE | `/api/v1/institutions/:id` | Delete institution   |

### Semesters

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| GET    | `/api/v1/semesters`     | Get all semesters |
| POST   | `/api/v1/semesters`     | Create semester   |
| GET    | `/api/v1/semesters/:id` | Get semester      |
| PATCH  | `/api/v1/semesters/:id` | Update semester   |
| DELETE | `/api/v1/semesters/:id` | Delete semester   |

### Subjects

| Method | Endpoint               | Description      |
| ------ | ---------------------- | ---------------- |
| GET    | `/api/v1/subjects`     | Get all subjects |
| POST   | `/api/v1/subjects`     | Create subject   |
| GET    | `/api/v1/subjects/:id` | Get subject      |
| PATCH  | `/api/v1/subjects/:id` | Update subject   |
| DELETE | `/api/v1/subjects/:id` | Delete subject   |

### Notes

| Method | Endpoint                      | Description   |
| ------ | ----------------------------- | ------------- |
| GET    | `/api/v1/notes`               | Get all notes |
| POST   | `/api/v1/notes`               | Create note   |
| GET    | `/api/v1/notes/:id`           | Get note      |
| PATCH  | `/api/v1/notes/:id`           | Update note   |
| DELETE | `/api/v1/notes/:id`           | Delete note   |
| POST   | `/api/v1/notes/:id/share`     | Share note    |
| POST   | `/api/v1/notes/:id/summarize` | AI summarize  |
| POST   | `/api/v1/notes/:id/quiz`      | Generate quiz |

### Comments

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| POST   | `/api/v1/comments`              | Create comment    |
| GET    | `/api/v1/comments/note/:noteId` | Get note comments |
| PATCH  | `/api/v1/comments/:id`          | Update comment    |
| DELETE | `/api/v1/comments/:id`          | Delete comment    |

### Notifications

| Method | Endpoint                         | Description       |
| ------ | -------------------------------- | ----------------- |
| GET    | `/api/v1/notifications`          | Get notifications |
| PATCH  | `/api/v1/notifications/:id/read` | Mark as read      |
| PATCH  | `/api/v1/notifications/read-all` | Mark all read     |

### Admin

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| GET    | `/api/v1/admin/dashboard`     | Get dashboard stats |
| GET    | `/api/v1/admin/users`         | Get all users       |
| PATCH  | `/api/v1/admin/users/:id`     | Update user         |
| GET    | `/api/v1/admin/admins`        | Get all admins      |
| POST   | `/api/v1/admin/admins`        | Create admin        |
| POST   | `/api/v1/admin/announcements` | Create announcement |

## 🔒 Security Features

- Password hashing with bcrypt
- JWT access and refresh tokens
- Email verification
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation
- Role-based access control (RBAC)

## 🌐 Environment Variables

| Variable             | Description                            |
| -------------------- | -------------------------------------- |
| `NODE_ENV`           | Environment (development/production)   |
| `PORT`               | Server port (default: 5000)            |
| `MONGODB_URI`        | MongoDB connection string              |
| `JWT_ACCESS_SECRET`  | JWT access token secret                |
| `JWT_REFRESH_SECRET` | JWT refresh token secret               |
| `EMAIL_HOST`         | SMTP host                              |
| `EMAIL_PORT`         | SMTP port                              |
| `EMAIL_USER`         | SMTP username                          |
| `EMAIL_PASS`         | SMTP password                          |
| `CLIENT_URL`         | Frontend URL                           |
| `ADMIN_URL`          | Admin panel URL                        |
| `CLOUDINARY_*`       | Cloudinary credentials                 |
| `OPENAI_API_KEY`     | OpenAI API key                         |
| `GEMINI_API_KEY`     | Google Gemini API key                  |
| `AI_PROVIDER`        | AI provider preference (openai/gemini) |

## 🎨 UI/UX Features

- Modern academic theme
- Responsive design (mobile, tablet, desktop)
- Proper Urdu RTL handling
- Clean typography
- Accessible UI components
- Dark mode support (via preferences)
- Animated transitions

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ for students everywhere
