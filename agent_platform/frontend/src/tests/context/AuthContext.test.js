import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider } from '../context/AuthContext';

describe('AuthContext', () => {
  it('provides initial auth state', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updates auth state on login', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login({ username: 'testuser' });
    });
    
    expect(result.current.user).toEqual({ username: 'testuser' });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears auth state on logout', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // First login
    act(() => {
      result.current.login({ username: 'testuser' });
    });
    
    // Then logout
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
