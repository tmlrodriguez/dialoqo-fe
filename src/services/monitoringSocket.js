import { API_BASE_URL } from "../api/client.js";

/**
 * createMonitoringSocket
 * Description: Connect to the authorized company and number using the current session.
 * Notes: An explicit WS URL wins; otherwise derive the origin from API configuration.
 */
export function createMonitoringSocket({ companyId, numberId, onOpen, onEvent, onClose, onError }) {
    const token = localStorage.getItem("centralchat_token");
    if (!companyId || !numberId || !token) return null;

    const configuredBaseUrl = import.meta.env?.VITE_WS_BASE_URL;
    const apiOrigin = new URL(API_BASE_URL || window.location.origin, window.location.origin)
        .origin;
    const baseUrl = new URL(configuredBaseUrl || apiOrigin, window.location.origin);
    baseUrl.protocol =
        baseUrl.protocol === "https:" || baseUrl.protocol === "wss:" ? "wss:" : "ws:";
    const websocketBaseUrl = baseUrl.toString().replace(/\/$/, "");
    const socket = new WebSocket(
        `${websocketBaseUrl}/ws/whatsapp/companies/${companyId}/numbers/${numberId}/?token=${encodeURIComponent(token)}`,
    );

    socket.onopen = () => onOpen?.();
    socket.onmessage = async (messageEvent) => {
        try {
            await onEvent?.(JSON.parse(messageEvent.data));
        } catch (error) {
            onError?.(error);
        }
    };
    socket.onerror = (event) => onError?.(event);
    socket.onclose = (event) => onClose?.(event);
    return socket;
}

/**
 * closeMonitoringSocket
 * Description: Detach obsolete handlers and close an active or connecting socket.
 */
export function closeMonitoringSocket(socket) {
    if (!socket) return;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close(1000, "Monitoring workspace closed.");
    }
}
