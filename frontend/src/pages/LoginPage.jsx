import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap } from 'lucide-react'
import logo from '../assets/WhiteHat.jpg'

export default function LoginPage() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]         = useState({ username: '', password: '' })
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Acceso autorizado')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data || err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Destellos de fondo */}
      <div style={{
        position: 'fixed', top: '8%', left: '4%', width: 340, height: 340, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '6%', width: 440, height: 440, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)',
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo + nombre */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>

          {/* Logo circular con glow */}
          <div style={{
            width: 110, height: 110, margin: '0 auto 1.2rem',
            borderRadius: '50%',
            border: '2px solid var(--cyan)',
            boxShadow: '0 0 32px rgba(0,212,255,0.5), 0 0 64px rgba(0,212,255,0.2)',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--bg-elevated)',
          }}>
            <img
              src={logo}
              alt="SensoresVolt Logo"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.9) contrast(1.1)',
              }}
            />
            {/* Overlay cyan sutil */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,212,255,0.08)',
              borderRadius: '50%',
            }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 900,
            letterSpacing: '0.12em', color: 'var(--cyan)',
            textShadow: '0 0 28px rgba(0,212,255,0.6)',
          }}>
            SENSORESVOLT
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.35rem',
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>
            Plataforma de Monitoreo IoT · ESP32
          </p>
        </div>

        {/* Card de login */}
        <div className="card">
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.18em',
            color: 'var(--text-secondary)', marginBottom: '1.75rem', textAlign: 'center',
          }}>
            IDENTIFICACIÓN DE ACCESO
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label className="field-label">Usuario</label>
              <input
                className="input-field" type="text" placeholder="nombre_usuario"
                value={form.username} autoFocus required
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              />
            </div>
            <div>
              <label className="field-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password} required
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.25rem' }}>
              {loading
                ? <span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                : <Zap size={13} />}
              {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ¿Sin cuenta?{' '}
            <Link to="/register" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}