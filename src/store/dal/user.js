import store from "..";
import { AuthenticatedFetch } from "./common";

export const getUserInfo = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return await new AuthenticatedFetch(sessionToken).get(`/user/vlm/`);
  } catch (error) {
    return error;
  }
};

export const updateUserInfo = async () => {
  try {
    const { sessionToken, userInfo } = store.state.auth;
    const payload = { userInfo };
    return await new AuthenticatedFetch(sessionToken).post("/user/vlm/update", payload);
  } catch (error) {
    return error;
  }
};

export const setupUserInfo = async () => {
  try {
    const { sessionToken } = store.state.auth;
    const { userInfo, userOrgInfo } = store.state.user;
    const payload = { userInfo };
    if (userInfo.roles.includes(3)) {
      payload.userOrgInfo = userOrgInfo;
    }
    return await new AuthenticatedFetch(sessionToken).post("/user/vlm/setup", payload);
  } catch (error) {
    return error;
  }
};
