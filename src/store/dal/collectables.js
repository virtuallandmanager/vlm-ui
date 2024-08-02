import { AuthenticatedFetch } from './common'
import store from '..'

export const getUserCollections = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/collection/user`)
  } catch (error) {
    return error
  }
}

export const getCollection = async (contractAddress) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/collection/${contractAddress}`)
  } catch (error) {
    return error
  }
}

export const getCollectionItems = async (contractAddress) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/collection/${contractAddress}/items`)
  } catch (error) {
    return error
  }
}
