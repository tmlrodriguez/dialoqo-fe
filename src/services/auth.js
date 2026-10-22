import { apiRequest } from "../api/client.js";
/**
 * login
 *
 * Description:
 * - Authenticate a CentralChat user using the supplied credentials.
 * - Delegate the HTTP request to the shared API client.
 *
 * Notes:
 * - Credentials are sent only to the backend login endpoint.
 * - Authentication tokens returned by the backend are not persisted by this service.
 * - Token storage and authentication-state management belong to the authentication state layer.
 */
export function login(credentials) {
    return apiRequest("/access/login/", {
        method: "POST",
        body: JSON.stringify(credentials),
    });
}

/**
 * getCurrentUser
 *
 * Description:
 * - Retrieve the currently authenticated CentralChat user.
 * - Use the authentication token automatically attached by the shared API client.
 *
 * Notes:
 * - The backend remains authoritative for authentication validity.
 * - An invalid or expired token will cause the shared API client to throw an error.
 */
export function getCurrentUser() {
    return apiRequest("/access/me/");
}

/**
 * logout
 *
 * Description:
 * - Request termination of the current CentralChat backend authentication session.
 * - Delegate token-authenticated communication to the shared API client.
 *
 * Notes:
 * - The backend deletes the current DRF authentication token.
 * - Local authentication state should be cleared by the authentication state layer after a successful logout.
 */
export function logout() {
    return apiRequest("/access/logout/", {
        method: "POST",
    });
}
