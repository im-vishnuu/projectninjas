import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [newProject, setNewProject] = useState({ title: '', abstract: '', keywords: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await createProject(
      newProject.title,
      newProject.abstract,
      newProject.keywords.split(',').map(k => k.trim())
    );

    setLoading(false);
    if (success) {
      // On success, go to the dashboard
      navigate('/dashboard');
    } else {
      setError('Failed to create project. Please check your input and try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <Card className="p-8">
        <h1 className="text-3xl font-bold font-playfair text-white mb-2">Create New Project</h1>
        <p className="text-gray-400 mb-6">Fill out the details below to add your new project to the platform.</p>
        
        <form onSubmit={handleCreateProject} className="space-y-6">
          <Input
            label="Project Title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            required
            autoFocus
          />
          <div className="space-y-2">
             <label className="text-sm font-medium text-gray-400">Abstract</label>
             <textarea
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                rows={5}
                value={newProject.abstract}
                onChange={(e) => setNewProject({ ...newProject, abstract: e.target.value })}
                placeholder="Describe your project, its goals, and methodology..."
                required
              />
          </div>
          <Input
            label="Keywords (comma-separated)"
            value={newProject.keywords}
            onChange={(e) => setNewProject({ ...newProject, keywords: e.target.value })}
            placeholder="e.g., machine learning, data science, web app"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex space-x-4 pt-4">
            <Button type="submit" loading={loading} className="flex-1">Create Project</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};