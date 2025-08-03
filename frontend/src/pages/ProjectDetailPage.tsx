import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Calendar, User, FileText, Shield, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useProjects, useAccessRequests } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { ProjectFile } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id, 10) : 0;

  const { getProjectById, loading: projectsLoading, fetchProjectFiles } = useProjects();
  // FIX: Use the new state variables and fetch functions correctly
  const { sentRequests, submitAccessRequest, fetchMySentRequests } = useAccessRequests();
  const { user, isAuthenticated } = useAuth();

  const [requestLoading, setRequestLoading] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);

  // FIX: This useEffect now ONLY fetches the requests sent by the current user.
  useEffect(() => {
    if (isAuthenticated) {
      fetchMySentRequests();
    }
  }, [isAuthenticated, fetchMySentRequests]);

  const project = !projectsLoading ? getProjectById(projectId) : undefined;
  
  // FIX: Find the request in the dedicated 'sentRequests' array.
  const currentUserRequest = sentRequests.find(
    (req) => req.projectId === projectId
  );

  useEffect(() => {
    if (currentUserRequest?.status === 'approved' && project && fetchProjectFiles) {
      const loadFiles = async () => {
        try {
          const files = await fetchProjectFiles(project.projectId);
          setProjectFiles(files);
        } catch (error) {
          console.error("Failed to load project files after approval.");
        }
      };
      loadFiles();
    }
  }, [currentUserRequest, project, fetchProjectFiles]);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };
  if (projectsLoading) {
    return ( <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div> );
  }
  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const handleAccessRequest = async () => {
    if (!user || !project) return;
    setRequestLoading(true);
    try {
      await submitAccessRequest(project.projectId);
      // State is now updated optimistically inside the hook, no need to do anything here.
    } catch (error) {
      console.error("!!! FRONTEND ERROR in handleAccessRequest:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  const isOwner = user?.userId === project.ownerId;

  const renderAccessSection = () => {
    if (!isAuthenticated) {
        return (
            <div className="space-y-3">
                <p className="text-sm text-gray-400">Please sign in to request access.</p>
                <Button onClick={() => navigate('/login')}>Sign In</Button>
            </div>
        );
    }
    if (isOwner) {
        return (
            <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">You own this project.</span>
            </div>
        );
    }

    if (currentUserRequest) {
        switch (currentUserRequest.status) {
            case 'pending':
                return (
                    <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-400 font-medium">Access request sent.</span>
                    </div>
                );
            case 'approved':
                return (
                    <div className="space-y-4">
                        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-medium">Access Approved. You can now download the project files.</span>
                        </div>
                        <div className="space-y-3">
                            {projectFiles.map(file => (
                                <div key={file.fileId} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-gray-400" />
                                        <span className="text-white">{file.fileName}</span>
                                    </div>
                                    <a
                                        href={`http://localhost:5000/api/projects/files/${file.fileId}/download`}
                                        download
                                    >
                                        <Button variant="outline" size="sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'denied':
                return (
                    <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Access Denied.</span>
                    </div>
                );
        }
    }
    
    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-400">Send an access request to the author to view the files.</p>
            <Button onClick={handleAccessRequest} loading={requestLoading}>Request Access</Button>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Project Header */}
        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold font-playfair text-white leading-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{project.ownerEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.keywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded-full">{keyword}</span>
            ))}
          </div>
        </div>

        {/* Project Abstract */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold font-playfair text-white mb-4">Abstract</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{project.abstract}</p>
        </Card>

        {/* Access Control Section */}
        <Card className="p-8">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-white mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-semibold font-playfair text-white mb-2">Protected Content</h3>
                <p className="text-gray-400">This project's files are protected.</p>
              </div>
              {renderAccessSection()}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};