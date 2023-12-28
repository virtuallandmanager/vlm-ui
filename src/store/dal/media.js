import store from '..'
import { AuthenticatedFetch } from './common'

export const uploadUserImage = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/media/user/image', payload, true)
  } catch (error) {
    return error
  }
}
