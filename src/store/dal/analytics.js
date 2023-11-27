import store from "..";
import { AuthenticatedFetch } from "./common";

export const getRecentSceneMetrics = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/analytics/recent/${sceneId}`);
  } catch (error) {
    return error;
  }
};

