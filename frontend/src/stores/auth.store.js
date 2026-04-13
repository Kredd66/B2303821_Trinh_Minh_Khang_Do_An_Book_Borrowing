import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/authApi'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin  = computed(() => user.value?.role === 'admin')
  const isReader = computed(() => user.value?.role === 'reader')

  const setAuth = (data) => {
    token.value = data.token
    user.value  = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  const logout = () => {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const register = async (formData) => {
    const res = await authApi.register(formData)
    setAuth(res.data.data)
    return res.data
  }

  const login = async (formData) => {
    const res = await authApi.login(formData)
    setAuth(res.data.data)
    return res.data
  }

  return { token, user, isAuthenticated, isAdmin, isReader, login, register, logout }
})