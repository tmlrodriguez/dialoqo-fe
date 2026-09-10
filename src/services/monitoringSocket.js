/**
 * createMonitoringSocket
 *
 * Description:
 * - Crear una conexión WebSocket autenticada para monitoreo realtime.
 *
 * Notes:
 * - La conexión pertenece a una empresa y número específicos.
 * - Utiliza el mismo token DRF almacenado por AuthContext.
 * - El backend obtiene el token mediante TokenQueryAuthMiddleware.
 * - El WebSocket utiliza WSS automáticamente cuando la aplicación se ejecuta mediante HTTPS.
 */
export function createMonitoringSocket({
    companyId,
    numberId,
    onOpen,
    onEvent,
    onClose,
    onError,
}) {
    const token =
        localStorage.getItem(
            "centralchat_token"
        );

    if (
        !companyId ||
        !numberId ||
        !token
    ) {
        return null;
    }

    const configuredBaseUrl =
        import.meta.env.VITE_WS_BASE_URL;

    let websocketBaseUrl =
        configuredBaseUrl;

    if (!websocketBaseUrl) {
        const protocol =
            window.location.protocol === "https:"
                ? "wss"
                : "ws";

        websocketBaseUrl =
            `${protocol}://127.0.0.1:8000`;
    }

    websocketBaseUrl =
        websocketBaseUrl.replace(
            /\/$/,
            ""
        );

    const socketUrl =
        `${websocketBaseUrl}/ws/whatsapp/companies/${companyId}/numbers/${numberId}/?token=${encodeURIComponent(token)}`;

    const socket =
        new WebSocket(
            socketUrl
        );


    /**
     * WebSocket Open
     */
    socket.onopen = () => {
        onOpen?.();
    };


    /**
     * WebSocket Message
     */
    socket.onmessage = (
        messageEvent
    ) => {
        try {
            const payload =
                JSON.parse(
                    messageEvent.data
                );

            onEvent?.(
                payload
            );
        } catch (error) {
            console.error(
                "Invalid CentralChat realtime payload.",
                error
            );
        }
    };


    /**
     * WebSocket Error
     */
    socket.onerror = (
        event
    ) => {
        onError?.(
            event
        );
    };


    /**
     * WebSocket Close
     */
    socket.onclose = (
        event
    ) => {
        onClose?.(
            event
        );
    };


    return socket;
}


/**
 * closeMonitoringSocket
 *
 * Description:
 * - Cerrar de forma controlada una conexión WebSocket de monitoreo.
 */
export function closeMonitoringSocket(
    socket
) {
    if (!socket) {
        return;
    }

    if (
        socket.readyState ===
            WebSocket.OPEN ||
        socket.readyState ===
            WebSocket.CONNECTING
    ) {
        socket.close(
            1000,
            "Monitoring workspace closed."
        );
    }
}