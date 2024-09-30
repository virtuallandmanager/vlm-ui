import { DateTime } from 'luxon'
// src/utils/authUtils.js

/**
 * Retrieves a specific cookie value by name.
 * @param {string} name - The name of the cookie.
 * @returns {string|null} - The cookie value if found, else null.
 */
export function getCookie(name) {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

/**
 * Sets a cookie with the specified name and value.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value to store in the cookie.
 * @param {number} days - Number of days until the cookie expires.
 */
export function setCookie(name, value, days = 7) {
  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  // Secure and SameSite attributes enhance security
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Strict; Secure`
}

/**
 * Clears a specific cookie by name.
 * @param {string} name - The name of the cookie to clear.
 */
export function clearCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Strict; Secure`
}

/**
 * Retrieves the session token from localStorage or cookies.
 * @returns {string|null} - The session token if found, else null.
 */
export function getSessionToken() {
  // Attempt to get the session token from localStorage
  const token = localStorage.getItem('sessionToken')
  if (token) return token

  // If not in localStorage, try to get it from cookies
  return getCookie('sessionToken')
}

/**
 * Retrieves the refresh token from localStorage or cookies.
 * @returns {string|null} - The refresh token if found, else null.
 */
export function getRefreshToken() {
  // Attempt to get the refresh token from localStorage
  const token = localStorage.getItem('refreshToken')
  if (token) return token

  // If not in localStorage, try to get it from cookies
  return getCookie('refreshToken')
}

/**
 * Saves the session token to localStorage and as a cookie.
 * @param {string} token - The session token to save.
 */
export function setSessionToken(token) {
  // Save session token to localStorage
  localStorage.setItem('sessionToken', token)

  // Also set it as a cookie
  setCookie('sessionToken', token)
}

/**
 * Saves the refresh token to localStorage and as a cookie.
 * @param {string} token - The refresh token to save.
 */
export function setRefreshToken(token) {
  // Save refresh token to localStorage
  localStorage.setItem('refreshToken', token)

  // Also set it as a cookie
  setCookie('refreshToken', token)
}

/**
 * Clears both session and refresh tokens from storage.
 */
export function clearAuthTokens() {
  // Remove tokens from localStorage
  localStorage.removeItem('sessionToken')
  localStorage.removeItem('refreshToken')

  // Remove the cookies
  clearCookie('sessionToken')
  clearCookie('refreshToken')
}

/**
 * Checks if the session token is expired or close to expiring.
 * @param {string} token - The session token.
 * @param {number} threshold - Time in milliseconds before expiry to trigger a refresh.
 * @returns {boolean} - True if the token is expired or close to expiring.
 */
export function isTokenExpired(token, threshold = 5 * 60 * 1000) {
  // 5 minutes threshold by default
  if (!token) return true // If there's no token, it's considered expired

  const expiryTime = localStorage.getItem('sessionTokenExpiry') // Assuming you store the expiry time
  if (!expiryTime) return true // If no expiry time is set, consider it expired

  const now = DateTime.now().toMillis()
  return now >= expiryTime - threshold // If current time is past the expiry time minus the threshold
}
