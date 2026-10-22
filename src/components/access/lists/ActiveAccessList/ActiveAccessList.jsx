import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import ActiveAccessListItem from "../ActiveAccessListItem/ActiveAccessListItem.jsx";

/**
 * ActiveAccessList
 * Description: Render the active access collection.
 */
function ActiveAccessList({
    items = [],
    t,
    handleRevokeAccess,
    isDeleting,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((access) => (
        <ActiveAccessListItem
            key={access.id}
            item={access}
            t={t}
            handleRevokeAccess={handleRevokeAccess}
            isDeleting={isDeleting}
        />
    ));
}

export default ActiveAccessList;
