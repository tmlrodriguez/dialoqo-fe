import { useCallback, useEffect, useRef, useState } from "react";

import { useMonitoringEvents } from "./useMonitoringEvents.js";
import { usePageTranslation } from "./usePageTranslation.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { getConversation, markConversationAsRead } from "../services/monitoring.js";
import { closeMonitoringSocket, createMonitoringSocket } from "../services/monitoringSocket.js";
import {
    createMonitoringEvents,
    getEventConversationId,
    isSameMonitoringId,
    mergeMonitoringConversation,
    mergeMonitoringRecord,
} from "../utils/monitoringRealtime.js";

/**
 * useMonitoringWorkspace
 * Description: Own the socket and selection while delivering updates directly to subscribed resources.
 */
export function useMonitoringWorkspace({
    company,
    branch,
    number,
    canSendMessages = false,
    canStartConversations = false,
    onChangeNumber,
    onError,
}) {
    const { t } = usePageTranslation();
    const companyId = company?.id;
    const branchId = branch?.id;
    const numberId = number?.id;
    const [events] = useState(createMonitoringEvents);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
    const selectedConversationId = selectedConversation?.id;
    const selectedConversationRef = useRef(null);
    const selectionRevisionRef = useRef(0);
    const selectionRequestRef = useRef(0);
    const resourceGenerationRef = useRef(0);
    const acknowledgementsRef = useRef(new Map());

    const clearRealtimeError = useCallback(() => onError?.(""), [onError]);

    const applySelection = useCallback((conversation) => {
        if (conversation !== selectedConversationRef.current) selectionRevisionRef.current += 1;
        selectedConversationRef.current = conversation;
        setSelectedConversation(conversation);
    }, []);

    /**
     * acknowledgeOpenConversation
     * Description: Coalesce read requests and acknowledge messages that arrive during an outstanding request.
     */
    const acknowledgeOpenConversation = useCallback(
        async (conversationId) => {
            if (
                !companyId ||
                !branchId ||
                !numberId ||
                !conversationId ||
                document.visibilityState === "hidden"
            )
                return;
            const key = String(conversationId);
            const existing = acknowledgementsRef.current.get(key);
            if (existing) {
                existing.dirty = true;
                return;
            }
            const task = { dirty: true };
            const generation = resourceGenerationRef.current;
            acknowledgementsRef.current.set(key, task);
            try {
                do {
                    task.dirty = false;
                    const response = await markConversationAsRead(
                        companyId,
                        branchId,
                        numberId,
                        conversationId,
                    );
                    if (generation !== resourceGenerationRef.current) return;
                    if (response?.data)
                        events.publish({
                            event: "conversation.read_state_changed",
                            data: { conversation_id: conversationId, read_state: response.data },
                        });
                } while (
                    task.dirty &&
                    isSameMonitoringId(selectedConversationRef.current?.id, conversationId)
                );
            } catch (error) {
                if (generation === resourceGenerationRef.current)
                    onError?.(
                        error.message || t("No fue posible marcar la conversación como leída."),
                    );
            } finally {
                if (acknowledgementsRef.current.get(key) === task)
                    acknowledgementsRef.current.delete(key);
            }
        },
        [companyId, branchId, numberId, events, onError, t],
    );

    const loadSelectedDetail = useCallback(
        async (conversation, requestId) => {
            if (!companyId || !branchId || !numberId || !conversation?.id) return;
            const generation = resourceGenerationRef.current;
            const revision = selectionRevisionRef.current;
            try {
                const response = await getConversation(
                    companyId,
                    branchId,
                    numberId,
                    conversation.id,
                );
                if (
                    generation !== resourceGenerationRef.current ||
                    selectionRequestRef.current !== requestId
                )
                    return;
                const current = selectedConversationRef.current;
                if (isSameMonitoringId(current?.id, conversation.id)) {
                    const detail = response?.data || conversation;
                    applySelection(
                        revision === selectionRevisionRef.current
                            ? mergeMonitoringConversation(current, detail)
                            : mergeMonitoringConversation(detail, current),
                    );
                }
            } catch (error) {
                if (
                    generation === resourceGenerationRef.current &&
                    selectionRequestRef.current === requestId
                ) {
                    onError?.(
                        error.message || t("No fue posible obtener el detalle de la conversación."),
                    );
                }
            }
        },
        [companyId, branchId, numberId, applySelection, onError, t],
    );

    const handleConversationSelect = useCallback(
        (conversation) => {
            const requestId = ++selectionRequestRef.current;
            applySelection(conversation);
            clearRealtimeError();
            if (conversation) {
                loadSelectedDetail(conversation, requestId);
                acknowledgeOpenConversation(conversation.id);
            }
        },
        [applySelection, clearRealtimeError, loadSelectedDetail, acknowledgeOpenConversation],
    );

    const handleConversationBack = useCallback(() => {
        selectionRequestRef.current += 1;
        applySelection(null);
        clearRealtimeError();
    }, [applySelection, clearRealtimeError]);

    useMonitoringEvents(events, (payload) => {
        const current = selectedConversationRef.current;
        const { event, data = {} } = payload;
        if (event === "connection.restored") {
            if (current) {
                loadSelectedDetail(current, selectionRequestRef.current);
                acknowledgeOpenConversation(current.id);
            }
            return;
        }
        if (!current) return;
        if (event === "number.assignment_changed") {
            applySelection(
                mergeMonitoringRecord(current, { current_assignment: data.current_assignment }),
            );
        } else if (isSameMonitoringId(getEventConversationId(payload), current.id)) {
            if (event === "conversation.updated") {
                if (data.conversation?.is_active === false) handleConversationBack();
                else applySelection(mergeMonitoringConversation(current, data.conversation));
            }
            if (event === "message.created" && data.message?.direction === "INBOUND") {
                acknowledgeOpenConversation(current.id);
            }
        }
    });

    const handleMessageSent = useCallback(
        (message, conversationId) => {
            const id = conversationId ?? selectedConversationRef.current?.id;
            if (!id) return;
            events.publish({
                event: message?.id != null ? "message.created" : "conversation.invalidate",
                source: "local",
                data: { conversation_id: id, message },
            });
        },
        [events],
    );

    async function handleNewConversationCreated(result) {
        setIsNewConversationOpen(false);
        const id = result?.conversationId;
        if (!id || !companyId || !branchId || !numberId) return;
        const requestId = ++selectionRequestRef.current;
        const generation = resourceGenerationRef.current;
        try {
            const response = await getConversation(companyId, branchId, numberId, id);
            if (
                generation !== resourceGenerationRef.current ||
                selectionRequestRef.current !== requestId
            )
                return;
            if (!response?.data)
                throw new Error(t("No fue posible obtener la nueva conversación."));
            events.publish({
                event: "conversation.updated",
                data: { conversation: response.data },
            });
            applySelection(response.data);
            clearRealtimeError();
            acknowledgeOpenConversation(id);
            events.publish({ event: "conversation.invalidate", data: { conversation_id: id } });
        } catch (error) {
            if (generation === resourceGenerationRef.current)
                onError?.(
                    error.message ||
                        t(
                            "La conversación fue creada, pero no fue posible abrirla automáticamente.",
                        ),
                );
        }
    }

    // Keep the document lock tied to conversation identity, not each preview update.
    useEffect(() => {
        if (!selectedConversationId || typeof window === "undefined") return undefined;

        const mobileQuery = window.matchMedia("(max-width: 800px)");
        if (!mobileQuery.matches) return undefined;

        const scrollY = window.scrollY;
        const html = document.documentElement;
        const body = document.body;

        const previousHtmlOverflow = html.style.overflow;
        const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyPosition = body.style.position;
        const previousBodyTop = body.style.top;
        const previousBodyWidth = body.style.width;
        const previousBodyOverscrollBehavior = body.style.overscrollBehavior;

        html.style.overflow = "hidden";
        html.style.overscrollBehavior = "none";
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";
        body.style.overscrollBehavior = "none";

        return () => {
            html.style.overflow = previousHtmlOverflow;
            html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
            body.style.overflow = previousBodyOverflow;
            body.style.position = previousBodyPosition;
            body.style.top = previousBodyTop;
            body.style.width = previousBodyWidth;
            body.style.overscrollBehavior = previousBodyOverscrollBehavior;
            window.scrollTo(0, scrollY);
        };
    }, [selectedConversationId]);

    useResourceLifecycle(
        () => {
            resourceGenerationRef.current += 1;
            let disposed = false;
            let socket;
            let retryTimer;
            let retryAttempt = 0;

            function connect() {
                if (disposed || !companyId || !numberId) return;
                socket = createMonitoringSocket({
                    companyId,
                    numberId,
                    onEvent: (payload) => {
                        if (disposed || !payload?.event) return;
                        if (payload.event === "connection.ready") {
                            retryAttempt = 0;
                            setIsRealtimeConnected(true);
                            clearRealtimeError();
                            events.publish({ event: "connection.restored" });
                        } else {
                            if (
                                payload.event === "number.assignment_changed" &&
                                !isSameMonitoringId(payload.data?.whatsapp_number_id, numberId)
                            )
                                return;
                            events.publish(payload);
                        }
                    },
                    onClose: (event) => {
                        if (disposed) return;
                        setIsRealtimeConnected(false);
                        if ([1000, 4401, 4403].includes(event?.code)) return;
                        const delay = Math.min(1000 * 2 ** retryAttempt++, 30000);
                        retryTimer = window.setTimeout(connect, delay);
                    },
                    onError: () => {
                        if (!disposed) setIsRealtimeConnected(false);
                    },
                });
            }

            function resume() {
                if (document.visibilityState === "hidden") return;
                if (socket?.readyState === WebSocket.OPEN)
                    events.publish({ event: "connection.restored" });
                else if (!socket || socket.readyState === WebSocket.CLOSED) {
                    window.clearTimeout(retryTimer);
                    connect();
                }
            }

            connect();
            window.addEventListener("online", resume);
            document.addEventListener("visibilitychange", resume);
            return () => {
                disposed = true;
                resourceGenerationRef.current += 1;
                selectionRequestRef.current += 1;
                acknowledgementsRef.current.clear();
                window.clearTimeout(retryTimer);
                window.removeEventListener("online", resume);
                document.removeEventListener("visibilitychange", resume);
                closeMonitoringSocket(socket);
            };
        },
        JSON.stringify([companyId, branchId, numberId]),
    );

    return {
        onChangeNumber,
        t,
        number,
        company,
        branch,
        isRealtimeConnected,
        canStartConversations,
        clearRealtimeError,
        setIsNewConversationOpen,
        selectedConversation,
        events,
        handleConversationSelect,
        onError,
        canSendMessages,
        handleConversationBack,
        handleMessageSent,
        isNewConversationOpen,
        handleNewConversationCreated,
    };
}
