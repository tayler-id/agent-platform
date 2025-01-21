import React from 'react';
import { render, screen } from '@testing-library/react';
import Tour from '../../components/Tour';

describe('Tour Component', () => {
  const mockSteps = [
    { target: '.step1', content: 'First step' },
    { target: '.step2', content: 'Second step' }
  ];

  it('renders without crashing', () => {
    render(<Tour steps={mockSteps} isOpen={true} onRequestClose={() => {}} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays the first step content when open', () => {
    render(<Tour steps={mockSteps} isOpen={true} onRequestClose={() => {}} />);
    expect(screen.getByText('First step')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Tour steps={mockSteps} isOpen={false} onRequestClose={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });
});
