import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import StepListItem from "../StepListItem/StepListItem.jsx";

/**
 * StepList
 * Description: Render the step collection.
 */
function StepList({
    items = [],
    currentLanguage,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((item, index) => (
        <StepListItem
            key={item.es.title}
            item={item}
            index={index}
            currentLanguage={currentLanguage}
        />
    ));
}

export default StepList;
