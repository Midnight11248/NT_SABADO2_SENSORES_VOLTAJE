import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import DashboardPage from '../pages/DashboardPage'

// Mock de la API
vi.mock('../services/api', () => ({
  sensoresApi: {
    getTodos:         vi.fn(),
    getMisSensores:   vi.fn(),
  },
  medicionesApi: {
    ultimas: vi.fn(),
  }
}))

// Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
  toast:   { error: vi.fn() }
}))

import { sensoresApi } from '../services/api'

const renderDashboard = (userOverride = {}) => {
  const userData = {
    idusuario: 1,
    username:  'admin',
    rol:       'SUPER_ADMIN',
    ...userOverride
  }
  localStorage.setItem('sv_user', JSON.stringify(userData))

  return render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('DashboardPage', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Título y estructura ────────────────────────────────────
  test('muestra el título DASHBOARD', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderDashboard()
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument()
  })

  test('muestra el spinner mientras carga', () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderDashboard()
    expect(document.querySelector('.spinner')).toBeInTheDocument()
  })

  // ── Sin sensores ───────────────────────────────────────────
  test('muestra mensaje cuando no hay sensores registrados', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('NO HAY SENSORES REGISTRADOS')).toBeInTheDocument()
    })
  })

  // ── Con sensores ───────────────────────────────────────────
  test('muestra las tarjetas de sensores cuando hay datos', async () => {
    const sensoresMock = [
      { idsensor: 1, sensorName: 'Panel_Solar_Norte', sensorToken: 'tok-001', activo: true },
      { idsensor: 2, sensorName: 'Temperatura_ESP32', sensorToken: 'tok-002', activo: true },
    ]
    sensoresApi.getTodos.mockResolvedValue({ data: sensoresMock })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Panel_Solar_Norte')).toBeInTheDocument()
      expect(screen.getByText('Temperatura_ESP32')).toBeInTheDocument()
    })
  })

  // ── Detección de unidades ──────────────────────────────────
  test('detecta la unidad °C para sensores de temperatura', async () => {
    sensoresApi.getTodos.mockResolvedValue({
      data: [{ idsensor: 1, sensorName: 'Temperatura_ESP32', sensorToken: 'tok-temp', activo: true }]
    })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('TEMPERATURA')).toBeInTheDocument()
    })
  })

  test('detecta la unidad % para sensores de humedad', async () => {
    sensoresApi.getTodos.mockResolvedValue({
      data: [{ idsensor: 2, sensorName: 'Humedad_ESP32', sensorToken: 'tok-hum', activo: true }]
    })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('HUMEDAD')).toBeInTheDocument()
    })
  })

  test('usa unidad V por defecto para sensores sin palabra clave', async () => {
    sensoresApi.getTodos.mockResolvedValue({
      data: [{ idsensor: 3, sensorName: 'Sensor_Generico', sensorToken: 'tok-gen', activo: true }]
    })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('VOLTAJE')).toBeInTheDocument()
    })
  })

  // ── Texto informativo ──────────────────────────────────────
  test('muestra el texto de actualización con el intervalo configurado', async () => {
    sensoresApi.getTodos.mockResolvedValue({ data: [] })
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Monitoreo en tiempo real/)).toBeInTheDocument()
    })
  })

  // ── Usuario READ_ONLY llama getMisSensores ─────────────────
  test('usuario READ_ONLY carga solo sus sensores', async () => {
    sensoresApi.getMisSensores.mockResolvedValue({ data: [] })

    renderDashboard({ rol: 'READ_ONLY', idusuario: 5 })

    await waitFor(() => {
      expect(sensoresApi.getMisSensores).toHaveBeenCalledWith(5)
    })
  })

})
