import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MonitorListItem from "../MonitorListItem/MonitorListItem.jsx";

/**
 * MonitorList
 * Description: Render the monitor collection.
 */
function MonitorList({
    items = [],
    t,
    selectedMonitor,
    isLoadingMonitorDetail,
    handleSelectMonitor,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((monitor) => (
        <MonitorListItem
            key={monitor.id}
            item={monitor}
            t={t}
            selectedMonitor={selectedMonitor}
            isLoadingMonitorDetail={isLoadingMonitorDetail}
            handleSelectMonitor={handleSelectMonitor}
        />
    ));
}

export default MonitorList;
