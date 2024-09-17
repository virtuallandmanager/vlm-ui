import store from '..'
import { AuthenticatedFetch } from './common'

export const getStreamCards = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/stream/cards`)
  } catch (error) {
    return error
  }
}
