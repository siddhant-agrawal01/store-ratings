import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="card">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="text-sm text-gray-600 mt-2">Rate stores and manage via role-based dashboards.</p>
        <div className="mt-4 flex gap-2">
          <Link to="/stores" className="bg-gray-900 text-white">Browse Stores</Link>
          <Link to="/login" className="bg-gray-200">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Home;
