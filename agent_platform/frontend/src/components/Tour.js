import React, { useState } from 'react';
import Joyride from 'react-joyride';

const Tour = () => {
  const [runTour, setRunTour] = useState(false);
  const [steps] = useState([
    {
      target: '.navbar',
      content: 'This is the main navigation. Use it to access different sections of the platform.',
      placement: 'bottom'
    },
    {
      target: '.marketplace-link',
      content: 'Browse and discover AI agents created by the community.',
      placement: 'bottom'
    },
    {
      target: '.create-agent-link',
      content: 'Create and publish your own AI agents to share or monetize.',
      placement: 'bottom'
    },
    {
      target: '.profile-link',
      content: 'Manage your profile, agents, and transactions here.',
      placement: 'bottom'
    },
    {
      target: '.leaderboard-link',
      content: 'See top-performing agents and developers on the leaderboard.',
      placement: 'bottom'
    },
    {
      target: '.agent-card',
      content: 'Interact with agents, see their ratings and capabilities.',
      placement: 'right'
    },
    {
      target: '.gamification-badge',
      content: 'Earn badges and rewards for platform engagement.',
      placement: 'right'
    }
  ]);

  // Check localStorage for first visit
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setRunTour(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      styles={{
        options: {
          primaryColor: '#2563eb',
          textColor: '#1e293b',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          arrowColor: '#ffffff'
        }
      }}
    />
  );
};

export default Tour;
