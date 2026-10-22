import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import AssignmentHistoryListItem from "../AssignmentHistoryListItem/AssignmentHistoryListItem.jsx";

/**
 * AssignmentHistoryList
 * Description: Render the assignment history collection.
 */
function AssignmentHistoryList({
    items = [],
    getMemberName,
    getMemberDescription,
    t,
    formatDateTime,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((assignment) => (
        <AssignmentHistoryListItem
            key={assignment.id}
            item={assignment}
            getMemberName={getMemberName}
            getMemberDescription={getMemberDescription}
            t={t}
            formatDateTime={formatDateTime}
        />
    ));
}

export default AssignmentHistoryList;
