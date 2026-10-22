const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "";

/**
 * apiRequest
 *
 * Description:
 * - Execute an HTTP request against the CentralChat backend API.
 * - Attach the current DRF authentication token when one is available.
 * - Normalize successful JSON responses and backend error responses.
 *
 * Notes:
 * - The API base URL is loaded from the Vite environment configuration.
 * - Authentication tokens must never be logged.
 * - Backend authentication and authorization remain authoritative.
 * - The function throws an Error object containing the HTTP status and backend response payload when the request fails.
 */
export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("centralchat_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Token ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const error = new Error(data?.error_message || "No fue posible completar la solicitud.");

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}

export { API_BASE_URL };
