import { useState } from "react";

/**
 * useKeyedState
 * Description: Reset local form state when the edited resource changes.
 * Notes: The guarded render update prevents a stale form from reaching the DOM.
 */
export function useKeyedState(initialValue, key) {
    const [state, setState] = useState(() => ({
        key,
        value: typeof initialValue === "function" ? initialValue() : initialValue,
    }));

    if (!Object.is(state.key, key)) {
        setState({
            key,
            value: typeof initialValue === "function" ? initialValue() : initialValue,
        });
    }

    function update(next) {
        setState((current) => ({
            key,
            value: typeof next === "function" ? next(current.value) : next,
        }));
    }

    return [state.value, update];
}
