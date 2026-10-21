import { useEffect, useRef, useState } from "react";

import AlertMessage from "../../components/common/AlertMessage/AlertMessage.jsx";
import PageHeader from "../../components/common/PageHeader/PageHeader.jsx";
import SectionTabs from "../../components/common/SectionTabs/SectionTabs.jsx";

import { getCompanies } from "../../services/organizations.js";

import NumberAssignmentPanel from "./components/NumberAssignmentPanel.jsx";
import TemplateManagement from "./components/TemplateManagement.jsx";
import WabaForm from "./components/WabaForm.jsx";
import WhatsAppNumberForm from "./components/WhatsAppNumberForm.jsx";

import styles from "./WhatsAppAdministrationPage.module.css";
import { usePageTranslation } from "../usePageTranslation.js";


/**
 * WhatsApp Administration Sections
 *
 * Description:
 * - Define the administrative sections available
 *   within the WhatsApp management workspace.
 *
 * Notes:
 * - Sections are translated when rendered.
 * - Section identifiers remain language-independent.
 */
const WHATSAPP_SECTIONS = [
    {
        id: "accounts",
        label: "Cuentas WABA",
    },
    {
        id: "numbers",
        label: "Números",
    },
    {
        id: "assignments",
        label: "Asignaciones",
    },
    {
        id: "templates",
        label: "Plantillas",
    },
];


/**
 * WhatsAppAdministrationPage
 *
 * Description:
 * - Provide the administrative workspace for WhatsApp.
 * - Manage WhatsApp resources within a selected company.
 * - Coordinate WABA, number, assignment, and template sections.
 * - Support Meta Embedded Signup through the WABA component.
 *
 * Notes:
 * - Every WhatsApp administrative operation belongs
 *   to an explicitly selected company.
 * - Company ownership is enforced by Django.
 * - WhatsApp Business Accounts belong to companies.
 * - WhatsApp numbers belong to companies and branches.
 * - Newly onboarded numbers may be registered under
 *   the company's default Principal branch.
 * - Meta Embedded Signup authorization is handled
 *   by WabaForm and the Django backend.
 * - WABA-specific credentials remain backend-managed.
 * - Access tokens and App Secrets never reach this page.
 * - Monitoring remains an independent operation.
 * - Conversations and messages belong to the
 *   monitoring workspace.
 */
function WhatsAppAdministrationPage() {
    const { t } = usePageTranslation();

    // ---------------------------------------------------------
    // Administrative navigation
    // ---------------------------------------------------------

    const [activeSection, setActiveSection] = useState(
        "accounts"
    );

    // ---------------------------------------------------------
    // Company context
    // ---------------------------------------------------------

    const [companies, setCompanies] = useState([]);

    const [
        selectedCompanyId,
        setSelectedCompanyId,
    ] = useState("");

    const [
        isLoadingCompanies,
        setIsLoadingCompanies,
    ] = useState(true);

    // ---------------------------------------------------------
    // Notifications
    // ---------------------------------------------------------

    const [errorMessage, setErrorMessage] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    // ---------------------------------------------------------
    // Request and context lifecycle
    // ---------------------------------------------------------

    const companyRequestRef = useRef(0);

    const contextVersionRef = useRef(0);

    const [
        contextVersion,
        setContextVersion,
    ] = useState(0);


    /**
     * clearMessages
     *
     * Description:
     * - Clear administrative error and success messages.
     */
    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }


    /**
     * invalidateContext
     *
     * Description:
     * - Invalidate notifications associated with
     *   the previous administrative context.
     *
     * Notes:
     * - Child components are remounted when the
     *   context version changes.
     * - Prevents old company operations from
     *   updating the current page notifications.
     */
    function invalidateContext() {
        contextVersionRef.current += 1;

        setContextVersion(
            contextVersionRef.current
        );

        clearMessages();
    }


    /**
     * handleError
     *
     * Description:
     * - Display an administrative error message.
     *
     * Notes:
     * - Empty messages clear the error state.
     */
    function handleError(message) {
        setErrorMessage(message || "");

        if (message) {
            setSuccessMessage("");
        }
    }


    /**
     * handleSuccess
     *
     * Description:
     * - Display an administrative success message.
     *
     * Notes:
     * - Empty messages clear the success state.
     */
    function handleSuccess(message) {
        setSuccessMessage(message || "");

        if (message) {
            setErrorMessage("");
        }
    }


    /**
     * loadCompanies
     *
     * Description:
     * - Retrieve companies available to the
     *   authenticated administrator.
     * - Preserve the selected company when possible.
     * - Select the first available company otherwise.
     *
     * Notes:
     * - Company authorization remains backend-authoritative.
     * - Stale requests are ignored.
     * - The frontend does not create companies here.
     */
    async function loadCompanies() {
        const requestId =
            ++companyRequestRef.current;

        setIsLoadingCompanies(true);
        setErrorMessage("");

        try {
            const response = await getCompanies();

            if (
                requestId !== companyRequestRef.current
            ) {
                return;
            }

            const companyList = Array.isArray(
                response?.data
            )
                ? response.data
                : [];

            setCompanies(companyList);

            setSelectedCompanyId(
                (currentCompanyId) => {
                    const companyExists =
                        companyList.some(
                            (company) =>
                                String(company.id) ===
                                String(currentCompanyId)
                        );

                    if (companyExists) {
                        return String(
                            currentCompanyId
                        );
                    }

                    return companyList.length > 0
                        ? String(
                            companyList[0].id
                        )
                        : "";
                }
            );

        } catch (error) {
            if (
                requestId !== companyRequestRef.current
            ) {
                return;
            }

            setCompanies([]);
            setSelectedCompanyId("");

            handleError(
                error.message ||
                t(
                    "No fue posible cargar las empresas."
                )
            );

        } finally {
            if (
                requestId === companyRequestRef.current
            ) {
                setIsLoadingCompanies(false);
            }
        }
    }


    /**
     * handleCompanyChange
     *
     * Description:
     * - Change the company used as the
     *   WhatsApp administrative context.
     *
     * Notes:
     * - Previous notifications are cleared.
     * - Child components are remounted.
     * - Company-specific resources are reloaded.
     * - The selected administrative section
     *   remains unchanged.
     */
    function handleCompanyChange(event) {
        const nextCompanyId =
            event.target.value;

        if (
            String(nextCompanyId) ===
            String(selectedCompanyId)
        ) {
            return;
        }

        invalidateContext();

        setSelectedCompanyId(
            nextCompanyId
        );
    }


    /**
     * handleSectionChange
     *
     * Description:
     * - Change the visible WhatsApp
     *   administrative section.
     *
     * Notes:
     * - Previous notifications are cleared.
     * - Section-specific state is reset.
     */
    function handleSectionChange(section) {
        if (section === activeSection) {
            return;
        }

        invalidateContext();

        setActiveSection(section);
    }


    /**
     * createContextHandlers
     *
     * Description:
     * - Create notification handlers bound
     *   to the current administrative context.
     *
     * Notes:
     * - Responses from obsolete child contexts
     *   cannot overwrite current notifications.
     */
    function createContextHandlers(version) {
        return {
            onError: (message) => {
                if (
                    version !==
                    contextVersionRef.current
                ) {
                    return;
                }

                handleError(message);
            },

            onSuccess: (message) => {
                if (
                    version !==
                    contextVersionRef.current
                ) {
                    return;
                }

                handleSuccess(message);
            },
        };
    }


    // ---------------------------------------------------------
    // Initial company loading
    // ---------------------------------------------------------

    useEffect(() => {
        loadCompanies();

        return () => {
            companyRequestRef.current += 1;
        };
    }, []);


    // ---------------------------------------------------------
    // Derived administrative context
    // ---------------------------------------------------------

    const selectedCompany = companies.find(
        (company) =>
            String(company.id) ===
            String(selectedCompanyId)
    );

    const hasCompanies =
        companies.length > 0;

    const hasSelectedCompany =
        Boolean(selectedCompanyId && selectedCompany);

    const contextKey = [
        selectedCompanyId,
        activeSection,
        contextVersion,
    ].join(":");

    const contextHandlers =
        createContextHandlers(
            contextVersion
        );


    return (
        <section
            className={
                styles.whatsappAdministrationPage
            }
        >
            {/* ---------------------------------------------- */}
            {/* PAGE HEADER                                    */}
            {/* ---------------------------------------------- */}

            <PageHeader
                eyebrow={t("Administración")}
                title="WhatsApp"
                description={t(
                    "Administre cuentas de WhatsApp Business, números corporativos, responsables y plantillas utilizadas por Dialoqo."
                )}
            />


            {/* ---------------------------------------------- */}
            {/* COMPANY CONTEXT                                */}
            {/* ---------------------------------------------- */}

            <div className={styles.contextBar}>
                <div className={styles.contextField}>
                    <label htmlFor="whatsapp-company">
                        {t("Empresa")}
                    </label>

                    <select
                        id="whatsapp-company"
                        value={selectedCompanyId}
                        onChange={
                            handleCompanyChange
                        }
                        disabled={
                            isLoadingCompanies ||
                            !hasCompanies
                        }
                    >
                        {!hasCompanies && (
                            <option value="">
                                {isLoadingCompanies
                                    ? t(
                                        "Cargando empresas..."
                                    )
                                    : t(
                                        "No existen empresas disponibles"
                                    )}
                            </option>
                        )}

                        {companies.map(
                            (company) => (
                                <option
                                    key={company.id}
                                    value={company.id}
                                >
                                    {company.name}
                                </option>
                            )
                        )}
                    </select>
                </div>
            </div>


            {/* ---------------------------------------------- */}
            {/* ADMINISTRATIVE NOTIFICATIONS                   */}
            {/* ---------------------------------------------- */}

            <AlertMessage
                message={errorMessage}
                type="error"
            />

            <AlertMessage
                message={successMessage}
                type="success"
            />


            {/* ---------------------------------------------- */}
            {/* ADMINISTRATIVE SECTIONS                        */}
            {/* ---------------------------------------------- */}

            <SectionTabs
                sections={
                    WHATSAPP_SECTIONS.map(
                        (section) => ({
                            ...section,
                            label: t(
                                section.label
                            ),
                        })
                    )
                }
                activeSection={activeSection}
                onChange={
                    handleSectionChange
                }
            />


            {/* ---------------------------------------------- */}
            {/* COMPANY LOADING STATE                          */}
            {/* ---------------------------------------------- */}

            {isLoadingCompanies ? (
                <section
                    className={
                        styles.emptyWorkspace
                    }
                >
                    <strong>
                        {t(
                            "Cargando empresas..."
                        )}
                    </strong>
                </section>

            ) : !hasSelectedCompany ? (

                /* ------------------------------------------ */
                /* EMPTY COMPANY STATE                        */
                /* ------------------------------------------ */

                <section
                    className={
                        styles.emptyWorkspace
                    }
                >
                    <div
                        className={
                            styles.emptyIcon
                        }
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
                            <path
                                d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"
                            />

                            <path
                                d="M17 9h2a1 1 0 0 1 1 1v11"
                            />

                            <path
                                d="M2 21h20"
                            />
                        </svg>
                    </div>

                    <strong>
                        {t(
                            "No existe una empresa seleccionada."
                        )}
                    </strong>

                    <span>
                        {t(
                            "Cree o seleccione una empresa antes de configurar WhatsApp."
                        )}
                    </span>
                </section>

            ) : (

                /* ------------------------------------------ */
                /* COMPANY WHATSAPP WORKSPACE                 */
                /* ------------------------------------------ */

                <>
                    {activeSection === "accounts" && (
                        <WabaForm
                            key={contextKey}
                            companyId={
                                selectedCompanyId
                            }
                            {...contextHandlers}
                        />
                    )}

                    {activeSection === "numbers" && (
                        <WhatsAppNumberForm
                            key={contextKey}
                            companyId={
                                selectedCompanyId
                            }
                            {...contextHandlers}
                        />
                    )}

                    {activeSection === "assignments" && (
                        <NumberAssignmentPanel
                            key={contextKey}
                            companyId={
                                selectedCompanyId
                            }
                            {...contextHandlers}
                        />
                    )}

                    {activeSection === "templates" && (
                        <TemplateManagement
                            key={contextKey}
                            companyId={
                                selectedCompanyId
                            }
                            {...contextHandlers}
                        />
                    )}
                </>
            )}
        </section>
    );
}

export default WhatsAppAdministrationPage;