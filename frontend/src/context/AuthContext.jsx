import React, { createContext, useContext, useState, useCallback } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const api = axios.create({ baseURL: '' })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sv_user')) }
    catch { return null }
  })

  const login = useCallback(async (username, password) => {
    const res  = await api.get(`/usuarios/username/${username}`)
    const data = res.data

    if (!data) throw new Error('Usuario no encontrado')
    if (data.password !== password) throw new Error('Contraseña incorrecta')
    if (data.activo === false) throw new Error('Usuario inactivo')

    const userData = {
      idusuario: data.idusuario,
      username:  data.username,
      email:     data.email,
      rol:       data.mRol?.nombre || 'READ_ONLY',
    }

    localStorage.setItem('sv_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/usuarios', {
      username,
      email,
      password,
      mRol: { idrol: 3 }
    })
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sv_user')
    setUser(null)
  }, [])

  const isSuperAdmin = user?.rol === 'SUPER_ADMIN'
  const isAdmin      = user?.rol === 'ADMIN' || isSuperAdmin

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isSuperAdmin, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)