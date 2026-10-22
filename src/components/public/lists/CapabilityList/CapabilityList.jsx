import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import CapabilityListItem from "../CapabilityListItem/CapabilityListItem.jsx";

/**
 * CapabilityList
 * Description: Render the capability collection.
 */
function CapabilityList({
    items = [],
    currentLanguage,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((item) => (
        <CapabilityListItem key={item.es.title} item={item} currentLanguage={currentLanguage} />
    ));
}

export default CapabilityList;
