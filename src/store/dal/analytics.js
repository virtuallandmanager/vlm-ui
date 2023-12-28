import store from '..'
import { AuthenticatedFetch } from './common'

export const getRecentSceneMetrics = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/analytics/recent/${sceneId}`)
  } catch (error) {
    return error
  }
}

export const getHistoricalData = async (sceneId, dateRange, scale) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/analytics/historical/${sceneId}?start=${dateRange[0]}&end=${dateRange[1]}&scale=${scale}`)
  } catch (error) {
    return error
  }
}
