import React, { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'
import { Shield, Users, UserCheck, UserX, ChevronDown } from 'lucide-react'

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState([])
  const [roles,    setRoles]    = useState([])
  const [loading,  setLoading]  = useState(true)

  const cargar = async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([adminApi.getUsuarios(), adminApi.getRoles()])
      setUsuarios(uRes.data)
      setRoles(rRes.data)
    } catch {
      toast.error('Error al cargar usuarios. Verifica que el backend esté activo.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  // CORREGIDO: el nuevo backend recibe idrol (número) en la URL, no nombreRol en el body
  const handleCambiarRol = async (idusuario, idrol) => {
    try {
      await adminApi.cambiarRol(idusuario, idrol)
      toast.success('Rol actualizado')
      cargar()
    } catch (err) {
      toast.error(err.response?.data || 'Error al cambiar rol')
    }
  }


  const handleEliminar = async (idusuario, username) => {
    if (!confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return
    try {
      await adminApi.desactivar(idusuario)
      toast.success('Usuario eliminado')
      cargar()
    } catch (err) {
      toast.error(err.response?.data || 'Error al eliminar usuario')
    }
  }

  const stats = {
    total:   usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    inact:   usuarios.filter(u => !u.activo).length,
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900,
          letterSpacing: '0.1em', color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '0.7rem',
        }}>
          <Shield size={21} color="var(--amber)" /> ADMINISTRACIÓN
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.2rem' }}>
          Gestión de usuarios y roles — solo SUPER_ADMIN
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'TOTAL',     value: stats.total,   icon: Users,     color: 'var(--cyan)' },
          { label: 'ACTIVOS',   value: stats.activos, icon: UserCheck, color: 'var(--green-ok)' },
          { label: 'INACTIVOS', value: stats.inact,   icon: UserX,     color: 'var(--red-alert)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ flex: 1, minWidth: 140, textAlign: 'center', padding: '1rem' }}>
            <Icon size={19} color={color} style={{ margin: '0 auto 0.4rem', display: 'block' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tabla">
            <thead>
              <tr>
                {['ID', 'Usuario', 'Email', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.idusuario} style={{ opacity: u.activo ? 1 : 0.5 }}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>#{u.idusuario}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{u.email}</td>
                  <td>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        value={u.mRol?.idrol || 3}
                        onChange={e => handleCambiarRol(u.idusuario, Number(e.target.value))}
                        disabled={!u.activo}
                        style={{
                          appearance: 'none',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--cyan-border)',
                          borderRadius: 6,
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.6rem', letterSpacing: '0.08em',
                          padding: '0.28rem 1.5rem 0.28rem 0.55rem',
                          cursor: u.activo ? 'pointer' : 'not-allowed',
                        }}>
                        {roles.map(r => (
                          <option key={r.idrol} value={r.idrol}>{r.nombre}</option>
                        ))}
                      </select>
                      <ChevronDown size={9} style={{
                        position: 'absolute', right: '0.35rem', top: '50%',
                        transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
                      }} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.activo ? 'badge-green' : 'badge-red'}`}>
                      {u.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td>
                    {u.activo && (
                      <button className="btn btn-danger" style={{ padding: '0.35rem 0.7rem', fontSize: '0.6rem' }}
                        onClick={() => handleEliminar(u.idusuario, u.username)}>
                        <UserX size={11} /> ELIMINAR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}