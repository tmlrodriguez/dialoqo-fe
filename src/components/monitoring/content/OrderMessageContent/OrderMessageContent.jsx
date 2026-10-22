import { getFirstValue } from "../../../../utils/firstValue.js";
import OrderProductList from "../../lists/OrderProductList/OrderProductList.jsx";

import styles from "./OrderMessageContent.module.css";

/**
 * OrderMessageContent
 * Description: Render a structured WhatsApp message without performing requests.
 */

function OrderMessageContent({ contentData, t }) {
    const orderData =
        contentData.order && typeof contentData.order === "object"
            ? contentData.order
            : contentData;
    const catalogId = getFirstValue(orderData, ["catalog_id", "catalogId"]);
    const products = Array.isArray(orderData.product_items)
        ? orderData.product_items
        : Array.isArray(orderData.products)
          ? orderData.products
          : [];
    return (
        <div className={styles.orderCard}>
            <header className={styles.orderHeader}>
                <div className={styles.orderIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M3 4h2l2 11h10l2-7H7" />

                        <circle cx="9" cy="19" r="1" />

                        <circle cx="17" cy="19" r="1" />
                    </svg>
                </div>

                <div>
                    <strong>{t("Pedido de WhatsApp")}</strong>

                    <span>
                        {products.length} producto
                        {products.length === 1 ? "" : "s"}
                    </span>
                </div>
            </header>

            {products.length > 0 && (
                <div className={styles.orderProducts}>
                    <OrderProductList items={products} getFirstValue={getFirstValue} />
                </div>
            )}

            {catalogId && <footer className={styles.orderFooter}>Catálogo: {catalogId}</footer>}
        </div>
    );
}

export default OrderMessageContent;
