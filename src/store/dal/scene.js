import store from "..";
import { AuthenticatedFetch } from "./common";
import * as Colyseus from "colyseus.js";

const client = new Colyseus.Client(process.env.VUE_APP_WSS_URL);
let room;

export const connectToScene = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth,
      { activeScene } = store.state.scene;
    room = await client.joinOrCreate("vlm_scene", { sessionToken, sceneId: sceneId || activeScene.sk, host: true });
    return room;
  } catch (error) {
    return error;
  }
};

export const sendSceneMessage = async (messageType, payload) => {
  try {
    const { sessionToken } = store.state.auth;
    room.send(messageType, { sessionToken, ...payload });
    return room;
  } catch (error) {
    return error;
  }
};

export const disconnectFromScene = async () => {
  try {
    await room.leave();
  } catch (error) {
    return error;
  }
};

export const createScene = async (scene) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).post(`/scene/create`, scene);
  } catch (error) {
    return error;
  }
};

export const getScene = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/scene/${sceneId}`);
  } catch (error) {
    return error;
  }
};

export const getDemoScene = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/scene/demo`);
  } catch (error) {
    return error;
  }
};

export const getSceneCards = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/scene/cards`);
  } catch (error) {
    return error;
  }
};

export const updateScene = async (scene) => {
  try {
    const { sessionToken } = store.state.auth;
    const payload = { scene };
    return await new AuthenticatedFetch(sessionToken).post("/scene/update", payload);
  } catch (error) {
    return error;
  }
};

export const liveUpdateScene = async (message) => {
  try {
    const { sessionToken } = store.state.auth;

    if (!room) {
      throw new Error("Not connected to the web socket.");
    }

    return await room.send("update_scene", { sessionToken, message });
  } catch (error) {
    return error;
  }
};
