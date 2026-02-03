import React, { useState, useEffect } from 'react';
import { initDatabase, dbOperations } from './database/schema.js';
import { seedDatabase } from './database/seed.js';
import { seedMissions, fillMissingMissions, syncMissionDescriptions } from './database/missions.js';
import { MissionManager } from './utils/missionManager.js';
import { useAdmin } from './contexts/AdminContext';
import Login from './components/auth/Login';
import Onboarding from './components/auth/Onboarding';
import OnboardingLoader from './components/auth/OnboardingLoader';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import GameGrid from './components/GameGrid';
import GameDetails from './components/GameDetails';
import Inbox from './components/Inbox';
import MissionBrowser from './components/MissionBrowser';
import MissionDetail from './components/MissionDetail';
import SubmissionForm from './components/SubmissionForm';
import Profile from './components/Profile';
import Dashboard from './components/Dashboard';
import Community from './components/Community';
import GDABridge from './components/GDABridge';
import Subscription from './components/Subscription';
import Checkout from './components/Checkout';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/admin/AdminPanel';
import './index.css';
import './App.css';

function App() {
  const { isAdminAuthenticated } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [submittingMission, setSubmittingMission] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // FTUE state
  const [showOnboardingLoader, setShowOnboardingLoader] = useState(false);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeApp();
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadActiveMissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadActiveMissions = async () => {
    if (!user) return;
    const missions = await MissionManager.getActiveMissions(user.id);
    setActiveMissions(missions);
  };

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDatabase();

      // Seed data - checks are now internal to these functions
      await seedDatabase();
      await seedMissions();
      // Auto-fill missions for games that have none (User Request)
      await fillMissingMissions();
      // Sync mission descriptions with new detailed templates (User Request)
      await syncMissionDescriptions();

      // Load user ONLY if session exists
      const storedUser = localStorage.getItem('gda-currentUser');
      if (storedUser) {
        const users = await dbOperations.getAll('users');
        // In a real app we'd verify ID/token, for demo we just check if user exists
        const currentUser = users.find(u => u.id === JSON.parse(storedUser).id) || users[0];
        if (currentUser) {
          setUser(currentUser);
        }
      } else {
        // No session, ensures we stay on login screen
        setUser(null);
      }

      // Load games and missions to calculate counts
      const [allGames, allMissions] = await Promise.all([
        dbOperations.getAll('games'),
        dbOperations.getAll('missions')
      ]);

      // Calculate mission counts per game
      const gamesWithCounts = allGames.map(game => {
        const gameMissions = allMissions.filter(m => m.gameId === game.id);
        return {
          ...game,
          missionCount: gameMissions.length
        };
      });

      setGames(gamesWithCounts);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      // Fallback load
      try {
        const users = await dbOperations.getAll('users');
        if (users.length > 0) setUser(users[0]);

        const allGames = await dbOperations.getAll('games');
        setGames(allGames); // Without counts if missions fail
      } catch (e) {
        console.error('Fallback failed', e);
      }
      setLoading(false);
    }
  };

  // Expose reset function for user convenience
  useEffect(() => {
    window.resetDatabase = async () => {
      if (confirm('Tüm veriler silinecek ve başlangıç verileri yüklenecek. Emin misiniz?')) {
        await dbOperations.clearDatabase();
        window.location.reload();
      }
    };
    console.log('💡 Geliştirici: Veritabanını sıfırlamak için konsola "window.resetDatabase()" yazabilirsiniz.');
    window.clearAndReseed = window.resetDatabase;
  }, []);

  const handleGameSelect = (game) => {
    console.log('Selected game:', game);
    setSelectedGame(game);
    setCurrentPage('game-details');
  };

  const handleBackToGames = () => {
    setSelectedGame(null);
    setCurrentPage('games');
  };

  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setShowMissionDetail(true);
  };

  const handleAcceptMission = async () => {
    await loadActiveMissions();
  };

  const handleMissionSubmit = (mission) => {
    setSubmittingMission(mission);
  };

  // FTUE Handlers
  const handleLogin = (loggedInUser) => {
    localStorage.setItem('gda-currentUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setLoading(false);
  };

  const handleOnboardingComplete = async () => {
    // Reload user from database to get updated onboarding status
    try {
      const users = await dbOperations.getAll('users');
      const updatedUser = users.find(u => u.id === user.id);
      if (updatedUser) {
        setUser(updatedUser);
      }
      setShowOnboardingLoader(true);
    } catch (error) {
      console.error('Error reloading user:', error);
      setShowOnboardingLoader(true); // Show loader anyway
    }
  };

  const handleLoaderComplete = () => {
    setShowOnboardingLoader(false);
  };

  const handleSubmissionComplete = async () => {
    setSubmittingMission(null);
    await loadActiveMissions();

    // Trigger AI Assistant with proactive message
    setTimeout(() => {
      if (window.triggerAIAssistant) {
        window.triggerAIAssistant('afterCaseCompletion');
      }
    }, 2000);
    alert(`Submission successful! AI feedback will arrive in your inbox.`);
  };

  // Subscription Handlers
  const handleSubscriptionSelect = (plan) => {
    setSelectedPlan(plan);
    setCurrentPage('checkout');
  };

  const handleCheckoutComplete = () => {
    // Refresh user data to show new subscription
    if (user) {
      // Re-fetch user to get updated subscription tier
      dbOperations.get('users', user.id).then(updatedUser => {
        if (updatedUser) setUser(updatedUser);
      });
    }
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Initializing GDA Hub...</div>
      </div>
    );
  }

  // If admin is authenticated, show admin panel
  if (isAdminAuthenticated) {
    return <AdminPanel />;
  }

  // FTUE Flow: Check authentication and onboarding status
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user && !user.hasCompletedOnboarding) {
    return <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />;
  }

  if (showOnboardingLoader) {
    return <OnboardingLoader onComplete={handleLoaderComplete} />;
  }

  // Main App (after FTUE)
  return (
    <div className="app">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={() => {
          localStorage.removeItem('gda-currentUser');
          window.location.reload();
        }}
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="page-container">
          {currentPage === 'dashboard' && (
            <div className="dashboard-page">
              <Dashboard
                user={user}
                onGameBrowse={() => setCurrentPage('games')}
                onMissionSelect={handleMissionSelect}
              />
            </div>
          )}

          {currentPage === 'games' && (
            <div className="games-page">
              <GameGrid games={games} onGameSelect={handleGameSelect} />
            </div>
          )}

          {currentPage === 'game-details' && selectedGame && (
            <div className="game-details-page">
              <GameDetails
                game={selectedGame}
                onBack={handleBackToGames}
                onMissionSelect={handleMissionSelect}
              />
            </div>
          )}

          {currentPage === 'missions' && (
            <div className="missions-page">
              <MissionBrowser
                userId={user?.id}
                onMissionSelect={handleMissionSelect}
              />
            </div>
          )}

          {currentPage === 'submissions' && (
            <div className="submissions-page">
              <div className="page-header">
                <h1>My Submissions</h1>
                <p className="page-description">
                  View all your completed case studies and their feedback
                </p>
              </div>
              <p>Submissions feature coming soon...</p>
            </div>
          )}

          {currentPage === 'profile' && (
            <div className="profile-page">
              <Profile userId={user?.id} />
            </div>
          )}

          {currentPage === 'inbox' && (
            <div className="inbox-page">
              <Inbox userId={user?.id} />
            </div>
          )}

          {currentPage === 'leaderboard' && (
            <div className="leaderboard-page">
              <div className="page-header">
                <h1>Leaderboard</h1>
                <p className="page-description">
                  Top designers in the GDA community
                </p>
              </div>
              <div className="coming-soon">
                <div className="coming-soon-icon">🏆</div>
                <div className="coming-soon-text">Leaderboard coming soon!</div>
              </div>
            </div>
          )}

          {currentPage === 'community' && (
            <Community user={user} />
          )}

          {currentPage === 'bridge' && (
            <GDABridge user={user} />
          )}

          {currentPage === 'subscription' && (
            <Subscription onSelectPlan={handleSubscriptionSelect} />
          )}

          {currentPage === 'checkout' && (
            <Checkout
              plan={selectedPlan}
              user={user}
              onBack={() => setCurrentPage('subscription')}
              onComplete={handleCheckoutComplete}
            />
          )}

        </div>
      </main >

      {/* Mobile Bottom Navigation */}
      < BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Mission Detail Modal */}
      {
        showMissionDetail && selectedMission && (
          <MissionDetail
            mission={selectedMission}
            userId={user?.id}
            onClose={() => setShowMissionDetail(false)}
            onAccept={handleAcceptMission}
          />
        )
      }

      {/* Submission Form Modal */}
      {
        submittingMission && (
          <SubmissionForm
            mission={submittingMission}
            userId={user?.id}
            onClose={() => setSubmittingMission(null)}
            onSubmit={handleSubmissionComplete}
          />
        )
      }

      {/* AI Assistant - Always visible */}
      <AIAssistant />
    </div >
  );
}

export default App;
