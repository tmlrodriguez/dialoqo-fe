/**
 * @typedef {object} MetadataNode
 * @property {string} id Stable JSON pointer for the entry.
 * @property {string} line Opening or scalar line, including indentation.
 * @property {string} closing Closing line for nonempty containers.
 * @property {MetadataNode[]} children Nested entries.
 */

/**
 * buildMetadataTree
 * Description: Build an immutable, bounded tree for readable audit JSON.
 * Notes: Ancestor tracking allows shared references and stops cycles. Depth and
 * entry limits bound both recursion and rendered output for untrusted metadata.
 * @returns {MetadataNode}
 */
export function buildMetadataTree(value, { maxDepth = 40, maxEntries = 2000 } = {}) {
    if (!Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 64) {
        throw new RangeError("Metadata depth must be an integer between 0 and 64.");
    }
    if (!Number.isInteger(maxEntries) || maxEntries < 1 || maxEntries > 20000) {
        throw new RangeError("Metadata entry limit must be an integer between 1 and 20000.");
    }

    const ancestors = new WeakSet();
    let entries = 0;

    function visit(current, id, depth, label = "", suffix = "") {
        entries += 1;
        const prefix = `${"  ".repeat(depth)}${label}`;
        const leaf = (text) => ({
            id,
            line: `${prefix}${text}${suffix}`,
            closing: "",
            children: [],
        });

        if (current === null || typeof current !== "object") {
            const scalar = typeof current === "bigint" ? String(current) : current;
            return leaf(JSON.stringify(scalar) ?? "null");
        }
        if (ancestors.has(current)) return leaf(JSON.stringify("[Circular]"));
        if (depth >= maxDepth) return leaf(JSON.stringify("[Depth limit]"));

        const isArray = Array.isArray(current);
        const pairs = Object.entries(current).filter(
            ([, entry]) => isArray || !["undefined", "function", "symbol"].includes(typeof entry),
        );
        const opening = isArray ? "[" : "{";
        const closing = isArray ? "]" : "}";
        if (!pairs.length) return leaf(`${opening}${closing}`);

        ancestors.add(current);
        const children = [];
        for (let index = 0; index < pairs.length; index += 1) {
            if (entries >= maxEntries) {
                children.push({
                    id: `${id}/~limit`,
                    line: `${"  ".repeat(depth + 1)}${JSON.stringify("[Entry limit]")}`,
                    closing: "",
                    children: [],
                });
                break;
            }
            const [key, entry] = pairs[index];
            const pointer = key.replaceAll("~", "~0").replaceAll("/", "~1");
            children.push(
                visit(
                    entry,
                    `${id}/${pointer}`,
                    depth + 1,
                    isArray ? "" : `${JSON.stringify(key)}: `,
                    index < pairs.length - 1 ? "," : "",
                ),
            );
        }
        ancestors.delete(current);

        return {
            id,
            line: `${prefix}${opening}`,
            closing: `${"  ".repeat(depth)}${closing}${suffix}`,
            children,
        };
    }

    return visit(value, "$", 0);
}
