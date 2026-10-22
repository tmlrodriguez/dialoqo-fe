import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./WhatsAppNumberListItem.module.css";

/**
 * WhatsAppNumberListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function WhatsAppNumberListItem({ item: number, busy, selectNumber, selected, t }) {
    return (
        <Button
            key={number.id}
            type="button"
            disabled={busy}
            onClick={() => selectNumber(number)}
            className={`${styles.numberCard} ${selected?.id === number.id ? styles.numberCardActive : ""}`}
        >
            <div className={styles.numberInformation}>
                <strong>{number.display_name}</strong>
                <span>{number.phone_number}</span>
            </div>
            <div className={styles.statusGroup}>
                <span
                    className={
                        number.is_connected ? styles.connectedBadge : styles.disconnectedBadge
                    }
                >
                    {number.is_connected ? t("Conectado") : t("Sin validar")}
                </span>
                <span
                    className={
                        number.is_monitoring_enabled
                            ? styles.monitoringBadge
                            : styles.monitoringInactiveBadge
                    }
                >
                    {number.is_monitoring_enabled ? t("Monitoreando") : t("Sin monitoreo")}
                </span>
            </div>
        </Button>
    );
}

export default WhatsAppNumberListItem;
