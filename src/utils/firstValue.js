/**
 * getFirstValue
 * Description: Return the first present, nonempty field while preserving zero and false.
 */

export function getFirstValue(object, keys) {
    if (!object || typeof object !== "object") {
        return "";
    }

    for (const key of keys) {
        const value = object[key];

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return "";
}
