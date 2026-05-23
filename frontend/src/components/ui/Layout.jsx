import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Activity, Cpu, History, Shield, LogOut, Zap
} from 'lucide-react'
import logo from '../../assets/WhiteHat.jpg'

export default function Layout() {
  const { user, logout, isSuperAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'DASHBOARD',    icon: Activity },
    { to: '/sensores',  label: 'MIS SENSORES', icon: Cpu      },
    { to: '/historico', label: 'HISTÓRICO',    icon: History  },
    ...(isSuperAdmin ? [{ to: '/admin', label: 'ADMIN', icon: Shield }] : []),
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 230, flexShrink: 0,
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--cyan-border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        padding: '1.5rem 0',
      }}>

        {/* Logo + nombre */}
        <div style={{
          padding: '0 1.40rem 1.9rem',
          borderBottom: '1px solid var(--cyan-border)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          {/* Logo circular */}
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            borderRadius: '50%',
            border: '1.5px solid var(--cyan)',
            boxShadow: '0 0 14px rgba(0,212,255,0.5)',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--bg-void)',
          }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,212,255,0.06)',
              borderRadius: '50%',
            }} />
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.68rem',
              fontWeight: 900, letterSpacing: '0.1em', color: 'var(--cyan)',
              lineHeight: 1.2,
            }}>
              SENSORESVOLT
            </div>
            <div style={{
              fontSize: '0.58rem', color: 'var(--text-muted)',
              letterSpacing: '0.08em', marginTop: '0.15rem',
            }}>
              IoT MONITOR
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{
          flex: 1, padding: '1rem 0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
        }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.6rem 0.85rem', borderRadius: 8,
              textDecoration: 'none',
              fontFamily: 'var(--font-display)', fontSize: '0.68rem', letterSpacing: '0.1em',
              color:      isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              border:     isActive ? '1px solid var(--cyan-border)' : '1px solid transparent',
              transition: 'all 0.15s',
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Usuario + logout */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--cyan-border)',
        }}>
          {/* Avatar + info usuario */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            marginBottom: '0.85rem',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid var(--cyan-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '0.75rem',
              color: 'var(--cyan)', fontWeight: 700, flexShrink: 0,
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.username}
              </div>
              <div style={{
                fontSize: '0.58rem', color: 'var(--cyan)',
                fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
              }}>
                {user?.rol}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-ghost" style={{
            width: '100%', fontSize: '0.65rem', gap: '0.5rem',
            justifyContent: 'center', padding: '0.5rem',
          }}>
            <LogOut size={13} /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}