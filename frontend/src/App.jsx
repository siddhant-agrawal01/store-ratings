import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import api from './services/api'
import Header from './components/Header.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RatingStars from './components/RatingStars.jsx'

function useAuth() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userRaw = localStorage.getItem('user')
    if (token && userRaw) setUser(JSON.parse(userRaw))
  }, [])
  return { user, setUser }
}

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

function Login({ setUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      // decode-lite: trust server to embed role and name; fetch /stores to hydrate user? we store from token by pinging /stores no endpoint; accept from /me? Instead the server doesn't expose /me.
      // Quick decode: split token and parse payload (not validating) just for UX routing.
      const payload = JSON.parse(atob(data.token.split('.')[1]))
      localStorage.setItem('user', JSON.stringify(payload))
      setUser(payload)
      if (payload.role === 'ADMIN') navigate('/admin')
      else if (payload.role === 'STORE_OWNER') navigate('/owner')
      else navigate('/stores')
    } catch (e) {
      setError(e.response?.data?.message || e.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <form className="card flex flex-col gap-3" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Login</h2>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-gray-900 text-white" type="submit">Login</button>
      </form>
    </div>
  )
}

function Register() {
  const [form, setForm] = useState({ name: "", email: "", address: "", password: "" })
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }))
  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setMsg("")
    try {
      await api.post('/auth/register', form)
      setMsg("Registered! Please login.")
      setForm({ name: "", email: "", address: "", password: "" })
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    }
  }
  return (
    <div className="max-w-md mx-auto p-4">
      <form className="card flex flex-col gap-3" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Register (Normal User)</h2>
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input placeholder="Full Name (20-60 chars)"
               value={form.name} onChange={e=>onChange('name', e.target.value)} />
        <input placeholder="Email"
               value={form.email} onChange={e=>onChange('email', e.target.value)} />
        <input placeholder="Address (max 400)"
               value={form.address} onChange={e=>onChange('address', e.target.value)} />
        <input type="password" placeholder="Password (8-16, 1 uppercase, 1 special)"
               value={form.password} onChange={e=>onChange('password', e.target.value)} />
        <button className="bg-gray-900 text-white" type="submit">Create Account</button>
      </form>
    </div>
  )
}

function ChangePassword() {
  const [oldPassword, setOld] = useState("")
  const [newPassword, setNew] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setMsg("")
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword })
      setMsg("Password updated.")
      setOld(""); setNew("")
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    }
  }
  return (
    <div className="max-w-md mx-auto p-4">
      <form className="card flex flex-col gap-3" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Change Password</h2>
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input type="password" placeholder="Old Password" value={oldPassword} onChange={e=>setOld(e.target.value)} />
        <input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNew(e.target.value)} />
        <button className="bg-gray-900 text-white" type="submit">Update</button>
      </form>
    </div>
  )
}

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
    await api.post('/admin/users', newUser)
    setNewUser({ name: "", email: "", address: "", password: "", role: "USER" })
    load()
  }
  const createStore = async (e) => {
    e.preventDefault()
    await api.post('/admin/stores', { ...newStore, ownerId: newStore.ownerId || null, email: newStore.email || null })
    setNewStore({ name: "", email: "", address: "", ownerId: "" })
    load()
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
          <button className="bg-gray-900 text-white md:col-span-5">Add User</button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-2">Create Store</h3>
        <form className="grid md:grid-cols-4 gap-2" onSubmit={createStore}>
          <input placeholder="Name" value={newStore.name} onChange={e=>setNewStore(s=>({...s, name:e.target.value}))} />
          <input placeholder="Email (optional)" value={newStore.email} onChange={e=>setNewStore(s=>({...s, email:e.target.value}))} />
          <input placeholder="Address" value={newStore.address} onChange={e=>setNewStore(s=>({...s, address:e.target.value}))} />
          <input placeholder="OwnerId (optional)" value={newStore.ownerId} onChange={e=>setNewStore(s=>({...s, ownerId:e.target.value}))} />
          <button className="bg-gray-900 text-white md:col-span-4">Add Store</button>
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

export default function App() {
  const { user, setUser } = useAuth()
  return (
    <div>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={
          <ProtectedRoute user={user}>
            <ChangePassword />
          </ProtectedRoute>
        } />
        <Route path="/stores" element={
          <ProtectedRoute user={user} allow={['USER']}>
            <Stores />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute user={user} allow={['ADMIN']}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/owner" element={
          <ProtectedRoute user={user} allow={['STORE_OWNER']}>
            <Owner />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}
