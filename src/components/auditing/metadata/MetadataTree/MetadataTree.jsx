import { useMemo } from "react";

import { buildMetadataTree } from "../../../../utils/metadataTree.js";
import MetadataListItem from "../MetadataListItem/MetadataListItem.jsx";

/**
 * MetadataTree
 * Description: Preserve readable audit JSON while safely rendering nested metadata.
 */
function MetadataTree({ metadata }) {
    const tree = useMemo(
        () => buildMetadataTree(!metadata || Object.keys(metadata).length === 0 ? {} : metadata),
        [metadata],
    );
    return <MetadataListItem node={tree} />;
}

export default MetadataTree;
