import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/LoginPage'

describe('LoginPage', () => {

  test('muestra el título SENSORESVOLT', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('SENSORESVOLT')).toBeInTheDocument()
  })

  test('muestra el campo de usuario', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText('nombre_usuario')).toBeInTheDocument()
  })

  test('muestra el botón de iniciar sesión', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )
    expect(screen.getByText('INICIAR SESIÓN')).toBeInTheDocument()
  })

})  