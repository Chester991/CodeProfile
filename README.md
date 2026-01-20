# CodeProfile

A unified dashboard to track your competitive programming stats from **LeetCode**, **Codeforces**, and **CodeChef**.

![CodeProfile Dashboard](https://img.shields.io/badge/Status-Active-success)

## Features

- 🔍 **Public Search**: Look up any user's stats without logging in
- 👤 **User Profiles**: Save your platform usernames and track progress
- 🌙 **Dark Mode**: Easy on the eyes with theme toggle
- 📊 **Real-time Stats**: Fetch latest data from all platforms
- 🔒 **Secure Auth**: JWT-based authentication

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/codeprofile.git
   cd codeprofile
   ```

2. Install backend dependencies:
   ```bash
   npm run install:backend
   ```

3. Set up environment variables in `backend/.env`:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `frontend/index.html` in your browser

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set the following environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

## Project Structure

```
codeprofile/
├── api/                    # Vercel serverless functions
├── backend/                # Express.js API
│   ├── controller/         # Route handlers
│   ├── middlewares/        # Auth, error handling
│   ├── model/              # MongoDB schemas
│   ├── routes/             # API routes
│   └── utils/              # Utilities
├── frontend/               # Static frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── vercel.json             # Vercel config
```

## License

ISC
