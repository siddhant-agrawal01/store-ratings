import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ user, allow, children }) {
  if (!user) return <Navigate to="/login" replace />
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />
  return children
}
