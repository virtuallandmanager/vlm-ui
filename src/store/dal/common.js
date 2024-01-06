import store from '../../store'
// import router from "../../router";
/*/
These data access methods are used by the Vuex Auth Module to make HTTP requests to the server. There are two classes defined in store/dal/auth.js: AuthenticatedFetch and UnauthenticatedFetch.

AuthenticatedFetch is used to make authenticated requests to the server. It adds an Authorization header to the request with the sessionToken stored in the Vuex store. This class has two methods: get and post, which correspond to HTTP GET and POST requests respectively.

UnauthenticatedFetch is used to make unauthenticated requests to the server. It adds an Authorization header to the request with the connectedWallet stored in the Vuex store. This class also has two methods: get and post, which correspond to HTTP GET and POST requests respectively.

In store/modules/auth.js, there are three methods defined that use these data access methods to make requests to the server: authenticate, login, and restoreSession.

The authenticate method uses an instance of UnauthenticatedFetch to make an unauthenticated GET request to the /auth/vlm/web3 endpoint.

The login method first checks if a sessionToken exists in the Vuex store. If it does, it uses an instance of AuthenticatedFetch to make an authenticated GET request to the /auth/vlm/restore endpoint. If there is no sessionToken, it uses an instance of UnauthenticatedFetch to make an unauthenticated POST request to the /auth/vlm/login endpoint with a payload containing the signatureAccount, signatureMessage, and signature stored in the Vuex store.

The restoreSession method uses an instance of AuthenticatedFetch to make an authenticated POST request to the /auth/vlm/restore endpoint with a payload containing the connectedWallet stored in the Vuex store.
/*/
export class AuthenticatedFetch {
  static refreshing = false
  static refreshQueue = []
  static maxRetries = 3 // Maximum number of retries for a request

  constructor() {
    this.sessionToken = store.state.auth.sessionToken
    this.refreshToken = store.state.auth.refreshToken
  }

  async refreshSession() {
    try {
      AuthenticatedFetch.refreshing = true
      await store.dispatch('auth/refreshSession')
      this.sessionToken = store.state.auth.sessionToken // Update token after refresh
    } finally {
      AuthenticatedFetch.refreshing = false
    }
  }

  async get(endpoint, retryCount = 0) {
    const payload = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.sessionToken,
      },
    }

    try {
      const response = await fetch(process.env.VUE_APP_API_URL + endpoint, payload)
      const responseJson = await response.json()

      if (response.status === 401) {
        if (!AuthenticatedFetch.refreshing) {
          await this.refreshSession()
          // Check if the session was successfully refreshed
          if (this.sessionToken) {
            return this.get(endpoint) // Retry with new session token
          } else {
            // Handle case where session cannot be refreshed
            // Example: Logout the user or show an error
          }
        } else if (retryCount < AuthenticatedFetch.maxRetries) {
          // Enqueue the request for retry
          setTimeout(() => this.get(endpoint, retryCount + 1), 1000) // Retry after a delay
        }
      } else {
        return { status: response.status, ...responseJson }
      }
    } catch (error) {
      // Handle other errors
      console.error('Fetch error:', error)
    }
  }

  async post(endpoint, payloadBody, file, retryCount = 0) {
    let body
    let headers

    // Configure headers and body based on whether a file is included
    if (file) {
      body = payloadBody // Assuming payloadBody is FormData for file upload
      headers = { Authorization: 'Bearer ' + this.sessionToken }
    } else {
      body = JSON.stringify(payloadBody)
      headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.sessionToken,
      }
    }

    const payload = { method: 'POST', headers, body }

    try {
      const response = await fetch(process.env.VUE_APP_API_URL + endpoint, payload)
      const responseJson = await response.json()

      if (response.status === 401) {
        if (!AuthenticatedFetch.refreshing) {
          await this.refreshSession()

          // Check if session was successfully refreshed
          if (this.sessionToken) {
            return this.post(endpoint, payloadBody, file) // Retry with new session token
          } else {
            // Handle case where session cannot be refreshed
            // Example: Logout the user or show an error
          }
        } else if (retryCount < AuthenticatedFetch.maxRetries) {
          // Enqueue the request for retry
          setTimeout(() => this.post(endpoint, payloadBody, file, retryCount + 1), 1000)
        }
      } else {
        return { status: response.status, ...responseJson }
      }
    } catch (error) {
      console.log('Fetch error:', error)
    }
  }

  refresh = async () => {
    try {
      const payload = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.refreshToken,
        },
      }
      const response = await fetch(process.env.VUE_APP_API_URL + '/auth/refresh', payload),
        responseJson = await response.json()

      await store.dispatch('auth/handleSuccessfulLogin', responseJson)
      return { status: response.status, ...responseJson }
    } catch (error) {
      console.log(error)
    }
  }
}

export class UnauthenticatedFetch {
  authString = store.state.auth.connectedWallet

  constructor(authString) {
    if (authString) {
      this.authString = authString
    }
  }

  get = async (endpoint) => {
    const payload = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.authString,
      },
    }
    const response = await fetch(process.env.VUE_APP_API_URL + endpoint, payload),
      responseJson = await response.json()

    return { status: response.status, ...responseJson }
  }
  post = async (endpoint, payloadBody) => {
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.authString,
      },
      body: JSON.stringify(payloadBody),
    }
    const response = await fetch(process.env.VUE_APP_API_URL + endpoint, payload),
      responseJson = await response.json()

    return { status: response.status, ...responseJson }
  }
}

export class ExternalFetch {
  authString = store.state.auth.connectedWallet

  constructor(authString) {
    if (authString) {
      this.authString = authString
    }
  }

  get = async (endpoint) => {
    const response = await fetch(endpoint),
      responseJson = await response.json()

    return { status: response.status, ...responseJson }
  }

  post = async (endpoint, payloadBody) => {
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.authString,
      },
      body: JSON.stringify(payloadBody),
    }
    const response = await fetch(endpoint, payload),
      responseJson = await response.json()

    return { status: response.status, ...responseJson }
  }
}
