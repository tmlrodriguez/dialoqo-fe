import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import BusinessAccountFieldListItem from "../BusinessAccountFieldListItem/BusinessAccountFieldListItem.jsx";

/**
 * BusinessAccountFieldList
 * Description: Render the waba form field collection.
 */
function BusinessAccountFieldList({
    items = [],
    form,
    changeField,
    busy,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((entry) => (
        <BusinessAccountFieldListItem
            key={entry[0]}
            item={entry}
            form={form}
            changeField={changeField}
            busy={busy}
        />
    ));
}

export default BusinessAccountFieldList;
