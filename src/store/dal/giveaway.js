import store from '..'
import { AuthenticatedFetch } from './common'

export const get = async (giveawayId) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/giveaway/${giveawayId}`)
  } catch (error) {
    return error
  }
}

export const getAll = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/giveaway/all`)
  } catch (error) {
    return error
  }
}

export const create = async (giveaway) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/create`, { giveaway })
  } catch (error) {
    return error
  }
}

export const update = async (giveaway) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/update`, { giveaway })
  } catch (error) {
    return error
  }
}

export const addItem = async ({ giveawayId, item }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/item/add`, { giveawayId, item })
  } catch (error) {
    return error
  }
}

export const checkMintingRights = async ({ giveawayIds }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/check-minting-rights`, { giveawayIds })
  } catch (error) {
    return error
  }
}

export const sendMinterRightsRequest = async ({ contracts, ids }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/set-minter/request`, { contracts, ids })
  } catch (error) {
    return error
  }
}

export const sendMinterRightsTransactions = async ({ contracts, ids }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/set-minter/broadcast`, { contracts, ids })
  } catch (error) {
    return error
  }
}

export default { get, getAll, create, update, addItem, checkMintingRights, sendMinterRightsRequest, sendMinterRightsTransactions }
