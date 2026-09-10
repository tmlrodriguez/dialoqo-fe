import { useEffect, useState } from "react";
import AlertMessage from "../../components/common/AlertMessage/AlertMessage.jsx";
import PageHeader from "../../components/common/PageHeader/PageHeader.jsx";
import SectionTabs from "../../components/common/SectionTabs/SectionTabs.jsx";
import MetaIntegrationForm from "./components/MetaIntegrationForm.jsx";
import WabaForm from "./components/WabaForm.jsx";
import WhatsAppNumberForm from "./components/WhatsAppNumberForm.jsx";
import NumberAssignmentPanel from "./components/NumberAssignmentPanel.jsx";
import TemplateManagement from "./components/TemplateManagement.jsx";
import { getCompanies } from "../../services/organizations.js";
import styles from "./WhatsAppAdministrationPage.module.css";


const WHATSAPP_SECTIONS = [
    {
        id: "integrations",
        label: "Integraciones",
    },
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
 * - Proporcionar la interfaz administrativa de configuración de WhatsApp.
 *
 * Notes:
 * - La administración se ejecuta dentro del contexto de una empresa.
 * - Integra configuración de Meta, WABA, números, asignaciones y plantillas.
 * - Las conversaciones y mensajes pertenecen a la interfaz MONITOR y no se
 *   administran desde esta página.
 */
function WhatsAppAdministrationPage() {
    const [activeSection, setActiveSection] = useState("integrations");

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
                const companyExists = companyList.some(
                    (company) => String(company.id) === String(currentCompanyId)
                );

                if (companyExists) {
                    return currentCompanyId;
                }

                if (companyList.length > 0) {
                    return String(companyList[0].id);
                }

                return "";
            });
        } catch (error) {
            setCompanies([]);
            setSelectedCompanyId("");

            setErrorMessage(
                error.message ||
                "No fue posible cargar las empresas."
            );
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
     * - Los componentes internos recargarán sus recursos cuando cambie
     *   selectedCompanyId.
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
                eyebrow="Administración"
                title="WhatsApp"
                description="Configure las integraciones de Meta, cuentas de WhatsApp Business, números corporativos, responsables y plantillas utilizadas por Dialoqo."
            />

            <div className={styles.contextBar}>
                <div className={styles.contextField}>
                    <label htmlFor="whatsapp-company">
                        Empresa
                    </label>

                    <select
                        id="whatsapp-company"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                        disabled={
                            isLoadingCompanies ||
                            companies.length === 0
                        }
                    >
                        {companies.length === 0 && (
                            <option value="">
                                No existen empresas disponibles
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
                sections={WHATSAPP_SECTIONS}
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
                        No existe una empresa seleccionada.
                    </strong>

                    <span>
                        Cree o seleccione una empresa antes de configurar WhatsApp.
                    </span>
                </section>
            ) : (
                <>
                    {activeSection === "integrations" && (
                        <MetaIntegrationForm
                            companyId={selectedCompanyId}
                            onError={setErrorMessage}
                            onSuccess={setSuccessMessage}
                        />
                    )}
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