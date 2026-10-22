import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./BusinessAccountListItem.module.css";

/**
 * BusinessAccountListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function BusinessAccountListItem({
    item: account,
    selected,
    selectAccount,
    busy,
    loadingDetail,
    t,
}) {
    return (
        <Button
            key={account.id}
            type="button"
            className={`
                                    ${styles.accountCard}
                                    ${selected?.id === account.id ? styles.accountCardActive : ""}
                                `}
            onClick={() => selectAccount(account)}
            disabled={busy || loadingDetail}
            aria-pressed={selected?.id === account.id}
        >
            <div className={styles.accountInformation}>
                <strong>{account.display_name}</strong>

                <span>WABA {account.meta_waba_id}</span>
            </div>

            <div className={styles.statusGroup}>
                <span
                    className={
                        account.is_connected ? styles.connectedBadge : styles.disconnectedBadge
                    }
                >
                    {account.is_connected ? t("Conectada") : t("Desconectada")}
                </span>

                <span
                    className={
                        account.is_webhook_configured
                            ? styles.webhookBadge
                            : styles.webhookInactiveBadge
                    }
                >
                    {account.is_webhook_configured ? t("Webhook") : t("Sin webhook")}
                </span>
            </div>
        </Button>
    );
}

export default BusinessAccountListItem;
