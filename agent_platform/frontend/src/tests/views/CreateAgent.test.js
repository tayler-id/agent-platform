import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateAgent from '../../views/CreateAgent';

describe('CreateAgent Component', () => {
  const mockCategories = [
    { id: '1', name: 'Chatbot' },
    { id: '2', name: 'Automation' }
  ];

  const mockTemplates = [
    { id: '1', name: 'Basic Chatbot' },
    { id: '2', name: 'Advanced Automation' }
  ];

  it('renders the create agent form', () => {
    render(<CreateAgent categories={mockCategories} templates={mockTemplates} />);
    
    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/template/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<CreateAgent isLoading={true} />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    const errorMessage = 'Failed to load form data';
    render(<CreateAgent error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const mockSubmit = jest.fn();
    render(<CreateAgent onSubmit={mockSubmit} />);
    
    fireEvent.click(screen.getByText(/create agent/i));
    
    expect(await screen.findAllByText(/required/i)).toHaveLength(4);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('allows creating an agent', async () => {
    const mockSubmit = jest.fn();
    render(<CreateAgent 
      categories={mockCategories}
      templates={mockTemplates}
      onSubmit={mockSubmit}
    />);
    
    fireEvent.change(screen.getByLabelText(/agent name/i), {
      target: { value: 'Test Agent' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test description' }
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: mockCategories[0].id }
    });
    fireEvent.change(screen.getByLabelText(/template/i), {
      target: { value: mockTemplates[0].id }
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: 100 }
    });
    fireEvent.change(screen.getByLabelText(/tags/i), {
      target: { value: 'test,agent' }
    });
    
    fireEvent.click(screen.getByText(/create agent/i));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'Test Agent',
      description: 'Test description',
      category: mockCategories[0].id,
      template: mockTemplates[0].id,
      price: 100,
      tags: ['test', 'agent']
    });
  });

  it('shows creation success', () => {
    render(<CreateAgent isSuccess={true} />);
    
    expect(screen.getByText(/agent created/i)).toBeInTheDocument();
  });

  it('shows creation error', () => {
    const creationError = 'Failed to create agent';
    render(<CreateAgent creationError={creationError} />);
    
    expect(screen.getByText(creationError)).toBeInTheDocument();
  });

  it('allows adding custom fields', () => {
    const mockAddField = jest.fn();
    render(<CreateAgent onAddField={mockAddField} />);
    
    fireEvent.click(screen.getByText(/add custom field/i));
    
    expect(mockAddField).toHaveBeenCalled();
  });

  it('allows removing custom fields', () => {
    const mockRemoveField = jest.fn();
    render(<CreateAgent 
      customFields={[{ id: '1', name: 'Test Field' }]}
      onRemoveField={mockRemoveField}
    />);
    
    fireEvent.click(screen.getByText(/remove/i));
    
    expect(mockRemoveField).toHaveBeenCalledWith('1');
  });

  it('allows uploading agent icon', () => {
    const mockUploadIcon = jest.fn();
    render(<CreateAgent onUploadIcon={mockUploadIcon} />);
    
    fireEvent.change(screen.getByLabelText(/upload icon/i), {
      target: { files: [new File([''], 'icon.png')] }
    });
    
    expect(mockUploadIcon).toHaveBeenCalled();
  });

  it('allows setting agent visibility', () => {
    const mockSetVisibility = jest.fn();
    render(<CreateAgent onSetVisibility={mockSetVisibility} />);
    
    fireEvent.click(screen.getByLabelText(/private/i));
    
    expect(mockSetVisibility).toHaveBeenCalledWith('private');
  });

  it('allows setting agent license', () => {
    const mockSetLicense = jest.fn();
    render(<CreateAgent onSetLicense={mockSetLicense} />);
    
    fireEvent.change(screen.getByLabelText(/license/i), {
      target: { value: 'MIT' }
    });
    
    expect(mockSetLicense).toHaveBeenCalledWith('MIT');
  });

  it('allows setting agent pricing model', () => {
    const mockSetPricing = jest.fn();
    render(<CreateAgent onSetPricing={mockSetPricing} />);
    
    fireEvent.click(screen.getByLabelText(/subscription/i));
    
    expect(mockSetPricing).toHaveBeenCalledWith('subscription');
  });

  it('allows setting agent documentation', () => {
    const mockSetDocumentation = jest.fn();
    render(<CreateAgent onSetDocumentation={mockSetDocumentation} />);
    
    fireEvent.change(screen.getByLabelText(/documentation/i), {
      target: { value: 'Test documentation' }
    });
    
    expect(mockSetDocumentation).toHaveBeenCalledWith('Test documentation');
  });

  it('allows setting agent requirements', () => {
    const mockSetRequirements = jest.fn();
    render(<CreateAgent onSetRequirements={mockSetRequirements} />);
    
    fireEvent.change(screen.getByLabelText(/requirements/i), {
      target: { value: 'Test requirements' }
    });
    
    expect(mockSetRequirements).toHaveBeenCalledWith('Test requirements');
  });

  it('allows setting agent dependencies', () => {
    const mockSetDependencies = jest.fn();
    render(<CreateAgent onSetDependencies={mockSetDependencies} />);
    
    fireEvent.change(screen.getByLabelText(/dependencies/i), {
      target: { value: 'Test dependencies' }
    });
    
    expect(mockSetDependencies).toHaveBeenCalledWith('Test dependencies');
  });

  it('allows setting agent configuration', () => {
    const mockSetConfiguration = jest.fn();
    render(<CreateAgent onSetConfiguration={mockSetConfiguration} />);
    
    fireEvent.change(screen.getByLabelText(/configuration/i), {
      target: { value: 'Test configuration' }
    });
    
    expect(mockSetConfiguration).toHaveBeenCalledWith('Test configuration');
  });

  it('allows setting agent endpoints', () => {
    const mockSetEndpoints = jest.fn();
    render(<CreateAgent onSetEndpoints={mockSetEndpoints} />);
    
    fireEvent.change(screen.getByLabelText(/endpoints/i), {
      target: { value: 'Test endpoints' }
    });
    
    expect(mockSetEndpoints).toHaveBeenCalledWith('Test endpoints');
  });

  it('allows setting agent permissions', () => {
    const mockSetPermissions = jest.fn();
    render(<CreateAgent onSetPermissions={mockSetPermissions} />);
    
    fireEvent.change(screen.getByLabelText(/permissions/i), {
      target: { value: 'Test permissions' }
    });
    
    expect(mockSetPermissions).toHaveBeenCalledWith('Test permissions');
  });

  it('allows setting agent environment variables', () => {
    const mockSetEnvVars = jest.fn();
    render(<CreateAgent onSetEnvVars={mockSetEnvVars} />);
    
    fireEvent.change(screen.getByLabelText(/environment variables/i), {
      target: { value: 'Test env vars' }
    });
    
    expect(mockSetEnvVars).toHaveBeenCalledWith('Test env vars');
  });

  it('allows setting agent rate limits', () => {
    const mockSetRateLimits = jest.fn();
    render(<CreateAgent onSetRateLimits={mockSetRateLimits} />);
    
    fireEvent.change(screen.getByLabelText(/rate limits/i), {
      target: { value: 'Test rate limits' }
    });
    
    expect(mockSetRateLimits).toHaveBeenCalledWith('Test rate limits');
  });

  it('allows setting agent logging', () => {
    const mockSetLogging = jest.fn();
    render(<CreateAgent onSetLogging={mockSetLogging} />);
    
    fireEvent.change(screen.getByLabelText(/logging/i), {
      target: { value: 'Test logging' }
    });
    
    expect(mockSetLogging).toHaveBeenCalledWith('Test logging');
  });

  it('allows setting agent monitoring', () => {
    const mockSetMonitoring = jest.fn();
    render(<CreateAgent onSetMonitoring={mockSetMonitoring} />);
    
    fireEvent.change(screen.getByLabelText(/monitoring/i), {
      target: { value: 'Test monitoring' }
    });
    
    expect(mockSetMonitoring).toHaveBeenCalledWith('Test monitoring');
  });

  it('allows setting agent alerts', () => {
    const mockSetAlerts = jest.fn();
    render(<CreateAgent onSetAlerts={mockSetAlerts} />);
    
    fireEvent.change(screen.getByLabelText(/alerts/i), {
      target: { value: 'Test alerts' }
    });
    
    expect(mockSetAlerts).toHaveBeenCalledWith('Test alerts');
  });

  it('allows setting agent backups', () => {
    const mockSetBackups = jest.fn();
    render(<CreateAgent onSetBackups={mockSetBackups} />);
    
    fireEvent.change(screen.getByLabelText(/backups/i), {
      target: { value: 'Test backups' }
    });
    
    expect(mockSetBackups).toHaveBeenCalledWith('Test backups');
  });

  it('allows setting agent security', () => {
    const mockSetSecurity = jest.fn();
    render(<CreateAgent onSetSecurity={mockSetSecurity} />);
    
    fireEvent.change(screen.getByLabelText(/security/i), {
      target: { value: 'Test security' }
    });
    
    expect(mockSetSecurity).toHaveBeenCalledWith('Test security');
  });

  it('allows setting agent scaling', () => {
    const mockSetScaling = jest.fn();
    render(<CreateAgent onSetScaling={mockSetScaling} />);
    
    fireEvent.change(screen.getByLabelText(/scaling/i), {
      target: { value: 'Test scaling' }
    });
    
    expect(mockSetScaling).toHaveBeenCalledWith('Test scaling');
  });

  it('allows setting agent availability', () => {
    const mockSetAvailability = jest.fn();
    render(<CreateAgent onSetAvailability={mockSetAvailability} />);
    
    fireEvent.change(screen.getByLabelText(/availability/i), {
      target: { value: 'Test availability' }
    });
    
    expect(mockSetAvailability).toHaveBeenCalledWith('Test availability');
  });

  it('allows setting agent performance', () => {
    const mockSetPerformance = jest.fn();
    render(<CreateAgent onSetPerformance={mockSetPerformance} />);
    
    fireEvent.change(screen.getByLabelText(/performance/i), {
      target: { value: 'Test performance' }
    });
    
    expect(mockSetPerformance).toHaveBeenCalledWith('Test performance');
  });

  it('allows setting agent reliability', () => {
    const mockSetReliability = jest.fn();
    render(<CreateAgent onSetReliability={mockSetReliability} />);
    
    fireEvent.change(screen.getByLabelText(/reliability/i), {
      target: { value: 'Test reliability' }
    });
    
    expect(mockSetReliability).toHaveBeenCalledWith('Test reliability');
  });

  it('allows setting agent support', () => {
    const mockSetSupport = jest.fn();
    render(<CreateAgent onSetSupport={mockSetSupport} />);
    
    fireEvent.change(screen.getByLabelText(/support/i), {
      target: { value: 'Test support' }
    });
    
    expect(mockSetSupport).toHaveBeenCalledWith('Test support');
  });

  it('allows setting agent documentation url', () => {
    const mockSetDocUrl = jest.fn();
    render(<CreateAgent onSetDocUrl={mockSetDocUrl} />);
    
    fireEvent.change(screen.getByLabelText(/documentation url/i), {
      target: { value: 'https://example.com/docs' }
    });
    
    expect(mockSetDocUrl).toHaveBeenCalledWith('https://example.com/docs');
  });

  it('allows setting agent support url', () => {
    const mockSetSupportUrl = jest.fn();
    render(<CreateAgent onSetSupportUrl={mockSetSupportUrl} />);
    
    fireEvent.change(screen.getByLabelText(/support url/i), {
      target: { value: 'https://example.com/support' }
    });
    
    expect(mockSetSupportUrl).toHaveBeenCalledWith('https://example.com/support');
  });

  it('allows setting agent repository url', () => {
    const mockSetRepoUrl = jest.fn();
    render(<CreateAgent onSetRepoUrl={mockSetRepoUrl} />);
    
    fireEvent.change(screen.getByLabelText(/repository url/i), {
      target: { value: 'https://example.com/repo' }
    });
    
    expect(mockSetRepoUrl).toHaveBeenCalledWith('https://example.com/repo');
  });

  it('allows setting agent website url', () => {
    const mockSetWebsiteUrl = jest.fn();
    render(<CreateAgent onSetWebsiteUrl={mockSetWebsiteUrl} />);
    
    fireEvent.change(screen.getByLabelText(/website url/i), {
      target: { value: 'https://example.com' }
    });
    
    expect(mockSetWebsiteUrl).toHaveBeenCalledWith('https://example.com');
  });

  it('allows setting agent demo url', () => {
    const mockSetDemoUrl = jest.fn();
    render(<CreateAgent onSetDemoUrl={mockSetDemoUrl} />);
    
    fireEvent.change(screen.getByLabelText(/demo url/i), {
      target: { value: 'https://example.com/demo' }
    });
    
    expect(mockSetDemoUrl).toHaveBeenCalledWith('https://example.com/demo');
  });

  it('allows setting agent changelog url', () => {
    const mockSetChangelogUrl = jest.fn();
    render(<CreateAgent onSetChangelogUrl={mockSetChangelogUrl} />);
    
    fireEvent.change(screen.getByLabelText(/changelog url/i), {
      target: { value: 'https://example.com/changelog' }
    });
    
    expect(mockSetChangelogUrl).toHaveBeenCalledWith('https://example.com/changelog');
  });

  it('allows setting agent roadmap url', () => {
    const mockSetRoadmapUrl = jest.fn();
    render(<CreateAgent onSetRoadmapUrl={mockSetRoadmapUrl} />);
    
    fireEvent.change(screen.getByLabelText(/roadmap url/i), {
      target: { value: 'https://example.com/roadmap' }
    });
    
    expect(mockSetRoadmapUrl).toHaveBeenCalledWith('https://example.com/roadmap');
  });

  it('allows setting agent license url', () => {
    const mockSetLicenseUrl = jest.fn();
    render(<CreateAgent onSetLicenseUrl={mockSetLicenseUrl} />);
    
    fireEvent.change(screen.getByLabelText(/license url/i), {
      target: { value: 'https://example.com/license' }
    });
    
    expect(mockSetLicenseUrl).toHaveBeenCalledWith('https://example.com/license');
  });

  it('allows setting agent privacy policy url', () => {
    const mockSetPrivacyPolicyUrl = jest.fn();
    render(<CreateAgent onSetPrivacyPolicyUrl={mockSetPrivacyPolicyUrl} />);
    
    fireEvent.change(screen.getByLabelText(/privacy policy url/i), {
      target: { value: 'https://example.com/privacy' }
    });
    
    expect(mockSetPrivacyPolicyUrl).toHaveBeenCalledWith('https://example.com/privacy');
  });

  it('allows setting agent terms of service url', () => {
    const mockSetTermsUrl = jest.fn();
    render(<CreateAgent onSetTermsUrl={mockSetTermsUrl} />);
    
    fireEvent.change(screen.getByLabelText(/terms of service url/i), {
      target: { value: 'https://example.com/terms' }
    });
    
    expect(mockSetTermsUrl).toHaveBeenCalledWith('https://example.com/terms');
  });

  it('allows setting agent support email', () => {
    const mockSetSupportEmail = jest.fn();
    render(<CreateAgent onSetSupportEmail={mockSetSupportEmail} />);
    
    fireEvent.change(screen.getByLabelText(/support email/i), {
      target: { value: 'support@example.com' }
    });
    
    expect(mockSetSupportEmail).toHaveBeenCalledWith('support@example.com');
  });
});
