import Button from "../../../common/buttons/Button/Button.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";
import WhatsAppNumberEditForm from "../../forms/WhatsAppNumberEditForm/WhatsAppNumberEditForm.jsx";

import WhatsAppNumberList from "../../lists/WhatsAppNumberList/WhatsAppNumberList.jsx";

import styles from "./WhatsAppNumbersView.module.css";

/**
 * WhatsAppNumbersView
 * Description: Present WhatsApp resources and delegate all operations to the page.
 */
function WhatsAppNumbersView({
    t,
    branchId,
    loading,
    busy,
    branches,
    clearMessages,
    setBranchId,
    reset,
    setManual,
    loadingNumbers,
    numbers,
    selectNumber,
    selected,
    manual,
    dateText,
    operation,
    save,
    initialValues,
    accounts,
    deactivate,
    handleValidate,
    handleDeactivateMonitoring,
    handleActivateMonitoring,
}) {
    return (
        <>
            <div className={styles.contextBar}>
                <label htmlFor="number-branch">{t("Sucursal")}</label>
                <Input
                    as="select"
                    id="number-branch"
                    value={branchId}
                    disabled={loading || busy || branches.length === 0}
                    onChange={(event) => {
                        clearMessages();
                        setBranchId(event.target.value);
                        reset();
                    }}
                >
                    {branches.length === 0 && (
                        <option value="">{t("No existen sucursales disponibles")}</option>
                    )}
                    <OptionList
                        items={branches}
                        getValue={(branch) => branch.id}
                        getLabel={(branch) => <>{branch.name}</>}
                    />
                </Input>
                <p>
                    {t(
                        "Los números de Meta se registran inicialmente en la sucursal predeterminada.",
                    )}
                </p>
            </div>

            <div className={styles.numberWorkspace}>
                <section className={styles.listPanel}>
                    <header className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>{t("Canales")}</span>
                            <h2>{t("Números de WhatsApp")}</h2>
                            <p>{t("Seleccione un número para administrar su monitoreo.")}</p>
                        </div>
                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            disabled={!branchId || busy}
                            onClick={() => {
                                clearMessages();
                                reset();
                                setManual(true);
                            }}
                        >
                            {t("Registro manual")}
                        </Button>
                    </header>

                    {!branchId ? (
                        <div className={styles.emptyState}>{t("Seleccione una sucursal.")}</div>
                    ) : loadingNumbers ? (
                        <div className={styles.loadingState}>{t("Cargando números...")}</div>
                    ) : numbers.length === 0 ? (
                        <div className={styles.emptyState}>
                            <strong>{t("No existen números registrados.")}</strong>
                            <p>
                                {t(
                                    "Conecte una cuenta desde Cuentas WABA para registrar números automáticamente.",
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className={styles.numberList}>
                            <WhatsAppNumberList
                                items={numbers}
                                busy={busy}
                                selectNumber={selectNumber}
                                selected={selected}
                                t={t}
                            />
                        </div>
                    )}
                </section>

                <section className={styles.formPanel}>
                    <header className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>{t("Administración")}</span>
                            <h2>
                                {selected?.display_name ||
                                    (manual ? t("Registro manual") : t("Detalle del número"))}
                            </h2>
                            <p>{t("Estado operativo y configuración administrativa.")}</p>
                        </div>
                    </header>

                    {!selected && !manual ? (
                        <div className={styles.emptyState}>
                            <strong>{t("Seleccione un número")}</strong>
                            <p>{t("El monitoreo se activa por número.")}</p>
                        </div>
                    ) : (
                        <div className={styles.detailsBody}>
                            {selected && (
                                <div className={styles.lifecycleSection}>
                                    <h3>{t("Estado operativo")}</h3>
                                    <div className={styles.lifecycleGrid}>
                                        <div>
                                            <span>{t("Conexión")}</span>
                                            <strong>
                                                {selected.is_connected
                                                    ? t("Conectado")
                                                    : t("Sin validar")}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>{t("Monitoreo")}</span>
                                            <strong>
                                                {selected.is_monitoring_enabled
                                                    ? t("Activo")
                                                    : t("Inactivo")}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>{t("Inicio de monitoreo")}</span>
                                            <strong>
                                                {dateText(selected.monitoring_started_at)}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>{t("Fin de monitoreo")}</span>
                                            <strong>
                                                {dateText(selected.monitoring_stopped_at)}
                                            </strong>
                                        </div>
                                    </div>
                                    <div className={styles.lifecycleActions}>
                                        <Button
                                            type="button"
                                            className={styles.secondaryButton}
                                            disabled={busy}
                                            onClick={handleValidate}
                                        >
                                            {operation === "validate"
                                                ? t("Validando...")
                                                : t("Validar con Meta")}
                                        </Button>
                                        {selected.is_monitoring_enabled ? (
                                            <Button
                                                type="button"
                                                className={styles.dangerButton}
                                                disabled={busy}
                                                onClick={handleDeactivateMonitoring}
                                            >
                                                {t("Detener monitoreo")}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                className={styles.primaryButton}
                                                disabled={busy || !selected.is_connected}
                                                onClick={handleActivateMonitoring}
                                            >
                                                {t("Activar monitoreo")}
                                            </Button>
                                        )}
                                    </div>
                                    {!selected.is_connected && (
                                        <p className={styles.lifecycleNotice}>
                                            {t("Valide primero el número con Meta.")}
                                        </p>
                                    )}
                                </div>
                            )}

                            <WhatsAppNumberEditForm
                                onSubmit={save}
                                t={t}
                                initialValues={initialValues}
                                busy={busy}

                                selected={selected}
                                manual={manual}
                                accounts={accounts}
                                deactivate={deactivate}
                                reset={reset}
                                operation={operation}
                            />
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

export default WhatsAppNumbersView;
