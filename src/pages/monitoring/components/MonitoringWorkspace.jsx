import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getConversation,
    markConversationAsRead,
} from "../../../services/monitoring.js";

import {
    closeMonitoringSocket,
    createMonitoringSocket,
} from "../../../services/monitoringSocket.js";

import ConversationList from "./ConversationList.jsx";
import ConversationPanel from "./ConversationPanel.jsx";
import NewConversationPanel from "./NewConversationPanel.jsx";

import styles from "./MonitoringWorkspace.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * MonitoringWorkspace
 *
 * Description:
 * - Proporcionar el espacio principal realtime para consultar y operar conversaciones de un número de WhatsApp.
 *
 * Notes:
 * - Mantiene una conexión WebSocket para la combinación empresa y número.
 * - Cambiar de conversación no provoca una nueva conexión.
 * - MONITOR utiliza el workspace en modo lectura.
 * - MEMBER puede enviar mensajes e iniciar conversaciones mediante templates aprobados.
 * - Cuando una nueva conversación es creada, Dialoqo la abre automáticamente.
 * - Los mensajes inbound recibidos en la conversación abierta son reconocidos como leídos.
 */
function MonitoringWorkspace({
    company,
    branch,
    number,
    canSendMessages = false,
    canStartConversations = false,
    onChangeNumber,
    onError,
}) {
    const { t } = usePageTranslation();
    const [
        selectedConversation,
        setSelectedConversation,
    ] = useState(null);

    const [
        conversationRefreshKey,
        setConversationRefreshKey,
    ] = useState(0);

    const [
        messageRefreshKey,
        setMessageRefreshKey,
    ] = useState(0);

    const [
        isRealtimeConnected,
        setIsRealtimeConnected,
    ] = useState(false);

    const [
        isNewConversationOpen,
        setIsNewConversationOpen,
    ] = useState(false);

    const socketRef =
        useRef(null);

    const selectedConversationRef =
        useRef(null);

    const isAcknowledgingRealtimeMessageRef =
        useRef(false);

    const conversationSelectionRequestRef =
        useRef(0);


    /**
     * clearRealtimeError
     *
     * Description:
     * - Limpiar mensajes globales previos.
     */
    function clearRealtimeError() {
        onError?.("");
    }


    /**
     * refreshConversationList
     *
     * Description:
     * - Solicitar actualización de la lista de conversaciones.
     */
    function refreshConversationList() {
        setConversationRefreshKey(
            (currentValue) =>
                currentValue + 1
        );
    }


    /**
     * refreshMessageList
     *
     * Description:
     * - Solicitar actualización de mensajes de la conversación abierta.
     */
    function refreshMessageList() {
        setMessageRefreshKey(
            (currentValue) =>
                currentValue + 1
        );
    }


    /**
     * handleConversationSelect
     *
     * Description:
     * - Seleccionar una conversación.
     */
    async function handleConversationSelect(
        conversation
    ) {
        const requestId =
            conversationSelectionRequestRef.current + 1;

        conversationSelectionRequestRef.current =
            requestId;

        if (!conversation) {
            selectedConversationRef.current = null;
            setSelectedConversation(null);
            clearRealtimeError();
            return;
        }

        // Apply the list snapshot immediately for responsive selection, then
        // replace it with the authoritative detail. This prevents stale customer
        // or assignment data from remaining in the conversation header.
        selectedConversationRef.current = conversation;
        setSelectedConversation(conversation);
        clearRealtimeError();

        if (!company?.id || !branch?.id || !number?.id || !conversation?.id) return;

        try {
            const response = await getConversation(
                company.id,
                branch.id,
                number.id,
                conversation.id
            );

            if (conversationSelectionRequestRef.current !== requestId) return;

            const conversationDetail = response?.data || conversation;
            selectedConversationRef.current = conversationDetail;
            setSelectedConversation(conversationDetail);
        } catch (error) {
            if (conversationSelectionRequestRef.current !== requestId) return;
            onError?.(error.message || t("No fue posible obtener el detalle de la conversación."));
        }
    }


    /**
     * acknowledgeOpenConversation
     *
     * Description:
     * - Marcar como leída una conversación actualmente abierta cuando recibe un mensaje inbound realtime.
     */
    async function acknowledgeOpenConversation(
        conversationId
    ) {
        if (
            !company?.id ||
            !branch?.id ||
            !number?.id ||
            !conversationId ||
            isAcknowledgingRealtimeMessageRef.current
        ) {
            return;
        }

        isAcknowledgingRealtimeMessageRef.current =
            true;

        try {
            await markConversationAsRead(
                company.id,
                branch.id,
                number.id,
                conversationId
            );

            refreshConversationList();
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible actualizar el estado de lectura de la conversación.")
            );
        } finally {
            isAcknowledgingRealtimeMessageRef.current =
                false;
        }
    }


    /**
     * handleMessageCreatedEvent
     *
     * Description:
     * - Procesar creación realtime de mensajes.
     */
    function handleMessageCreatedEvent(
        eventData
    ) {
        const eventConversationId =
            eventData?.conversation_id;

        const currentConversationId =
            selectedConversationRef.current?.id;

        const isCurrentConversation =
            String(
                eventConversationId
            ) ===
            String(
                currentConversationId
            );

        refreshConversationList();

        if (!isCurrentConversation) {
            return;
        }

        refreshMessageList();

        if (
            eventData?.message?.direction ===
            "INBOUND"
        ) {
            acknowledgeOpenConversation(
                eventConversationId
            );
        }
    }


    /**
     * handleRealtimeEvent
     *
     * Description:
     * - Procesar eventos recibidos desde Django Channels.
     */
    function handleRealtimeEvent(
        payload
    ) {
        const eventName =
            payload?.event;

        const eventData =
            payload?.data || {};

        if (!eventName) {
            return;
        }

        if (
            eventName ===
            "connection.ready"
        ) {
            setIsRealtimeConnected(
                true
            );

            clearRealtimeError();

            return;
        }

        if (
            eventName ===
            "message.created"
        ) {
            handleMessageCreatedEvent(
                eventData
            );

            return;
        }

        if (
            eventName ===
                "message.updated" ||
            eventName ===
                "message.status_changed"
        ) {
            refreshConversationList();

            if (
                String(
                    eventData?.conversation_id
                ) ===
                String(
                    selectedConversationRef.current?.id
                )
            ) {
                refreshMessageList();
            }

            return;
        }

        if (
            eventName ===
                "conversation.updated" ||
            eventName ===
                "conversation.read_state_changed" ||
            eventName ===
                "number.assignment_changed"
        ) {
            refreshConversationList();
        }
    }


    /**
     * handleNewConversationCreated
     *
     * Description:
     * - Abrir inmediatamente la conversación creada o reutilizada después de un envío de template.
     */
    async function handleNewConversationCreated(
        result
    ) {
        const conversationId =
            result?.conversationId;

        setIsNewConversationOpen(
            false
        );

        refreshConversationList();

        if (
            !conversationId ||
            !company?.id ||
            !branch?.id ||
            !number?.id
        ) {
            return;
        }

        try {
            const response =
                await getConversation(
                    company.id,
                    branch.id,
                    number.id,
                    conversationId
                );

            const conversation =
                response?.data;

            if (!conversation) {
                throw new Error(
                    t("No fue posible obtener la nueva conversación.")
                );
            }

            selectedConversationRef.current =
                conversation;

            setSelectedConversation(
                conversation
            );

            refreshMessageList();

            clearRealtimeError();
        } catch (error) {
            onError?.(
                error.message ||
                t("La conversación fue creada, pero no fue posible abrirla automáticamente.")
            );
        }
    }


    /**
     * handleConversationRead
     *
     * Description:
     * - Actualizar la lista después de marcar una conversación como leída.
     */
    function handleConversationRead() {
        refreshConversationList();
    }


    /**
     * handleMessageSent
     *
     * Description:
     * - Actualizar mensajes y conversaciones después de un envío.
     */
    function handleMessageSent() {
        refreshConversationList();
        refreshMessageList();
    }


    function handleSocketOpen() {
        setIsRealtimeConnected(
            true
        );

        clearRealtimeError();
    }


    function handleSocketClose() {
        setIsRealtimeConnected(
            false
        );
    }


    function handleSocketError() {
        setIsRealtimeConnected(
            false
        );
    }


    useEffect(() => {
        selectedConversationRef.current =
            selectedConversation;
    }, [
        selectedConversation,
    ]);


    useEffect(() => {
        setSelectedConversation(
            null
        );

        selectedConversationRef.current =
            null;

        conversationSelectionRequestRef.current += 1;

        isAcknowledgingRealtimeMessageRef.current =
            false;

        setConversationRefreshKey(
            0
        );

        setMessageRefreshKey(
            0
        );

        setIsRealtimeConnected(
            false
        );

        setIsNewConversationOpen(
            false
        );

        clearRealtimeError();

        if (
            !company?.id ||
            !number?.id
        ) {
            return undefined;
        }

        const socket =
            createMonitoringSocket({
                companyId:
                    company.id,

                numberId:
                    number.id,

                onOpen:
                    handleSocketOpen,

                onEvent:
                    handleRealtimeEvent,

                onClose:
                    handleSocketClose,

                onError:
                    handleSocketError,
            });

        socketRef.current =
            socket;

        if (!socket) {
            return undefined;
        }

        return () => {
            closeMonitoringSocket(
                socket
            );

            socketRef.current =
                null;

            selectedConversationRef.current =
                null;

            isAcknowledgingRealtimeMessageRef.current =
                false;

            setIsRealtimeConnected(
                false
            );
        };
    }, [
        company?.id,
        number?.id,
    ]);


    return (
        <section className={styles.workspace}>
            <header className={styles.workspaceHeader}>
                <div className={styles.workspaceIdentity}>
                    {onChangeNumber && (
                        <button
                            className={styles.backButton}
                            type="button"
                            onClick={onChangeNumber}
                            aria-label={t("Cambiar número")}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    )}

                    <div className={styles.numberIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect
                                x="6"
                                y="2.5"
                                width="12"
                                height="19"
                                rx="2"
                            />

                            <path d="M10 18h4" />
                        </svg>
                    </div>

                    <div className={styles.numberInformation}>
                        <strong>
                            {number?.display_name ||
                                "WhatsApp"}
                        </strong>

                        <span>
                            {number?.phone_number ||
                                ""}
                        </span>
                    </div>
                </div>

                <div className={styles.workspaceContext}>
                    <div>
                        <span>
                            {t("Empresa")}
                        </span>

                        <strong>
                            {company?.name ||
                                "—"}
                        </strong>
                    </div>

                    <div>
                        <span>
                            {t("Sucursal")}
                        </span>

                        <strong>
                            {branch?.name ||
                                "—"}
                        </strong>
                    </div>

                    <div className={styles.statuses}>
                        {number?.is_connected && (
                            <span className={styles.connectedBadge}>
                                {t("Conectado")}
                            </span>
                        )}

                        {number?.is_monitoring_enabled && (
                            <span className={styles.monitoringBadge}>
                                {t("Monitoreando")}
                            </span>
                        )}

                        <span
                            title={t("La conexión en tiempo real permite que nuevos mensajes y cambios aparezcan sin recargar la página.")}
                            className={
                                isRealtimeConnected
                                    ? styles.realtimeConnectedBadge
                                    : styles.realtimeDisconnectedBadge
                            }
                        >
                            {isRealtimeConnected
                                ? "Tiempo real activo"
                                : "Tiempo real desconectado"}
                        </span>

                        {canStartConversations && (
                            <button
                                className={styles.newConversationButton}
                                type="button"
                                onClick={() => {
                                    clearRealtimeError();
                                    setIsNewConversationOpen(true);
                                }}
                            >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 5v14" />
                                <path d="M5 12h14" />
                            </svg>

                                {t("Nueva conversación")}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className={styles.workspaceBody}>
                <ConversationList
                    companyId={
                        company?.id
                    }
                    branchId={
                        branch?.id
                    }
                    numberId={
                        number?.id
                    }
                    selectedConversationId={
                        selectedConversation?.id
                    }
                    refreshKey={
                        conversationRefreshKey
                    }
                    onConversationSelect={
                        handleConversationSelect
                    }
                    onError={
                        onError
                    }
                />

                <ConversationPanel
                    key={selectedConversation?.id || "empty"}
                    companyId={
                        company?.id
                    }
                    branchId={
                        branch?.id
                    }
                    numberId={
                        number?.id
                    }
                    conversation={
                        selectedConversation
                    }
                    canSendMessages={
                        canSendMessages
                    }
                    realtimeRefreshKey={
                        messageRefreshKey
                    }
                    onConversationRead={
                        handleConversationRead
                    }
                    onMessageSent={
                        handleMessageSent
                    }
                    onError={
                        onError
                    }
                />
            </div>

            {canStartConversations && isNewConversationOpen && (
                <NewConversationPanel
                    companyId={
                        company?.id
                    }
                    branchId={
                        branch?.id
                    }
                    numberId={
                        number?.id
                    }
                    onClose={() =>
                        setIsNewConversationOpen(
                            false
                        )
                    }
                    onConversationCreated={
                        handleNewConversationCreated
                    }
                    onError={
                        onError
                    }
                />
            )}
        </section>
    );
}


export default MonitoringWorkspace;
