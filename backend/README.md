# CodeProfile Backend

A full-stack competitive programming dashboard backend that aggregates and visualizes user data from three major coding platforms: LeetCode, Codeforces, and CodeChef.

## Features

- User authentication (register, login, logout, token refresh)
- JWT-based authentication with access and refresh tokens
- Secure password hashing with bcrypt
- Data fetching from LeetCode, Codeforces, and CodeChef
- RESTful API design
- Error handling and logging
- MongoDB integration with Mongoose

## Project Structure

```
backend/
├── controller/
│   ├── authController.js
│   ├── leetcodeController.js
│   ├── codeforcesController.js
│   └── codechefController.js
├── middlewares/
│   ├── auth.js
│   └── errorHandler.js
├── model/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── platformRoutes.js
│   └── userRoutes.js
├── utils/
│   └── logger.js
├── webScraping/
├── .env
├── .gitignore
├── index.js
└── package.json
```

## Installation

1. Clone the repository and navigate to the backend folder
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/codeprofile
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
CODEFORCES_USER_INFO_URL=https://codeforces.com/api/user.info?handles=
CODEFORCES_USER_STATUS_URL=https://codeforces.com/api/user.status?handle=
CODEFORCES_USER_RATING_URL=https://codeforces.com/api/user.rating?handle=
```

4. Replace `MONGO_URI` with your MongoDB connection string
5. Update the secret keys with your own secure random strings

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 3000 by default.

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Authentication
- `POST /api/auth/register` - Register a new user
  - Body: `{ username, email, password }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token

### User Management
- `GET /api/user/profile` - Get user profile (requires authentication)
- `PUT /api/user/profile` - Update user profile (requires authentication)
  - Body: `{ leetcodeUsername, codeforcesUsername, codechefUsername }`

### Platform Data
- `GET /api/platform/leetcode/:username` - Get LeetCode user data
- `GET /api/platform/codeforces/:username` - Get Codeforces user data
- `GET /api/platform/codechef/:username` - Get CodeChef user data

## Authentication

All protected routes require an access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes. Use the refresh token endpoint to get a new access token.

## Error Handling

The API uses standard HTTP status codes:
- 200 OK - Request successful
- 201 Created - Resource created successfully
- 400 Bad Request - Invalid request data
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 409 Conflict - Resource already exists
- 500 Internal Server Error - Server error

Error response format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (in development)"
}
```

## MongoDB Setup

1. Create a free MongoDB account at https://www.mongodb.com/
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get the connection string and update the `MONGO_URI` in `.env`

## Development

The project uses ES6 modules (import/export) and requires Node.js version 18 or higher.

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS configuration
- Rate limiting (ready to be implemented)
- Input validation
- Environment variables for sensitive data

## Future Enhancements

- Rate limiting middleware
- Request logging
- Database indexing
- Caching for platform data
- WebSocket support for real-time updates
- GraphQL API alternative
