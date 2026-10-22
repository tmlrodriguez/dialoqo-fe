import { useMonitoringWorkspace } from "../../../../hooks/useMonitoringWorkspace.js";
import MonitoringWorkspaceView from "../MonitoringWorkspaceView/MonitoringWorkspaceView.jsx";

/**
 * MonitoringWorkspace
 * Description: Connect monitoring behavior to its presentation.
 */
function MonitoringWorkspace(props) {
    const state = useMonitoringWorkspace(props);
    return <MonitoringWorkspaceView {...state} />;
}

export default MonitoringWorkspace;
