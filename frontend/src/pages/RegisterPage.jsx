import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { UserPlus, Zap } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirmar: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      toast.success('Registro exitoso. Inicia sesión.')
      navigate('/login')
    } catch (err) {
  const data = err.response?.data
  const mensaje = typeof data === 'string'
    ? data
    : data?.message || 'Error al registrar. Verifica que el backend esté activo.'
  toast.error(mensaje)
    } 
  { setLoading(false) }
  }

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }))

  const campos = [
    { key: 'username',  label: 'Nombre de usuario', type: 'text',     placeholder: 'operador_01' },
    { key: 'email',     label: 'Email',              type: 'email',    placeholder: 'usuario@dominio.com' },
    { key: 'password',  label: 'Contraseña',         type: 'password', placeholder: '••••••••' },
    { key: 'confirmar', label: 'Confirmar contraseña',type: 'password',placeholder: '••••••••' },
  ]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, margin: '0 auto 1rem',
            background: 'var(--bg-elevated)', border: '1px solid var(--cyan)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,212,255,0.25)',
          }}>
            <UserPlus size={28} color="var(--cyan)" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 900,
            letterSpacing: '0.1em', color: 'var(--cyan)',
          }}>REGISTRO</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', letterSpacing: '0.12em', marginTop: '0.3rem' }}>
            NUEVO OPERADOR DE SENSORES
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {campos.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <input
                  className="input-field" type={type} placeholder={placeholder}
                  value={form[key]} onChange={set(key)} required
                />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.3rem' }}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Zap size={13} />}
              {loading ? 'REGISTRANDO...' : 'CREAR CUENTA'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
