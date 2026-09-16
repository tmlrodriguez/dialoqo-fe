import { useEffect, useState } from "react";

import AlertMessage from "../../components/common/AlertMessage/AlertMessage.jsx";
import PageHeader from "../../components/common/PageHeader/PageHeader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getConversations, getMonitoringContext } from "../../services/monitoring.js";

import MonitoringSelection from "./components/MonitoringSelection.jsx";
import MonitoringWorkspace from "./components/MonitoringWorkspace.jsx";

import styles from "./MonitoringPage.module.css";
import { usePageTranslation } from "../usePageTranslation.js";


/**
 * MonitoringPage
 *
 * Description:
 * - Proporcionar el flujo de monitoreo para MONITOR y el workspace operativo para MEMBER.
 *
 * Notes:
 * - Los MONITOR navegan empresa → sucursal → número y consultan conversaciones sin capacidad de envío.
 * - Los MEMBER pueden enviar mensajes y utilizar plantillas dentro de sus números asignados.
 * - Cuando un MEMBER dispone de un único número autorizado, ingresa directamente a sus conversaciones.
 * - MONITOR nunca omite la selección jerárquica, incluso cuando exista un único recurso disponible.
 * - Los recursos disponibles son determinados exclusivamente por el backend.
 */
function MonitoringPage() {
    const { t } = usePageTranslation();
    const { user } = useAuth();

    const [companies, setCompanies] = useState([]);
    const [monitoringStep, setMonitoringStep] = useState("company");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const isMember = user?.role === "MEMBER";
    const canSendMessages = isMember;
    const canStartConversations = isMember;


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
     * getAvailableNumberContexts
     *
     * Description:
     * - Obtener todas las combinaciones empresa, sucursal y número entregadas por el backend.
     *
     * Notes:
     * - Para MEMBER el backend debe devolver exclusivamente números asignados al usuario autenticado.
     */
    function getAvailableNumberContexts(companyList) {
        return companyList.flatMap((company) =>
            (company.branches || []).flatMap((branch) =>
                (branch.numbers || []).map((number) => ({ company, branch, number }))
            )
        );
    }


    /**
     * hydrateMonitorNumberAssignments
     *
     * Description:
     * - Completar el responsable visible de cada número cuando el contexto de monitoreo no incluye current_assignment.
     *
     * Notes:
     * - Utiliza exclusivamente el endpoint de conversaciones ya autorizado para MONITOR.
     * - No concede permisos adicionales ni consulta endpoints administrativos.
     * - El backend continúa siendo la autoridad de acceso.
     * - Si un número todavía no tiene conversaciones, conserva el snapshot recibido por monitoring/context.
     */
    async function hydrateMonitorNumberAssignments(companyList) {
        if (user?.role !== "MONITOR") {
            return companyList;
        }

        const clonedCompanies = companyList.map((company) => ({
            ...company,
            branches: (company.branches || []).map((branch) => ({
                ...branch,
                numbers: (branch.numbers || []).map((number) => ({ ...number })),
            })),
        }));

        const numberContexts = getAvailableNumberContexts(clonedCompanies);

        await Promise.all(numberContexts.map(async ({ company, branch, number }) => {
            const hasAssignment = Boolean(
                number?.current_assignment?.member ||
                number?.assignment?.member ||
                number?.active_assignment?.member ||
                number?.assigned_member ||
                number?.responsible_member ||
                number?.current_member ||
                number?.responsible
            );

            if (hasAssignment) {
                return;
            }

            try {
                const response = await getConversations(company.id, branch.id, number.id, { ordering: "-last_message_at", page: 1, pageSize: 1 });
                const firstConversation = response?.data?.results?.[0];

                if (firstConversation?.current_assignment?.member) {
                    number.current_assignment = firstConversation.current_assignment;
                }
            } catch {
                // La carga principal de monitoreo no debe fallar por una hidratación visual opcional.
            }
        }));

        return clonedCompanies;
    }


    /**
     * applyInitialContext
     *
     * Description:
     * - Determinar el contexto inicial después de obtener los recursos autorizados.
     *
     * Notes:
     * - MEMBER abre automáticamente su único número cuando solo existe una asignación disponible.
     * - Cuando existen varios números autorizados se conserva la selección progresiva.
     */
    function applyInitialContext(companyList) {
        const numberContexts = getAvailableNumberContexts(companyList);

        if (isMember && numberContexts.length === 1) {
            const context = numberContexts[0];

            setSelectedCompany(context.company);
            setSelectedBranch(context.branch);
            setSelectedNumber(context.number);
            setMonitoringStep("workspace");
            return;
        }

        setMonitoringStep("company");
        setSelectedCompany(null);
        setSelectedBranch(null);
        setSelectedNumber(null);
    }


    /**
     * loadMonitoringContext
     *
     * Description:
     * - Obtener el contexto de conversaciones autorizado para el usuario autenticado.
     */
    async function loadMonitoringContext() {
        setIsLoadingContext(true);
        setErrorMessage("");

        try {
            const response = await getMonitoringContext();
            const companyList = response?.data || [];
            const hydratedCompanyList = await hydrateMonitorNumberAssignments(companyList);

            setCompanies(hydratedCompanyList);
            applyInitialContext(hydratedCompanyList);
        } catch (error) {
            setCompanies([]);
            setSelectedCompany(null);
            setSelectedBranch(null);
            setSelectedNumber(null);
            setMonitoringStep("company");
            setErrorMessage(error.message || t("No fue posible cargar el contexto de conversaciones."));
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
     * - Seleccionar un número y abrir el workspace de conversaciones.
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
     * - Salir del workspace y regresar a la selección de números autorizados.
     */
    function handleChangeNumber() {
        clearMessages();
        setSelectedNumber(null);
        setMonitoringStep("number");
    }


    const availableNumberContexts = getAvailableNumberContexts(companies);
    const canChangeNumber = !isMember || availableNumberContexts.length > 1;


    useEffect(() => {
        loadMonitoringContext();
    }, [user?.id, user?.role]);


    return (
        <section className={`${styles.monitoringPage} ${monitoringStep === "workspace" ? styles.monitoringPageWorkspace : ""}`}>
            {monitoringStep !== "workspace" && (
                <PageHeader
                    eyebrow={isMember ? t("Operación") : t("Monitoreo")}
                    title={isMember ? "Mis conversaciones" : t("Monitoreo")}
                    description={
                        isMember
                            ? t("Seleccione uno de sus números asignados para atender conversaciones.")
                            : t("Seleccione el canal de WhatsApp que desea supervisar.")
                    }
                />
            )}

            <AlertMessage message={errorMessage} type="error" />
            <AlertMessage message={successMessage} type="success" />

            {isLoadingContext ? (
                <section className={styles.loadingWorkspace}>
                    <div className={styles.loadingIndicator}>
                        <span></span>
                    </div>

                    <strong>{t("Cargando contexto de conversaciones...")}</strong>
                    <span>{t("Estamos obteniendo los canales autorizados para su usuario.")}</span>
                </section>
            ) : companies.length === 0 ? (
                <section className={styles.emptyWorkspace}>
                    <div className={styles.emptyIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
                            <path d="M17 9h2a1 1 0 0 1 1 1v11" />
                            <path d="M2 21h20" />
                        </svg>
                    </div>

                    <strong>{t("No existen conversaciones disponibles.")}</strong>
                    <span>
                        {isMember
                            ? t("Su usuario todavía no tiene ningún número de WhatsApp asignado.")
                            : t("Su usuario todavía no tiene acceso a empresas con canales de monitoreo disponibles.")}
                    </span>
                </section>
            ) : monitoringStep === "workspace" && selectedCompany && selectedBranch && selectedNumber ? (
                <MonitoringWorkspace
                    company={selectedCompany}
                    branch={selectedBranch}
                    number={selectedNumber}
                    canSendMessages={canSendMessages}
                    canStartConversations={canStartConversations}
                    onChangeNumber={canChangeNumber ? handleChangeNumber : null}
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
