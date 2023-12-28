import store from '..'
import { AuthenticatedFetch } from './common'

export const getAdminPanelKeys = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/admin/panel`)
  } catch (error) {
    return error
  }
}

export const getUsers = async (page, pageSize, sort) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/admin/users?page=${page}&pageSize=${pageSize}&sort=${sort}`)
  } catch (error) {
    return error
  }
}

export const getOrganizations = async (page, pageSize, sort) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/admin/organizations?page=${page}&pageSize=${pageSize}&sort=${sort}`)
  } catch (error) {
    return error
  }
}

export const getScenes = async (page, pageSize, sort) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/admin/scenes?page=${page}&pageSize=${pageSize}&sort=${sort}`)
  } catch (error) {
    return error
  }
}

export const getEvents = async (page, pageSize, sort) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/admin/events?page=${page}&pageSize=${pageSize}&sort=${sort}`)
  } catch (error) {
    return error
  }
}
