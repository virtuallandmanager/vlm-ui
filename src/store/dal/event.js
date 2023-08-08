import store from "..";
import { AuthenticatedFetch } from "./common";
import * as Colyseus from "colyseus.js";

const client = new Colyseus.Client(process.env.VUE_APP_WSS_URL);
let room;

export const connectToEvent = async () => {
  try {
    const { sessionToken } = store.state.auth,
      { activeEvent } = store.state.event;
    room = await client.joinOrCreate("vlm_event", { sessionToken, eventId: activeEvent.sk });
  } catch (error) {
    return error;
  }
};

export const createEvent = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/event/create`);
  } catch (error) {
    return error;
  }
};

export const getEvent = async (eventId) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/event/${eventId}`);
  } catch (error) {
    return error;
  }
};

export const getEventCards = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/event/cards`);
  } catch (error) {
    return error;
  }
};

export const adminGetEvents = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/admin/events`);
  } catch (error) {
    return error;
  }
};

export const updateEvent = async (event) => {
  try {
    const { sessionToken } = store.state.auth;
    const payload = { event };
    return await new AuthenticatedFetch(sessionToken).post("/event/update", payload);
  } catch (error) {
    return error;
  }
};

export const liveUpdateEvent = async (message) => {
  try {
    const { sessionToken } = store.state.auth;

    if (!room) {
      throw new Error("Not connected to the web socket.");
    }

    return await room.send("update_event", { sessionToken, message });
  } catch (error) {
    return error;
  }
};
