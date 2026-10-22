import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import BusinessAccountListItem from "../BusinessAccountListItem/BusinessAccountListItem.jsx";

/**
 * BusinessAccountList
 * Description: Render the business account collection.
 */
function BusinessAccountList({
    items = [],
    selected,
    selectAccount,
    busy,
    loadingDetail,
    t,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((account) => (
        <BusinessAccountListItem
            key={account.id}
            item={account}
            selected={selected}
            selectAccount={selectAccount}
            busy={busy}
            loadingDetail={loadingDetail}
            t={t}
        />
    ));
}

export default BusinessAccountList;
