import { useEffect, useState } from "react";

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
 * - Proporcionar la interfaz administrativa de configuración de WhatsApp para una empresa.
 *
 * Notes:
 * - La administración se ejecuta siempre dentro del contexto de una empresa.
 * - Las cuentas WABA pertenecen directamente a la empresa.
 * - Los números, asignaciones y plantillas permanecen segregados por empresa.
 * - La Meta App y sus credenciales pertenecen globalmente a Dialoqo.
 * - No existe una integración Meta independiente por empresa.
 * - Las conversaciones y mensajes pertenecen a la interfaz de monitoreo y no se administran desde esta página.
 */
function WhatsAppAdministrationPage() {
    const { t } = usePageTranslation();
    const [activeSection, setActiveSection] = useState("accounts");

    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");

    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

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
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas administradas por el usuario autenticado.
     *
     * Notes:
     * - Selecciona automáticamente la primera empresa disponible.
     */
    async function loadCompanies() {
        setIsLoadingCompanies(true);
        setErrorMessage("");

        try {
            const response = await getCompanies();
            const companyList = response?.data || [];

            setCompanies(companyList);

            setSelectedCompanyId((currentCompanyId) => {
                const companyExists = companyList.some((company) => String(company.id) === String(currentCompanyId));

                if (companyExists) {
                    return currentCompanyId;
                }

                return companyList.length > 0 ? String(companyList[0].id) : "";
            });
        } catch (error) {
            setCompanies([]);
            setSelectedCompanyId("");
            setErrorMessage(error.message || t("No fue posible cargar las empresas."));
        } finally {
            setIsLoadingCompanies(false);
        }
    }


    /**
     * handleCompanyChange
     *
     * Description:
     * - Cambiar la empresa utilizada como contexto administrativo de WhatsApp.
     *
     * Notes:
     * - Cada componente interno recarga sus recursos cuando cambia selectedCompanyId.
     */
    function handleCompanyChange(event) {
        clearMessages();
        setSelectedCompanyId(event.target.value);
    }


    /**
     * handleSectionChange
     *
     * Description:
     * - Cambiar la sección administrativa visible.
     */
    function handleSectionChange(section) {
        clearMessages();
        setActiveSection(section);
    }


    useEffect(() => {
        loadCompanies();
    }, []);


    return (
        <section className={styles.whatsappAdministrationPage}>
            <PageHeader
                eyebrow={t("Administración")}
                title="WhatsApp"
                description={t("Administre cuentas de WhatsApp Business, números corporativos, responsables y plantillas utilizadas por Dialoqo.")}
            />

            <div className={styles.contextBar}>
                <div className={styles.contextField}>
                    <label htmlFor="whatsapp-company">
                        {t("Empresa")}
                    </label>

                    <select
                        id="whatsapp-company"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                        disabled={isLoadingCompanies || companies.length === 0}
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
            </div>

            <AlertMessage
                message={errorMessage}
                type="error"
            />

            <AlertMessage
                message={successMessage}
                type="success"
            />

            <SectionTabs
                sections={WHATSAPP_SECTIONS.map((section) => ({ ...section, label: t(section.label) }))}
                activeSection={activeSection}
                onChange={handleSectionChange}
            />

            {!selectedCompanyId ? (
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
                        {t("No existe una empresa seleccionada.")}
                    </strong>

                    <span>
                        {t("Cree o seleccione una empresa antes de configurar WhatsApp.")}
                    </span>
                </section>
            ) : (
                <>
                    {activeSection === "accounts" && (
                        <WabaForm
                            companyId={selectedCompanyId}
                            onError={setErrorMessage}
                            onSuccess={setSuccessMessage}
                        />
                    )}

                    {activeSection === "numbers" && (
                        <WhatsAppNumberForm
                            companyId={selectedCompanyId}
                            onError={setErrorMessage}
                            onSuccess={setSuccessMessage}
                        />
                    )}

                    {activeSection === "assignments" && (
                        <NumberAssignmentPanel
                            companyId={selectedCompanyId}
                            onError={setErrorMessage}
                            onSuccess={setSuccessMessage}
                        />
                    )}

                    {activeSection === "templates" && (
                        <TemplateManagement
                            companyId={selectedCompanyId}
                            onError={setErrorMessage}
                            onSuccess={setSuccessMessage}
                        />
                    )}
                </>
            )}
        </section>
    );
}

export default WhatsAppAdministrationPage;
