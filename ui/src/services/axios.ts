import axios, { AxiosRequestConfig } from 'axios'
import store from '../store'

// Create a axios instance using the base url from the .env file
const instance = axios.create({
  baseURL: window.location.origin + import.meta.env.VITE_API_PREFIX,
})

// Auto add bearer token to all requests (use a interceptor in order to handle token refresh)
instance.interceptors.request.use((config: AxiosRequestConfig) => {
  if (!config.headers) config.headers = {}
  config.headers['Authorization'] = 'Bearer ' + store.authUser.token.token
  return config
})

export default instance
