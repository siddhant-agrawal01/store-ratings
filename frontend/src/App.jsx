import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Stores from './pages/Stores.jsx';
import Admin from './pages/Admin.jsx';
import Owner from './pages/Owner.jsx';

function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (token && userRaw) setUser(JSON.parse(userRaw));
  }, []);
  return { user, setUser };
}

export default function App() {
  const { user, setUser } = useAuth();
  return (
    <div>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Signup />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute user={user} allow={['USER']}>
              <Stores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allow={['ADMIN']}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <ProtectedRoute user={user} allow={['STORE_OWNER']}>
              <Owner />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}