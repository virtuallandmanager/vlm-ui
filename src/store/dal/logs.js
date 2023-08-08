import store from "..";
import { AuthenticatedFetch } from "./common";

export const logError = async (payload) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).post(`/log/error`, payload);
  } catch (error) {
    return error;
  }
};

export const logWarning = async (payload) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).post(`/log/error`, payload);
  } catch (error) {
    return error;
  }
};

export const logInfo = async (payload) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).post(`/log/error`, payload);
  } catch (error) {
    return error;
  }
};

export const logWAT = async (payload) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).post(`/log/wat`, payload);
  } catch (error) {
    return error;
  }
};