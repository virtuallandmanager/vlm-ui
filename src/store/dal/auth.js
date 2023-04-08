import store from "..";
import { AuthenticatedFetch, UnauthenticatedFetch } from "./common";

export const authenticate = async () => {
  try {
    const { connectedWallet } = store.state.auth;
    return new UnauthenticatedFetch(connectedWallet).get("/auth/vlm/web3");
  } catch (error) {
    return error;
  }
};

export const login = async () => {
  try {
    const {
      sessionToken,
      signatureAccount,
      signatureToken,
      signatureMessage,
      signature,
    } = store.state.auth;
    const payload = { signatureAccount, signatureMessage, signature };
    if (sessionToken) {
      return new AuthenticatedFetch(sessionToken).get("/auth/vlm/restore");
    } else {
      return new UnauthenticatedFetch(signatureToken).post(
        "/auth/vlm/login",
        payload
      );
    }
  } catch (error) {
    return error;
  }
};

export const restoreSession = async () => {
  try {
    const { sessionToken, connectedWallet } = store.state.auth;
    const payload = { connectedWallet };
    return new AuthenticatedFetch(sessionToken).post(
      "/auth/vlm/restore",
      payload
    );
  } catch (error) {
    return error;
  }
};

export const updateUser = async () => {
  try {
    const { sessionToken, userInfo } = store.state.auth;
    const payload = { userInfo };
    return new AuthenticatedFetch(sessionToken).post(
      "/auth/vlm/user/update",
      payload
    );
  } catch (error) {
    return error;
  }
};
