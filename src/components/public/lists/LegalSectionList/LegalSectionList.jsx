import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import LegalSectionListItem from "../LegalSectionListItem/LegalSectionListItem.jsx";

/**
 * LegalSectionList
 * Description: Render the legal section collection.

 */
function LegalSectionList({
    items = [],
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((entry) => <LegalSectionListItem key={entry[0]} item={entry} />);
}

export default LegalSectionList;
