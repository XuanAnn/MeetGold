import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './stores/user.store';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
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
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (Requires Login Authentication via MySQL) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/green-room/:id"
            element={
              <ProtectedRoute>
                <GreenRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/room/:id"
            element={
              <ProtectedRoute>
                <WhiteboardRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary/:id"
            element={
              <ProtectedRoute>
                <PostMeetingSummaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ProjectHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
};

export default App;
