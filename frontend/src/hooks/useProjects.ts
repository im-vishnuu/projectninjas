import { useState, useEffect, useCallback } from 'react';
import { Project, AccessRequest, ProjectFile } from '../types';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

export const useProjects = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (title: string, abstract: string, keywords: string[]): Promise<boolean> => {
    if (!token) return false;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/projects`,
        { title, abstract, keywords },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(prev => [response.data, ...prev]);
      return true;
    } catch (error) {
      return false;
    }
  }, [token]);

  const getProjectById = useCallback((id: number): Project | undefined => {
    return projects.find(p => p.projectId === id);
  }, [projects]);

  const fetchProjectFiles = useCallback(async (projectId: number): Promise<ProjectFile[]> => {
    if (!token) throw new Error("No auth token");
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/files`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      console.error('Failed to fetch project files:', err);
      throw err;
    }
  }, [token]);

  const uploadProjectFile = useCallback(async (projectId: number, file: File, fileType: string): Promise<boolean> => {
    if (!token) return false;
    const formData = new FormData();
    formData.append('projectFile', file);
    formData.append('fileType', fileType);

    try {
      await axios.post(`${API_BASE_URL}/projects/${projectId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (err) {
      console.error('Failed to upload file:', err);
      return false;
    }
  }, [token]);

  return { projects, loading, getProjectById, createProject, fetchProjectFiles, uploadProjectFile };
};

// --- REFACTORED HOOK ---
export const useAccessRequests = () => {
  const { token } = useAuth();
  // FIX: Use separate state for received and sent requests
  const [receivedRequests, setReceivedRequests] = useState<AccessRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<AccessRequest[]>([]);

  // Fetches requests for projects OWNED by the current user (for the dashboard)
  const fetchMyProjectsRequests = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReceivedRequests(response.data); // FIX: Only set received requests
    } catch (error) {
      console.error('Failed to fetch received requests:', error);
    }
  }, [token]);

  // Fetches requests SENT BY the current user
  const fetchMySentRequests = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/requests/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSentRequests(response.data); // FIX: Only set sent requests
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
    }
  }, [token]);

  const submitAccessRequest = useCallback(async (projectId: number): Promise<AccessRequest | null> => {
    if (!token) {
      console.error('submitAccessRequest failed: No token available.');
      return null;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/requests`,
        { projectId }, // FIX: Backend gets requesterId from token, no need to send it.
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newRequest = response.data;
      // FIX: Optimistically update the sent requests state
      setSentRequests(prev => [...prev, newRequest]);
      return newRequest;
    } catch (error: any) {
      console.error("API request to submit access request failed.", error.response ? error.response.data : error);
      return null;
    }
  }, [token]);

  const updateRequestStatus = useCallback(async (requestId: number, status: 'approved' | 'denied'): Promise<boolean> => {
    if (!token) return false;
    try {
      await axios.put(
        `${API_BASE_URL}/requests/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // FIX: Update the state for received requests, which is where this action is performed.
      setReceivedRequests(prev =>
        prev.map(r => (r.requestId === requestId ? { ...r, status } : r))
      );
      return true;
    } catch (error) {
      return false;
    }
  }, [token]);

  return {
    receivedRequests,
    sentRequests,
    fetchMyProjectsRequests,
    fetchMySentRequests,
    submitAccessRequest,
    updateRequestStatus,
  };
};