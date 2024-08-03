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

export const addItems = async ({ giveawayId, items }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/item/add`, { giveawayId, items })
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

export const sendMinterRightsRequest = async ({ giveawayId, byItem }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/set-minter/request`, { giveawayId, byItem })
  } catch (error) {
    return error
  }
}

export const sendMinterRightsTransactions = async ({ signedTransactions }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/giveaway/set-minter/broadcast`, { signedTransactions })
  } catch (error) {
    return error
  }
}

export default { get, getAll, create, update, addItems, checkMintingRights, sendMinterRightsRequest, sendMinterRightsTransactions }
