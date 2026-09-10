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


/**
 * MonitoringWorkspace
 *
 * Description:
 * - Proporcionar el espacio principal de monitoreo realtime de un número de WhatsApp.
 *
 * Notes:
 * - Mantiene una conexión WebSocket para la combinación empresa y número.
 * - Cambiar de conversación no provoca una nueva conexión.
 * - Permite iniciar nuevas conversaciones mediante templates aprobados.
 * - Cuando una nueva conversación es creada, CentralChat la abre automáticamente.
 * - Los mensajes inbound recibidos en la conversación abierta son reconocidos como leídos.
 */
function MonitoringWorkspace({
    company,
    branch,
    number,
    onChangeNumber,
    onError,
}) {
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
    function handleConversationSelect(
        conversation
    ) {
        selectedConversationRef.current =
            conversation;

        setSelectedConversation(
            conversation
        );

        clearRealtimeError();
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
                "No fue posible actualizar el estado de lectura de la conversación."
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
                    "No fue posible obtener la nueva conversación."
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
                "La conversación fue creada, pero no fue posible abrirla automáticamente."
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
                    <button
                        className={styles.backButton}
                        type="button"
                        onClick={
                            onChangeNumber
                        }
                        aria-label="Cambiar número"
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
                            Empresa
                        </span>

                        <strong>
                            {company?.name ||
                                "—"}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Sucursal
                        </span>

                        <strong>
                            {branch?.name ||
                                "—"}
                        </strong>
                    </div>

                    <div className={styles.statuses}>
                        {number?.is_connected && (
                            <span className={styles.connectedBadge}>
                                Conectado
                            </span>
                        )}

                        {number?.is_monitoring_enabled && (
                            <span className={styles.monitoringBadge}>
                                Monitoreando
                            </span>
                        )}

                        <span
                            className={
                                isRealtimeConnected
                                    ? styles.realtimeConnectedBadge
                                    : styles.realtimeDisconnectedBadge
                            }
                        >
                            {isRealtimeConnected
                                ? "Tiempo real"
                                : "Sin tiempo real"}
                        </span>

                        <button
                            className={styles.newConversationButton}
                            type="button"
                            onClick={() => {
                                clearRealtimeError();

                                setIsNewConversationOpen(
                                    true
                                );
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

                            Nueva conversación
                        </button>
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

            {isNewConversationOpen && (
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