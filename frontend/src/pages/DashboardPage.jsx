import React, { useState, useEffect, useCallback } from 'react';
import { sensoresApi, medicionesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, ChevronLeft, ChevronRight, Wifi, WifiOff, Zap, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// ================================================================
// CONFIGURACION
// ================================================================
const POLL_INTERVAL       = 5000; // ms entre actualizaciones
const SENSORES_POR_PAGINA = 6;
const TIMEOUT_OFFLINE_MIN = 6;     // minutos sin datos -> OFFLINE

// ================================================================
// DETECCION DE UNIDAD POR NOMBRE DEL SENSOR
// Agrega aqui mas palabras clave segun tus sensores
// ================================================================
function getUnidad(sensor) {
  const nombre = (sensor.sensorName || '').toLowerCase()
  const token  = (sensor.sensorToken || '').toLowerCase()
  const clave  = nombre + ' ' + token

  if (clave.includes('temp'))     return { unidad: '°C',  label: 'Temperatura'    }
  if (clave.includes('hum'))      return { unidad: '%',   label: 'Humedad'        }
  if (clave.includes('presion'))  return { unidad: 'hPa', label: 'Presion'        }
  if (clave.includes('co2'))      return { unidad: 'ppm', label: 'CO₂'           }
  if (clave.includes('luz'))      return { unidad: 'lux', label: 'Luminosidad'    }
  if (clave.includes('corriente'))return { unidad: 'A',   label: 'Corriente'      }
  if (clave.includes('panel'))    return { unidad: 'V',   label: 'Voltaje'        }
  if (clave.includes('bateria'))  return { unidad: 'V',   label: 'Voltaje'        }
  if (clave.includes('volt'))     return { unidad: 'V',   label: 'Voltaje'        }
  return { unidad: 'V', label: 'Voltaje' }  // default
}

// ================================================================
// DETECCION OFFLINE
// ================================================================
function estaOnline(fechaUltima) {
  if (!fechaUltima) return false
  const diffMin = (new Date() - new Date(fechaUltima)) / 1000 / 60
  return diffMin < TIMEOUT_OFFLINE_MIN
}

// ================================================================
// TARJETA DE SENSOR
// ================================================================
function TarjetaSensor({ sensor }) {
  const [datos,       setDatos]       = useState([])
  const [online,      setOnline]      = useState(false)
  const [fechaUltima, setFechaUltima] = useState(null)
  const [estado,      setEstado]      = useState('SIN DATOS')

  const { unidad, label } = getUnidad(sensor)

  const cargarDatos = useCallback(async () => {
    try {
      const res    = await medicionesApi.ultimas(sensor.idsensor)
      const medics = res.data

      if (medics.length === 0) {
        setDatos([])
        setOnline(false)
        setEstado('SIN DATOS')
        setFechaUltima(null)
        return
      }

      const ultimaFecha = medics[0].fecha
      setFechaUltima(ultimaFecha)
      const isOnline = estaOnline(ultimaFecha)
      setOnline(isOnline)
      setEstado(isOnline ? 'ONLINE' : 'OFFLINE')

      const puntos = medics
        .slice(0, 30)
        .reverse()
        .map(m => ({
          t:      format(new Date(m.fecha), 'HH:mm:ss'),
          valor:  parseFloat(parseFloat(m.voltaje).toFixed(2)),
        }))
      setDatos(puntos)
    } catch {
      setOnline(false)
      setEstado('ERROR')
    }
  }, [sensor.idsensor])

  useEffect(() => {
    cargarDatos()
    const id = setInterval(cargarDatos, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [cargarDatos])

  const ultimoValor = datos[datos.length - 1]?.valor

  const colorEstado = {
    ONLINE:     'var(--green-ok)',
    OFFLINE:    'var(--red-alert)',
    'SIN DATOS':'var(--text-muted)',
    ERROR:      'var(--red-alert)',
  }[estado] || 'var(--text-muted)'

  const colorValor = estado === 'OFFLINE' ? 'var(--red-alert)' : 'var(--cyan)'

  return (
    <div className="card fade-up" style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      borderColor: estado === 'OFFLINE' ? 'var(--red-alert)' : undefined,
      opacity:     estado === 'OFFLINE' ? 0.75 : 1,
      transition:  'all 0.3s',
    }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            {label.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {sensor.sensorName}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {estado === 'ONLINE'
            ? <Wifi    size={14} color="var(--green-ok)"   />
            : <WifiOff size={14} color={colorEstado} />}
          <span className={`badge ${estado === 'ONLINE' ? 'badge-green' : estado === 'OFFLINE' ? 'badge-red' : ''}`}
            style={!['ONLINE','OFFLINE'].includes(estado) ? {
              color: 'var(--text-muted)', border: '1px solid var(--cyan-border)', fontSize: '0.58rem'
            } : {}}>
            {estado}
          </span>
        </div>
      </div>

      {/* Valor principal con unidad correcta */}
      {ultimoValor !== undefined && (
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900,
          color: colorValor,
          textShadow: `0 0 16px ${colorValor}66`,
          letterSpacing: '0.05em', lineHeight: 1,
        }}>
          {ultimoValor.toFixed(2)}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>
            {unidad}
          </span>
        </div>
      )}

      {/* Ultima actualizacion */}
      {fechaUltima && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem',
                      fontSize: '0.68rem', color: estado === 'OFFLINE' ? 'var(--red-alert)' : 'var(--text-muted)' }}>
          <Clock size={11} />
          {estado === 'OFFLINE' ? 'Ultimo dato ' : 'Actualizado '}
          {formatDistanceToNow(new Date(fechaUltima), { addSuffix: true, locale: es })}
          {estado === 'OFFLINE' && (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>
              — SIN SEÑAL
            </span>
          )}
        </div>
      )}

      {/* Grafica */}
      <div style={{ height: '120px' }}>
        {datos.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={datos} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${sensor.idsensor}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={colorValor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colorValor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9 }} domain={['auto', 'auto']}
                tickFormatter={v => `${v}${unidad}`} />
              <Tooltip
                formatter={v => [`${v} ${unidad}`, label]}
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--cyan-border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-secondary)', fontSize: 10 }}
                itemStyle={{ color: colorValor }}
              />
              <Area type="monotone" dataKey="valor" stroke={colorValor}
                strokeWidth={2} fill={`url(#grad-${sensor.idsensor})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {estado === 'SIN DATOS' ? 'Esperando datos del ESP...' : 'Sin datos recientes'}
            </span>
          </div>
        )}
      </div>

      {/* Token */}
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        TOKEN: {sensor.sensorToken}
      </div>
    </div>
  )
}

// ================================================================
// PAGINA PRINCIPAL DASHBOARD
// ================================================================
export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [sensores, setSensores] = useState([])
  const [pagina,   setPagina]   = useState(0)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = isAdmin
          ? await sensoresApi.getTodos()
          : await sensoresApi.getMisSensores(user?.idusuario)
        setSensores(res.data)
      } catch {
        toast.error('Error al cargar sensores. Verifica que el backend este activo.')
      } finally { setLoading(false) }
    }
    cargar()
  }, [isAdmin])

  const totalPaginas = Math.ceil(sensores.length / SENSORES_POR_PAGINA)
  const paginados    = sensores.slice(pagina * SENSORES_POR_PAGINA, (pagina + 1) * SENSORES_POR_PAGINA)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 900,
            letterSpacing: '0.1em', color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <Activity size={22} color="var(--cyan)" /> DASHBOARD
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
            Monitoreo en tiempo real · actualización cada {POLL_INTERVAL / 1000}s · offline si sin datos &gt; {TIMEOUT_OFFLINE_MIN} min
          </p>
        </div>
        {totalPaginas > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              PÁGINA {pagina + 1} / {totalPaginas}
            </span>
            <button className="btn btn-ghost" style={{ padding: '0.45rem' }}
              onClick={() => setPagina(p => Math.max(0, p - 1))} disabled={pagina === 0}>
              <ChevronLeft size={15} />
            </button>
            <button className="btn btn-ghost" style={{ padding: '0.45rem' }}
              onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))} disabled={pagina === totalPaginas - 1}>
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : sensores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Zap size={48} color="var(--cyan-border)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            NO HAY SENSORES REGISTRADOS
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {paginados.map(sensor => (
            <TarjetaSensor key={sensor.idsensor} sensor={sensor} />
          ))}
        </div>
      )}
    </div>
  )
}