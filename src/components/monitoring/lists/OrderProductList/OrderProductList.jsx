import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import OrderProductListItem from "../OrderProductListItem/OrderProductListItem.jsx";

/**
 * OrderProductList
 * Description: Render the order product collection.
 */
function OrderProductList({
    items = [],
    getFirstValue,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((product, index) => (
        <OrderProductListItem
            key={product?.id ?? index}
            item={product}
            index={index}
            getFirstValue={getFirstValue}
        />
    ));
}

export default OrderProductList;
