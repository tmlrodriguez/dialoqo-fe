import MetadataListItem from "../MetadataListItem/MetadataListItem.jsx";

/**
 * MetadataList
 * Description: Render an ordered collection of JSON entries.
 */
function MetadataList({ nodes }) {
    return nodes.map((node) => <MetadataListItem key={node.id} node={node} />);
}

export default MetadataList;
