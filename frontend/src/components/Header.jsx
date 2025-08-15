import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header({ user }) {
  const navigate = useNavigate()
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">Store Ratings</Link>
        <nav className="flex items-center gap-3">
          {user?.role === 'ADMIN' && <Link className="text-sm" to="/admin">Admin</Link>}
          {user?.role === 'STORE_OWNER' && <Link className="text-sm" to="/owner">Owner</Link>}
          {user?.role === 'USER' && <Link className="text-sm" to="/stores">Stores</Link>}
          {user && <Link className="text-sm" to="/change-password">Change Password</Link>}
          {user ? (
            <button onClick={logout} className="bg-gray-900 text-white">Logout</button>
          ) : (
            <>
              <Link className="text-sm" to="/login">Login</Link>
              <Link className="text-sm" to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
