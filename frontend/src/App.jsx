import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ExplorePage from './pages/ExplorePage';
import SearchPage from './pages/SearchPage';
import HashCalcPage from './pages/HashCalcPage';
import VisualizationPage from './pages/VisualizationPage';
import ResultFoundPage from './pages/ResultFoundPage';
import ResultNotFoundPage from './pages/ResultNotFoundPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/hash-calculation" element={<HashCalcPage />} />
              <Route path="/visualization" element={<VisualizationPage />} />
              <Route path="/result/found" element={<ResultFoundPage />} />
              <Route path="/result/not-found" element={<ResultNotFoundPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e1b4b',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '0.9rem',
              },
            }}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
