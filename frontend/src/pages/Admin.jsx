import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Button from '../components/Button';

function Admin() {
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 })
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [qUsers, setQUsers] = useState("")
  const [role, setRole] = useState("")
  const [qStores, setQStores] = useState("")
  const [orderU, setOrderU] = useState("asc")
  const [orderS, setOrderS] = useState("asc")
  const [sortU, setSortU] = useState("name")
  const [sortS, setSortS] = useState("name")
  const [newUser, setNewUser] = useState({ name: "", email: "", address: "", password: "", role: "USER" })
  const [newStore, setNewStore] = useState({ name: "", email: "", address: "", ownerId: "" })
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const load = async () => {
    const met = await api.get('/admin/metrics')
    setMetrics(met.data)
    const us = await api.get('/admin/users', { params: { q: qUsers, role, sort: sortU, order: orderU } })
    setUsers(us.data)
    const st = await api.get('/admin/stores', { params: { q: qStores, sort: sortS, order: orderS } })
    setStores(st.data)
  }
  useEffect(()=>{ load() }, [])
  useEffect(()=>{ load() }, [qUsers, role, sortU, orderU, qStores, sortS, orderS])

  const createUser = async (e) => {
    e.preventDefault()
    setIsCreatingUser(true);
    try {
      await api.post('/admin/users', newUser)
      setNewUser({ name: "", email: "", address: "", password: "", role: "USER" })
      load()
    } finally {
      setIsCreatingUser(false);
    }
  }
  const createStore = async (e) => {
    e.preventDefault()
    setIsCreatingStore(true);
    try {
      await api.post('/admin/stores', { ...newStore, ownerId: newStore.ownerId || null, email: newStore.email || null })
      setNewStore({ name: "", email: "", address: "", ownerId: "" })
      load()
    } finally {
      setIsCreatingStore(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><div className="text-sm text-gray-500">Users</div><div className="text-2xl font-semibold">{metrics.totalUsers}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Stores</div><div className="text-2xl font-semibold">{metrics.totalStores}</div></div>
        <div className="card"><div className="text-sm text-gray-500">Ratings</div><div className="text-2xl font-semibold">{metrics.totalRatings}</div></div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-2">Create User</h3>
        <form className="grid md:grid-cols-5 gap-2" onSubmit={createUser}>
          <input placeholder="Name (20-60)" value={newUser.name} onChange={e=>setNewUser(s=>({...s, name:e.target.value}))} />
          <input placeholder="Email" value={newUser.email} onChange={e=>setNewUser(s=>({...s, email:e.target.value}))} />
          <input placeholder="Address" value={newUser.address} onChange={e=>setNewUser(s=>({...s, address:e.target.value}))} />
          <input placeholder="Password" value={newUser.password} onChange={e=>setNewUser(s=>({...s, password:e.target.value}))} />
          <select value={newUser.role} onChange={e=>setNewUser(s=>({...s, role:e.target.value}))}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
          </select>
          <Button className="bg-gray-900 text-white md:col-span-5" isLoading={isCreatingUser}>Add User</Button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-2">Create Store</h3>
        <form className="grid md:grid-cols-4 gap-2" onSubmit={createStore}>
          <input placeholder="Name" value={newStore.name} onChange={e=>setNewStore(s=>({...s, name:e.target.value}))} />
          <input placeholder="Email (optional)" value={newStore.email} onChange={e=>setNewStore(s=>({...s, email:e.target.value}))} />
          <input placeholder="Address" value={newStore.address} onChange={e=>setNewStore(s=>({...s, address:e.target.value}))} />
          <input placeholder="OwnerId (optional)" value={newStore.ownerId} onChange={e=>setNewStore(s=>({...s, ownerId:e.target.value}))} />
          <Button className="bg-gray-900 text-white md:col-span-4" isLoading={isCreatingStore}>Add Store</Button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">Users</h3>
            <input className="flex-1" placeholder="Filter by name/email/address" value={qUsers} onChange={e=>setQUsers(e.target.value)} />
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STORE_OWNER">STORE_OWNER</option>
            </select>
            <select value={sortU} onChange={e=>setSortU(e.target.value)}>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="address">Address</option>
              <option value="role">Role</option>
            </select>
            <select value={orderU} onChange={e=>setOrderU(e.target.value)}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th>Name</th><th>Email</th><th>Address</th><th>Role</th><th>Owner Avg</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td>{u.name}</td><td>{u.email}</td><td>{u.address}</td><td>{u.role}</td>
                    <td>{u.storeOwnerAverageRating?.toFixed?.(1) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">Stores</h3>
            <input className="flex-1" placeholder="Filter by name/email/address" value={qStores} onChange={e=>setQStores(e.target.value)} />
            <select value={sortS} onChange={e=>setSortS(e.target.value)}>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="address">Address</option>
            </select>
            <select value={orderS} onChange={e=>setOrderS(e.target.value)}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left"><th>Name</th><th>Email</th><th>Address</th><th>Avg Rating</th></tr></thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id} className="border-t">
                    <td>{s.name}</td><td>{s.email}</td><td>{s.address}</td><td>{s.rating?.toFixed?.(1) ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin;
