/**
 * createRequestGuard
 * Description: Reject results from superseded or disposed resource requests.
 * @returns {{begin: () => (() => boolean), invalidate: () => void}}
 */
export function createRequestGuard() {
    let generation = 0;

    return {
        begin() {
            const requestGeneration = ++generation;
            return () => requestGeneration === generation;
        },
        invalidate() {
            generation += 1;
        },
    };
}
