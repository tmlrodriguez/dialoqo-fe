import { API_BASE_URL } from "../api/client.js";

/**
 * getMonitoringSocketUrl
 * Description: Resolve a socket URL reachable from the browser, including HTTPS tunnels.
 */
function getMonitoringSocketUrl(companyId, numberId, token) {
    const pageUrl = new URL(window.location.origin);
    const apiOrigin = new URL(API_BASE_URL || pageUrl.origin, pageUrl.origin).origin;
    const configuredBaseUrl = import.meta.env?.VITE_WS_BASE_URL?.trim();
    let baseUrl = new URL(configuredBaseUrl || apiOrigin, pageUrl.origin);
    const localHosts = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"];

    // A remote browser must reach a local backend through the same proxy as REST.
    if (
        apiOrigin === pageUrl.origin &&
        localHosts.includes(baseUrl.hostname) &&
        !localHosts.includes(pageUrl.hostname)
    ) {
        baseUrl = new URL(pageUrl.origin);
    }

    baseUrl.protocol =
        pageUrl.protocol === "https:" || ["https:", "wss:"].includes(baseUrl.protocol)
            ? "wss:"
            : "ws:";
    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/ws/whatsapp/companies/${companyId}/numbers/${numberId}/`;
    baseUrl.search = "";
    baseUrl.hash = "";
    baseUrl.searchParams.set("token", token);
    return baseUrl.toString();
}

/**
 * createMonitoringSocket
 * Description: Connect to the authorized company and number using the current session.
 * Notes: Local overrides use the REST proxy when the browser accesses a public tunnel.
 */
export function createMonitoringSocket({ companyId, numberId, onOpen, onEvent, onClose, onError }) {
    const token = localStorage.getItem("centralchat_token");
    if (!companyId || !numberId || !token) return null;

    const socket = new WebSocket(getMonitoringSocketUrl(companyId, numberId, token));

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
