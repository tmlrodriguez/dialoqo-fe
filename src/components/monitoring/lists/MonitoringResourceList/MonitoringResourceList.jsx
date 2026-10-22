import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MonitoringResourceListItem from "../MonitoringResourceListItem/MonitoringResourceListItem.jsx";

/**
 * MonitoringResourceList
 * Description: Render the monitoring resource collection.
 */
function MonitoringResourceList({
    items = [],
    step,
    getNumberAssignmentMember,
    handleItemClick,
    getCardInitial,
    getCardTitle,
    getCardSubtitle,
    t,
    getMemberName,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((item) => (
        <MonitoringResourceListItem
            key={item.id}
            item={item}
            step={step}
            getNumberAssignmentMember={getNumberAssignmentMember}
            handleItemClick={handleItemClick}
            getCardInitial={getCardInitial}
            getCardTitle={getCardTitle}
            getCardSubtitle={getCardSubtitle}
            t={t}
            getMemberName={getMemberName}
        />
    ));
}

export default MonitoringResourceList;
