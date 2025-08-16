import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

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
        <p className="text-center text-sm">Don't have an account? <Link to="/register" className="text-blue-500">Sign up</Link></p>
      </form>
    </div>
  )
}

export default Login;
