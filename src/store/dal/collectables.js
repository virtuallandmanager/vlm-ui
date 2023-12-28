import { ExternalFetch } from './common'
import store from '..'

export const getCollections = async () => {
  try {
    const { connectedWallet } = store.state.auth
    return await new ExternalFetch().get(`https://nft-api.decentraland.org/v1/collections?sortBy=newest&creator=${connectedWallet}`)
  } catch (error) {
    return error
  }
}

export const getCollectionItems = async (contractAddress) => {
  try {
    return await new ExternalFetch().get(`https://nft-api.decentraland.org/v1/items?contractAddress=${contractAddress}`)
  } catch (error) {
    return error
  }
}
