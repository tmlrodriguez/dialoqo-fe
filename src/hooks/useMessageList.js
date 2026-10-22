import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { useMonitoringEvents } from "./useMonitoringEvents.js";
import { usePageTranslation } from "./usePageTranslation.js";
import { useRequestGuard } from "./useRequestGuard.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { getMessages } from "../services/monitoring.js";
import { getLanguageLocale } from "../utils/i18n.js";
import {
    getEventConversationId,
    isSameMonitoringId,
    mergeMonitoringMessages,
} from "../utils/monitoringRealtime.js";

/**
 * useMessageList
 * Description: Merge live messages into retained history and preserve the reader's scroll position.
 */
export function useMessageList({ companyId, branchId, numberId, conversationId, events, onError }) {
    const { t } = usePageTranslation();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [hasOlderMessages, setHasOlderMessages] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const listRef = useRef(null);
    const contentRef = useRef(null);
    const messagesRef = useRef([]);
    const currentPageRef = useRef(1);
    const pinnedToBottomRef = useRef(true);
    const pendingScrollRef = useRef(null);
    const pendingChangesRef = useRef(null);
    const latestRequestRef = useRef(false);
    const olderRequestRef = useRef(false);
    const refreshRequestedRef = useRef(false);
    const refreshTimerRef = useRef(null);
    const resourceKey = JSON.stringify([companyId, branchId, numberId, conversationId]);
    const latestGuard = useRequestGuard(resourceKey);
    const olderGuard = useRequestGuard(resourceKey);

    const commit = useCallback((next) => {
        if (messagesRef.current === next) return;
        messagesRef.current = next;
        setMessages(next);
    }, []);

    const handleScroll = useCallback(() => {
        const container = listRef.current;
        if (!container) return;
        const atBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 80;
        pinnedToBottomRef.current = atBottom;
        if (!atBottom && pendingScrollRef.current?.type === "bottom")
            pendingScrollRef.current = null;
        if (atBottom) setNewMessageCount(0);
    }, []);

    const scrollToBottom = useCallback(() => {
        pinnedToBottomRef.current = true;
        setNewMessageCount(0);
        const container = listRef.current;
        if (container) container.scrollTop = container.scrollHeight;
    }, []);

    const handleContentResize = useCallback(() => {
        const container = listRef.current;
        if (container && pinnedToBottomRef.current) container.scrollTop = container.scrollHeight;
    }, []);

    useLayoutEffect(() => {
        const pending = pendingScrollRef.current;
        const container = listRef.current;
        if (!pending || !container) return;
        pendingScrollRef.current = null;
        if (pending.type === "bottom") {
            pinnedToBottomRef.current = true;
            container.scrollTop = container.scrollHeight;
        } else {
            container.scrollTop = pending.top + container.scrollHeight - pending.height;
        }
    }, [messages, isLoading]);

    useLayoutEffect(() => {
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(handleContentResize);
        if (contentRef.current) observer.observe(contentRef.current);
        if (listRef.current) observer.observe(listRef.current);
        return () => observer.disconnect();
    }, [handleContentResize]);

    async function loadLatestMessages(initial = false) {
        if (!companyId || !branchId || !numberId || !conversationId) return;
        if (latestRequestRef.current) {
            refreshRequestedRef.current = true;
            return;
        }
        latestRequestRef.current = true;
        const isCurrent = latestGuard.begin();
        const changes = [];
        pendingChangesRef.current = changes;
        try {
            const known = new Set(messagesRef.current.map((message) => String(message.id)));
            const latestKnownTime = Date.parse(messagesRef.current.at(-1)?.message_timestamp) || 0;
            const received = [];
            let page = 1;
            let firstPage;
            while (true) {
                const response = await getMessages(companyId, branchId, numberId, conversationId, {
                    ordering: "-message_timestamp",
                    page,
                    pageSize: 50,
                });
                if (!isCurrent()) return;
                const data = response?.data || {};
                const results = data.results || [];
                firstPage ??= data;
                received.push(...results);
                if (
                    initial ||
                    known.size === 0 ||
                    !data.next ||
                    results.length === 0 ||
                    results.some((message) => known.has(String(message.id)))
                )
                    break;
                page += 1;
            }
            let next = mergeMonitoringMessages(messagesRef.current, received);
            for (const change of changes)
                next = mergeMonitoringMessages(next, [change.message], change.insert);
            if (!initial && !pinnedToBottomRef.current) {
                const visibleIds = new Set(
                    messagesRef.current.map((message) => String(message.id)),
                );
                const recoveredCount = next.filter(
                    (message) =>
                        !visibleIds.has(String(message.id)) &&
                        Date.parse(message.message_timestamp) > latestKnownTime,
                ).length;
                if (recoveredCount) setNewMessageCount((count) => count + recoveredCount);
            }
            if (initial || (next !== messagesRef.current && pinnedToBottomRef.current))
                pendingScrollRef.current = { type: "bottom" };
            commit(next);
            if (initial || currentPageRef.current === 1)
                setHasOlderMessages(Boolean(firstPage.next));
        } catch (error) {
            if (isCurrent()) onError?.(error.message || t("No fue posible cargar los mensajes."));
        } finally {
            if (isCurrent()) {
                latestRequestRef.current = false;
                pendingChangesRef.current = null;
                setIsLoading(false);
                if (refreshRequestedRef.current) {
                    refreshRequestedRef.current = false;
                    scheduleRefresh();
                }
            }
        }
    }

    function scheduleRefresh() {
        if (refreshTimerRef.current !== null) return;
        refreshTimerRef.current = window.setTimeout(() => {
            refreshTimerRef.current = null;
            loadLatestMessages();
        }, 200);
    }

    useMonitoringEvents(events, (payload) => {
        if (payload.event === "connection.restored") {
            scheduleRefresh();
            return;
        }
        if (!isSameMonitoringId(getEventConversationId(payload), conversationId)) return;
        if (payload.event === "conversation.invalidate") {
            scheduleRefresh();
            return;
        }
        if (
            !["message.created", "message.updated", "message.status_changed"].includes(
                payload.event,
            )
        )
            return;
        const message = payload.data?.message;
        if (message?.id == null) {
            scheduleRefresh();
            return;
        }
        const insert = payload.event === "message.created" && Boolean(message.message_timestamp);
        if (payload.event === "message.created" && !insert) scheduleRefresh();
        if (pendingChangesRef.current) pendingChangesRef.current.push({ message, insert });
        const current = messagesRef.current;
        const isNew = insert && !current.some((item) => isSameMonitoringId(item.id, message.id));
        const forceBottom = payload.source === "local";
        const next = mergeMonitoringMessages(current, [message], insert);
        if (next !== current && (forceBottom || pinnedToBottomRef.current))
            pendingScrollRef.current = { type: "bottom" };
        else if (isNew && !forceBottom) setNewMessageCount((count) => count + 1);
        commit(next);
        if (forceBottom) {
            setNewMessageCount(0);
            if (next === current) scrollToBottom();
        }
    });

    /**
     * loadOlderMessages
     * Description: Prepend deduplicated history while keeping the visible message in place.
     */
    async function loadOlderMessages() {
        if (!hasOlderMessages || olderRequestRef.current || isLoading) return;
        olderRequestRef.current = true;
        setIsLoadingOlder(true);
        const isCurrent = olderGuard.begin();
        const nextPage = Math.max(2, Math.floor(messagesRef.current.length / 50) + 1);
        try {
            const response = await getMessages(companyId, branchId, numberId, conversationId, {
                ordering: "-message_timestamp",
                page: nextPage,
                pageSize: 50,
            });
            if (!isCurrent()) return;
            const data = response?.data || {};
            const container = listRef.current;
            const next = mergeMonitoringMessages(messagesRef.current, data.results || []);
            if (container && next !== messagesRef.current)
                pendingScrollRef.current = pinnedToBottomRef.current
                    ? { type: "bottom" }
                    : { type: "anchor", top: container.scrollTop, height: container.scrollHeight };
            commit(next);
            currentPageRef.current = nextPage;
            setHasOlderMessages(Boolean(data.next));
        } catch (error) {
            if (isCurrent())
                onError?.(error.message || t("No fue posible cargar mensajes anteriores."));
        } finally {
            if (isCurrent()) {
                olderRequestRef.current = false;
                setIsLoadingOlder(false);
            }
        }
    }

    const formatDateDivider = useCallback(
        (value) => {
            if (!value) return "";
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return "";
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const messageStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const difference = Math.round((todayStart - messageStart) / 86400000);
            if (difference === 0) return t("Hoy");
            if (difference === 1) return t("Ayer");
            return new Intl.DateTimeFormat(getLanguageLocale(), {
                day: "numeric",
                month: "long",
                year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
            }).format(date);
        },
        [t],
    );

    const isDifferentDay = useCallback((current, previous) => {
        if (!previous) return true;
        const first = new Date(current.message_timestamp);
        const second = new Date(previous.message_timestamp);
        if (Number.isNaN(first.getTime()) || Number.isNaN(second.getTime())) return false;
        return (
            first.getFullYear() !== second.getFullYear() ||
            first.getMonth() !== second.getMonth() ||
            first.getDate() !== second.getDate()
        );
    }, []);

    useResourceLifecycle(() => {
        latestRequestRef.current = false;
        olderRequestRef.current = false;
        refreshRequestedRef.current = false;
        pendingChangesRef.current = null;
        currentPageRef.current = 1;
        messagesRef.current = [];
        pinnedToBottomRef.current = true;
        pendingScrollRef.current = null;
        setMessages([]);
        setIsLoading(true);
        setIsLoadingOlder(false);
        setHasOlderMessages(false);
        setNewMessageCount(0);
        loadLatestMessages(true);
        return () => {
            latestGuard.invalidate();
            olderGuard.invalidate();
            window.clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        };
    }, resourceKey);

    return {
        isLoading,
        t,
        messages,
        listRef,
        contentRef,
        handleScroll,
        handleContentResize,
        newMessageCount,
        scrollToBottom,
        hasOlderMessages,
        loadOlderMessages,
        isLoadingOlder,
        isDifferentDay,
        formatDateDivider,
        companyId,
        branchId,
        numberId,
        conversationId,
    };
}
