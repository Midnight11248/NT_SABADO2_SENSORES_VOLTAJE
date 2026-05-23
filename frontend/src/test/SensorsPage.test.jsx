import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import SensoresPage from '../pages/SensorsPage'

// Mock de la API
vi.mock('../services/api', () => ({
  sensoresApi: {
    getTodos:       vi.fn(),
    getMisSensores: vi.fn(),
    adicionar:      vi.fn(),
    eliminar:       vi.fn(),
  }
}))

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

import { sensoresApi } from '../services/api'

const renderSensores = (rol = 'SUPER_ADMIN') => {
  localStorage.setItem('sv_user', JSON.stringify({
    idusuario: 1, username: 'admin', rol
  }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <SensoresPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('SensoresPage', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Título y estructura ────────────────────────────────────
  test('muestra el título MIS SENSORES', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderSensores()
    expect(screen.getByText('MIS SENSORES')).toBeInTheDocument()
  })

  test('muestra el botón NUEVO SENSOR', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderSensores()
    expect(screen.getByText('NUEVO SENSOR')).toBeInTheDocument()
  })

  // ── Sin sensores ───────────────────────────────────────────
  test('muestra mensaje cuando no hay sensores', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderSensores()

    await waitFor(() => {
      expect(screen.getByText('NO HAY SENSORES REGISTRADOS')).toBeInTheDocument()
    })
  })

  // ── Formulario ─────────────────────────────────────────────
  test('muestra el formulario al hacer clic en NUEVO SENSOR', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderSensores()

    await waitFor(() => {
      fireEvent.click(screen.getByText('NUEVO SENSOR'))
    })

    expect(screen.getByText('REGISTRAR NUEVO SENSOR ESP32 / NodeMCU')).toBeInTheDocument()
  })

  test('oculta el formulario al hacer clic en CANCELAR', async () => {
  sensoresApi.getTodos.mockResolvedValue({ data: [] })
  renderSensores()

  await waitFor(() => {
    fireEvent.click(screen.getByText('NUEVO SENSOR'))
  })

  // Hay dos botones CANCELAR — el del toggle y el del formulario
  // Usamos el btn-ghost que es el del formulario
  const botonesCancelar = screen.getAllByText('CANCELAR')
  fireEvent.click(botonesCancelar[1]) // El segundo es el del formulario

  expect(screen.queryByText('REGISTRAR NUEVO SENSOR ESP32 / NodeMCU')).not.toBeInTheDocument()
})

  test('el botón Generar crea un token automáticamente', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderSensores()

    await waitFor(() => {
      fireEvent.click(screen.getByText('NUEVO SENSOR'))
    })

    const inputToken = screen.getByPlaceholderText('token_unico_sensor')
    expect(inputToken.value).toBe('')

    fireEvent.click(screen.getByText('Generar'))
    expect(inputToken.value).not.toBe('')
    expect(inputToken.value.length).toBeGreaterThan(10)
  })

  // ── Con sensores ───────────────────────────────────────────
  test('muestra la lista de sensores en la tabla', async () => {
    sensoresApi.getTodos.mockResolvedValue({
      data: [
        { idsensor: 1, sensorName: 'Panel_Solar_Norte', sensorToken: 'tok-001', activo: true, descripcion: 'Norte', fechaCreacion: '2026-05-01' },
        { idsensor: 2, sensorName: 'Bateria_01',        sensorToken: 'tok-002', activo: true, descripcion: 'Batería', fechaCreacion: '2026-05-01' },
      ]
    })
    renderSensores()

    await waitFor(() => {
      expect(screen.getByText('Panel_Solar_Norte')).toBeInTheDocument()
      expect(screen.getByText('Bateria_01')).toBeInTheDocument()
    })
  })

  test('muestra el badge ACTIVO para sensores activos', async () => {
    sensoresApi.getTodos.mockResolvedValue({
      data: [{ idsensor: 1, sensorName: 'Sensor_Test', sensorToken: 'tok-001', activo: true, fechaCreacion: '2026-05-01' }]
    })
    renderSensores()

    await waitFor(() => {
      expect(screen.getByText('ACTIVO')).toBeInTheDocument()
    })
  })

  // ── Contador ───────────────────────────────────────────────
  test('muestra el contador correcto de sensores', async () => {
    sensoresApi.getTodos.mockResolvedValue({
      data: [
        { idsensor: 1, sensorName: 'Sensor_1', sensorToken: 'tok-1', activo: true, fechaCreacion: '2026-05-01' },
        { idsensor: 2, sensorName: 'Sensor_2', sensorToken: 'tok-2', activo: true, fechaCreacion: '2026-05-01' },
        { idsensor: 3, sensorName: 'Sensor_3', sensorToken: 'tok-3', activo: true, fechaCreacion: '2026-05-01' },
      ]
    })
    renderSensores()

    await waitFor(() => {
      expect(screen.getByText('3 sensores registrados')).toBeInTheDocument()
    })
  })

})
