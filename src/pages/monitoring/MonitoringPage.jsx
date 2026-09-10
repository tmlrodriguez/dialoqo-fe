import { useEffect, useState } from "react";

import AlertMessage from "../../components/common/AlertMessage/AlertMessage.jsx";
import PageHeader from "../../components/common/PageHeader/PageHeader.jsx";

import {
    getMonitoringContext,
} from "../../services/monitoring.js";

import MonitoringSelection from "./components/MonitoringSelection.jsx";
import MonitoringWorkspace from "./components/MonitoringWorkspace.jsx";

import styles from "./MonitoringPage.module.css";


/**
 * MonitoringPage
 *
 * Description:
 * - Proporcionar la interfaz operacional principal para usuarios MONITOR.
 *
 * Notes:
 * - La selección del contexto utiliza una navegación progresiva.
 * - El flujo de selección es empresa, sucursal y número.
 * - Una vez seleccionado el número se muestra el workspace completo.
 * - Los recursos disponibles son determinados exclusivamente por el backend.
 */
function MonitoringPage() {
    const [companies, setCompanies] = useState([]);

    const [monitoringStep, setMonitoringStep] = useState("company");

    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedNumber, setSelectedNumber] = useState(null);

    const [isLoadingContext, setIsLoadingContext] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    /**
     * clearMessages
     *
     * Description:
     * - Limpiar los mensajes visibles de la interfaz.
     */
    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }


    /**
     * loadMonitoringContext
     *
     * Description:
     * - Obtener el contexto autorizado del monitor autenticado.
     */
    async function loadMonitoringContext() {
        setIsLoadingContext(true);
        setErrorMessage("");

        try {
            const response = await getMonitoringContext();
            const companyList = response?.data || [];

            setCompanies(companyList);

            setMonitoringStep("company");
            setSelectedCompany(null);
            setSelectedBranch(null);
            setSelectedNumber(null);
        } catch (error) {
            setCompanies([]);

            setSelectedCompany(null);
            setSelectedBranch(null);
            setSelectedNumber(null);

            setErrorMessage(
                error.message ||
                "No fue posible cargar el contexto de monitoreo."
            );
        } finally {
            setIsLoadingContext(false);
        }
    }


    /**
     * handleCompanySelect
     *
     * Description:
     * - Seleccionar una empresa y avanzar a la selección de sucursal.
     */
    function handleCompanySelect(company) {
        clearMessages();

        setSelectedCompany(company);
        setSelectedBranch(null);
        setSelectedNumber(null);

        setMonitoringStep("branch");
    }


    /**
     * handleBranchSelect
     *
     * Description:
     * - Seleccionar una sucursal y avanzar a la selección de número.
     */
    function handleBranchSelect(branch) {
        clearMessages();

        setSelectedBranch(branch);
        setSelectedNumber(null);

        setMonitoringStep("number");
    }


    /**
     * handleNumberSelect
     *
     * Description:
     * - Seleccionar un número y abrir el workspace operativo.
     */
    function handleNumberSelect(number) {
        clearMessages();

        setSelectedNumber(number);
        setMonitoringStep("workspace");
    }


    /**
     * handleSelectionBack
     *
     * Description:
     * - Regresar un nivel dentro de la selección progresiva.
     */
    function handleSelectionBack() {
        clearMessages();

        if (monitoringStep === "branch") {
            setSelectedCompany(null);
            setSelectedBranch(null);
            setSelectedNumber(null);

            setMonitoringStep("company");

            return;
        }

        if (monitoringStep === "number") {
            setSelectedBranch(null);
            setSelectedNumber(null);

            setMonitoringStep("branch");
        }
    }


    /**
     * handleChangeNumber
     *
     * Description:
     * - Salir del workspace y regresar a la selección de números.
     */
    function handleChangeNumber() {
        clearMessages();

        setSelectedNumber(null);

        setMonitoringStep("number");
    }


    useEffect(() => {
        loadMonitoringContext();
    }, []);


    return (
        <section
            className={`${styles.monitoringPage} ${
                monitoringStep === "workspace"
                    ? styles.monitoringPageWorkspace
                    : ""
            }`}
        >
            {monitoringStep !== "workspace" && (
                <PageHeader
                    eyebrow="Operación"
                    title="Monitoreo"
                    description="Seleccione el canal de WhatsApp que desea supervisar."
                />
            )}

            <AlertMessage
                message={errorMessage}
                type="error"
            />

            <AlertMessage
                message={successMessage}
                type="success"
            />

            {isLoadingContext ? (
                <section className={styles.loadingWorkspace}>
                    <div className={styles.loadingIndicator}>
                        <span></span>
                    </div>

                    <strong>
                        Cargando contexto de monitoreo...
                    </strong>

                    <span>
                        Estamos obteniendo las empresas y canales autorizados para su usuario.
                    </span>
                </section>
            ) : companies.length === 0 ? (
                <section className={styles.emptyWorkspace}>
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
                        No existen empresas disponibles.
                    </strong>

                    <span>
                        Su usuario todavía no tiene acceso a ninguna empresa con canales de monitoreo disponibles.
                    </span>
                </section>
            ) : monitoringStep === "workspace" && selectedCompany && selectedBranch && selectedNumber ? (
                <MonitoringWorkspace
                    company={selectedCompany}
                    branch={selectedBranch}
                    number={selectedNumber}
                    onChangeNumber={handleChangeNumber}
                    onError={setErrorMessage}
                />
            ) : (
                <MonitoringSelection
                    step={monitoringStep}
                    companies={companies}
                    selectedCompany={selectedCompany}
                    selectedBranch={selectedBranch}
                    onCompanySelect={handleCompanySelect}
                    onBranchSelect={handleBranchSelect}
                    onNumberSelect={handleNumberSelect}
                    onBack={handleSelectionBack}
                />
            )}
        </section>
    );
}

export default MonitoringPage;