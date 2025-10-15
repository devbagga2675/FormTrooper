// File: src/pages/AuthCallbackPage.jsx

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // This code runs as soon as the page loads
    const token = searchParams.get('token');

    if (token) {
      // 1. Save the token to the browser's local storage for future use
      localStorage.setItem('authToken', token);
      
      // 2. Redirect the user to their main dashboard page, replacing the current history entry
      navigate('/dashboard', { replace: true });
    } else {
      // If no token is found, send the user back to the login page
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]); // This effect depends on the URL query parameters and navigate function

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Authenticating, please wait...</p>
    </div>
  );
};

export default AuthCallbackPage;