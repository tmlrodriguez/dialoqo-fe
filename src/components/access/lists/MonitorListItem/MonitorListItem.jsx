import EntityListItem from "../../../common/lists/EntityListItem/EntityListItem.jsx";

/**
 * MonitorListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function MonitorListItem({
    item: monitor,
    t,
    selectedMonitor,
    isLoadingMonitorDetail,
    handleSelectMonitor,
}) {
    const monitorName =
        [monitor.first_name, monitor.last_name].filter(Boolean).join(" ") || monitor.username;
    return (
        <EntityListItem
            key={monitor.id}
            title={monitorName}
            subtitle={monitor.username}
            initial={(monitor.first_name || monitor.username || "M").charAt(0).toUpperCase()}
            status={t("Activo")}
            isActive={selectedMonitor?.id === monitor.id}
            disabled={isLoadingMonitorDetail}
            onClick={() => handleSelectMonitor(monitor)}
        />
    );
}

export default MonitorListItem;
