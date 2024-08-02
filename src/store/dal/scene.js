import store from '..'
import { AuthenticatedFetch } from './common'
import { Client } from 'colyseus.js'

const client = new Client(process.env.VUE_APP_WSS_URL)
let room

export const connectToScene = async () => {
  try {
    const { sessionToken } = store.state.auth,
      { activeScene } = store.state.scene
    room = await client.joinOrCreate('vlm_scene', { sessionToken, sceneId: activeScene.sk, host: true })
    return room
  } catch (error) {
    throw new Error(error)
  }
}

export const sendSceneMessage = async (messageType, payload) => {
  try {
    const { sessionToken } = store.state.auth
    const { userInfo } = store.state.user
    room.send(messageType, { sessionToken, userInfo, ...payload })
    return room
  } catch (error) {
    throw new Error(error)
  }
}

export const disconnectFromScene = async () => {
  try {
    await room.leave()
  } catch (error) {
    throw new Error(error)
  }
}

export const createScene = async (scene) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).post(`/scene/create`, scene)
  } catch (error) {
    throw new Error(error)
  }
}

export const getScene = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/scene/${sceneId}`)
  } catch (error) {
    throw new Error(error)
  }
}

export const getDemoScene = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/scene/demo`)
  } catch (error) {
    throw new Error(error)
  }
}

export const getSceneCards = async () => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/scene/cards`)
  } catch (error) {
    throw new Error(error)
  }
}

export const updateScene = async (scene) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { scene }
    return await new AuthenticatedFetch(sessionToken).post('/scene/update', payload)
  } catch (error) {
    throw new Error(error)
  }
}

export const liveUpdateScene = async (message) => {
  try {
    const { sessionToken } = store.state.auth

    if (!room) {
      throw new Error('Not connected to the web socket.')
    }

    return await room.send('update_scene', { sessionToken, message })
  } catch (error) {
    throw new Error(error)
  }
}

export const inviteUserToCollab = async ({ userWallet, sceneId, startTime, endTime }) => {
  try {
    const { sessionToken } = store.state.auth
    const payload = { userWallet, sceneId, startTime, endTime }
    return await new AuthenticatedFetch(sessionToken).post('/scene/invite/user', payload)
  } catch (error) {
    throw new Error(error)
  }
}
