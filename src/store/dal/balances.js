import store from '..'
import { AuthenticatedFetch } from './common'

export const getUserBalances = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/balance/user/all`)
  } catch (error) {
    return error
  }
}

export const getPromoBalances = async (promoId) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/promotion/balances/${promoId}`)
  } catch (error) {
    return error
  }
}

export const addToBalance = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/balance/add`, payload)
  } catch (error) {
    return error
  }
}

export const deductFromBalance = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/balance/deduct`, payload)
  } catch (error) {
    return error
  }
}

export const allocateBalance = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/balance/allocate', payload)
  } catch (error) {
    return error
  }
}

export const deallocateBalance = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/balance/deallocate', payload)
  } catch (error) {
    return error
  }
}

export const claimPromotion = async (payload) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/promotion/claim', payload)
  } catch (error) {
    return error
  }
}

export const updateUserBalance = async (balanceType, amount) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/balance/update', { balanceType, amount })
  } catch (error) {
    return error
  }
}
