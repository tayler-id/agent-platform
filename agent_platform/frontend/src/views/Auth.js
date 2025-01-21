import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { signIn, signUp, enable2FA, get2FASecret } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (show2FASetup && !totpSecret) {
      const fetchSecret = async () => {
        try {
          const secret = await get2FASecret();
          setTotpSecret(secret);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchSecret();
    }
  }, [show2FASetup, totpSecret, get2FASecret]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (requires2FA && !totpCode) {
      setError('Please enter your 2FA code');
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await signIn(username, password, totpCode);
      } else {
        result = await signUp(username, email, password);
      }

      if (result.requires2FA) {
        setRequires2FA(true);
        setCurrentUser(result.user);
        return;
      }

      if (result.user) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnable2FA = async () => {
    try {
      await enable2FA(totpCode);
      setShow2FASetup(false);
      setTotpSecret('');
      setTotpCode('');
      setError(null);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      {error && <div className="error-message">{error}</div>}

      {show2FASetup ? (
        <div className="2fa-setup">
          <h2>Enable Two-Factor Authentication</h2>
          {totpSecret && (
            <>
              <div className="qr-code">
                <QRCodeSVG value={`otpauth://totp/AgentPlatform:${username}?secret=${totpSecret}&issuer=AgentPlatform`} />
              </div>
              <p>Scan this QR code with your authenticator app</p>
              <input
                type="text"
                placeholder="Enter 2FA code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <button onClick={handleEnable2FA}>Enable 2FA</button>
              <button onClick={() => setShow2FASetup(false)}>Cancel</button>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={handleAuthSubmit}>
          {!isLogin && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {requires2FA && (
            <input
              type="text"
              placeholder="2FA Code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
            />
          )}
          <button type="submit">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
      )}

      {!show2FASetup && (
        <div className="auth-actions">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setRequires2FA(false);
            }}
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
          {isLogin && (
            <button 
              onClick={() => setShow2FASetup(true)}
            >
              Enable 2FA
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Auth;
