import styles from "./MonitoringSelection.module.css";


/**
 * MonitoringSelection
 *
 * Description:
 * - Proporcionar navegación progresiva para seleccionar el contexto de monitoreo.
 *
 * Notes:
 * - La selección sigue la jerarquía empresa, sucursal y número de WhatsApp.
 * - Cada recurso se representa mediante tarjetas seleccionables.
 * - El componente no realiza solicitudes HTTP.
 * - Solo utiliza recursos previamente autorizados por el backend.
 */
function MonitoringSelection({
    step,
    companies,
    selectedCompany,
    selectedBranch,
    onCompanySelect,
    onBranchSelect,
    onNumberSelect,
    onBack,
}) {
    /**
     * getStepInformation
     *
     * Description:
     * - Obtener título y descripción correspondientes al paso actual.
     */
    function getStepInformation() {
        if (step === "company") {
            return {
                eyebrow: "Paso 1 de 3",
                title: "Seleccione una empresa",
                description: "Seleccione la empresa cuyas conversaciones desea monitorear.",
            };
        }

        if (step === "branch") {
            return {
                eyebrow: "Paso 2 de 3",
                title: "Seleccione una sucursal",
                description: `Seleccione una sucursal de ${selectedCompany?.name || "la empresa seleccionada"}.`,
            };
        }

        if (step === "number") {
            return {
                eyebrow: "Paso 3 de 3",
                title: "Seleccione un número",
                description: `Seleccione el número de WhatsApp que desea monitorear en ${selectedBranch?.name || "la sucursal seleccionada"}.`,
            };
        }

        return {
            eyebrow: "",
            title: "",
            description: "",
        };
    }


    /**
     * getAvailableItems
     *
     * Description:
     * - Obtener los recursos correspondientes al paso actual.
     */
    function getAvailableItems() {
        if (step === "company") {
            return companies || [];
        }

        if (step === "branch") {
            return selectedCompany?.branches || [];
        }

        if (step === "number") {
            return selectedBranch?.numbers || [];
        }

        return [];
    }


    /**
     * handleItemClick
     *
     * Description:
     * - Delegar la selección del recurso correspondiente.
     */
    function handleItemClick(item) {
        if (step === "company") {
            onCompanySelect?.(item);

            return;
        }

        if (step === "branch") {
            onBranchSelect?.(item);

            return;
        }

        if (step === "number") {
            onNumberSelect?.(item);
        }
    }


    /**
     * getCardTitle
     *
     * Description:
     * - Obtener el título visible de una tarjeta.
     */
    function getCardTitle(item) {
        if (step === "number") {
            return (
                item.display_name ||
                item.phone_number ||
                "Número de WhatsApp"
            );
        }

        return item.name || "Sin nombre";
    }


    /**
     * getCardSubtitle
     *
     * Description:
     * - Obtener información secundaria de una tarjeta.
     */
    function getCardSubtitle(item) {
        if (step === "company") {
            const branchCount =
                item.branches?.length || 0;

            return `${branchCount} ${
                branchCount === 1
                    ? "sucursal disponible"
                    : "sucursales disponibles"
            }`;
        }

        if (step === "branch") {
            const numberCount =
                item.numbers?.length || 0;

            return `${numberCount} ${
                numberCount === 1
                    ? "número disponible"
                    : "números disponibles"
            }`;
        }

        if (step === "number") {
            return item.phone_number || "";
        }

        return "";
    }


    /**
     * getCardInitial
     *
     * Description:
     * - Obtener la inicial utilizada en la representación visual.
     */
    function getCardInitial(item) {
        const label =
            step === "number"
                ? (
                    item.display_name ||
                    item.phone_number ||
                    "W"
                )
                : (
                    item.name ||
                    "C"
                );

        return label
            .charAt(0)
            .toUpperCase();
    }


    /**
     * getEmptyStateMessage
     *
     * Description:
     * - Obtener el mensaje vacío correspondiente al paso actual.
     */
    function getEmptyStateMessage() {
        if (step === "company") {
            return {
                title: "No existen empresas disponibles.",
                description: "Su usuario no tiene empresas disponibles para monitoreo.",
            };
        }

        if (step === "branch") {
            return {
                title: "No existen sucursales disponibles.",
                description: "La empresa seleccionada no contiene sucursales disponibles para monitoreo.",
            };
        }

        return {
            title: "No existen números disponibles.",
            description: "La sucursal seleccionada no contiene números de WhatsApp disponibles para monitoreo.",
        };
    }


    const stepInformation =
        getStepInformation();

    const availableItems =
        getAvailableItems();

    const emptyStateMessage =
        getEmptyStateMessage();


    return (
        <section className={styles.selection}>
            <header className={styles.header}>
                <div className={styles.headerMain}>
                    {step !== "company" && (
                        <button
                            className={styles.backButton}
                            type="button"
                            onClick={onBack}
                            aria-label="Regresar"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    )}

                    <div>
                        <span className={styles.eyebrow}>
                            {stepInformation.eyebrow}
                        </span>

                        <h2>
                            {stepInformation.title}
                        </h2>

                        <p>
                            {stepInformation.description}
                        </p>
                    </div>
                </div>

                <div
                    className={styles.progress}
                    aria-label="Progreso de selección"
                >
                    <span className={styles.progressActive}></span>

                    <span
                        className={
                            step === "branch" ||
                            step === "number"
                                ? styles.progressActive
                                : ""
                        }
                    ></span>

                    <span
                        className={
                            step === "number"
                                ? styles.progressActive
                                : ""
                        }
                    ></span>
                </div>
            </header>

            {step !== "company" && (
                <div className={styles.breadcrumb}>
                    {selectedCompany && (
                        <span>
                            {selectedCompany.name}
                        </span>
                    )}

                    {selectedBranch && step === "number" && (
                        <>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>

                            <span>
                                {selectedBranch.name}
                            </span>
                        </>
                    )}
                </div>
            )}

            {availableItems.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
                            <path d="M17 9h2a1 1 0 0 1 1 1v11" />
                            <path d="M2 21h20" />
                        </svg>
                    </div>

                    <strong>
                        {emptyStateMessage.title}
                    </strong>

                    <span>
                        {emptyStateMessage.description}
                    </span>
                </div>
            ) : (
                <div className={styles.cardGrid}>
                    {availableItems.map((item) => (
                        <button
                            key={item.id}
                            className={styles.card}
                            type="button"
                            onClick={() =>
                                handleItemClick(item)
                            }
                        >
                            <div className={styles.cardIcon}>
                                {getCardInitial(item)}
                            </div>

                            <div className={styles.cardContent}>
                                <strong>
                                    {getCardTitle(item)}
                                </strong>

                                <span>
                                    {getCardSubtitle(item)}
                                </span>
                            </div>

                            {step === "number" && (
                                <div className={styles.numberStatuses}>
                                    {item.is_connected && (
                                        <span className={styles.connectedBadge}>
                                            Conectado
                                        </span>
                                    )}

                                    {item.is_monitoring_enabled && (
                                        <span className={styles.monitoringBadge}>
                                            Monitoreando
                                        </span>
                                    )}
                                </div>
                            )}

                            <svg
                                className={styles.chevron}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}


export default MonitoringSelection;