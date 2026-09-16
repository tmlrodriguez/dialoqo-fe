import { useEffect, useState } from "react";

import AlertMessage from "../../../components/common/AlertMessage/AlertMessage.jsx";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";
import EntityList from "../../../components/common/EntityList/EntityList.jsx";
import EntityListItem from "../../../components/common/EntityList/EntityListItem.jsx";
import LoadingState from "../../../components/common/LoadingState/LoadingState.jsx";
import PageHeader from "../../../components/common/PageHeader/PageHeader.jsx";
import SectionTabs from "../../../components/common/SectionTabs/SectionTabs.jsx";

import {
    createBranch,
    createCompany,
    deactivateBranch,
    deactivateCompany,
    getBranches,
    getCompanies,
    updateBranch,
    updateCompany,
} from "../../../services/organizations.js";

import BranchForm from "./components/BranchForm.jsx";
import CompanyForm from "./components/CompanyForm.jsx";

import styles from "./OrganizationPage.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


const SECTIONS = [
    {
        value: "companies",
        label: "Empresas",
    },
    {
        value: "branches",
        label: "Sucursales",
    },
];


/**
 * OrganizationPage
 *
 * Description:
 * - Gestionar la estructura organizacional de Dialoqo.
 *
 * Notes:
 * - Permite administrar empresas y sucursales.
 */
function OrganizationPage() {
    const { t } = usePageTranslation();
    const [activeSection, setActiveSection] = useState("companies");

    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [companyCode, setCompanyCode] = useState("");
    const [companyDescription, setCompanyDescription] = useState("");

    const [branchCompanyId, setBranchCompanyId] = useState("");
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchName, setBranchName] = useState("");
    const [branchCode, setBranchCode] = useState("");
    const [branchDescription, setBranchDescription] = useState("");

    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    /**
     * clearMessages
     *
     * Description:
     * - Limpiar mensajes visibles de la página.
     */
    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }


    /**
     * resetCompanyForm
     *
     * Description:
     * - Restablecer el formulario de empresa.
     */
    function resetCompanyForm() {
        setSelectedCompany(null);
        setCompanyName("");
        setCompanyCode("");
        setCompanyDescription("");
    }


    /**
     * resetBranchForm
     *
     * Description:
     * - Restablecer el formulario de sucursal.
     */
    function resetBranchForm() {
        setSelectedBranch(null);
        setBranchName("");
        setBranchCode("");
        setBranchDescription("");
    }


    /**
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas administradas por el usuario.
     */
    async function loadCompanies() {
        setIsLoadingCompanies(true);
        setErrorMessage("");

        try {
            const response = await getCompanies();
            const companyList = response?.data || [];

            setCompanies(companyList);

            if (!branchCompanyId && companyList.length > 0) {
                setBranchCompanyId(String(companyList[0].id));
            }
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible cargar las empresas."));
        } finally {
            setIsLoadingCompanies(false);
        }
    }


    /**
     * loadBranches
     *
     * Description:
     * - Obtener las sucursales de una empresa.
     */
    async function loadBranches(companyId) {
        if (!companyId) {
            setBranches([]);
            return;
        }

        setIsLoadingBranches(true);
        setErrorMessage("");

        try {
            const response = await getBranches(companyId);

            setBranches(response?.data || []);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible cargar las sucursales."));
        } finally {
            setIsLoadingBranches(false);
        }
    }


    /**
     * handleSectionChange
     *
     * Description:
     * - Cambiar la sección organizacional visible.
     */
    function handleSectionChange(section) {
        setActiveSection(section);
        clearMessages();

        if (section === "companies") {
            resetCompanyForm();
        }

        if (section === "branches") {
            resetBranchForm();
        }
    }


    /**
     * handleSelectCompany
     *
     * Description:
     * - Seleccionar una empresa para edición.
     */
    function handleSelectCompany(company) {
        setSelectedCompany(company);
        setCompanyName(company.name || "");
        setCompanyCode(company.code || "");
        setCompanyDescription(company.description || "");

        clearMessages();
    }


    /**
     * handleCompanySubmit
     *
     * Description:
     * - Crear o actualizar una empresa.
     */
    async function handleCompanySubmit(event) {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        const companyData = {
            name: companyName.trim(),
            code: companyCode.trim(),
            description: companyDescription.trim(),
        };

        try {
            if (selectedCompany) {
                await updateCompany(selectedCompany.id, companyData);
                setSuccessMessage(t("Empresa actualizada correctamente."));
            } else {
                await createCompany(companyData);
                setSuccessMessage(t("Empresa creada correctamente."));
            }

            resetCompanyForm();

            await loadCompanies();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible guardar la empresa."));
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleDeactivateCompany
     *
     * Description:
     * - Desactivar la empresa seleccionada.
     */
    async function handleDeactivateCompany() {
        if (!selectedCompany || isDeleting) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea desactivar la empresa "${selectedCompany.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await deactivateCompany(selectedCompany.id);

            if (String(selectedCompany.id) === String(branchCompanyId)) {
                setBranchCompanyId("");
                setBranches([]);
                resetBranchForm();
            }

            resetCompanyForm();

            setSuccessMessage(t("Empresa desactivada correctamente."));

            await loadCompanies();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar la empresa."));
        } finally {
            setIsDeleting(false);
        }
    }


    /**
     * handleBranchCompanyChange
     *
     * Description:
     * - Cambiar la empresa utilizada para administrar sucursales.
     */
    function handleBranchCompanyChange(event) {
        setBranchCompanyId(event.target.value);
        resetBranchForm();
        clearMessages();
    }


    /**
     * handleSelectBranch
     *
     * Description:
     * - Seleccionar una sucursal para edición.
     */
    function handleSelectBranch(branch) {
        setSelectedBranch(branch);
        setBranchName(branch.name || "");
        setBranchCode(branch.code || "");
        setBranchDescription(branch.description || "");

        clearMessages();
    }


    /**
     * handleBranchSubmit
     *
     * Description:
     * - Crear o actualizar una sucursal.
     */
    async function handleBranchSubmit(event) {
        event.preventDefault();

        if (!branchCompanyId || isSaving) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        const branchData = {
            name: branchName.trim(),
            code: branchCode.trim(),
            description: branchDescription.trim(),
        };

        try {
            if (selectedBranch) {
                await updateBranch(
                    branchCompanyId,
                    selectedBranch.id,
                    branchData
                );

                setSuccessMessage(t("Sucursal actualizada correctamente."));
            } else {
                await createBranch(
                    branchCompanyId,
                    branchData
                );

                setSuccessMessage(t("Sucursal creada correctamente."));
            }

            resetBranchForm();

            await loadBranches(branchCompanyId);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible guardar la sucursal."));
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleDeactivateBranch
     *
     * Description:
     * - Desactivar la sucursal seleccionada.
     */
    async function handleDeactivateBranch() {
        if (!selectedBranch || !branchCompanyId || isDeleting) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea desactivar la sucursal "${selectedBranch.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await deactivateBranch(
                branchCompanyId,
                selectedBranch.id
            );

            resetBranchForm();

            setSuccessMessage(t("Sucursal desactivada correctamente."));

            await loadBranches(branchCompanyId);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar la sucursal."));
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (branchCompanyId) {
            loadBranches(branchCompanyId);
        } else {
            setBranches([]);
        }
    }, [branchCompanyId]);

    return (
        <section className={styles.organizationPage}>
            <PageHeader
                eyebrow={t("Administración")}
                title={t("Organización")}
                description={t("Administre las empresas y sucursales registradas en Dialoqo.")}
            />

            <SectionTabs
                sections={SECTIONS.map((section) => ({ ...section, label: t(section.label) }))}
                activeSection={activeSection}
                onChange={handleSectionChange}
            />

            <AlertMessage
                message={errorMessage}
                type="error"
            />

            <AlertMessage
                message={successMessage}
                type="success"
            />

            {activeSection === "companies" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Empresas")}</h2>
                                <p>{t("Empresas activas administradas por su usuario.")}</p>
                            </div>

                            <button
                                className={styles.secondaryButton}
                                type="button"
                                onClick={resetCompanyForm}
                            >
                                {t("Nueva empresa")}
                            </button>
                        </div>

                        {isLoadingCompanies ? (
                            <LoadingState message={t("Cargando empresas...")} />
                        ) : companies.length === 0 ? (
                            <EmptyState
                                icon="▦"
                                title={t("No existen empresas registradas.")}
                                description={t("Cree la primera empresa para comenzar a configurar Dialoqo.")}
                            />
                        ) : (
                            <EntityList>
                                {companies.map((company) => (
                                    <EntityListItem
                                        key={company.id}
                                        title={company.name}
                                        subtitle={company.code}
                                        initial={(company.name || "E").charAt(0).toUpperCase()}
                                        status={t("Activa")}
                                        isActive={selectedCompany?.id === company.id}
                                        onClick={() => handleSelectCompany(company)}
                                    />
                                ))}
                            </EntityList>
                        )}
                    </section>

                    <CompanyForm
                        selectedCompany={selectedCompany}
                        name={companyName}
                        code={companyCode}
                        description={companyDescription}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        onNameChange={(event) => setCompanyName(event.target.value)}
                        onCodeChange={(event) => setCompanyCode(event.target.value)}
                        onDescriptionChange={(event) => setCompanyDescription(event.target.value)}
                        onSubmit={handleCompanySubmit}
                        onReset={resetCompanyForm}
                        onDeactivate={handleDeactivateCompany}
                    />
                </div>
            )}

            {activeSection === "branches" && (
                <>
                    <div className={styles.contextBar}>
                        <div className={styles.contextField}>
                            <label htmlFor="branch-company">
                                {t("Empresa")}
                            </label>

                            <select
                                id="branch-company"
                                value={branchCompanyId}
                                onChange={handleBranchCompanyChange}
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

                    <div className={styles.workspace}>
                        <section className={styles.listPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>{t("Sucursales")}</h2>
                                    <p>{t("Sucursales activas de la empresa seleccionada.")}</p>
                                </div>

                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={resetBranchForm}
                                    disabled={!branchCompanyId}
                                >
                                    {t("Nueva sucursal")}
                                </button>
                            </div>

                            {!branchCompanyId ? (
                                <EmptyState
                                    icon="⌂"
                                    title={t("Seleccione una empresa.")}
                                    description={t("Debe seleccionar una empresa antes de administrar sus sucursales.")}
                                />
                            ) : isLoadingBranches ? (
                                <LoadingState message={t("Cargando sucursales...")} />
                            ) : branches.length === 0 ? (
                                <EmptyState
                                    icon="⌂"
                                    title={t("No existen sucursales registradas.")}
                                    description={t("Cree la primera sucursal para la empresa seleccionada.")}
                                />
                            ) : (
                                <EntityList>
                                    {branches.map((branch) => (
                                        <EntityListItem
                                            key={branch.id}
                                            title={branch.name}
                                            subtitle={branch.code}
                                            initial={(branch.name || "S").charAt(0).toUpperCase()}
                                            status={t("Activa")}
                                            isActive={selectedBranch?.id === branch.id}
                                            onClick={() => handleSelectBranch(branch)}
                                        />
                                    ))}
                                </EntityList>
                            )}
                        </section>

                        <BranchForm
                            selectedBranch={selectedBranch}
                            companyId={branchCompanyId}
                            name={branchName}
                            code={branchCode}
                            description={branchDescription}
                            isSaving={isSaving}
                            isDeleting={isDeleting}
                            onNameChange={(event) => setBranchName(event.target.value)}
                            onCodeChange={(event) => setBranchCode(event.target.value)}
                            onDescriptionChange={(event) => setBranchDescription(event.target.value)}
                            onSubmit={handleBranchSubmit}
                            onReset={resetBranchForm}
                            onDeactivate={handleDeactivateBranch}
                        />
                    </div>
                </>
            )}
        </section>
    );
}

export default OrganizationPage;
