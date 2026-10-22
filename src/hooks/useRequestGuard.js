import { useEffect, useState } from "react";

import { createRequestGuard } from "../utils/requestGuard.js";

/**
 * useRequestGuard
 * Description: Keep request ownership scoped to a mounted resource identity.
 */
export function useRequestGuard(resourceKey = "mounted") {
    const [guard] = useState(createRequestGuard);
    useEffect(() => () => guard.invalidate(), [guard, resourceKey]);
    return guard;
}
