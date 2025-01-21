import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Auth from '../../views/Auth';

describe('Auth Component', () => {
  it('renders login form by default', () => {
    render(<Auth />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('switches to registration form when toggle is clicked', () => {
    render(<Auth />);
    fireEvent.click(screen.getByText(/create account/i));
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it('validates login form fields', () => {
    const mockLogin = jest.fn();
    render(<Auth onLogin={mockLogin} />);
    
    fireEvent.click(screen.getByText(/login/i));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits login form when valid', () => {
    const mockLogin = jest.fn();
    render(<Auth onLogin={mockLogin} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText(/login/i));
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('validates registration form fields', () => {
    const mockRegister = jest.fn();
    render(<Auth onRegister={mockRegister} />);
    
    fireEvent.click(screen.getByText(/create account/i));
    fireEvent.click(screen.getByText(/register/i));
    
    expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('validates password match in registration', () => {
    render(<Auth />);
    
    fireEvent.click(screen.getByText(/create account/i));
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different' }
    });
    fireEvent.click(screen.getByText(/register/i));
    
    expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
  });

  it('submits registration form when valid', () => {
    const mockRegister = jest.fn();
    render(<Auth onRegister={mockRegister} />);
    
    fireEvent.click(screen.getByText(/create account/i));
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText(/register/i));
    
    expect(mockRegister).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
