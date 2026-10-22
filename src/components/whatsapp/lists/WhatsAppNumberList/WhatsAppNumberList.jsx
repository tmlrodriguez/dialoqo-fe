import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import WhatsAppNumberListItem from "../WhatsAppNumberListItem/WhatsAppNumberListItem.jsx";

/**
 * WhatsAppNumberList
 * Description: Render the whats app number collection.
 */
function WhatsAppNumberList({
    items = [],
    busy,
    selectNumber,
    selected,
    t,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((number) => (
        <WhatsAppNumberListItem
            key={number.id}
            item={number}
            busy={busy}
            selectNumber={selectNumber}
            selected={selected}
            t={t}
        />
    ));
}

export default WhatsAppNumberList;
