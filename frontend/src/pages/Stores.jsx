import React, { useEffect, useState } from 'react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';

function Stores() {
  const [stores, setStores] = useState([])
  const [q, setQ] = useState("")
  const [sort, setSort] = useState("name")
  const [order, setOrder] = useState("asc")
  const fetchStores = async () => {
    const { data } = await api.get('/stores', { params: { q, sort, order } })
    setStores(data)
  }
  useEffect(() => { fetchStores() }, [q, sort, order])
  const rate = async (storeId, value) => {
    await api.post('/ratings', { storeId, value })
    fetchStores()
  }
  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="card mb-4">
        <div className="flex flex-wrap gap-2">
          <input className="flex-1" placeholder="Search by name or address" value={q} onChange={e=>setQ(e.target.value)} />
          <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="name">Name</option>
            <option value="address">Address</option>
          </select>
          <select value={order} onChange={e=>setOrder(e.target.value)}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {stores.map(s => (
          <div key={s.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-600">{s.address}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Overall</div>
                <div className="text-lg">{s.overallRating?.toFixed(1) ?? "—"}</div>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-500">Your Rating</div>
              <RatingStars value={s.userRating ?? 0} onChange={(v)=>rate(s.id, v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Stores;
