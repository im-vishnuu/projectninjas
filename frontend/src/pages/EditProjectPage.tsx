import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', abstract: '', keywords: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setForm({
          title: res.data.title || '',
          abstract: res.data.abstract || '',
          keywords: Array.isArray(res.data.keywords) ? res.data.keywords.join(', ') : res.data.keywords || ''
        });
      } catch (err) {
        setError('Failed to load project.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Inside frontend/src/pages/EditProjectPage.tsx

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('projectninjas_token');

      // First, create the data object
      const updatedData = {
        title: form.title,
        abstract: form.abstract,
        keywords: form.keywords.split(',').map(k => k.trim())
      };

      // --- ADD THE LOG HERE ---
      console.log('FRONTEND: Sending PUT request to /api/projects/' + id, 'with data:', updatedData);

      // Then, send the request
      await axios.put(
        `http://localhost:5000/api/projects/${id}`,
        updatedData, // Use the object we just created
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Card className="p-8">
        <h1 className="text-2xl font-bold font-playfair text-white mb-6">Edit Project</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-white mb-2">Abstract</label>
            <textarea
              name="abstract"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors duration-200 font-inter resize-none"
              rows={4}
              value={form.abstract}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            label="Keywords (comma-separated)"
            name="keywords"
            value={form.keywords}
            onChange={handleChange}
            required
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex space-x-3 pt-2">
            <Button type="submit" loading={saving}>Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
