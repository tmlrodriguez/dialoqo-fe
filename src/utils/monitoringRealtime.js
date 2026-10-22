/**
 * createMonitoringEvents
 * Description: Deliver every workspace event without rerendering its parent or dropping batched messages.
 */
export function createMonitoringEvents() {
    const listeners = new Set();

    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        publish(event) {
            for (const listener of listeners) listener(event);
        },
    };
}

export function isSameMonitoringId(first, second) {
    return first != null && second != null && String(first) === String(second);
}

export function getEventConversationId(payload) {
    return payload?.data?.conversation_id ?? payload?.data?.conversation?.id;
}

/**
 * mergeMonitoringRecord
 * Description: Preserve unchanged record and nested value references for memoized rows.
 */
export function mergeMonitoringRecord(current, incoming) {
    if (!current) return incoming;
    let changed = false;
    const result = { ...current };
    for (const [key, value] of Object.entries(incoming || {})) {
        if (value === undefined) continue;
        const previous = current[key];
        const equal =
            Object.is(previous, value) ||
            (previous !== null &&
                value !== null &&
                typeof previous === "object" &&
                typeof value === "object" &&
                JSON.stringify(previous) === JSON.stringify(value));
        if (!equal) {
            result[key] = value;
            changed = true;
        }
    }
    return changed ? result : current;
}

function timestamp(value) {
    return Date.parse(value) || 0;
}

function compareMessages(first, second) {
    return (
        timestamp(first.message_timestamp) - timestamp(second.message_timestamp) ||
        String(first.id).localeCompare(String(second.id), undefined, { numeric: true })
    );
}

/**
 * mergeMonitoringMessage
 * Description: Reconcile REST responses and socket echoes without reverting a newer delivery state or edit.
 */
export function mergeMonitoringMessage(current, incoming) {
    if (!current) return incoming;
    const update = { ...incoming };
    if (timestamp(current.updated_at) > timestamp(incoming.updated_at)) {
        return mergeMonitoringRecord(current, { ...incoming, ...current });
    }
    const statuses = { PENDING: 0, SENT: 1, DELIVERED: 2, READ: 3 };
    if (
        timestamp(current.status_updated_at) > timestamp(incoming.status_updated_at) ||
        (timestamp(current.status_updated_at) === timestamp(incoming.status_updated_at) &&
            statuses[current.status] > statuses[incoming.status])
    ) {
        for (const key of [
            "status",
            "status_updated_at",
            "sent_at",
            "delivered_at",
            "read_at",
            "failed_at",
            "failure_code",
            "failure_message",
        ]) {
            if (key in current) update[key] = current[key];
        }
    }
    if (
        (current.is_revoked && !incoming.is_revoked) ||
        timestamp(current.edited_at) > timestamp(incoming.edited_at)
    ) {
        for (const key of [
            "text_body",
            "display_text",
            "content_data",
            "media_attachments",
            "is_edited",
            "edited_at",
            "is_revoked",
            "revoked_at",
        ]) {
            if (key in current) update[key] = current[key];
        }
    }
    return mergeMonitoringRecord(current, update);
}

/**
 * mergeMonitoringMessages
 * Description: Upsert chronological messages by identity while retaining previously loaded history.
 */
export function mergeMonitoringMessages(current, incoming, allowInsert = true) {
    const messages = [...current];
    const positions = new Map(messages.map((message, index) => [String(message.id), index]));
    let changed = false;
    let needsSort = false;
    for (const message of incoming) {
        if (message?.id == null) continue;
        const position = positions.get(String(message.id));
        if (position === undefined) {
            if (!allowInsert) continue;
            positions.set(String(message.id), messages.length);
            messages.push(message);
            changed = true;
            needsSort = true;
        } else {
            const merged = mergeMonitoringMessage(messages[position], message);
            if (merged !== messages[position]) {
                needsSort ||= merged.message_timestamp !== messages[position].message_timestamp;
                messages[position] = merged;
                changed = true;
            }
        }
    }
    return changed ? (needsSort ? messages.sort(compareMessages) : messages) : current;
}

/**
 * mergeMonitoringConversation
 * Description: Keep preview ordering and private read counts when applying a shared conversation snapshot.
 */
export function mergeMonitoringConversation(current, snapshot, preserveReadState = true) {
    const update = { ...snapshot };
    if (preserveReadState) {
        delete update.is_read;
        delete update.unread_count;
    }
    if (current?.last_message && snapshot?.last_message) {
        if (isSameMonitoringId(current.last_message.id, snapshot.last_message.id)) {
            update.last_message = mergeMonitoringMessage(
                current.last_message,
                snapshot.last_message,
            );
        } else if (compareMessages(current.last_message, snapshot.last_message) > 0) {
            update.last_message = current.last_message;
            update.last_message_at = current.last_message_at;
        }
    }
    return mergeMonitoringRecord(current, update);
}

/**
 * applyMonitoringConversationEvent
 * Description: Patch matching previews, read counts and assignments without replacing unaffected rows.
 */
export function applyMonitoringConversationEvent(items, payload, options = {}) {
    const { search = "", unreadOnly = false, allowInsert = true, readStates, limit = 30 } = options;
    const { event, data = {} } = payload;
    const id = getEventConversationId(payload);
    let found = false;
    let next = items.map((conversation) => {
        if (event === "number.assignment_changed") {
            return mergeMonitoringRecord(conversation, {
                current_assignment: data.current_assignment,
            });
        }
        if (!isSameMonitoringId(conversation.id, id)) return conversation;
        found = true;
        if (event === "conversation.updated") {
            return mergeMonitoringConversation(conversation, data.conversation);
        }
        if (event === "conversation.read_state_changed") {
            return mergeMonitoringRecord(conversation, {
                is_read: data.read_state?.is_read,
                unread_count: data.read_state?.unread_count,
            });
        }
        if (event.startsWith("message.") && data.message?.id != null) {
            const last = conversation.last_message;
            if (event !== "message.created" && !isSameMonitoringId(last?.id, data.message.id))
                return conversation;
            return mergeMonitoringConversation(conversation, {
                last_message: data.message,
                last_message_at: data.message.message_timestamp,
            });
        }
        return conversation;
    });
    if (
        !found &&
        allowInsert &&
        event === "conversation.updated" &&
        data.conversation?.id != null
    ) {
        const snapshot = mergeMonitoringConversation(null, data.conversation);
        const readState = readStates?.get(String(snapshot.id));
        next.push({ ...snapshot, is_read: false, unread_count: 0, ...readState });
    }
    const normalizedSearch = search.toLowerCase();
    next = next
        .filter((conversation) => {
            if (conversation.is_active === false) return false;
            if (unreadOnly && !(conversation.unread_count > 0 && !conversation.is_read))
                return false;
            const customer = conversation.customer || {};
            return (
                !normalizedSearch ||
                [customer.phone_number, customer.display_name, customer.profile_name].some(
                    (value) =>
                        String(value || "")
                            .toLowerCase()
                            .includes(normalizedSearch),
                )
            );
        })
        .sort(
            (first, second) =>
                timestamp(second.last_message_at) - timestamp(first.last_message_at) ||
                String(second.id).localeCompare(String(first.id), undefined, { numeric: true }),
        )
        .slice(0, limit);
    return next.length === items.length && next.every((item, index) => item === items[index])
        ? items
        : next;
}
