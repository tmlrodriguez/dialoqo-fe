import styles from "./MessageSpecialContent.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * MessageSpecialContent
 *
 * Description:
 * - Renderizar contenido estructurado de mensajes WhatsApp que no corresponde
 *   directamente a texto o archivos multimedia.
 *
 * Notes:
 * - Utiliza exclusivamente content_data normalizado por el backend.
 * - Soporta ubicación, contactos, reacciones, botones, mensajes interactivos,
 *   pedidos y contenido no soportado.
 * - No realiza operaciones de escritura ni solicitudes HTTP adicionales.
 */
function MessageSpecialContent({
    message,
}) {
    const { t } = usePageTranslation();
    const messageType =
        String(
            message?.message_type || ""
        ).toUpperCase();

    const contentData =
        message?.content_data &&
        typeof message.content_data === "object"
            ? message.content_data
            : {};


    /**
     * getFirstValue
     *
     * Description:
     * - Obtener el primer valor válido entre varias claves posibles.
     */
    function getFirstValue(
        object,
        keys
    ) {
        if (
            !object ||
            typeof object !== "object"
        ) {
            return "";
        }

        for (const key of keys) {
            const value =
                object[key];

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                return value;
            }
        }

        return "";
    }


    /**
     * renderLocation
     *
     * Description:
     * - Renderizar una ubicación compartida.
     */
    function renderLocation() {
        const latitude =
            getFirstValue(
                contentData,
                [
                    "latitude",
                    "lat",
                ]
            );

        const longitude =
            getFirstValue(
                contentData,
                [
                    "longitude",
                    "lng",
                    "lon",
                ]
            );

        const name =
            getFirstValue(
                contentData,
                [
                    "name",
                    "location_name",
                ]
            );

        const address =
            getFirstValue(
                contentData,
                [
                    "address",
                    "location_address",
                ]
            );

        const hasCoordinates =
            latitude !== "" &&
            longitude !== "";

        const mapUrl =
            hasCoordinates
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${latitude},${longitude}`
                )}`
                : "";

        return (
            <div className={styles.locationCard}>
                <div className={styles.locationIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                        <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                        />
                    </svg>
                </div>

                <div className={styles.locationInformation}>
                    <strong>
                        {name || t("Ubicación compartida")}
                    </strong>

                    {address && (
                        <span>
                            {address}
                        </span>
                    )}

                    {hasCoordinates && (
                        <small>
                            {latitude}, {longitude}
                        </small>
                    )}
                </div>

                {mapUrl && (
                    <button
                        className={styles.actionButton}
                        type="button"
                        onClick={() => {
                            window.open(
                                mapUrl,
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }}
                    >
                        {t("Abrir mapa")}
                    </button>
                )}
            </div>
        );
    }


    /**
     * renderContacts
     *
     * Description:
     * - Renderizar uno o varios contactos compartidos.
     */
    function renderContacts() {
        let contacts =
            contentData.contacts;

        if (
            !Array.isArray(contacts)
        ) {
            contacts = [
                contentData,
            ];
        }

        contacts =
            contacts.filter(
                (contact) =>
                    contact &&
                    typeof contact === "object"
            );

        if (
            contacts.length === 0
        ) {
            return (
                <UnsupportedContent
                    title={t("Contacto compartido")}
                    description={t("No fue posible interpretar los datos del contacto.")}
                />
            );
        }

        return (
            <div className={styles.contacts}>
                {contacts.map(
                    (
                        contact,
                        index
                    ) => {
                        const nameData =
                            contact.name || {};

                        const formattedName =
                            typeof nameData === "string"
                                ? nameData
                                : (
                                    nameData.formatted_name ||
                                    [
                                        nameData.first_name,
                                        nameData.middle_name,
                                        nameData.last_name,
                                    ]
                                        .filter(Boolean)
                                        .join(" ")
                                );

                        const phones =
                            Array.isArray(
                                contact.phones
                            )
                                ? contact.phones
                                : [];

                        const emails =
                            Array.isArray(
                                contact.emails
                            )
                                ? contact.emails
                                : [];

                        return (
                            <div
                                className={styles.contactCard}
                                key={`${formattedName || "contact"}-${index}`}
                            >
                                <div className={styles.contactAvatar}>
                                    {(formattedName || "C")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className={styles.contactInformation}>
                                    <strong>
                                        {formattedName || t("Contacto")}
                                    </strong>

                                    {phones.map(
                                        (
                                            phone,
                                            phoneIndex
                                        ) => {
                                            const phoneValue =
                                                typeof phone === "string"
                                                    ? phone
                                                    : (
                                                        phone.phone ||
                                                        phone.wa_id ||
                                                        phone.number ||
                                                        ""
                                                    );

                                            if (!phoneValue) {
                                                return null;
                                            }

                                            return (
                                                <span
                                                    key={`${phoneValue}-${phoneIndex}`}
                                                >
                                                    {phoneValue}
                                                </span>
                                            );
                                        }
                                    )}

                                    {emails.map(
                                        (
                                            email,
                                            emailIndex
                                        ) => {
                                            const emailValue =
                                                typeof email === "string"
                                                    ? email
                                                    : email.email || "";

                                            if (!emailValue) {
                                                return null;
                                            }

                                            return (
                                                <small
                                                    key={`${emailValue}-${emailIndex}`}
                                                >
                                                    {emailValue}
                                                </small>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        );
    }


    /**
     * renderReaction
     *
     * Description:
     * - Renderizar una reacción sobre otro mensaje.
     */
    function renderReaction() {
        const reactionData =
            contentData.reaction &&
            typeof contentData.reaction === "object"
                ? contentData.reaction
                : contentData;

        const emoji =
            getFirstValue(
                reactionData,
                [
                    "emoji",
                    "reaction",
                ]
            );

        return (
            <div className={styles.reactionCard}>
                <span className={styles.reactionEmoji}>
                    {emoji || "♡"}
                </span>

                <div className={styles.reactionInformation}>
                    <strong>
                        {t(t("Reacción"))}
                    </strong>

                    <span>
                        {message?.context_message_id
                            ? `Mensaje relacionado #${message.context_message_id}`
                            : t("Mensaje relacionado")}
                    </span>
                </div>
            </div>
        );
    }


    /**
     * renderButton
     *
     * Description:
     * - Renderizar una respuesta originada por un botón.
     */
    function renderButton() {
        const buttonData =
            contentData.button &&
            typeof contentData.button === "object"
                ? contentData.button
                : contentData;

        const title =
            getFirstValue(
                buttonData,
                [
                    "text",
                    "title",
                    "label",
                ]
            );

        const payload =
            getFirstValue(
                buttonData,
                [
                    "payload",
                    "id",
                ]
            );

        return (
            <div className={styles.selectionCard}>
                <div className={styles.selectionIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect
                            x="4"
                            y="7"
                            width="16"
                            height="10"
                            rx="2"
                        />

                        <path d="M8 12h8" />
                    </svg>
                </div>

                <div className={styles.selectionInformation}>
                    <span>
                        {t("Respuesta de botón")}
                    </span>

                    <strong>
                        {title || t("Botón seleccionado")}
                    </strong>

                    {payload && (
                        <small>
                            {payload}
                        </small>
                    )}
                </div>
            </div>
        );
    }


    /**
     * renderInteractive
     *
     * Description:
     * - Renderizar una respuesta interactiva.
     */
    function renderInteractive() {
        const interactiveType =
            String(
                contentData.type || ""
            ).toLowerCase();

        const reply =
            contentData.button_reply ||
            contentData.buttonReply ||
            contentData.list_reply ||
            contentData.listReply ||
            contentData.reply ||
            {};

        const title =
            getFirstValue(
                reply,
                [
                    "title",
                    "text",
                    "name",
                ]
            );

        const description =
            getFirstValue(
                reply,
                [
                    "description",
                    "subtitle",
                ]
            );

        const identifier =
            getFirstValue(
                reply,
                [
                    "id",
                    "payload",
                ]
            );

        return (
            <div className={styles.selectionCard}>
                <div className={styles.selectionIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M5 5h14v14H5Z" />
                        <path d="M8 9h8" />
                        <path d="M8 13h5" />
                    </svg>
                </div>

                <div className={styles.selectionInformation}>
                    <span>
                        {interactiveType === "list_reply"
                            ? t("Opción seleccionada")
                            : t("Respuesta interactiva")}
                    </span>

                    <strong>
                        {title || t("Respuesta recibida")}
                    </strong>

                    {description && (
                        <small>
                            {description}
                        </small>
                    )}

                    {identifier && (
                        <small>
                            ID: {identifier}
                        </small>
                    )}
                </div>
            </div>
        );
    }


    /**
     * renderOrder
     *
     * Description:
     * - Renderizar un pedido de WhatsApp Commerce.
     */
    function renderOrder() {
        const orderData =
            contentData.order &&
            typeof contentData.order === "object"
                ? contentData.order
                : contentData;

        const catalogId =
            getFirstValue(
                orderData,
                [
                    "catalog_id",
                    "catalogId",
                ]
            );

        const products =
            Array.isArray(
                orderData.product_items
            )
                ? orderData.product_items
                : Array.isArray(
                    orderData.products
                )
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

                            <circle
                                cx="9"
                                cy="19"
                                r="1"
                            />

                            <circle
                                cx="17"
                                cy="19"
                                r="1"
                            />
                        </svg>
                    </div>

                    <div>
                        <strong>
                            {t("Pedido de WhatsApp")}
                        </strong>

                        <span>
                            {products.length} producto
                            {products.length === 1
                                ? ""
                                : "s"}
                        </span>
                    </div>
                </header>

                {products.length > 0 && (
                    <div className={styles.orderProducts}>
                        {products.map(
                            (
                                product,
                                index
                            ) => {
                                const productId =
                                    getFirstValue(
                                        product,
                                        [
                                            "product_retailer_id",
                                            "product_id",
                                            "id",
                                        ]
                                    );

                                const quantity =
                                    getFirstValue(
                                        product,
                                        [
                                            "quantity",
                                            "qty",
                                        ]
                                    );

                                const price =
                                    getFirstValue(
                                        product,
                                        [
                                            "item_price",
                                            "price",
                                        ]
                                    );

                                const currency =
                                    getFirstValue(
                                        product,
                                        [
                                            "currency",
                                        ]
                                    );

                                return (
                                    <div
                                        className={styles.orderProduct}
                                        key={`${productId || "product"}-${index}`}
                                    >
                                        <div>
                                            <strong>
                                                {productId ||
                                                    `Producto ${index + 1}`}
                                            </strong>

                                            {quantity !== "" && (
                                                <span>
                                                    Cantidad: {quantity}
                                                </span>
                                            )}
                                        </div>

                                        {price !== "" && (
                                            <strong>
                                                {currency
                                                    ? `${currency} `
                                                    : ""}
                                                {price}
                                            </strong>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                )}

                {catalogId && (
                    <footer className={styles.orderFooter}>
                        Catálogo: {catalogId}
                    </footer>
                )}
            </div>
        );
    }


    if (
        messageType === "LOCATION"
    ) {
        return renderLocation();
    }

    if (
        messageType === "CONTACTS"
    ) {
        return renderContacts();
    }

    if (
        messageType === "REACTION"
    ) {
        return renderReaction();
    }

    if (
        messageType === "BUTTON"
    ) {
        return renderButton();
    }

    if (
        messageType === "INTERACTIVE"
    ) {
        return renderInteractive();
    }

    if (
        messageType === "ORDER"
    ) {
        return renderOrder();
    }

    if (
        messageType === "UNSUPPORTED"
    ) {
        return (
            <UnsupportedContent
                title={t("Tipo de mensaje no soportado")}
                description={t("CentralChat conservó el evento, pero todavía no dispone de una representación especializada.")}
            />
        );
    }

    return null;
}


/**
 * UnsupportedContent
 *
 * Description:
 * - Mostrar contenido que todavía no tiene representación específica.
 */
function UnsupportedContent({
    title,
    description,
}) {
    const { t } = usePageTranslation();
    return (
        <div className={styles.unsupported}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                />

                <path d="M9.5 9a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.2 2.1-2.2 3.8" />

                <path d="M12 17h.01" />
            </svg>

            <div>
                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>
            </div>
        </div>
    );
}


export default MessageSpecialContent;
