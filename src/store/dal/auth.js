import store from "..";
import { AuthenticatedFetch, UnauthenticatedFetch } from "./common";

export const authenticate = async () => {
  try {
    const { connectedWallet } = store.state.auth;
    return await new UnauthenticatedFetch(connectedWallet).get("/auth/web3");
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
      return await new AuthenticatedFetch(sessionToken).get("/auth/restore");
    } else {
      return await new UnauthenticatedFetch(signatureToken).post(
        "/auth/login",
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
    return await new AuthenticatedFetch(sessionToken).post(
      "/auth/restore",
      payload
    );
  } catch (error) {
    return error;
  }
};
