import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
      } catch (error) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (username, password, totpCode) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
        totp_code: totpCode
      });

      if (response.data.requires2FA) {
        return { requires2FA: true, user: response.data.user };
      }

      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      return { user: response.data.user };
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const signUp = async (username, email, password) => {
    try {
      await axios.post('/api/auth/register', {
        username,
        email,
        password
      });
      return true;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const get2FASecret = async () => {
    try {
      const response = await axios.get('/api/auth/2fa/generate-secret', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.secret;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to generate 2FA secret';
    }
  };

  const enable2FA = async (code) => {
    try {
      await axios.post('/api/auth/2fa/enable', { code }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return true;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to enable 2FA';
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    get2FASecret,
    enable2FA
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
