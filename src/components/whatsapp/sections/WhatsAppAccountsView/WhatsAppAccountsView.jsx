import Button from "../../../common/buttons/Button/Button.jsx";
import BusinessAccountEditForm from "../../forms/BusinessAccountEditForm/BusinessAccountEditForm.jsx";
import BusinessAccountList from "../../lists/BusinessAccountList/BusinessAccountList.jsx";
import BusinessAccountRegistrationForm from "../../forms/BusinessAccountRegistrationForm/BusinessAccountRegistrationForm.jsx";

import styles from "./WhatsAppAccountsView.module.css";

/**
 * WhatsAppAccountsView
 * Description: Present WhatsApp resources and delegate all operations to the page.
 */
function WhatsAppAccountsView({
    t,
    handleSignup,
    companyId,
    busy,
    operation,
    loading,
    accounts,
    selected,
    selectAccount,
    loadingDetail,
    formatDateTime,
    handleSave,
    initialValues,
    resetSelection,
    setAdvanced,
    advanced,
    handleDisconnect,
    handleDeactivate,
    manual,
    setManual,
    handleRefresh,
    handleConnect,
}) {
    return (
        <>
            <section className={styles.listPanel}>
                <header className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>WhatsApp Business</span>

                        <h2>{t("Cuentas WABA")}</h2>

                        <p>{t("Conecte y administre las cuentas de esta empresa.")}</p>
                    </div>

                    <Button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleSignup}
                        disabled={!companyId || busy}
                    >
                        {operation === "signup" ? t("Conectando...") : t("Conectar con Meta")}
                    </Button>
                </header>

                {loading ? (
                    <div className={styles.loadingState}>{t("Cargando cuentas...")}</div>
                ) : accounts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <strong>{t("No existen cuentas WABA configuradas.")}</strong>

                        <span>
                            {t(
                                "Conecte con Meta para registrar automáticamente la cuenta y sus números.",
                            )}
                        </span>
                    </div>
                ) : (
                    <div className={styles.accountList}>
                        <BusinessAccountList
                            items={accounts}
                            selected={selected}
                            selectAccount={selectAccount}
                            busy={busy}
                            loadingDetail={loadingDetail}
                            t={t}
                        />
                    </div>
                )}
            </section>

            <section className={styles.formPanel}>
                <header className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>{t("Configuración")}</span>

                        <h2>{selected ? selected.display_name : t("Administración de cuenta")}</h2>

                        <p>
                            {selected
                                ? t("Revise el estado y administre la cuenta seleccionada.")
                                : t("Seleccione una cuenta o utilice Conectar con Meta.")}
                        </p>
                    </div>
                </header>

                {selected && (
                    <div className={styles.detailBody}>
                        <div className={styles.lifecycleSection}>
                            <div className={styles.lifecycleHeader}>
                                <h3>{t("Estado en Meta")}</h3>

                                <p>{t("Estado sincronizado por el backend.")}</p>
                            </div>

                            <div className={styles.lifecycleGrid}>
                                <div className={styles.lifecycleField}>
                                    <span>{t("Conexión")}</span>

                                    <strong>
                                        {selected.is_connected ? t("Conectada") : t("Desconectada")}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>{t("Webhook")}</span>

                                    <strong>
                                        {selected.is_webhook_configured
                                            ? t("Configurado")
                                            : t("No configurado")}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>{t("Conectada desde")}</span>

                                    <strong>{formatDateTime(selected.connected_at)}</strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>{t("Última desconexión")}</span>

                                    <strong>{formatDateTime(selected.disconnected_at)}</strong>
                                </div>
                            </div>

                            <div className={styles.lifecycleActions}>
                                <Button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={handleRefresh}
                                    disabled={busy}
                                >
                                    {operation === "refresh"
                                        ? t("Actualizando...")
                                        : t("Actualizar estado")}
                                </Button>
                            </div>
                        </div>

                        <BusinessAccountEditForm
                            onSubmit={handleSave}
                            t={t}
                            initialValues={initialValues}

                            busy={busy}
                            resetSelection={resetSelection}
                            operation={operation}
                        />
                    </div>
                )}

                <div className={styles.advancedArea}>
                    <Button
                        type="button"
                        className={styles.advancedToggle}
                        onClick={() => setAdvanced((value) => !value)}
                        disabled={busy}
                        aria-expanded={advanced}
                    >
                        {t("Opciones avanzadas")} {advanced ? "−" : "+"}
                    </Button>

                    {advanced && (
                        <div className={styles.advancedContent}>
                            {selected ? (
                                <>
                                    <div className={styles.lifecycleGrid}>
                                        <div className={styles.lifecycleField}>
                                            <span>Meta WABA ID</span>

                                            <strong>{selected.meta_waba_id}</strong>
                                        </div>

                                        <div className={styles.lifecycleField}>
                                            <span>Meta Business ID</span>

                                            <strong>{selected.meta_business_id}</strong>
                                        </div>
                                    </div>

                                    <div className={styles.lifecycleActions}>
                                        {!selected.is_connected && (
                                            <Button
                                                type="button"
                                                className={styles.secondaryButton}
                                                onClick={handleConnect}
                                                disabled={busy}
                                            >
                                                {operation === "connect"
                                                    ? t("Conectando...")
                                                    : t("Conectar cuenta existente")}
                                            </Button>
                                        )}

                                        {selected.is_connected && (
                                            <Button
                                                type="button"
                                                className={styles.dangerButton}
                                                onClick={handleDisconnect}
                                                disabled={busy}
                                            >
                                                {operation === "disconnect"
                                                    ? t("Desconectando...")
                                                    : t("Desconectar")}
                                            </Button>
                                        )}

                                        <Button
                                            type="button"
                                            className={styles.dangerButton}
                                            onClick={handleDeactivate}
                                            disabled={busy}
                                        >
                                            {operation === "deactivate"
                                                ? t("Desactivando...")
                                                : t("Desactivar")}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className={styles.advancedHelp}>
                                        {t(
                                            "El registro manual es una alternativa administrativa. Se recomienda conectar con Meta.",
                                        )}
                                    </p>

                                    {!manual ? (
                                        <Button
                                            type="button"
                                            className={styles.secondaryButton}
                                            onClick={() => setManual(true)}
                                            disabled={busy}
                                        >
                                            {t("Crear cuenta manualmente")}
                                        </Button>
                                    ) : (
                                        <BusinessAccountRegistrationForm
                                            onSubmit={handleSave}
                                            t={t}
                                            initialValues={initialValues}

                                            busy={busy}
                                            setManual={setManual}
                                            operation={operation}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default WhatsAppAccountsView;
