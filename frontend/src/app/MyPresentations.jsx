import { useEffect, useState } from 'react';
import { getMyPresentations } from '../api/presentationService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const res = await getMyPresentations();
      setList(res.data);
    };
    fetchDocs();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Presentations</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.map((item) => (
          <div key={item._id} className="border p-4 rounded shadow hover:bg-gray-50">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-500">Slides: {item.slidesCount}</p>
            <p className="text-xs text-gray-400">
              Last edited: {new Date(item.updatedAt).toLocaleDateString()}
            </p>
            <Link 
              to={`/preview/${item._id}`} 
              className="mt-3 inline-block text-blue-600 font-medium"
            >
              Open Project →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};