import styles from "./MonitoringContextBar.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";
/**
 * MonitoringContextBar
 *
 * Description:
 * - Permitir seleccionar el contexto operativo utilizado por el monitor.
 *
 * Notes:
 * - La jerarquía de selección es empresa, sucursal y número de WhatsApp.
 * - Las empresas disponibles son determinadas exclusivamente por el backend.
 * - Las sucursales dependen de la empresa seleccionada.
 * - Los números dependen de la sucursal seleccionada.
 * - Este componente no realiza solicitudes HTTP directamente.
 */
function MonitoringContextBar({
    companies,
    selectedCompanyId,
    selectedBranchId,
    selectedNumberId,
    isLoading,
    onCompanyChange,
    onBranchChange,
    onNumberChange,
}) {
    const { t } = usePageTranslation();
    const selectedCompany = companies.find(
        (company) =>
            String(company.id) === String(selectedCompanyId)
    ) || null;

    const branches = selectedCompany?.branches || [];

    const selectedBranch = branches.find(
        (branch) =>
            String(branch.id) === String(selectedBranchId)
    ) || null;

    const numbers = selectedBranch?.numbers || [];


    return (
        <section className={styles.contextBar}>
            <div className={styles.contextHeader}>
                <div>
                    <span className={styles.eyebrow}>
                        {t("Contexto de monitoreo")}
                    </span>

                    <h2>
                        {t("Seleccione el canal")}
                    </h2>

                    <p>
                        {t("Elija la empresa, sucursal y número de WhatsApp que desea monitorear.")}
                    </p>
                </div>

                {selectedNumberId && (
                    <span className={styles.readyBadge}>
                        {t("Monitoreo disponible")}
                    </span>
                )}
            </div>

            <div className={styles.contextGrid}>
                <div className={styles.contextField}>
                    <label htmlFor="monitoring-company">
                        {t("Empresa")}
                    </label>

                    <select
                        id="monitoring-company"
                        value={selectedCompanyId}
                        onChange={onCompanyChange}
                        disabled={
                            isLoading ||
                            companies.length === 0
                        }
                    >
                        {companies.length === 0 && (
                            <option value="">
                                {t("No existen empresas disponibles")}
                            </option>
                        )}

                        {companies.map((company) => (
                            <option
                                key={company.id}
                                value={company.id}
                            >
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.contextField}>
                    <label htmlFor="monitoring-branch">
                        {t("Sucursal")}
                    </label>

                    <select
                        id="monitoring-branch"
                        value={selectedBranchId}
                        onChange={onBranchChange}
                        disabled={
                            isLoading ||
                            !selectedCompanyId ||
                            branches.length === 0
                        }
                    >
                        {branches.length === 0 && (
                            <option value="">
                                {t("No existen sucursales disponibles")}
                            </option>
                        )}

                        {branches.map((branch) => (
                            <option
                                key={branch.id}
                                value={branch.id}
                            >
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.contextField}>
                    <label htmlFor="monitoring-number">
                        {t("Número de WhatsApp")}
                    </label>

                    <select
                        id="monitoring-number"
                        value={selectedNumberId}
                        onChange={onNumberChange}
                        disabled={
                            isLoading ||
                            !selectedBranchId ||
                            numbers.length === 0
                        }
                    >
                        {numbers.length === 0 && (
                            <option value="">
                                {t("No existen números disponibles")}
                            </option>
                        )}

                        {numbers.map((number) => (
                            <option
                                key={number.id}
                                value={number.id}
                            >
                                {number.display_name} — {number.phone_number}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedNumberId && (
                <div className={styles.numberSummary}>
                    <div className={styles.numberIcon}>
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
                                x="6"
                                y="2.5"
                                width="12"
                                height="19"
                                rx="2"
                            />

                            <path d="M10 18h4" />
                        </svg>
                    </div>

                    <div className={styles.numberInformation}>
                        <strong>
                            {numbers.find(
                                (number) =>
                                    String(number.id) === String(selectedNumberId)
                            )?.display_name || t("Número seleccionado")}
                        </strong>

                        <span>
                            {numbers.find(
                                (number) =>
                                    String(number.id) === String(selectedNumberId)
                            )?.phone_number || ""}
                        </span>
                    </div>

                    <div className={styles.numberStatuses}>
                        <span className={styles.connectedBadge}>
                            {t("Conectado")}
                        </span>

                        <span className={styles.monitoringBadge}>
                            {t("Monitoreando")}
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MonitoringContextBar;
