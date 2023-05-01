import store from "..";
import { AuthenticatedFetch } from "./common";

export const getOrgInfo = async (orgId) => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/org/vlm/${orgId}`);
  } catch (error) {
    return error;
  }
};

export const createOrganization = async () => {
  try {
    const { sessionToken } = store.state.auth,
      { orgInfo } = store.state.organization,
      payload = { orgInfo };
    return await new AuthenticatedFetch(sessionToken).post("/org/vlm/create", payload);
  } catch (error) {
    return error;
  }
};

export const updateOrgInfo = async () => {
  try {
    const { sessionToken } = store.state.auth,
      { orgInfo } = store.state.organization,
      payload = { orgInfo };
    return await new AuthenticatedFetch(sessionToken).post("/org/vlm/update", payload);
  } catch (error) {
    return error;
  }
};
