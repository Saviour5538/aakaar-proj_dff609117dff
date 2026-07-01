import React, { useEffect, useState } from 'react';
import { getDocuments, deleteDocument } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner: string;
}

const DocumentsList: React.FC = () => {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDocuments();
        setItems(response);
      } catch (err: any) {
        setError('Failed to fetch documents.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDocument(id);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err: any) {
      setError('Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Documents</h1>
        <button
          onClick={() => navigate('/documents/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-full"
        />
      </div>
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {!loading && !error && (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Created At</th>
              <th className="border border-gray-300 px-4 py-2">Updated At</th>
              <th className="border border-gray-300 px-4 py-2">Owner</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2">{item.title}</td>
                <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                <td className="border border-gray-300 px-4 py-2">{item.created_at}</td>
                <td className="border border-gray-300 px-4 py-2">{item.updated_at}</td>
                <td className="border border-gray-300 px-4 py-2">{item.owner}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DocumentsList;