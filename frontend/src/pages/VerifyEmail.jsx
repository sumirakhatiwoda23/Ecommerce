import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleResend = async () => {
    if (!email) {
      alert('Enter your email first');
      return;
    }
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code sent to your email.</p>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Verification Code" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
        <button type="submit" className="btn">Verify</button>
        <p>
          Didn't get a code?{' '}
          <button type="button" onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', textDecoration: 'underline' }}>
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </p>
        <p>Already verified? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default VerifyEmail;