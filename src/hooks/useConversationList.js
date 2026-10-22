import { useCallback, useRef, useState } from "react";

import { useMonitoringEvents } from "./useMonitoringEvents.js";
import { usePageTranslation } from "./usePageTranslation.js";
import { useRequestGuard } from "./useRequestGuard.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { getConversations } from "../services/monitoring.js";
import {
    applyMonitoringConversationEvent,
    getEventConversationId,
    isSameMonitoringId,
    mergeMonitoringConversation,
} from "../utils/monitoringRealtime.js";

const PAGE_SIZE = 30;

/**
 * useConversationList
 * Description: Load filtered pages and patch realtime previews without hiding the current list.
 */
export function useConversationList({
    companyId,
    branchId,
    numberId,
    selectedConversationId,
    events,
    onConversationSelect,
    onError,
}) {
    const { t } = usePageTranslation();
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState({ search: "", unread: false, page: 1 });
    const [model, setModel] = useState({
        items: [],
        pagination: { count: 0, next: null, previous: null },
    });
    const [isLoading, setIsLoading] = useState(true);
    const modelRef = useRef(model);
    const pendingEventsRef = useRef(null);
    const readStatesRef = useRef(new Map());
    const refreshTimerRef = useRef(null);
    const resourceKey = JSON.stringify([companyId, branchId, numberId, query]);
    const requestGuard = useRequestGuard(resourceKey);

    const commit = useCallback((next) => {
        modelRef.current = next;
        setModel(next);
    }, []);

    const loadConversations = useCallback(
        async (background = false) => {
            if (!companyId || !branchId || !numberId) {
                setIsLoading(false);
                return;
            }
            const isCurrent = requestGuard.begin();
            const pending = [];
            pendingEventsRef.current = pending;
            if (!background) setIsLoading(true);
            try {
                const response = await getConversations(companyId, branchId, numberId, {
                    search: query.search,
                    unread: query.unread ? "true" : "",
                    ordering: "-last_message_at",
                    page: query.page,
                    pageSize: PAGE_SIZE,
                });
                if (!isCurrent()) return;
                const data = response?.data || {};
                const currentById = new Map(
                    modelRef.current.items.map((item) => [String(item.id), item]),
                );
                let items = (data.results || []).map((item) =>
                    mergeMonitoringConversation(currentById.get(String(item.id)), item, false),
                );
                for (const payload of pending) {
                    items = applyMonitoringConversationEvent(items, payload, {
                        search: query.search,
                        unreadOnly: query.unread,
                        allowInsert: query.page === 1,
                        readStates: readStatesRef.current,
                        limit: PAGE_SIZE,
                    });
                }
                commit({
                    items,
                    pagination: {
                        count: data.count || 0,
                        next: data.next || null,
                        previous: data.previous || null,
                    },
                });
            } catch (error) {
                if (isCurrent())
                    onError?.(error.message || t("No fue posible cargar las conversaciones."));
            } finally {
                if (isCurrent()) {
                    pendingEventsRef.current = null;
                    setIsLoading(false);
                }
            }
        },
        [companyId, branchId, numberId, query, requestGuard, commit, onError, t],
    );

    function scheduleRefresh() {
        if (refreshTimerRef.current !== null) return;
        refreshTimerRef.current = window.setTimeout(() => {
            refreshTimerRef.current = null;
            loadConversations(true);
        }, 200);
    }

    useMonitoringEvents(events, (payload) => {
        const { event, data = {} } = payload;
        if (event === "connection.restored" || event === "conversation.invalidate") {
            scheduleRefresh();
            return;
        }
        if (
            !event.startsWith("message.") &&
            !event.startsWith("conversation.") &&
            event !== "number.assignment_changed"
        )
            return;
        const id = getEventConversationId(payload);
        if (event === "conversation.read_state_changed" && data.read_state) {
            readStatesRef.current.set(String(id), data.read_state);
            if (readStatesRef.current.size > 500)
                readStatesRef.current.delete(readStatesRef.current.keys().next().value);
        }
        if (pendingEventsRef.current) pendingEventsRef.current.push(payload);
        const previous = modelRef.current;
        const known = previous.items.some((item) => isSameMonitoringId(item.id, id));
        const items = applyMonitoringConversationEvent(previous.items, payload, {
            search: query.search,
            unreadOnly: query.unread,
            allowInsert: query.page === 1,
            limit: PAGE_SIZE,
            readStates: readStatesRef.current,
        });
        if (items !== previous.items) commit({ ...previous, items });
        const membershipChanged =
            items.length !== previous.items.length ||
            items.some(
                (item) =>
                    !previous.items.some((previousItem) =>
                        isSameMonitoringId(previousItem.id, item.id),
                    ),
            );
        if (
            membershipChanged ||
            (event === "conversation.updated" && !known) ||
            (event === "conversation.read_state_changed" && !known && query.unread) ||
            (query.page > 1 && event === "conversation.updated") ||
            (event.startsWith("message.") && !data.message?.id)
        )
            scheduleRefresh();
    });

    const handleConversationClick = useCallback(
        (conversation) => {
            onError?.("");
            onConversationSelect?.(conversation);
        },
        [onError, onConversationSelect],
    );

    function handleSearchSubmit(event) {
        event.preventDefault();
        onConversationSelect?.(null);
        const next = { ...query, search: search.trim(), page: 1 };
        if (JSON.stringify(next) === JSON.stringify(query)) loadConversations();
        else setQuery(next);
    }

    function handleUnreadFilter(unread) {
        if (unread === query.unread) return;
        onConversationSelect?.(null);
        setQuery((current) => ({ ...current, unread, page: 1 }));
    }

    function handlePreviousPage() {
        if (!model.pagination.previous || query.page <= 1 || isLoading) return;
        onConversationSelect?.(null);
        setQuery((current) => ({ ...current, page: current.page - 1 }));
    }

    function handleNextPage() {
        if (!model.pagination.next || isLoading) return;
        onConversationSelect?.(null);
        setQuery((current) => ({ ...current, page: current.page + 1 }));
    }

    useResourceLifecycle(() => {
        loadConversations();
        return () => {
            requestGuard.invalidate();
            pendingEventsRef.current = null;
            window.clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        };
    }, resourceKey);

    return {
        t,
        pagination: model.pagination,
        handleSearchSubmit,
        search,
        setSearch,
        isLoading,
        unreadOnly: query.unread,
        handleUnreadFilter,
        conversations: model.items,
        selectedConversationId,
        handleConversationClick,
        handlePreviousPage,
        currentPage: query.page,
        handleNextPage,
    };
}
