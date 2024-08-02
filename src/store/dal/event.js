import store from '..'
import { AuthenticatedFetch } from './common'

export const get = async (eventId) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/event/${eventId}`)
  } catch (error) {
    return error
  }
}

export const getAll = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/event/all`)
  } catch (error) {
    return error
  }
}

export const create = async (event) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/event/create`, { event })
  } catch (error) {
    return error
  }
}

export const adminGetAll = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/admin/events`)
  } catch (error) {
    return error
  }
}

export const update = async (event) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { event }
    console.log(payload)
    return await new AuthenticatedFetch(sessionToken).post('/event/update', payload)
  } catch (error) {
    return error
  }
}

export const updateSceneLinks = async ({ eventId, sceneLinkIds }) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { eventId, sceneLinkIds }
    return await new AuthenticatedFetch(sessionToken).post('/event/link/scenes', payload)
  } catch (error) {
    return error
  }
}

export const updateGiveawayLinks = async ({ eventId, giveawayLinkIds }) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { eventId, giveawayLinkIds }
    return await new AuthenticatedFetch(sessionToken).post('/event/link/giveaways', payload)
  } catch (error) {
    return error
  }
}

export const updateEventLinks = async ({ giveawayId, eventLinkIds }) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { giveawayId, eventLinkIds }
    return await new AuthenticatedFetch(sessionToken).post('/event/link/giveaways', payload)
  } catch (error) {
    return error
  }
}

export const linkScene = async ({ eventId, sceneId }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/event/link/scene', { eventId, sceneId })
  } catch (error) {
    return error
  }
}

export const linkGiveaway = async ({ eventId, giveawayId }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/event/link/giveaway', { eventId, giveawayId })
  } catch (error) {
    return error
  }
}

export const unlinkScene = async ({ eventId, sceneId }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/event/unlink/scene', { eventId, sceneId })
  } catch (error) {
    return error
  }
}

export const unlinkGiveaway = async ({ eventId, giveawayId }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post('/event/unlink/giveaway', { eventId, giveawayId })
  } catch (error) {
    return error
  }
}

export default {
  create,
  get,
  getAll,
  adminGetAll,
  update,
  linkScene,
  linkGiveaway,
  unlinkScene,
  unlinkGiveaway,
  updateSceneLinks,
  updateGiveawayLinks,
  updateEventLinks,
}
