import store from '..'
import axios from 'axios'
import { AuthenticatedFetch, UnauthenticatedFetch } from './common'

export const logError = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/log/error`, payload)
  } catch (error) {
    return error
  }
}

export const logWarning = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/log/error`, payload)
  } catch (error) {
    return error
  }
}

export const logInfo = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/log/error`, payload)
  } catch (error) {
    return error
  }
}

export const logWAT = async (payload) => {
  try {
    console.log(payload)
    return await new UnauthenticatedFetch().post(`/log/wat`, { log: payload.discordMessage, metadata: payload, userInfo: store.state.user.userInfo })
  } catch (error) {
    return error
  }
}
