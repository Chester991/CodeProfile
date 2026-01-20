# CodeProfile Frontend

A simple, responsive frontend for the CodeProfile competitive programming dashboard. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Profile Management**: Update and save platform usernames
- **Data Fetching**: Fetch statistics from LeetCode, Codeforces, and CodeChef
- **Dashboard**: View all your competitive programming stats in one place
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Fetch latest data from coding platforms

## Project Structure

```
frontend/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── app.js          # JavaScript logic and API calls
└── README.md       # This file
```

## Getting Started

### Prerequisites

1. Backend server running on `http://localhost:3000`
2. Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Open `index.html` in your web browser:
   - Double-click the file
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 5500
     
     # Using Node.js (if you have http-server installed)
     npx http-server -p 5500
     ```

3. Access the application at `http://localhost:5500` (or whichever port you chose)

## Configuration

The frontend connects to the backend API at `http://localhost:3000/api`. To change this, modify the `API_BASE` constant in `app.js`:

```javascript
const API_BASE = 'http://your-backend-url:port/api';
```

## Usage

### Registration

1. Click "Register" button in the navbar
2. Fill in username, email, and password
3. Submit the form
4. You'll be logged in automatically

### Login

1. Click "Login" button in the navbar
2. Enter your email and password
3. Submit the form

### Dashboard

Once logged in, you'll see the dashboard with:

1. **Platform Usernames Section**:
   - Enter your LeetCode, Codeforces, and CodeChef usernames
   - Click "Fetch Data" to retrieve statistics from each platform
   - Click "Save Profile" to save your usernames

2. **Statistics Cards**:
   - LeetCode: Total problems solved, difficulty breakdown, contest rating
   - Codeforces: Current rating, max rating, rank, contests attended
   - CodeChef: Rating, stars, global rank, fully solved problems

### Logout

Click the "Logout" button in the navbar to end your session.

## Features Explained

### Authentication
- JWT-based authentication
- Access tokens stored in localStorage
- Refresh tokens handled via HTTP-only cookies
- Automatic session management

### Platform Data Fetching

**LeetCode**: Uses GraphQL API to fetch:
- Problems solved by difficulty
- Contest rating
- Contest ranking

**Codeforces**: Uses official API to fetch:
- Current and max rating
- Rank
- Contests attended
- Country
- Friend count

**CodeChef**: Uses web scraping to fetch:
- Current and max rating
- Stars
- Global and country ranking
- Problems solved

### Responsive Design

- Mobile-first approach
- Flexible grid layout
- Touch-friendly buttons
- Adaptive card sizes
- Hamburger menu on mobile (future enhancement)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### CORS Errors
If you see CORS errors:
1. Verify backend is running on the correct port
2. Check that backend CORS configuration includes your frontend URL
3. Ensure both backend and frontend are on the same protocol (http/https)

### Failed to Fetch Data
If platform data doesn't load:
1. Check the username is correct
2. Verify the platform is accessible (test in browser)
3. Check browser console for specific error messages
4. Some platforms may rate-limit requests

### Authentication Issues
If login/registration fails:
1. Verify backend server is running
2. Check browser console for error messages
3. Clear browser cookies and localStorage
4. Try using incognito/private mode

### API Connection Issues
If frontend can't connect to backend:
1. Ensure backend server is running on port 3000
2. Check firewall settings
3. Verify API_BASE in app.js matches backend URL
4. Check browser console for network errors

## Development Tips

### Viewing Changes
For immediate changes while developing:
- Use a local server with auto-reload (e.g., Live Server extension in VS Code)
- Refresh browser after file changes

### Debugging
- Open browser DevTools (F12)
- Check Console tab for JavaScript errors
- Check Network tab to see API requests
- Use `console.log()` in app.js for debugging

### Styling
- All styles in styles.css
- Uses CSS Grid and Flexbox
- CSS variables for easy theming (future enhancement)
- Mobile breakpoints at 768px

## Future Enhancements

- [ ] Add charts/graphs for rating history
- [ ] Implement dark mode toggle
- [ ] Add data caching for faster loads
- [ ] Support for more platforms
- [ ] Export data as PDF/CSV
- [ ] Add user profiles/leaderboards
- [ ] Real-time contest updates
- [ ] Notification system
- [ ] Social sharing features

## API Endpoints Used

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/platform/leetcode/:username` - Get LeetCode data
- `GET /api/platform/codeforces/:username` - Get Codeforces data
- `GET /api/platform/codechef/:username` - Get CodeChef data

## Security Considerations

- Access tokens stored in localStorage (consider using secure cookies in production)
- HTTPS recommended for production
- Never commit .env files or sensitive data
- Validate and sanitize all user inputs
- Implement proper error handling without exposing sensitive data

## License

This project is open source and available for educational purposes.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console errors
3. Verify backend server is running correctly
4. Check network connectivity to API endpoints
