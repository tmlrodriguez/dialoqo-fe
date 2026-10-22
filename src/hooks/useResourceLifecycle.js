import { useEffect, useEffectEvent } from "react";

import { scheduleResource } from "../utils/scheduleResource.js";

/**
 * useResourceLifecycle
 * Description: Synchronize a remote resource when its explicit identity changes.
 * Notes: Setup uses current handlers without reopening resources on callback changes.
 * Cleanup cancels pending setup and releases any acquired resource.
 */
export function useResourceLifecycle(setup, resourceKey) {
    const synchronize = useEffectEvent(setup);

    useEffect(() => scheduleResource(() => synchronize()), [resourceKey]);
}
