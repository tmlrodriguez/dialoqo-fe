import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import ManagedTemplateListItem from "../ManagedTemplateListItem/ManagedTemplateListItem.jsx";

/**
 * ManagedTemplateList
 * Description: Render the managed template collection.
 */
function ManagedTemplateList({
    items = [],
    selectedTemplate,
    handleSelectTemplate,
    isLoadingDetail,
    getCategoryLabel,
    getStatusLabel,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((template) => (
        <ManagedTemplateListItem
            key={template.id}
            item={template}
            selectedTemplate={selectedTemplate}
            handleSelectTemplate={handleSelectTemplate}
            isLoadingDetail={isLoadingDetail}
            getCategoryLabel={getCategoryLabel}
            getStatusLabel={getStatusLabel}
        />
    ));
}

export default ManagedTemplateList;
