import React, { useState, useEffect } from 'react'
import { sensoresApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Cpu, Plus, Trash2, Key, Tag, FileText, RefreshCw } from 'lucide-react'

function generarToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function SensoresPage() {
  const { user, isAdmin } = useAuth()
  const [sensores,  setSensores]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState({ sensorName: '', sensorToken: '', descripcion: '' })
  const [guardando, setGuardando] = useState(false)

  const cargar = async () => {
    setLoading(true)
    try {
      const res = isAdmin
        ? await sensoresApi.getTodos()
        : await sensoresApi.getMisSensores(user?.idusuario)
      setSensores(res.data)
    } catch (err) {
      toast.error('Error al cargar sensores. Verifica que el backend esté activo.')
    } finally { setLoading(false) }
  }

  useEffect(() => { cargar() }, [])

  const handleAdicionar = async e => {
    e.preventDefault()
    setGuardando(true)
    try {
      // El nuevo backend necesita mUsuario para asignar el sensor al usuario autenticado
      await sensoresApi.adicionar({
        sensorName:  form.sensorName,
        sensorToken: form.sensorToken,
        descripcion: form.descripcion,
        mUsuario: { idusuario: user?.idusuario }
      })
      toast.success('Sensor registrado correctamente')
      setForm({ sensorName: '', sensorToken: '', descripcion: '' })
      setShowForm(false)
      cargar()
    } catch (err) {
      toast.error(err.response?.data || 'Error al registrar sensor')
    } finally { setGuardando(false) }
  }

  const handleEliminar = async (idsensor, nombre) => {
    if (!confirm(`¿Eliminar sensor "${nombre}"? Se borrarán todas sus mediciones.`)) return
    try {
      await sensoresApi.eliminar(idsensor)
      toast.success('Sensor eliminado')
      setSensores(prev => prev.filter(s => s.idsensor !== idsensor))
    } catch (err) {
      toast.error(err.response?.data || 'Error al eliminar')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900,
            letterSpacing: '0.1em', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <Cpu size={22} color="var(--cyan)" /> MIS SENSORES
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            {sensores.length} sensor{sensores.length !== 1 ? 'es' : ''} registrado{sensores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          <Plus size={14} /> {showForm ? 'CANCELAR' : 'NUEVO SENSOR'}
        </button>
      </div>

      {showForm && (
        <div className="card fade-up" style={{ marginBottom: '1.5rem', borderColor: 'var(--cyan)' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '0.12em',
            color: 'var(--cyan)', marginBottom: '1.25rem',
          }}>
            REGISTRAR NUEVO SENSOR ESP32 / NodeMCU
          </h3>
          <form onSubmit={handleAdicionar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="field-label"><Tag size={10} style={{ display: 'inline', marginRight: 4 }} /> Nombre del Sensor</label>
                <input className="input-field" type="text" placeholder="Ej: Panel_Solar_Norte"
                  value={form.sensorName}
                  onChange={e => setForm(p => ({ ...p, sensorName: e.target.value }))}
                  required maxLength={100} />
              </div>
              <div>
                <label className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><Key size={10} style={{ display: 'inline', marginRight: 4 }} /> Token del Sensor</span>
                  <button type="button" onClick={() => setForm(p => ({ ...p, sensorToken: generarToken() }))}
                    style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer',
                             display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem' }}>
                    <RefreshCw size={10} /> Generar
                  </button>
                </label>
                <input className="input-field" type="text" placeholder="token_unico_sensor"
                  value={form.sensorToken}
                  onChange={e => setForm(p => ({ ...p, sensorToken: e.target.value }))}
                  required maxLength={64} style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="field-label"><FileText size={10} style={{ display: 'inline', marginRight: 4 }} /> Descripción (opcional)</label>
              <input className="input-field" type="text" placeholder="Descripción o ubicación del sensor"
                value={form.descripcion}
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                maxLength={255} />
            </div>

            <div style={{
              background: 'rgba(0,212,255,0.04)', border: '1px solid var(--cyan-border)',
              borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
              fontSize: '0.78rem', color: 'var(--text-secondary)',
            }}>
              <strong style={{ color: 'var(--cyan)', fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                CONFIGURACIÓN EN EL FIRMWARE ESP
              </strong>
              <p style={{ marginTop: '0.4rem' }}>
                Usa el token generado en el campo <code style={{ color: 'var(--cyan)' }}>DEFAULT_SENSOR_TOKEN</code> del sketch Arduino,
                y apunta <code style={{ color: 'var(--cyan)' }}>DEFAULT_SERVER_URL</code> a{' '}
                <code style={{ color: 'var(--amber)' }}>http://[IP_SERVIDOR]:8080/mediciones/ingresar</code>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>CANCELAR</button>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Plus size={13} />}
                {guardando ? 'GUARDANDO...' : 'REGISTRAR SENSOR'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : sensores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Cpu size={48} color="var(--cyan-border)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            NO HAY SENSORES REGISTRADOS
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--cyan-border)' }}>
                {['ID', 'Nombre', 'Token', 'Descripción', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    padding: '0.85rem 1rem', textAlign: 'left',
                    fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em',
                    color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensores.map((s, i) => (
                <tr key={s.idsensor} style={{
                  borderBottom: '1px solid rgba(0,212,255,0.06)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(0,212,255,0.015)',
                }}>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>#{s.idsensor}</td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{s.sensorName}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <code style={{
                      fontSize: '0.72rem', color: 'var(--cyan)', background: 'var(--cyan-glow)',
                      padding: '0.2rem 0.5rem', borderRadius: '4px',
                    }}>
                      {s.sensorToken?.length > 20 ? s.sensorToken.slice(0, 20) + '…' : s.sensorToken}
                    </code>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s.descripcion || '—'}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge ${s.activo ? 'badge-green' : 'badge-red'}`}>{s.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {s.fechaCreacion ? new Date(s.fechaCreacion).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.62rem' }}
                      onClick={() => handleEliminar(s.idsensor, s.sensorName)}>
                      <Trash2 size={12} /> ELIMINAR
                    </button>
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