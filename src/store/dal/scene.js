import store from "..";
import { AuthenticatedFetch } from "./common";
import * as Colyseus from "colyseus.js";

const client = new Colyseus.Client(process.env.VUE_APP_WSS_URL);
let room;

export const connectToScene = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth;
    room = await client.joinOrCreate("vlm_scene", { sessionToken, sceneId });
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

export const createScene = async (scene) => {
  try {
    const { sessionToken } = store.state.auth;
    const payload = { scene };
    return await new AuthenticatedFetch(sessionToken).post("/scene/create", payload);
  } catch (error) {
    return error;
  }
};

export const updateScene = async () => {
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
