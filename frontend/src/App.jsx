import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/ui/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SensorsPage from './pages/SensorsPage'
import HistoryPage from './pages/HistoryPage'
import AdminPage from './pages/AdminPage'

function RutaPrivada({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function RutaAdmin({ children }) {
  const { user, isSuperAdmin } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--cyan-border)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
            },
          }}
        />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RutaPrivada><Layout /></RutaPrivada>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="sensores"  element={<SensorsPage />} />
            <Route path="historico" element={<HistoryPage />} />
            <Route path="admin"     element={<RutaAdmin><AdminPage /></RutaAdmin>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
