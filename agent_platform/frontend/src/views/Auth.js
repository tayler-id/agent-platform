import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const { signIn, signUp, resetPassword, get2FASecret, enable2FA } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(email, password, {});
        setShow2FASetup(true);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      setError('Password reset email sent!');
    } catch (err) {
      setError(err);
    }
  };

  const handleEnable2FA = async () => {
    try {
      if (!totpSecret) {
        const response = await get2FASecret();
        setTotpSecret(response.data.secret);
        return;
      }

      if (!totpCode) {
        setError('Please enter the 2FA code from your authenticator app');
        return;
      }

      await enable2FA({
        totp_secret: totpSecret,
        code: totpCode
      });
      setShow2FASetup(false);
      setTotpSecret('');
      setTotpCode('');
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to enable 2FA');
    }
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
      {error && <div className="error">{error}</div>}

      {show2FASetup ? (
        <div className="2fa-setup">
          <h2>Enable Two-Factor Authentication</h2>
          {totpSecret && (
            <>
              <div className="qr-code">
                <QRCodeSVG value={`otpauth://totp/AgentPlatform:${email}?secret=${totpSecret}&issuer=AgentPlatform`} />
              </div>
              <p>Scan this QR code with your authenticator app</p>
              <input
                type="text"
                placeholder="Enter 2FA code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <button onClick={handleEnable2FA}>Enable 2FA</button>
            </>
          )}
          <button onClick={() => setShow2FASetup(false)}>Cancel</button>
        </div>
      ) : (
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
      )}

      <div className="auth-actions">
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
        {isLogin && (
          <button onClick={handlePasswordReset}>
            Forgot Password?
          </button>
        )}
        {isLogin && !show2FASetup && (
          <button onClick={() => setShow2FASetup(true)}>
            Enable 2FA
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
