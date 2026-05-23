import { renderHook, act } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'
import axios from 'axios'

// Mock de axios
vi.mock('axios', () => ({
  default: {
    create: () => ({
      get:  vi.fn(),
      post: vi.fn(),
    })
  }
}))

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  // ── Estado inicial ─────────────────────────────────────────
  test('inicia sin usuario si localStorage está vacío', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
  })

  test('recupera el usuario guardado en localStorage al iniciar', () => {
    const userData = { idusuario: 1, username: 'admin', rol: 'SUPER_ADMIN' }
    localStorage.setItem('sv_user', JSON.stringify(userData))

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user?.username).toBe('admin')
  })

  // ── Roles ──────────────────────────────────────────────────
  test('isSuperAdmin es true cuando el rol es SUPER_ADMIN', () => {
    localStorage.setItem('sv_user', JSON.stringify({ rol: 'SUPER_ADMIN' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isSuperAdmin).toBe(true)
  })

  test('isAdmin es true cuando el rol es ADMIN', () => {
    localStorage.setItem('sv_user', JSON.stringify({ rol: 'ADMIN' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAdmin).toBe(true)
  })

  test('isAdmin es true cuando el rol es SUPER_ADMIN', () => {
    localStorage.setItem('sv_user', JSON.stringify({ rol: 'SUPER_ADMIN' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isAdmin).toBe(true)
  })

  test('isSuperAdmin es false cuando el rol es READ_ONLY', () => {
    localStorage.setItem('sv_user', JSON.stringify({ rol: 'READ_ONLY' }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.isSuperAdmin).toBe(false)
  })

  // ── Logout ─────────────────────────────────────────────────
  test('logout limpia el usuario del estado y del localStorage', () => {
    localStorage.setItem('sv_user', JSON.stringify({ username: 'admin', rol: 'SUPER_ADMIN' }))
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => { result.current.logout() })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('sv_user')).toBeNull()
  })

})
