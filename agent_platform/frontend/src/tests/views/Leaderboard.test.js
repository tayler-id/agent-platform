import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Leaderboard from '../../views/Leaderboard';

describe('Leaderboard Component', () => {
  const mockUsers = [
    {
      id: '1',
      username: 'user1',
      rank: 1,
      score: 1000,
      agentsCreated: 5,
      agentsSold: 3,
      earnings: 500
    },
    {
      id: '2',
      username: 'user2',
      rank: 2,
      score: 900,
      agentsCreated: 4,
      agentsSold: 2,
      earnings: 400
    }
  ];

  it('renders user rankings', () => {
    render(<Leaderboard users={mockUsers} />);
    
    expect(screen.getByText(mockUsers[0].username)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].rank)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].score)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[1].username)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Leaderboard isLoading={true} />);
    
    expect(screen.getByText(/loading leaderboard/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    const errorMessage = 'Failed to load leaderboard';
    render(<Leaderboard error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('allows sorting by score', () => {
    const mockSort = jest.fn();
    render(<Leaderboard onSort={mockSort} />);
    
    fireEvent.click(screen.getByText(/sort by score/i));
    
    expect(mockSort).toHaveBeenCalledWith('score');
  });

  it('allows sorting by agents created', () => {
    const mockSort = jest.fn();
    render(<Leaderboard onSort={mockSort} />);
    
    fireEvent.click(screen.getByText(/sort by agents created/i));
    
    expect(mockSort).toHaveBeenCalledWith('agentsCreated');
  });

  it('allows sorting by agents sold', () => {
    const mockSort = jest.fn();
    render(<Leaderboard onSort={mockSort} />);
    
    fireEvent.click(screen.getByText(/sort by agents sold/i));
    
    expect(mockSort).toHaveBeenCalledWith('agentsSold');
  });

  it('allows sorting by earnings', () => {
    const mockSort = jest.fn();
    render(<Leaderboard onSort={mockSort} />);
    
    fireEvent.click(screen.getByText(/sort by earnings/i));
    
    expect(mockSort).toHaveBeenCalledWith('earnings');
  });

  it('shows user statistics', () => {
    render(<Leaderboard users={mockUsers} />);
    
    expect(screen.getByText(mockUsers[0].agentsCreated)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].agentsSold)).toBeInTheDocument();
    expect(screen.getByText(mockUsers[0].earnings)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<Leaderboard users={[]} />);
    
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('allows viewing user profile', () => {
    const mockViewProfile = jest.fn();
    render(<Leaderboard users={mockUsers} onViewProfile={mockViewProfile} />);
    
    fireEvent.click(screen.getByText(mockUsers[0].username));
    
    expect(mockViewProfile).toHaveBeenCalledWith(mockUsers[0].id);
  });

  it('shows current user highlight', () => {
    const currentUserId = '1';
    render(<Leaderboard users={mockUsers} currentUserId={currentUserId} />);
    
    expect(screen.getByText(mockUsers[0].username)).toHaveClass('highlight');
  });

  it('shows rank badges', () => {
    render(<Leaderboard users={mockUsers} />);
    
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('🥈')).toBeInTheDocument();
  });

  it('shows score progression', () => {
    const mockUsersWithHistory = [
      {
        ...mockUsers[0],
        scoreHistory: [800, 900, 1000]
      }
    ];
    render(<Leaderboard users={mockUsersWithHistory} />);
    
    expect(screen.getByText(/score progression/i)).toBeInTheDocument();
  });

  it('shows monthly rankings', () => {
    const mockMonthlyUsers = [
      {
        ...mockUsers[0],
        monthlyRank: 1
      }
    ];
    render(<Leaderboard users={mockMonthlyUsers} showMonthly={true} />);
    
    expect(screen.getByText(/monthly rank/i)).toBeInTheDocument();
  });

  it('allows switching between all-time and monthly rankings', () => {
    const mockToggleView = jest.fn();
    render(<Leaderboard onToggleView={mockToggleView} />);
    
    fireEvent.click(screen.getByText(/show monthly rankings/i));
    
    expect(mockToggleView).toHaveBeenCalledWith(true);
  });

  it('shows user achievements', () => {
    const mockUsersWithAchievements = [
      {
        ...mockUsers[0],
        achievements: ['First Agent Created', 'Top Seller']
      }
    ];
    render(<Leaderboard users={mockUsersWithAchievements} />);
    
    expect(screen.getByText(mockUsersWithAchievements[0].achievements[0])).toBeInTheDocument();
    expect(screen.getByText(mockUsersWithAchievements[0].achievements[1])).toBeInTheDocument();
  });

  it('shows user badges', () => {
    const mockUsersWithBadges = [
      {
        ...mockUsers[0],
        badges: ['Verified Creator', 'Community Contributor']
      }
    ];
    render(<Leaderboard users={mockUsersWithBadges} />);
    
    expect(screen.getByText(mockUsersWithBadges[0].badges[0])).toBeInTheDocument();
    expect(screen.getByText(mockUsersWithBadges[0].badges[1])).toBeInTheDocument();
  });

  it('shows user activity', () => {
    const mockUsersWithActivity = [
      {
        ...mockUsers[0],
        lastActive: '2 hours ago'
      }
    ];
    render(<Leaderboard users={mockUsersWithActivity} />);
    
    expect(screen.getByText(mockUsersWithActivity[0].lastActive)).toBeInTheDocument();
  });

  it('shows user join date', () => {
    const mockUsersWithJoinDate = [
      {
        ...mockUsers[0],
        joinDate: '2023-01-01'
      }
    ];
    render(<Leaderboard users={mockUsersWithJoinDate} />);
    
    expect(screen.getByText(mockUsersWithJoinDate[0].joinDate)).toBeInTheDocument();
  });

  it('shows user agent portfolio', () => {
    const mockUsersWithPortfolio = [
      {
        ...mockUsers[0],
        portfolio: ['Agent 1', 'Agent 2']
      }
    ];
    render(<Leaderboard users={mockUsersWithPortfolio} />);
    
    expect(screen.getByText(mockUsersWithPortfolio[0].portfolio[0])).toBeInTheDocument();
    expect(screen.getByText(mockUsersWithPortfolio[0].portfolio[1])).toBeInTheDocument();
  });

  it('shows user reviews', () => {
    const mockUsersWithReviews = [
      {
        ...mockUsers[0],
        reviews: 50,
        rating: 4.8
      }
    ];
    render(<Leaderboard users={mockUsersWithReviews} />);
    
    expect(screen.getByText(mockUsersWithReviews[0].reviews)).toBeInTheDocument();
    expect(screen.getByText(mockUsersWithReviews[0].rating)).toBeInTheDocument();
  });

  it('shows user followers', () => {
    const mockUsersWithFollowers = [
      {
        ...mockUsers[0],
        followers: 100
      }
    ];
    render(<Leaderboard users={mockUsersWithFollowers} />);
    
    expect(screen.getByText(mockUsersWithFollowers[0].followers)).toBeInTheDocument();
  });

  it('shows user following', () => {
    const mockUsersWithFollowing = [
      {
        ...mockUsers[0],
        following: 50
      }
    ];
    render(<Leaderboard users={mockUsersWithFollowing} />);
    
    expect(screen.getByText(mockUsersWithFollowing[0].following)).toBeInTheDocument();
  });

  it('shows user transactions', () => {
    const mockUsersWithTransactions = [
      {
        ...mockUsers[0],
        transactions: 200
      }
    ];
    render(<Leaderboard users={mockUsersWithTransactions} />);
    
    expect(screen.getByText(mockUsersWithTransactions[0].transactions)).toBeInTheDocument();
  });

  it('shows user activity graph', () => {
    const mockUsersWithActivityGraph = [
      {
        ...mockUsers[0],
        activityGraph: [10, 20, 30]
      }
    ];
    render(<Leaderboard users={mockUsersWithActivityGraph} />);
    
    expect(screen.getByText(/activity graph/i)).toBeInTheDocument();
  });

  it('shows user performance metrics', () => {
    const mockUsersWithMetrics = [
      {
        ...mockUsers[0],
        performanceMetrics: {
          conversionRate: '75%',
          retentionRate: '90%'
        }
      }
    ];
    render(<Leaderboard users={mockUsersWithMetrics} />);
    
    expect(screen.getByText(mockUsersWithMetrics[0].performanceMetrics.conversionRate)).toBeInTheDocument();
    expect(screen.getByText(mockUsersWithMetrics[0].performanceMetrics.retentionRate)).toBeInTheDocument();
  });
});
