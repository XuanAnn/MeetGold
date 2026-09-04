import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';

export const ProjectHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col p-6">
      <div className="max-w-3xl w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-gray-200 mb-6 transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">Meeting & Whiteboard History</h1>
        <p className="text-xs text-gray-400 mb-6">
          Review saved whiteboard sessions and join past rooms.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center text-gray-400 text-xs">
          <Clock size={32} className="mx-auto mb-3 text-sky-400 opacity-60" />
          <p className="text-sm font-semibold text-gray-300 mb-1">No Past Meetings Recorded</p>
          <p>Rooms and canvas snapshots you create will appear here once saved to MySQL.</p>
          <Link
            to="/"
            className="inline-block mt-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-4 py-2 rounded-xl transition"
          >
            Create New Room
          </Link>
        </div>
      </div>
    </div>
  );
};
