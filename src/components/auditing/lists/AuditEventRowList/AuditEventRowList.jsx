import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import AuditEventRowListItem from "../AuditEventRowListItem/AuditEventRowListItem.jsx";

/**
 * AuditEventRowList
 * Description: Render the audit event row collection.
 */
function AuditEventRowList({
    items = [],
    selectedEventId,
    onSelectEvent,
    t,
    CATEGORY_LABELS,
    ACTION_LABELS,
    SEVERITY_LABELS,
    formatDateTime,
    getActorLabel,
    getTargetLabel,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((event) => (
        <AuditEventRowListItem
            key={event.id}
            item={event}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
            t={t}
            CATEGORY_LABELS={CATEGORY_LABELS}
            ACTION_LABELS={ACTION_LABELS}
            SEVERITY_LABELS={SEVERITY_LABELS}
            formatDateTime={formatDateTime}
            getActorLabel={getActorLabel}
            getTargetLabel={getTargetLabel}
        />
    ));
}

export default AuditEventRowList;
