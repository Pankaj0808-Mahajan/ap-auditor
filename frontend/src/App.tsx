import React, { useState } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { CleanFooter } from './components/CleanFooter';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { AuditLogPage } from './pages/AuditLogPage';
import { GetStartedModal } from './components/GetStartedModal';
import { ChatHomePage } from './components/ChatHomePage';

export function App() {
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'review' | 'audit'>('home');
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E6E8EE] flex flex-col font-sans selection:bg-[#0078D4]/40 selection:text-white">
      {/* Show TopNavbar on non-home pages to facilitate seamless navigation back to Chat Copilot */}
      {activeView !== 'home' && (
        <TopNavbar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onGetStarted={() => setIsGetStartedOpen(true)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full flex flex-col">
        {/* HOMEPAGE: CHATGPT-STYLE CHAT INTERFACE WITH LEFT SIDEBAR */}
        <div className={activeView === 'home' ? 'flex-1 flex flex-col h-screen' : 'hidden'}>
          <ChatHomePage
            activeView={activeView}
            onNavigate={(view) => {
              setActiveView(view);
              if (view !== 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenGetStarted={() => setIsGetStartedOpen(true)}
          />
        </div>

        {/* DASHBOARD PAGE */}
        {activeView === 'dashboard' && (
          <DashboardPage onNavigateToReview={() => setActiveView('review')} />
        )}

        {/* REVIEW QUEUE PAGE */}
        {activeView === 'review' && <ReviewQueuePage />}

        {/* AUDIT LOG PAGE */}
        {activeView === 'audit' && <AuditLogPage />}
      </main>

      {/* FOOTER: Only displayed on subpages, as Chat has full viewport height */}
      {activeView !== 'home' && (
        <CleanFooter
          onNavigate={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* GET STARTED / INTEGRATION MODAL */}
      <GetStartedModal
        isOpen={isGetStartedOpen}
        onClose={() => setIsGetStartedOpen(false)}
        onLaunchDemo={() => setActiveView('review')}
      />
    </div>
  );
}

export default App;
