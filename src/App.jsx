import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initDatabase, dbOperations } from './database/schema.js';
import { seedDatabase } from './database/seed.js';
import { seedMissions, fillMissingMissions, syncMissionDescriptions } from './database/missions.js';
import { MissionManager } from './utils/missionManager.js';
import { useAdmin, AdminProvider } from './contexts/AdminContext'; // Ensure AdminProvider is exported or handled in main.jsx? Checked: AdminContext exports AdminProvider.
import { seedPartners } from './database/seedPartners.js';
// Wait, main.jsx wraps App? No, main.jsx renders App. App.jsx likely didn't wrap AdminProvider in previous version? 
// Checking context... "useAdmin must be used within AdminProvider". 
// Previous App.jsx didn't have AdminProvider. It must be in main.jsx!
// I need to check main.jsx again. If safe, I will wrap here.
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './components/auth/Login';
import LoginAdmin from './components/auth/LoginAdmin';
import Onboarding from './components/auth/Onboarding';
import OnboardingLoader from './components/auth/OnboardingLoader';
import Sidebar from './components/Sidebar';
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
import { Elements } from '@stripe/react-stripe-js';
import { StripeService } from './services/StripeService';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/admin/AdminPanel';
import './index.css';
import './App.css';

// Page Transition Wrapper
const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

const pageTransition = {
  duration: 0.4,
  ease: [0.25, 1, 0.5, 1]
};

const PageWrapper = ({ children, className }) => (
  <motion.div
    className={className}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    style={{ width: '100%', height: '100%' }}
  >
    {children}
  </motion.div>
);

// Wrapper to find game from URL param
const GameDetailsWrapper = ({ games, onBack, onMissionSelect }) => {
  const { gameName } = useParams();
  const decodedGameName = gameName ? gameName.replace(/_/g, ' ') : '';
  const game = games.find(g =>
    g.title.toLowerCase() === decodedGameName.toLowerCase() ||
    g.name?.toLowerCase() === decodedGameName.toLowerCase()
  );

  if (!game) {
    return <div className="p-8">Game not found: {decodedGameName}. <button onClick={onBack}>Back to Games</button></div>;
  }
  return <GameDetails game={game} onBack={onBack} onMissionSelect={onMissionSelect} />;
};

const AppContent = () => {
  const { isAdminAuthenticated } = useAdmin();
  const { currentUser, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  // selectedMissions, etc...
  const [selectedMission, setSelectedMission] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showMissionDetail, setShowMissionDetail] = useState(false);
  const [submittingMission, setSubmittingMission] = useState(null);
  const [showOnboardingLoader, setShowOnboardingLoader] = useState(false);

  // Initial Data Loading (Seeding)
  useEffect(() => {
    const init = async () => {
      // Initialize database & Seed
      try {
        await initDatabase();
        await seedDatabase();
        await seedMissions();
        await fillMissingMissions();
        await syncMissionDescriptions();
        await seedPartners();

        // Load Games Data
        const [allGames, allMissions] = await Promise.all([
          dbOperations.getAll('games'),
          dbOperations.getAll('missions')
        ]);

        const gamesWithCounts = allGames.map(game => {
          const gameMissions = allMissions.filter(m => m.gameId === game.id);
          return { ...game, missionCount: gameMissions.length };
        });
        setGames(gamesWithCounts);
      } catch (e) {
        console.error("Init failed", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Load missions when user changes
  useEffect(() => {
    if (currentUser) {
      loadActiveMissions();
    }
  }, [currentUser]);

  const loadActiveMissions = async () => {
    if (!currentUser) return;
    await MissionManager.getActiveMissions(currentUser.id);
  };

  // ... Handlers (GameSelect, etc) ...
  const handleGameSelect = (game) => {
    const safeName = (game.title || game.name || 'Unknown').replace(/ /g, '_');
    navigate(`/Games/${safeName}`);
  };
  const handleBackToGames = () => navigate('/Games');
  const handleMissionSelect = (mission) => {
    setSelectedMission(mission);
    setShowMissionDetail(true);
  };
  const handleAcceptMission = async () => loadActiveMissions();

  // Onboarding
  const handleOnboardingComplete = async () => {
    setShowOnboardingLoader(true);
    await refreshUser(); // Refresh user state from DB to reflect 'hasCompletedOnboarding: true'
    // Optional: wait a bit for loader effect
    setTimeout(() => {
      setShowOnboardingLoader(false);
    }, 2000);
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div></div>;

  // Admin Route Handling
  if (isAdminAuthenticated) return <AdminPanel />;

  // Protected Routes Check
  // If not logged in, only allow Login routes
  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Onboarding Check
  if (!currentUser.hasCompletedOnboarding && !currentUser.role?.includes('admin')) {
    // Logic for onboarding
    return <Onboarding userId={currentUser.id} onComplete={handleOnboardingComplete} />;
    // Note: Onboarding component needs to update DB.
  }

  if (showOnboardingLoader) return <OnboardingLoader onComplete={() => setShowOnboardingLoader(false)} />;

  // Main App
  return (
    <div className="app">
      <Sidebar user={currentUser} onLogout={logout} />
      <main className="main-content">
        <div className="page-container">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Navigate to="/Dashboard" replace />} />
              <Route path="/Dashboard" element={<PageWrapper className="dashboard-page"><Dashboard user={currentUser} onGameBrowse={() => navigate('/Games')} onMissionSelect={handleMissionSelect} /></PageWrapper>} />
              <Route path="/Games" element={<PageWrapper className="games-page"><GameGrid games={games} onGameSelect={handleGameSelect} /></PageWrapper>} />
              <Route path="/Games/:gameName" element={<PageWrapper className="game-details-page"><GameDetailsWrapper games={games} onBack={handleBackToGames} onMissionSelect={handleMissionSelect} /></PageWrapper>} />
              <Route path="/Missions" element={<PageWrapper className="missions-page"><MissionBrowser userId={currentUser.id} onMissionSelect={handleMissionSelect} /></PageWrapper>} />
              <Route path="/Community/*" element={<PageWrapper><Community user={currentUser} /></PageWrapper>} />
              <Route path="/Profile" element={<PageWrapper className="profile-page"><Profile userId={currentUser.id} /></PageWrapper>} />
              <Route path="/Inbox" element={<PageWrapper className="inbox-page"><Inbox userId={currentUser.id} /></PageWrapper>} />
              <Route path="/Subscription" element={<PageWrapper><Subscription onSelectPlan={(plan) => { setSelectedPlan(plan); navigate('/Checkout'); }} /></PageWrapper>} />
              <Route path="/Checkout" element={<PageWrapper><Elements stripe={StripeService.getStripe()}><Checkout plan={selectedPlan} user={currentUser} refreshUser={refreshUser} onBack={() => navigate('/Subscription')} onComplete={() => navigate('/Dashboard')} /></Elements></PageWrapper>} />
              <Route path="/GDA_Bridge" element={<PageWrapper><GDABridge user={currentUser} /></PageWrapper>} />
              <Route path="*" element={<Navigate to="/Dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
      {showMissionDetail && selectedMission && <MissionDetail mission={selectedMission} userId={currentUser.id} onClose={() => setShowMissionDetail(false)} onAccept={handleAcceptMission} />}
      {submittingMission && <SubmissionForm mission={submittingMission} userId={currentUser.id} onClose={() => setSubmittingMission(null)} onSubmit={async () => { setSubmittingMission(null); await loadActiveMissions(); }} />}
      <AIAssistant />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
