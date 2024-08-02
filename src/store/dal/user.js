import store from '..'
import { AuthenticatedFetch } from './common'

export const getUserInfo = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/user/vlm/`)
  } catch (error) {
    return error
  }
}

export const updateUserInfo = async ({ userInfo, userOrgInfo }) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { userInfo, userOrgInfo }
    return await new AuthenticatedFetch(sessionToken).post('/user/vlm/update', payload)
  } catch (error) {
    return error
  }
}

export const setupUserInfo = async () => {
  try {
    const { sessionToken } = store.state.auth
    const { userInfo } = store.state.user
    const { userOrgs } = store.state.organization
    const payload = { userInfo }
    if (userInfo?.roles?.includes(4)) {
      payload.userOrgInfo = userOrgs[0]
    }
    return await new AuthenticatedFetch(sessionToken).post('/user/setup', payload)
  } catch (error) {
    return error
  }
}
