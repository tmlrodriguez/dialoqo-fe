import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import AccessHistoryListItem from "../AccessHistoryListItem/AccessHistoryListItem.jsx";

/**
 * AccessHistoryList
 * Description: Render the access history collection.
 */
function AccessHistoryList({
    items = [],
    t,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((access) => <AccessHistoryListItem key={access.id} item={access} t={t} />);
}

export default AccessHistoryList;
