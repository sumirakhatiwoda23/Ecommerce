// Base URL of the backend API.
// In production (Vercel) set REACT_APP_API_URL to your Render backend URL,
// e.g. https://shopnest-backend.onrender.com
// In local dev, leave it unset — requests stay relative and CRA's "proxy"
// field in package.json forwards them to http://localhost:5000.
export const API_URL = process.env.REACT_APP_API_URL || '';
