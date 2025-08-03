import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { AccessRequest } from '../types';

export const MyRequestsPage: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentRequests = async () => {
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:5000/api/requests/sent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch sent requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSentRequests();
  }, [token]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'denied': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-playfair text-white">My Sent Requests</h1>
        {requests.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">You haven't made any requests yet.</h3>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.requestId} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{request.projectTitle}</h3>
                    <p className="text-gray-500 text-xs">
                      Requested on: {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className="font-medium">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};