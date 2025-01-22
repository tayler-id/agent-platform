import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.auth.getSession();
        setUser(response.data.user ?? null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await api.auth.login({ email, password });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      const response = await api.auth.register({ 
        email, 
        password,
        metadata 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const signOut = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await api.auth.resetPassword({ email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const get2FASecret = async () => {
    try {
      const response = await api.auth.generate2FASecret();
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const enable2FA = async (data) => {
    try {
      await api.auth.enable2FA(data);
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.gamification.updateProfile(updates);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    resetPassword,
    get2FASecret,
    enable2FA,
    updateProfile
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
