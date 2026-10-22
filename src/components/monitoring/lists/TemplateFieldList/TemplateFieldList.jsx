import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import TemplateFieldListItem from "../TemplateFieldListItem/TemplateFieldListItem.jsx";

/**
 * TemplateFieldList
 * Description: Render the template field collection.
 */
function TemplateFieldList({
    items = [],
    values,
    handleValueChange,
    t,
    isSending,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((field) => (
        <TemplateFieldListItem
            key={field.id}
            item={field}
            values={values}
            handleValueChange={handleValueChange}
            t={t}
            isSending={isSending}
        />
    ));
}

export default TemplateFieldList;
