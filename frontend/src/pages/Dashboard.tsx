import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, listConversations } from '../api/client';
import { Document, Conversation } from '../types';
import { toast } from 'react-toastify';

interface StatCardProps {
  title: string;
  count: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [conversationCount, setConversationCount] = useState<number>(0);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const documentsResponse = await getDocuments();
        const conversationsResponse = await listConversations();

        setDocumentCount(documentsResponse.length);
        setConversationCount(conversationsResponse.length);

        setRecentDocuments(documentsResponse.slice(0, 5));
        setRecentConversations(conversationsResponse.slice(0, 5));
      } catch (err) {
        setError('Failed to fetch dashboard data.');
        toast.error('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickAction = (action: string) => {
    if (action === 'upload') {
      navigate('/upload');
    } else if (action === 'chat') {
      navigate('/chat');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Documents" count={documentCount} />
            <StatCard title="Conversations" count={conversationCount} />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Documents</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
              {recentDocuments.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentDocuments.map((doc) => (
                    <li key={doc.id} className="py-2">
                      <p className="text-gray-700">{doc.name}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No recent documents found.</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Conversations</h2>
            <div className="bg-white shadow-md rounded-lg p-4">
              {recentConversations.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentConversations.map((conv) => (
                    <li key={conv.id} className="py-2">
                      <p className="text-gray-700">Conversation ID: {conv.id}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No recent conversations found.</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleQuickAction('upload')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
              >
                Upload Document
              </button>
              <button
                onClick={() => handleQuickAction('chat')}
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
              >
                Start Chat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;