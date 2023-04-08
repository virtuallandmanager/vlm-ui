import store from "../../store";

export class AuthenticatedFetch {
  sessionToken = store.state.auth.sessionToken;

  get = async (endpoint) => {
    const payload = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.sessionToken,
      },
    };
    const response = await fetch(
        process.env.VUE_APP_API_URL + endpoint,
        payload
      ),
      responseJson = await response.json();

    return { status: response.status, ...responseJson };
  };
  post = async (endpoint, payloadBody) => {
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.sessionToken,
      },
    };

    if (payloadBody) {
      payload.body = JSON.stringify(payloadBody);
    }

    const response = await fetch(
        process.env.VUE_APP_API_URL + endpoint,
        payload
      ),
      responseJson = await response.json();

    return { status: response.status, ...responseJson };
  };
}

export class UnauthenticatedFetch {
  authString = store.state.auth.connectedWallet;

  constructor(authString) {
    if (authString) {
      this.authString = authString;
    }
  }

  get = async (endpoint) => {
    const payload = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.authString,
      },
    };
    const response = await fetch(
        process.env.VUE_APP_API_URL + endpoint,
        payload
      ),
      responseJson = await response.json();

    return { status: response.status, ...responseJson };
  };
  post = async (endpoint, payloadBody) => {
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.authString,
      },
      body: JSON.stringify(payloadBody),
    };
    const response = await fetch(
        process.env.VUE_APP_API_URL + endpoint,
        payload
      ),
      responseJson = await response.json();

    return { status: response.status, ...responseJson };
  };
}
