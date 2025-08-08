import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useProjects, useAccessRequests } from '../hooks/useProjects';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/ui/Spinner';
import { useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // 1. Import the delete icon
import axios from 'axios'

// Define your API base URL here or import it from your config
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';


export const DashboardPage: React.FC = () => {
  const { user ,token} = useAuth();
  const { projects,setProjects, createProject, loading: projectsLoading } = useProjects();
  // FIX: Use the new 'receivedRequests' state variable. Renaming for clarity.
  const { receivedRequests: requests, updateRequestStatus, fetchMyProjectsRequests } = useAccessRequests();
  const location = useLocation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', abstract: '', keywords: '' });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (location.state?.openCreateForm) {
      setShowCreateForm(true);
    }
  }, [location.state]);

  // FIX: This correctly fetches only the requests for the user's projects.
  useEffect(() => {
    fetchMyProjectsRequests();
  }, [fetchMyProjectsRequests]);



  const userProjects = projects.filter(p => p.ownerId === user?.userId);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    const success = await createProject(
      newProject.title,
      newProject.abstract,
      newProject.keywords.split(',').map(k => k.trim())
    );
    setCreateLoading(false);
    if (success) {
      setShowCreateForm(false);
      setNewProject({ title: '', abstract: '', keywords: '' });
    }
  };
const handleDeleteProject = async (projectId: number) => {
    // CRITICAL: Always ask for confirmation before a destructive action.
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this entire project?\nAll associated files and access requests will be permanently removed. This cannot be undone.'
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update the UI instantly by removing the project from the local state
      setProjects(currentProjects => currentProjects.filter(p => p.projectId !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Error: Could not delete the project.');
    }
  };

  const handleRequestResponse = async (requestId: number, status: 'approved' | 'denied') => {
    await updateRequestStatus(requestId, status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'denied': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'approved': return 'text-green-400';
      case 'denied': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (projectsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header and Create Project Form */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-playfair text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.email.split('@')[0]}</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold font-playfair text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <Input
                label="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
              />
              <textarea
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-white"
                  rows={4}
                  value={newProject.abstract}
                  onChange={(e) => setNewProject({ ...newProject, abstract: e.target.value })}
                  placeholder="Describe your project..."
                  required
                />
              <Input
                label="Keywords (comma-separated)"
                value={newProject.keywords}
                onChange={(e) => setNewProject({ ...newProject, keywords: e.target.value })}
                required
              />
              <div className="flex space-x-3 pt-2">
                <Button type="submit" loading={createLoading}>Create Project</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Projects Section */}
        <div>
          <h2 className="text-2xl font-semibold font-playfair text-white mb-6">Your Projects ({userProjects.length})</h2>
          {userProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">Start by creating your first project</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userProjects.map((project) => (
                <Card key={project.projectId} hover className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-playfair text-white">{project.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-3">{project.abstract}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords.slice(0, 3).map((keyword, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">{keyword}</span>
                      ))}
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/projects/${project.projectId}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link to={`/projects/${project.projectId}/files`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Upload className="w-4 h-4 mr-1" />
                          Files
                        </Button>
                      </Link>
<Button 
        onClick={() => handleDeleteProject(project.projectId)} 
        variant="destructive" 
        size="sm"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
    </div>

        {/* Access Requests Section - Now correctly uses 'requests' (which is 'receivedRequests') */}
        <div>
          <h2 className="text-2xl font-semibold font-playfair text-white mb-6">Access Requests ({requests.length})</h2>
          {requests.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No access requests</h3>
              <p className="text-gray-500">Requests for your projects will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.requestId} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(request.status)}
                        <span className={`font-medium ${getStatusColor(request.status)}`}>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{request.projectTitle}</h3>
                      <p className="text-gray-400 text-sm">Request from: {request.requesterEmail}</p>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleRequestResponse(request.requestId, 'approved')}>Approve</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleRequestResponse(request.requestId, 'denied')}>Deny</Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};