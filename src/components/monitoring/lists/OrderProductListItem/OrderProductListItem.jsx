import styles from "./OrderProductListItem.module.css";

/**
 * OrderProductListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function OrderProductListItem({ item: product, index: index, getFirstValue }) {
    const productId = getFirstValue(product, ["product_retailer_id", "product_id", "id"]);
    const quantity = getFirstValue(product, ["quantity", "qty"]);
    const price = getFirstValue(product, ["item_price", "price"]);
    const currency = getFirstValue(product, ["currency"]);
    return (
        <div className={styles.orderProduct} key={`${productId || "product"}-${index}`}>
            <div>
                <strong>{productId || `Producto ${index + 1}`}</strong>

                {quantity !== "" && <span>Cantidad: {quantity}</span>}
            </div>

            {price !== "" && (
                <strong>
                    {currency ? `${currency} ` : ""}
                    {price}
                </strong>
            )}
        </div>
    );
}

export default OrderProductListItem;
