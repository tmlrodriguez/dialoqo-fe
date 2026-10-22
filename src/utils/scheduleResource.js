/**
 * scheduleResource
 * Description: Schedule resource setup and return an idempotent disposal function.
 * Notes: A discarded commit never starts a request or opens a socket.
 */
export function scheduleResource(setup, enqueue = queueMicrotask) {
    let active = true;
    let dispose;

    enqueue(() => {
        if (active) dispose = setup();
    });

    return () => {
        if (!active) return;
        active = false;
        dispose?.();
    };
}
