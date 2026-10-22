import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import AvailableTemplateListItem from "../AvailableTemplateListItem/AvailableTemplateListItem.jsx";

/**
 * AvailableTemplateList
 * Description: Render the available template collection.
 */
function AvailableTemplateList({
    items = [],
    selectedTemplateId,
    onSelect,
    getCategoryLabel,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((template) => (
        <AvailableTemplateListItem
            key={template.id}
            item={template}
            selectedTemplateId={selectedTemplateId}
            onSelect={onSelect}
            getCategoryLabel={getCategoryLabel}
        />
    ));
}

export default AvailableTemplateList;
