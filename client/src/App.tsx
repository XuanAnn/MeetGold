import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { GreenRoomPage } from './pages/GreenRoom/GreenRoomPage';
import { WhiteboardRoomPage } from './pages/WhiteboardRoom/WhiteboardRoomPage';
import { PostMeetingSummaryPage } from './pages/PostMeetingSummary/PostMeetingSummaryPage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { ProjectHistoryPage } from './pages/ProjectHistory/ProjectHistoryPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Screen 1: Dashboard Hub */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Screen 2: Green Room / Pre-Call Check */}
        <Route path="/green-room/:id" element={<GreenRoomPage />} />

        {/* Screen 3 & 4: Whiteboard Canvas, Screen Share & Discussion */}
        <Route path="/room/:id" element={<WhiteboardRoomPage />} />

        {/* Screen 5: Post-Meeting Archive & AI Summary */}
        <Route path="/summary/:id" element={<PostMeetingSummaryPage />} />

        {/* Additional Auth & Setting Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/history" element={<ProjectHistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
