import { useMemo, useState } from "react";

import AlertMessage from "../../../components/common/feedback/AlertMessage/AlertMessage.jsx";
import PageHeader from "../../../components/common/layout/PageHeader/PageHeader.jsx";
import Page from "../../../components/common/layout/Page/Page.jsx";
import MonitoringView from "../../../components/monitoring/sections/MonitoringView/MonitoringView.jsx";
import {
    getAvailableNumberContexts,
    hydrateMonitorNumberAssignments,
} from "../../../data/monitoringContext.js";
import { useAuth } from "../../../hooks/useAuth.js";
import { usePageTranslation } from "../../../hooks/usePageTranslation.js";

import { useRequestGuard } from "../../../hooks/useRequestGuard.js";
import { useResourceLifecycle } from "../../../hooks/useResourceLifecycle.js";
import { getMonitoringContext } from "../../../services/monitoring.js";

import styles from "./MonitoringPage.module.css";

/**
 * MonitoringPage
 *
 * Description:
 * - Proporcionar conversaciones de solo consulta para MONITOR y MEMBER.
 *
 * Notes:
 * - Los MONITOR navegan empresa → sucursal → número y consultan conversaciones sin capacidad de envío.
 * - Los MEMBER consultan las conversaciones de sus números asignados sin capacidad de envío.
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

    const loadMonitoringContextGuard = useRequestGuard(JSON.stringify([user?.id, user?.role]));

    const isMember = user?.role === "MEMBER";
    // El envío y las conversaciones nuevas se habilitarán en una entrega posterior.
    const canSendMessages = false;
    const canStartConversations = false;

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
        const isCurrentRequest = loadMonitoringContextGuard.begin();
        setIsLoadingContext(true);
        setErrorMessage("");

        try {
            const response = await getMonitoringContext();
            if (!isCurrentRequest()) return;
            const companyList = response?.data || [];
            const hydratedCompanyList = await hydrateMonitorNumberAssignments(
                companyList,
                user?.role,
            );
            if (!isCurrentRequest()) return;

            setCompanies(hydratedCompanyList);
            applyInitialContext(hydratedCompanyList);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setCompanies([]);
            setSelectedCompany(null);
            setSelectedBranch(null);
            setSelectedNumber(null);
            setMonitoringStep("company");
            setErrorMessage(
                error.message || t("No fue posible cargar el contexto de conversaciones."),
            );
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingContext(false);
            }
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

    const availableNumberContexts = useMemo(
        () => getAvailableNumberContexts(companies),
        [companies],
    );
    const canChangeNumber = !isMember || availableNumberContexts.length > 1;

    useResourceLifecycle(
        () => {
            loadMonitoringContext();
        },
        JSON.stringify([user?.id, user?.role]),
    );

    return (
        <Page
            as="section"
            title={isMember ? t("Mis conversaciones") : t("Monitoreo")}
            className={`${styles.monitoringPage} ${monitoringStep === "workspace" ? styles.monitoringPageWorkspace : ""}`}
        >
            {monitoringStep !== "workspace" && (
                <PageHeader
                    eyebrow={t("Monitoreo")}
                    title={isMember ? t("Mis conversaciones") : t("Monitoreo")}
                    description={t("Seleccione el canal de WhatsApp que desea supervisar.")}
                />
            )}

            <AlertMessage message={errorMessage} type="error" />
            <AlertMessage message={successMessage} type="success" />

            <MonitoringView
                isLoadingContext={isLoadingContext}
                t={t}
                companies={companies}
                isMember={isMember}
                monitoringStep={monitoringStep}
                selectedCompany={selectedCompany}
                selectedBranch={selectedBranch}
                selectedNumber={selectedNumber}
                canSendMessages={canSendMessages}
                canStartConversations={canStartConversations}
                canChangeNumber={canChangeNumber}
                handleChangeNumber={handleChangeNumber}
                setErrorMessage={setErrorMessage}
                handleCompanySelect={handleCompanySelect}
                handleBranchSelect={handleBranchSelect}
                handleNumberSelect={handleNumberSelect}
                handleSelectionBack={handleSelectionBack}
            />
        </Page>
    );
}

export default MonitoringPage;
