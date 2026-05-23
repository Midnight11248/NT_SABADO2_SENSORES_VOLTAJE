import React, { useState, useEffect } from 'react'
import { sensoresApi, medicionesApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts'
import { format, subHours } from 'date-fns'
import { History, Download, Search, TrendingUp, TrendingDown, Minus, BarChart2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Rangos rapidos ────────────────────────────────────────────
const RANGOS = [
  { label: '1h',  horas: 1   },
  { label: '6h',  horas: 6   },
  { label: '12h', horas: 12  },
  { label: '24h', horas: 24  },
  { label: '3d',  horas: 72  },
  { label: '7d',  horas: 168 },
]

// ── Deteccion de unidad por nombre del sensor ─────────────────
function getUnidad(sensor) {
  if (!sensor) return { unidad: 'V', label: 'Voltaje' }
  const clave = ((sensor.sensorName || '') + ' ' + (sensor.sensorToken || '')).toLowerCase()

  if (clave.includes('temp'))      return { unidad: '°C',  label: 'Temperatura' }
  if (clave.includes('hum'))       return { unidad: '%',   label: 'Humedad'     }
  if (clave.includes('presion'))   return { unidad: 'hPa', label: 'Presion'     }
  if (clave.includes('co2'))       return { unidad: 'ppm', label: 'CO₂'        }
  if (clave.includes('luz'))       return { unidad: 'lux', label: 'Luminosidad' }
  if (clave.includes('corriente')) return { unidad: 'A',   label: 'Corriente'   }
  return { unidad: 'V', label: 'Voltaje' }
}

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

function toBackendDate(datetimeStr) {
  return datetimeStr.split('T')[0]
}

function exportarCSV(datos, nombreSensor) {
  const header = 'idmedicion,valor,fecha,sensor\n'
  const rows   = datos.map(m => `${m.idmedicion},${m.valor},"${m.fecha}","${nombreSensor}"`).join('\n')
  const blob   = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${nombreSensor}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function StatBox({ label, value, unit, icon: Icon, color = 'var(--cyan)' }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 130, textAlign: 'center', padding: '1rem' }}>
      <div style={{ color, marginBottom: '0.35rem' }}><Icon size={17} /></div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color,
                    textShadow: `0 0 10px ${color}55` }}>
        {value !== null ? `${value}${unit}` : '—'}
      </div>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
        {label}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { user, isAdmin } = useAuth()
  const ahora  = new Date()
  const hace1h = subHours(ahora, 1)

  const [sensores,    setSensores]    = useState([])
  const [idsensor,    setIdsensor]    = useState('')
  const [inicio,      setInicio]      = useState(toDatetimeLocal(hace1h))
  const [fin,         setFin]         = useState(toDatetimeLocal(ahora))
  const [rangoActivo, setRangoActivo] = useState('1h')
  const [datos,       setDatos]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [buscado,     setBuscado]     = useState(false)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = isAdmin
          ? await sensoresApi.getTodos()
          : await sensoresApi.getMisSensores(user?.idusuario)
        setSensores(res.data)
        if (res.data.length > 0) setIdsensor(String(res.data[0].idsensor))
      } catch {
        toast.error('Error al cargar sensores.')
      }
    }
    cargar()
  }, [isAdmin])

  const aplicarRango = (horas, label) => {
    const ahora = new Date()
    setInicio(toDatetimeLocal(subHours(ahora, horas)))
    setFin(toDatetimeLocal(ahora))
    setRangoActivo(label)
  }

  const handleBuscar = async e => {
    e?.preventDefault()
    if (!idsensor) { toast.error('Selecciona un sensor'); return }
    setLoading(true)
    setBuscado(true)
    try {
      const res = await medicionesApi.historico(idsensor, toBackendDate(inicio), toBackendDate(fin))
      const inicioDate = new Date(inicio)
      const finDate    = new Date(fin)

      const chartData = res.data
        .filter(m => {
          const f = new Date(m.fecha)
          return f >= inicioDate && f <= finDate
        })
        .map(m => ({
          idmedicion: m.idmedicion,
          valor:      parseFloat(parseFloat(m.voltaje).toFixed(2)),
          fecha:      m.fecha,
          label:      format(new Date(m.fecha), 'dd/MM HH:mm'),
        }))

      setDatos(chartData)
      if (chartData.length === 0)
        toast('Sin datos en el rango seleccionado.', { icon: '📭' })
      else
        toast.success(`${chartData.length} registros encontrados`)
    } catch {
      toast.error('Error al consultar historico.')
      setDatos([])
    } finally { setLoading(false) }
  }

  const sensorSel       = sensores.find(s => String(s.idsensor) === idsensor)
  const { unidad, label } = getUnidad(sensorSel)
  const valores  = datos.map(d => d.valor)
  const minV     = valores.length ? Math.min(...valores).toFixed(2) : null
  const maxV     = valores.length ? Math.max(...valores).toFixed(2) : null
  const avgV     = valores.length ? (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2) : null

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900,
          letterSpacing: '0.1em', color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '0.7rem',
        }}>
          <History size={21} color="var(--cyan)" /> HISTÓRICO DE MEDICIONES
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.2rem' }}>
          Consulta por rango de horas o fechas exactas con hora
        </p>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        {/* Rangos rapidos */}
        <div style={{ marginBottom: '1rem' }}>
          <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Clock size={11} /> Rango rápido
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {RANGOS.map(r => (
              <button key={r.label} type="button"
                onClick={() => aplicarRango(r.horas, r.label)}
                className={rangoActivo === r.label ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.72rem', minWidth: 48 }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleBuscar}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="field-label">Sensor</label>
              <select className="input-field" value={idsensor}
                onChange={e => setIdsensor(e.target.value)} required>
                <option value="">— Selecciona un sensor —</option>
                {sensores.map(s => (
                  <option key={s.idsensor} value={s.idsensor}>{s.sensorName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Inicio</label>
              <input className="input-field" type="datetime-local" value={inicio}
                onChange={e => { setInicio(e.target.value); setRangoActivo(null) }} required />
            </div>
            <div>
              <label className="field-label">Fin</label>
              <input className="input-field" type="datetime-local" value={fin}
                onChange={e => { setFin(e.target.value); setRangoActivo(null) }} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                : <Search size={13} />}
              {loading ? 'BUSCANDO…' : 'BUSCAR'}
            </button>
          </div>

          {/* Resumen rango */}
          <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <Clock size={10} style={{ display: 'inline', marginRight: 4 }} />
            Rango: <span style={{ color: 'var(--cyan)' }}>{format(new Date(inicio), 'dd/MM/yyyy HH:mm')}</span>
            {' → '}
            <span style={{ color: 'var(--cyan)' }}>{format(new Date(fin), 'dd/MM/yyyy HH:mm')}</span>
            {sensorSel && (
              <span style={{ marginLeft: '0.75rem', color: 'var(--amber)' }}>
                · Unidad: <strong>{unidad}</strong> ({label})
              </span>
            )}
          </div>
        </form>
      </div>

      {buscado && !loading && (
        <>
          {datos.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <StatBox label={`MÍN (${unidad})`}  value={minV} unit={` ${unidad}`} icon={TrendingDown} color="var(--cyan)"     />
              <StatBox label={`MÁX (${unidad})`}  value={maxV} unit={` ${unidad}`} icon={TrendingUp}   color="var(--amber)"    />
              <StatBox label={`PROM (${unidad})`} value={avgV} unit={` ${unidad}`} icon={Minus}        color="var(--green-ok)" />
              <div className="card" style={{ flex: 1, minWidth: 130, textAlign: 'center', padding: '1rem' }}>
                <BarChart2 size={17} color="var(--text-muted)" style={{ margin: '0 auto 0.35rem', display: 'block' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {datos.length.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: '0.2rem' }}>
                  REGISTROS
                </div>
              </div>
            </div>
          )}

          {datos.length > 1 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                  {label.toUpperCase()} — {sensorSel?.sensorName}
                </span>
                <button className="btn btn-ghost" style={{ fontSize: '0.62rem', padding: '0.4rem 0.85rem' }}
                  onClick={() => exportarCSV(datos, sensorSel?.sensorName || 'sensor')}>
                  <Download size={12} /> EXPORTAR CSV
                </button>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datos} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.floor(datos.length / 10)} />
                    <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']}
                      tickFormatter={v => `${v}${unidad}`} />
                    <Tooltip
                      formatter={v => [`${v} ${unidad}`, label]}
                      labelFormatter={l => `Hora: ${l}`}
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--cyan-border)', borderRadius: 8 }}
                      labelStyle={{ color: 'var(--text-secondary)', fontSize: 10 }}
                      itemStyle={{ color: 'var(--cyan)' }}
                    />
                    {avgV && (
                      <ReferenceLine y={parseFloat(avgV)} stroke="var(--amber)" strokeDasharray="4 4"
                        label={{ value: 'Prom', fill: 'var(--amber)', fontSize: 10 }} />
                    )}
                    <Line type="monotone" dataKey="valor" stroke="var(--cyan)"
                      strokeWidth={2} dot={datos.length < 80} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {datos.length > 0 ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1rem 1.25rem', borderBottom: '1px solid var(--cyan-border)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                  TABLA — {datos.length} registros
                </span>
                <button className="btn btn-primary" style={{ fontSize: '0.62rem', padding: '0.42rem 0.85rem' }}
                  onClick={() => exportarCSV(datos, sensorSel?.sensorName || 'sensor')}>
                  <Download size={12} /> CSV
                </button>
              </div>
              <div style={{ maxHeight: 380, overflow: 'auto' }}>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{label} ({unidad})</th>
                      <th>Fecha / Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map(row => (
                      <tr key={row.idmedicion}>
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{row.idmedicion}</td>
                        <td style={{ fontFamily: 'var(--font-display)', color: 'var(--cyan)', fontSize: '0.88rem' }}>
                          {row.valor.toFixed(2)} {unidad}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                          {format(new Date(row.fecha), 'dd/MM/yyyy HH:mm:ss')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
                SIN REGISTROS EN EL RANGO SELECCIONADO
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}