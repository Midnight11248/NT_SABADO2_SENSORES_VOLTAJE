import axios from 'axios'

const api = axios.create({ baseURL: '' })

// ── Auth — login y registro usando /usuarios directamente
export const authApi = {
  login:    datos => api.get(`/usuarios/username/${datos.username}`),
  register: datos => api.post('/usuarios', {
    username: datos.username,
    email:    datos.email,
    password: datos.password,
    mRol: { idrol: 3 }
  }),
}

// ── Sensores (/sensores)
export const sensoresApi = {
  getMisSensores: (idusuario) => api.get(`/sensores/usuario/${idusuario}`),
  getTodos:       ()          => api.get('/sensores'),
  getById:        id          => api.get(`/sensores/${id}`),
  adicionar:      datos       => api.post('/sensores', datos),
  modificar:      (id, d)     => api.put(`/sensores/${id}`, d),
  eliminar:       id          => api.delete(`/sensores/${id}`),
}

// ── Mediciones (/mediciones)
export const medicionesApi = {
  ultimas:      idsensor          => api.get(`/mediciones/ultimas/${idsensor}`),
  historico:    (id, inicio, fin) => api.get(`/mediciones/historico/${id}`, { params: { inicio, fin } }),
  estadisticas: idsensor          => api.get(`/mediciones/estadisticas/${idsensor}`),
  eliminar:     idmedicion        => api.delete(`/mediciones/${idmedicion}`),
}

// ── Admin — ahora usa /usuarios y /roles (sin /admin)
export const adminApi = {
  getUsuarios:  ()          => api.get('/usuarios'),
  getUsuario:   id          => api.get(`/usuarios/${id}`),
  cambiarRol:   (id, idrol) => api.put(`/usuarios/${id}/rol/${idrol}`),
  desactivar:   id          => api.delete(`/usuarios/${id}`),
  getRoles:     ()          => api.get('/roles'),
  adicionarRol: datos       => api.post('/roles', datos),
}

export default api