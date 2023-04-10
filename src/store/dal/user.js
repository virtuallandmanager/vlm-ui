import store from "..";
import { AuthenticatedFetch } from "./common";

export const getUserInfo = async () => {
  try {
    const { sessionToken } = store.state.auth;
    return new AuthenticatedFetch(sessionToken).get(`/user/vlm/`);
  } catch (error) {
    return error;
  }
};

export const updateUserInfo = async () => {
  try {
    const { sessionToken, userInfo } = store.state.auth;
    const payload = { userInfo };
    return new AuthenticatedFetch(sessionToken).post(
      "/user/vlm/update",
      payload
    );
  } catch (error) {
    return error;
  }
};
