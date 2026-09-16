import FormActions from "../../../../components/common/FormActions/FormActions.jsx";
import FormField from "../../../../components/common/FormField/FormField.jsx";

import styles from "./AccessForms.module.css";
import { usePageTranslation } from "../../../usePageTranslation.js";


/**
 * CompanyAccessForm
 *
 * Description:
 * - Renderizar el formulario para asignar empresas a monitores.
 *
 * Notes:
 * - Requiere un monitor y una empresa activos.
 */
function CompanyAccessForm({
    monitorId,
    companyId,
    monitors,
    companies,
    isSaving,
    isLoadingMonitors,
    isLoadingCompanies,
    onMonitorChange,
    onCompanyChange,
    onSubmit,
}) {
    const { t } = usePageTranslation();
    const monitorOptions = monitors.length > 0
        ? monitors.map((monitor) => {
            const monitorName = [monitor.first_name, monitor.last_name].filter(Boolean).join(" ") || monitor.username;

            return {
                value: monitor.id,
                label: `${monitorName} (${monitor.username})`,
            };
        })
        : [
            {
                value: "",
                label: t("No existen monitores disponibles"),
            },
        ];

    const companyOptions = companies.length > 0
        ? companies.map((company) => ({
            value: company.id,
            label: company.name,
        }))
        : [
            {
                value: "",
                label: t("No existen empresas disponibles"),
            },
        ];

    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>{t("Asignar acceso de Monitor")}</h2>
                    <p>{t("Seleccione un monitor y una empresa para autorizar su monitoreo.")}</p>
                </div>
            </div>

            <form className={styles.entityForm} onSubmit={onSubmit}>
                <FormField
                    id="access-monitor"
                    label={t("Monitor")}
                    type="select"
                    value={monitorId}
                    onChange={onMonitorChange}
                    options={monitorOptions}
                    disabled={isLoadingMonitors || monitors.length === 0 || isSaving}
                    required
                />

                <FormField
                    id="access-company"
                    label={t("Empresa")}
                    type="select"
                    value={companyId}
                    onChange={onCompanyChange}
                    options={companyOptions}
                    disabled={isLoadingCompanies || companies.length === 0 || isSaving}
                    required
                />

                <FormActions>
                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={!monitorId || !companyId || isSaving}
                    >
                        {isSaving ? t("Asignando...") : t("Asignar acceso de Monitor")}
                    </button>
                </FormActions>
            </form>
        </section>
    );
}

export default CompanyAccessForm;
