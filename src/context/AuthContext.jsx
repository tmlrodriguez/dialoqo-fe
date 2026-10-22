import { createContext, useState } from "react";

import { useResourceLifecycle } from "../hooks/useResourceLifecycle.js";
import {
    getCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
} from "../services/auth.js";

export const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Description:
 * - Provide authentication state to the CentralChat application.
 * - Restore an existing authenticated session when the application loads.
 *
 * Notes:
 * - Authentication tokens are stored in localStorage.
 * - The backend remains authoritative for authentication validity.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem("centralchat_token");
    const isAuthenticated = Boolean(user && token);

    /**
     * restoreSession
     *
     * Description:
     * - Restore the authenticated user from an existing token.
     *
     * Notes:
     * - Invalid tokens are removed automatically.
     */
    async function restoreSession() {
        const storedToken = localStorage.getItem("centralchat_token");

        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await getCurrentUser();

            setUser(response.data);
        } catch {
            localStorage.removeItem("centralchat_token");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    useResourceLifecycle(() => {
        restoreSession();
    }, "session");

    /**
     * login
     *
     * Description:
     * - Authenticate the user and establish the local session.
     *
     * Notes:
     * - The authentication token and user are returned by the backend.
     */
    async function login(credentials) {
        const response = await loginRequest(credentials);
        const authenticationData = response.data;

        localStorage.setItem("centralchat_token", authenticationData.token);

        setUser(authenticationData.user);

        return authenticationData.user;
    }

    /**
     * logout
     *
     * Description:
     * - Terminate the backend session and clear local authentication state.
     *
     * Notes:
     * - Local authentication state is cleared even if the backend request fails.
     */
    async function logout() {
        try {
            await logoutRequest();
        } finally {
            localStorage.removeItem("centralchat_token");
            setUser(null);
        }
    }

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
