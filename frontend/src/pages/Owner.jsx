import React, { useEffect, useState } from 'react';
import api from '../services/api';

function Owner() {
  const [data, setData] = useState({ store: null, average: null, ratings: [] })
  const load = async () => {
    const { data } = await api.get('/owner/ratings')
    setData(data)
  }
  useEffect(()=>{ load() }, [])
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="card">
        <h3 className="font-semibold text-lg">{data.store?.name || "Your Store"}</h3>
        <div className="text-sm text-gray-600">Average rating: {data.average?.toFixed?.(1) ?? "—"}</div>
      </div>
      <div className="card">
        <h4 className="font-semibold mb-2">Recent Ratings</h4>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left"><th>User</th><th>Email</th><th>Rating</th><th>When</th></tr></thead>
            <tbody>
              {data.ratings.map(r => (
                <tr key={r.id} className="border-t">
                  <td>{r.user.name}</td><td>{r.user.email}</td><td>{r.value}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Owner;
