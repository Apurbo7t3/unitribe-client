// Temporary debug version
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    console.log('DEBUG: VerifyEmail component mounted');
    console.log('Token from URL:', token);
    console.log('Token type:', typeof token);

    const verify = async () => {
      try {
        console.log('Making API call to /api/auth/verify-email/');
        console.log('Payload:', { token });
        
        // Direct API call for debugging
        const response = await fetch('http://localhost:8000/api/auth/verify-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
          setStatus('success');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setStatus('error');
          console.error('Verification failed:', data);
        }
      } catch (error) {
        console.error('Network error:', error);
        setStatus('network-error');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Email Verification Debug</h2>
      <p>Token: {token}</p>
      <p>Status: {status}</p>
      <p>Check browser console for details</p>
    </div>
  );
};

export default VerifyEmail;