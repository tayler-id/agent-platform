import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../../views/Profile';

describe('Profile Component', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'avatar.jpg',
    bio: 'Test bio',
    joinDate: '2023-01-01',
    lastActive: '2 hours ago',
    stats: {
      agentsCreated: 5,
      agentsSold: 3,
      earnings: 500,
      rating: 4.5,
      reviews: 10
    },
    settings: {
      notifications: true,
      theme: 'dark'
    }
  };

  it('renders user information', () => {
    render(<Profile user={mockUser} />);
    
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Profile isLoading={true} />);
    
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    const errorMessage = 'Failed to load profile';
    render(<Profile error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays user statistics', () => {
    render(<Profile user={mockUser} />);
    
    expect(screen.getByText(mockUser.stats.agentsCreated)).toBeInTheDocument();
    expect(screen.getByText(mockUser.stats.agentsSold)).toBeInTheDocument();
    expect(screen.getByText(mockUser.stats.earnings)).toBeInTheDocument();
    expect(screen.getByText(mockUser.stats.rating)).toBeInTheDocument();
    expect(screen.getByText(mockUser.stats.reviews)).toBeInTheDocument();
  });

  it('allows editing profile', () => {
    const mockEditProfile = jest.fn();
    render(<Profile user={mockUser} onEditProfile={mockEditProfile} />);
    
    fireEvent.click(screen.getByText(/edit profile/i));
    
    expect(mockEditProfile).toHaveBeenCalled();
  });

  it('allows changing avatar', () => {
    const mockChangeAvatar = jest.fn();
    render(<Profile user={mockUser} onChangeAvatar={mockChangeAvatar} />);
    
    fireEvent.change(screen.getByLabelText(/change avatar/i), {
      target: { files: [new File([''], 'new-avatar.jpg')] }
    });
    
    expect(mockChangeAvatar).toHaveBeenCalled();
  });

  it('allows updating bio', () => {
    const mockUpdateBio = jest.fn();
    render(<Profile user={mockUser} onUpdateBio={mockUpdateBio} />);
    
    const newBio = 'New test bio';
    fireEvent.change(screen.getByLabelText(/bio/i), {
      target: { value: newBio }
    });
    fireEvent.click(screen.getByText(/save bio/i));
    
    expect(mockUpdateBio).toHaveBeenCalledWith(newBio);
  });

  it('shows profile update success', () => {
    render(<Profile user={mockUser} isUpdateSuccess={true} />);
    
    expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
  });

  it('shows profile update error', () => {
    const updateError = 'Failed to update profile';
    render(<Profile user={mockUser} updateError={updateError} />);
    
    expect(screen.getByText(updateError)).toBeInTheDocument();
  });

  it('allows changing notification settings', () => {
    const mockUpdateSettings = jest.fn();
    render(<Profile user={mockUser} onUpdateSettings={mockUpdateSettings} />);
    
    fireEvent.click(screen.getByLabelText(/notifications/i));
    
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      ...mockUser.settings,
      notifications: false
    });
  });

  it('allows changing theme', () => {
    const mockUpdateSettings = jest.fn();
    render(<Profile user={mockUser} onUpdateSettings={mockUpdateSettings} />);
    
    fireEvent.change(screen.getByLabelText(/theme/i), {
      target: { value: 'light' }
    });
    
    expect(mockUpdateSettings).toHaveBeenCalledWith({
      ...mockUser.settings,
      theme: 'light'
    });
  });

  it('shows settings update success', () => {
    render(<Profile user={mockUser} isSettingsUpdateSuccess={true} />);
    
    expect(screen.getByText(/settings updated/i)).toBeInTheDocument();
  });

  it('shows settings update error', () => {
    const settingsError = 'Failed to update settings';
    render(<Profile user={mockUser} settingsError={settingsError} />);
    
    expect(screen.getByText(settingsError)).toBeInTheDocument();
  });

  it('allows viewing created agents', () => {
    const mockViewCreatedAgents = jest.fn();
    render(<Profile user={mockUser} onViewCreatedAgents={mockViewCreatedAgents} />);
    
    fireEvent.click(screen.getByText(/view created agents/i));
    
    expect(mockViewCreatedAgents).toHaveBeenCalled();
  });

  it('allows viewing sold agents', () => {
    const mockViewSoldAgents = jest.fn();
    render(<Profile user={mockUser} onViewSoldAgents={mockViewSoldAgents} />);
    
    fireEvent.click(screen.getByText(/view sold agents/i));
    
    expect(mockViewSoldAgents).toHaveBeenCalled();
  });

  it('allows viewing earnings history', () => {
    const mockViewEarningsHistory = jest.fn();
    render(<Profile user={mockUser} onViewEarningsHistory={mockViewEarningsHistory} />);
    
    fireEvent.click(screen.getByText(/view earnings history/i));
    
    expect(mockViewEarningsHistory).toHaveBeenCalled();
  });

  it('allows viewing reviews', () => {
    const mockViewReviews = jest.fn();
    render(<Profile user={mockUser} onViewReviews={mockViewReviews} />);
    
    fireEvent.click(screen.getByText(/view reviews/i));
    
    expect(mockViewReviews).toHaveBeenCalled();
  });

  it('allows changing password', () => {
    const mockChangePassword = jest.fn();
    render(<Profile user={mockUser} onChangePassword={mockChangePassword} />);
    
    fireEvent.click(screen.getByText(/change password/i));
    
    expect(mockChangePassword).toHaveBeenCalled();
  });

  it('shows password change success', () => {
    render(<Profile user={mockUser} isPasswordChangeSuccess={true} />);
    
    expect(screen.getByText(/password changed/i)).toBeInTheDocument();
  });

  it('shows password change error', () => {
    const passwordError = 'Failed to change password';
    render(<Profile user={mockUser} passwordError={passwordError} />);
    
    expect(screen.getByText(passwordError)).toBeInTheDocument();
  });

  it('allows deleting account', () => {
    const mockDeleteAccount = jest.fn();
    render(<Profile user={mockUser} onDeleteAccount={mockDeleteAccount} />);
    
    fireEvent.click(screen.getByText(/delete account/i));
    
    expect(mockDeleteAccount).toHaveBeenCalled();
  });

  it('shows account deletion confirmation', () => {
    render(<Profile user={mockUser} isAccountDeleted={true} />);
    
    expect(screen.getByText(/account deleted/i)).toBeInTheDocument();
  });

  it('shows account deletion error', () => {
    const deleteError = 'Failed to delete account';
    render(<Profile user={mockUser} deleteError={deleteError} />);
    
    expect(screen.getByText(deleteError)).toBeInTheDocument();
  });

  it('allows exporting data', () => {
    const mockExportData = jest.fn();
    render(<Profile user={mockUser} onExportData={mockExportData} />);
    
    fireEvent.click(screen.getByText(/export data/i));
    
    expect(mockExportData).toHaveBeenCalled();
  });

  it('shows data export success', () => {
    render(<Profile user={mockUser} isDataExportSuccess={true} />);
    
    expect(screen.getByText(/data exported/i)).toBeInTheDocument();
  });

  it('shows data export error', () => {
    const exportError = 'Failed to export data';
    render(<Profile user={mockUser} exportError={exportError} />);
    
    expect(screen.getByText(exportError)).toBeInTheDocument();
  });

  it('allows viewing activity history', () => {
    const mockViewActivityHistory = jest.fn();
    render(<Profile user={mockUser} onViewActivityHistory={mockViewActivityHistory} />);
    
    fireEvent.click(screen.getByText(/view activity history/i));
    
    expect(mockViewActivityHistory).toHaveBeenCalled();
  });

  it('allows viewing connected accounts', () => {
    const mockViewConnectedAccounts = jest.fn();
    render(<Profile user={mockUser} onViewConnectedAccounts={mockViewConnectedAccounts} />);
    
    fireEvent.click(screen.getByText(/view connected accounts/i));
    
    expect(mockViewConnectedAccounts).toHaveBeenCalled();
  });

  it('allows managing API keys', () => {
    const mockManageApiKeys = jest.fn();
    render(<Profile user={mockUser} onManageApiKeys={mockManageApiKeys} />);
    
    fireEvent.click(screen.getByText(/manage api keys/i));
    
    expect(mockManageApiKeys).toHaveBeenCalled();
  });

  it('allows viewing subscription', () => {
    const mockViewSubscription = jest.fn();
    render(<Profile user={mockUser} onViewSubscription={mockViewSubscription} />);
    
    fireEvent.click(screen.getByText(/view subscription/i));
    
    expect(mockViewSubscription).toHaveBeenCalled();
  });

  it('allows viewing billing history', () => {
    const mockViewBillingHistory = jest.fn();
    render(<Profile user={mockUser} onViewBillingHistory={mockViewBillingHistory} />);
    
    fireEvent.click(screen.getByText(/view billing history/i));
    
    expect(mockViewBillingHistory).toHaveBeenCalled();
  });

  it('allows viewing security settings', () => {
    const mockViewSecuritySettings = jest.fn();
    render(<Profile user={mockUser} onViewSecuritySettings={mockViewSecuritySettings} />);
    
    fireEvent.click(screen.getByText(/view security settings/i));
    
    expect(mockViewSecuritySettings).toHaveBeenCalled();
  });

  it('allows viewing privacy settings', () => {
    const mockViewPrivacySettings = jest.fn();
    render(<Profile user={mockUser} onViewPrivacySettings={mockViewPrivacySettings} />);
    
    fireEvent.click(screen.getByText(/view privacy settings/i));
    
    expect(mockViewPrivacySettings).toHaveBeenCalled();
  });

  it('allows viewing notification settings', () => {
    const mockViewNotificationSettings = jest.fn();
    render(<Profile user={mockUser} onViewNotificationSettings={mockViewNotificationSettings} />);
    
    fireEvent.click(screen.getByText(/view notification settings/i));
    
    expect(mockViewNotificationSettings).toHaveBeenCalled();
  });

  it('allows viewing theme settings', () => {
    const mockViewThemeSettings = jest.fn();
    render(<Profile user={mockUser} onViewThemeSettings={mockViewThemeSettings} />);
    
    fireEvent.click(screen.getByText(/view theme settings/i));
    
    expect(mockViewThemeSettings).toHaveBeenCalled();
  });

  it('allows viewing language settings', () => {
    const mockViewLanguageSettings = jest.fn();
    render(<Profile user={mockUser} onViewLanguageSettings={mockViewLanguageSettings} />);
    
    fireEvent.click(screen.getByText(/view language settings/i));
    
    expect(mockViewLanguageSettings).toHaveBeenCalled();
  });

  it('allows viewing accessibility settings', () => {
    const mockViewAccessibilitySettings = jest.fn();
    render(<Profile user={mockUser} onViewAccessibilitySettings={mockViewAccessibilitySettings} />);
    
    fireEvent.click(screen.getByText(/view accessibility settings/i));
    
    expect(mockViewAccessibilitySettings).toHaveBeenCalled();
  });

  it('allows viewing account settings', () => {
    const mockViewAccountSettings = jest.fn();
    render(<Profile user={mockUser} onViewAccountSettings={mockViewAccountSettings} />);
    
    fireEvent.click(screen.getByText(/view account settings/i));
    
    expect(mockViewAccountSettings).toHaveBeenCalled();
  });

  it('allows viewing developer settings', () => {
    const mockViewDeveloperSettings = jest.fn();
    render(<Profile user={mockUser} onViewDeveloperSettings={mockViewDeveloperSettings} />);
    
    fireEvent.click(screen.getByText(/view developer settings/i));
    
    expect(mockViewDeveloperSettings).toHaveBeenCalled();
  });

  it('allows viewing integrations', () => {
    const mockViewIntegrations = jest.fn();
    render(<Profile user={mockUser} onViewIntegrations={mockViewIntegrations} />);
    
    fireEvent.click(screen.getByText(/view integrations/i));
    
    expect(mockViewIntegrations).toHaveBeenCalled();
  });

  it('allows viewing connected devices', () => {
    const mockViewConnectedDevices = jest.fn();
    render(<Profile user={mockUser} onViewConnectedDevices={mockViewConnectedDevices} />);
    
    fireEvent.click(screen.getByText(/view connected devices/i));
    
    expect(mockViewConnectedDevices).toHaveBeenCalled();
  });

  it('allows viewing activity log', () => {
    const mockViewActivityLog = jest.fn();
    render(<Profile user={mockUser} onViewActivityLog={mockViewActivityLog} />);
    
    fireEvent.click(screen.getByText(/view activity log/i));
    
    expect(mockViewActivityLog).toHaveBeenCalled();
  });

  it('allows viewing security log', () => {
    const mockViewSecurityLog = jest.fn();
    render(<Profile user={mockUser} onViewSecurityLog={mockViewSecurityLog} />);
    
    fireEvent.click(screen.getByText(/view security log/i));
    
    expect(mockViewSecurityLog).toHaveBeenCalled();
  });

  it('allows viewing privacy log', () => {
    const mockViewPrivacyLog = jest.fn();
    render(<Profile user={mockUser} onViewPrivacyLog={mockViewPrivacyLog} />);
    
    fireEvent.click(screen.getByText(/view privacy log/i));
    
    expect(mockViewPrivacyLog).toHaveBeenCalled();
  });

  it('allows viewing notification log', () => {
    const mockViewNotificationLog = jest.fn();
    render(<Profile user={mockUser} onViewNotificationLog={mockViewNotificationLog} />);
    
    fireEvent.click(screen.getByText(/view notification log/i));
    
    expect(mockViewNotificationLog).toHaveBeenCalled();
  });

  it('allows viewing theme log', () => {
    const mockViewThemeLog = jest.fn();
    render(<Profile user={mockUser} onViewThemeLog={mockViewThemeLog} />);
    
    fireEvent.click(screen.getByText(/view theme log/i));
    
    expect(mockViewThemeLog).toHaveBeenCalled();
  });

  it('allows viewing language log', () => {
    const mockViewLanguageLog = jest.fn();
    render(<Profile user={mockUser} onViewLanguageLog={mockViewLanguageLog} />);
    
    fireEvent.click(screen.getByText(/view language log/i));
    
    expect(mockViewLanguageLog).toHaveBeenCalled();
  });

  it('allows viewing accessibility log', () => {
    const mockViewAccessibilityLog = jest.fn();
    render(<Profile user={mockUser} onViewAccessibilityLog={mockViewAccessibilityLog} />);
    
    fireEvent.click(screen.getByText(/view accessibility log/i));
    
    expect(mockViewAccessibilityLog).toHaveBeenCalled();
  });

  it('allows viewing account log', () => {
    const mockViewAccountLog = jest.fn();
    render(<Profile user={mockUser} onViewAccountLog={mockViewAccountLog} />);
    
    fireEvent.click(screen.getByText(/view account log/i));
    
    expect(mockViewAccountLog).toHaveBeenCalled();
  });

  it('allows viewing developer log', () => {
    const mockViewDeveloperLog = jest.fn();
    render(<Profile user={mockUser} onViewDeveloperLog={mockViewDeveloperLog} />);
    
    fireEvent.click(screen.getByText(/view developer log/i));
    
    expect(mockViewDeveloperLog).toHaveBeenCalled();
  });

  it('allows viewing integrations log', () => {
    const mockViewIntegrationsLog = jest.fn();
    render(<Profile user={mockUser} onViewIntegrationsLog={mockViewIntegrationsLog} />);
    
    fireEvent.click(screen.getByText(/view integrations log/i));
    
    expect(mockViewIntegrationsLog).toHaveBeenCalled();
  });

  it('allows viewing connected devices log', () => {
    const mockViewConnectedDevicesLog = jest.fn();
    render(<Profile user={mockUser} onViewConnectedDevicesLog={mockViewConnectedDevicesLog} />);
    
    fireEvent.click(screen.getByText(/view connected devices log/i));
    
    expect(mockViewConnectedDevicesLog).toHaveBeenCalled();
  });
});
