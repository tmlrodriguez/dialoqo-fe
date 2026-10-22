import { memo } from "react";

import MetadataList from "../MetadataList/MetadataList.jsx";

/**
 * MetadataListItem
 * Description: Recursively render a bounded JSON entry and its children.
 */
function MetadataListItem({ node }) {
    const ending = node.id === "$" ? "" : "\n";
    if (!node.children.length) return `${node.line}${ending}`;

    return (
        <>
            {`${node.line}\n`}
            <MetadataList nodes={node.children} />
            {`${node.closing}${ending}`}
        </>
    );
}

export default memo(MetadataListItem);
