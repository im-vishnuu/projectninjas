import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Upload, FileText, Book, Archive } from 'lucide-react';
import { ProjectFile } from '../types';

export const ProjectFilesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id ? parseInt(id, 10) : 0;
  const { token } = useAuth();
  const { fetchProjectFiles, uploadProjectFile } = useProjects();

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState('Source Code');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const fetchedFiles = await fetchProjectFiles(projectId);
      setFiles(fetchedFiles);
    } catch (err) {
      setError('Failed to fetch existing files.');
    } finally {
      setLoading(false);
    }
  }, [projectId, fetchProjectFiles]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;
    
    setUploading(true);
    setError('');

    try {
      const success = await uploadProjectFile(projectId, selectedFile, fileType);
      if (success) {
        await loadFiles();
        setSelectedFile(null);
      } else {
        setError('File upload failed. Please try again.');
      }
    } catch (err) {
      setError('File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'Documentation') return <Book className="w-5 h-5 text-gray-400" />;
    if (type === 'Other') return <Archive className="w-5 h-5 text-gray-400" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-playfair text-white">File Management</h1>
        
        <Card className="p-8">
          <h2 className="text-xl font-semibold font-playfair text-white mb-6">Uploaded Files</h2>
          {loading ? (
            <div className="flex justify-center"><Spinner /></div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <div className="space-y-3">
              {files.length > 0 ? files.map(file => (
                <div key={file.fileId} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.fileType)}
                    <span className="text-white">{file.fileName}</span>
                  </div>
                  <span className="text-xs text-gray-500">{file.fileType}</span>
                </div>
              )) : <p className="text-gray-500">No files have been uploaded for this project yet.</p>}
            </div>
          )}
        </Card>

        <Card className="p-8">
          <h2 className="text-xl font-semibold font-playfair text-white mb-6">Upload New File</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="file" onChange={handleFileChange} className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"/>
              <select value={fileType} onChange={e => setFileType(e.target.value)} className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700">
                <option>Source Code</option>
                <option>Documentation</option>
                <option>Other</option>
              </select>
            </div>
            <Button onClick={handleUpload} loading={uploading} disabled={!selectedFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Selected File
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};