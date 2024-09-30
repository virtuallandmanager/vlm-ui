import { AuthenticatedFetch } from './common'
import store from '..'

export const fetchCommunityChannels = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/media/community-channel/all`)
  } catch (error) {
    return error
  }
}

export const addCommunityChannel = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/media/community-channel/add`)
  } catch (error) {
    return error
  }
}
