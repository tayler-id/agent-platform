import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('rank');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // TODO: Replace with actual API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate fetched data (50 entries)
        const data = Array.from({ length: 50 }, (_, i) => ({
          rank: i + 1,
          username: `user${i + 1}`,
          totalEarnings: Math.floor(Math.random() * 2000),
          agentsCreated: Math.floor(Math.random() * 20),
          agentsSold: Math.floor(Math.random() * 15),
          rating: parseFloat((Math.random() * 5).toFixed(1))
        }));
        
        setLeaderboardData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid">
      <section className="card">
        <h1>Leaderboard</h1>
        
        {loading ? (
          <p>Loading leaderboard...</p>
        ) : (
            <div className="card">
              <div className="leaderboard-header">
                <div className="header-item" onClick={() => {
                  setSortField('rank');
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}>
                  Rank {sortField === 'rank' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
                <div className="header-item" onClick={() => {
                  setSortField('username');
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}>
                  Username {sortField === 'username' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
                <div className="header-item" onClick={() => {
                  setSortField('totalEarnings');
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}>
                  Earnings {sortField === 'totalEarnings' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
                <div className="header-item" onClick={() => {
                  setSortField('agentsCreated');
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}>
                  Created {sortField === 'agentsCreated' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
                <div className="header-item" onClick={() => {
                  setSortField('agentsSold');
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}>
                  Sold {sortField === 'agentsSold' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
                <div className="header-item" onClick={() => {
                  setSortField('rating');
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}>
                  Rating {sortField === 'rating' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
              </div>
              
              {leaderboardData
                .sort((a, b) => {
                  if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
                  if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
                  return 0;
                })
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(entry => (
                <div key={entry.rank} className="leaderboard-row">
                  <div className="rank">
                    {entry.rank <= 3 && (
                      <div className={`rank-badge rank-${entry.rank}`}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </div>
                    )}
                    {entry.rank}
                  </div>
                  <div className="username">{entry.username}</div>
                  <div className="earnings">${entry.totalEarnings.toLocaleString()}</div>
                  <div className="created">{entry.agentsCreated}</div>
                  <div className="sold">{entry.agentsSold}</div>
                  <div className="rating">
                    <div className="card-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          className={star <= Math.round(entry.rating) ? 'active' : ''}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
        
        <div className="pagination">
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="page-info">
            Page {currentPage} of {Math.ceil(leaderboardData.length / itemsPerPage)}
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage * itemsPerPage >= leaderboardData.length}
          >
            Next →
          </button>
        </div>
        
        <div style={{ marginTop: 'var(--spacing)', textAlign: 'center' }}>
          Page {currentPage} of {Math.ceil(leaderboardData.length / itemsPerPage)}
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;
