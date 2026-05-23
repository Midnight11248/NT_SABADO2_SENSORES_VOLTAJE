import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import AdminPage from '../pages/AdminPage'

// Mock de la API
vi.mock('../services/api', () => ({
  adminApi: {
    getUsuarios: vi.fn(),
    getRoles:    vi.fn(),
    cambiarRol:  vi.fn(),
    desactivar:  vi.fn(),
  }
}))

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}))

import { adminApi } from '../services/api'

const rolesMock = [
  { idrol: 1, nombre: 'SUPER_ADMIN' },
  { idrol: 2, nombre: 'ADMIN' },
  { idrol: 3, nombre: 'READ_ONLY' },
]

const usuariosMock = [
  { idusuario: 1, username: 'admin',    email: 'admin@sv.com',    activo: true,  mRol: { idrol: 1, nombre: 'SUPER_ADMIN' }, fechaRegistro: '2026-05-01' },
  { idusuario: 2, username: 'operador', email: 'op@sv.com',       activo: true,  mRol: { idrol: 2, nombre: 'ADMIN' },       fechaRegistro: '2026-05-02' },
  { idusuario: 3, username: 'visor',    email: 'visor@sv.com',    activo: false, mRol: { idrol: 3, nombre: 'READ_ONLY' },   fechaRegistro: '2026-05-03' },
]

const renderAdmin = () => {
  localStorage.setItem('sv_user', JSON.stringify({
    idusuario: 1, username: 'admin', rol: 'SUPER_ADMIN'
  }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('AdminPage', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    adminApi.getUsuarios.mockResolvedValue({ data: usuariosMock })
    adminApi.getRoles.mockResolvedValue({ data: rolesMock })
  })

  // ── Título y estructura ────────────────────────────────────
  test('muestra el título ADMINISTRACIÓN', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('ADMINISTRACIÓN')).toBeInTheDocument()
    })
  })

  test('muestra el subtítulo con restricción de rol', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText(/solo SUPER_ADMIN/)).toBeInTheDocument()
    })
  })

  // ── Stats ──────────────────────────────────────────────────
  test('muestra el total de usuarios', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('TOTAL')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  test('muestra el contador de usuarios activos', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('ACTIVOS')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  test('muestra el contador de usuarios inactivos', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('INACTIVOS')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  // ── Tabla de usuarios ──────────────────────────────────────
  test('muestra los usernames en la tabla', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument()
      expect(screen.getByText('operador')).toBeInTheDocument()
      expect(screen.getByText('visor')).toBeInTheDocument()
    })
  })

  test('muestra los emails en la tabla', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('admin@sv.com')).toBeInTheDocument()
    })
  })

  test('muestra badge ACTIVO para usuarios activos', async () => {
    renderAdmin()
    await waitFor(() => {
      const badges = screen.getAllByText('ACTIVO')
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  test('muestra badge INACTIVO para usuarios inactivos', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('INACTIVO')).toBeInTheDocument()
    })
  })

  // ── Cabeceras de la tabla ──────────────────────────────────
  test('muestra todas las cabeceras de la tabla', async () => {
    renderAdmin()
    await waitFor(() => {
      expect(screen.getByText('Usuario')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Rol')).toBeInTheDocument()
      expect(screen.getByText('Estado')).toBeInTheDocument()
    })
  })

  // ── Botón eliminar ─────────────────────────────────────────
  test('muestra botón ELIMINAR solo para usuarios activos', async () => {
    renderAdmin()
    await waitFor(() => {
      const botones = screen.getAllByText('ELIMINAR')
      // Solo admin y operador son activos — visor no debe tener botón
      expect(botones.length).toBe(2)
    })
  })

  // ── Spinner de carga ───────────────────────────────────────
  test('muestra spinner mientras carga los datos', () => {
    adminApi.getUsuarios.mockReturnValue(new Promise(() => {}))
    adminApi.getRoles.mockReturnValue(new Promise(() => {}))
    renderAdmin()
    expect(document.querySelector('.spinner')).toBeInTheDocument()
  })

})
