import store from '..'
import { UnauthenticatedFetch } from './common'

export const web3Authenticate = async () => {
  try {
    const { connectedWallet } = store.state.auth
    return await new UnauthenticatedFetch(connectedWallet).get('/auth/web3')
  } catch (error) {
    return error
  }
}

export const sendSignature = async () => {
  try {
    const { signatureAccount, signatureToken, signatureMessage, signature } = store.state.auth
    const payload = { signatureAccount, signatureMessage, signature }
    return await new UnauthenticatedFetch(signatureToken).post('/auth/login', payload)
  } catch (error) {
    return error
  }
}

export const refreshSession = async (refreshToken) => {
  try {
    return await new UnauthenticatedFetch(refreshToken).get('/auth/refresh')
  } catch (error) {
    return error
  }
}
