import { useEffect, useEffectEvent } from "react";

/**
 * useMonitoringEvents
 * Description: Subscribe a mounted resource to workspace events using its current handlers.
 */
export function useMonitoringEvents(events, onEvent) {
    const receive = useEffectEvent(onEvent);
    useEffect(() => events?.subscribe((payload) => receive(payload)), [events]);
}
