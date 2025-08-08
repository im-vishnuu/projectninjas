import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage'; // Ensure this import path is correct
import { EditProjectPage } from './pages/EditProjectPage';
import { ProjectFilesPage } from './pages/ProjectFilesPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { MainLayout } from './components/layout/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ManageFilesPage } from './pages/ManageFilesPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />

            {/* Protected Routes */}
            <Route
  path="/my-requests"
  element={
    <ProtectedRoute>
      <MyRequestsPage />
    </ProtectedRoute>
  }
/>
<Route path="/projects/:projectId/files" element={<ManageFilesPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id/edit" 
              element={
                <ProtectedRoute>
                  <EditProjectPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/projects/:id/files" 
              element={
                <ProtectedRoute>
                  <ProjectFilesPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MainLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
