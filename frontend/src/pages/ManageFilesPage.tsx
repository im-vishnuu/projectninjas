import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Project, ProjectFile } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Trash2, FileText, ArrowLeft, Upload, Download } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ManageFilesPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileType, setFileType] = useState('Source Code');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const fetchProjectData = useCallback(async () => {
        // --- THIS IS THE FIX ---
        // Don't run the function until both projectId and token are ready.
        if (!projectId || !token) return;

        setLoading(true);
        try {
            const projectRequest = axios.get(`${API_BASE_URL}/api/projects/${projectId}`);
            const filesRequest = axios.get(`${API_BASE_URL}/api/projects/${projectId}/files`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const [projectResponse, filesResponse] = await Promise.all([projectRequest, filesRequest]);
            setProject(projectResponse.data);
            setFiles(filesResponse.data);
        } catch (error) {
            console.error("Failed to fetch project data:", error);
        } finally {
            setLoading(false);
        }
    }, [projectId, token]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setUploadError('');
        }
    };

    const handleFileUpload = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedFile) {
            setUploadError('Please select a file to upload.');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('projectFile', selectedFile);
        formData.append('fileType', fileType);

        try {
            await axios.post(`${API_BASE_URL}/api/projects/${projectId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchProjectData();
            setSelectedFile(null);
        } catch (error) {
            console.error('File upload failed:', error);
            setUploadError('File upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileId: number, fileName: string) => {
        if (!token) {
            alert('Authentication error: No token found. Please log in again.');
            return;
        }
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/projects/files/${fileId}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob',
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download the file.");
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/projects/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFiles(currentFiles => currentFiles.filter(f => f.fileId !== fileId));
        } catch (error) {
            console.error('Failed to delete file:', error);
            alert('Error: Could not delete the file.');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div>
                <Link to="/dashboard" className="flex items-center text-sm text-gray-400 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mt-2">Manage Files for "{project?.title}"</h1>
            </div>
            
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Add New File</h2>
                <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                        <label htmlFor="file-type" className="block text-sm font-medium text-gray-300 mb-1">File Type</label>
                        <select
                            id="file-type"
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            className="block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                        >
                            <option>Source Code</option>
                            <option>Documentation</option>
                            <option>Presentation</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">Select File</label>
                        <input 
                            id="file-upload" 
                            type="file" 
                            onChange={handleFileChange} 
                            key={selectedFile ? 'file-selected' : 'no-file'}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                        />
                    </div>
                    {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
                    <Button type="submit" loading={uploading} disabled={!selectedFile || uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                    </Button>
                </form>
            </Card>
            
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
                <div className="space-y-3">
                    {Array.isArray(files) && files.length > 0 ? (
                        files.map(file => (
                            <div key={file.fileId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <span className="text-white">{file.fileName}</span>
                                    <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">{file.fileType}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button onClick={() => handleDownload(file.fileId, file.fileName)} variant="outline" size="sm">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleDeleteFile(file.fileId)} variant="destructive" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400">No files uploaded for this project yet.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};