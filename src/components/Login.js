import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !pin) {
      setError('Please enter both email and PIN');
      return;
    }
    try {
      const res = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Invalid email or PIN');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
      }}
    >
      <div
        style={{
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          width: '320px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          backgroundColor: '#fff',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Login</h2>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '14px',
            boxSizing: 'border-box',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            marginBottom: '15px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#fff',
          }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='PIN'
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              padding: '0 12px',
              cursor: 'pointer',
              color: '#666',
              fontSize: '20px',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
          </span>
        </div>
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#90CAF9',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease',
            boxSizing: 'border-box',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#64B5F6')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#90CAF9')}
        >
          Login
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
      </div>
    </div>
  );
};

export default Login;
