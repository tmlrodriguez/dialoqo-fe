import { useState } from "react";

import AlertMessage from "../../../../components/common/feedback/AlertMessage/AlertMessage.jsx";
import SectionTabs from "../../../../components/common/navigation/SectionTabs/SectionTabs.jsx";
import Page from "../../../../components/common/layout/Page/Page.jsx";
import OrganizationBranchesSection from "../../../../components/organization/sections/OrganizationBranchesSection/OrganizationBranchesSection.jsx";
import OrganizationCompaniesSection from "../../../../components/organization/sections/OrganizationCompaniesSection/OrganizationCompaniesSection.jsx";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";
import { useRequestGuard } from "../../../../hooks/useRequestGuard.js";
import { useResourceLifecycle } from "../../../../hooks/useResourceLifecycle.js";
import {
    createBranch,
    createCompany,
    deactivateBranch,
    deactivateCompany,
    getBranches,
    getCompanies,
    updateBranch,
    updateCompany,
} from "../../../../services/organizations.js";

import styles from "./OrganizationPage.module.css";

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
    const [companyFormVersion, setCompanyFormVersion] = useState(0);
    const [branchFormVersion, setBranchFormVersion] = useState(0);
    const [activeSection, setActiveSection] = useState("companies");

    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [branchCompanyId, setBranchCompanyId] = useState("");
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const loadCompaniesGuard = useRequestGuard("companies");
    const loadBranchesGuard = useRequestGuard(branchCompanyId);

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
        setCompanyFormVersion((current) => current + 1);
    }

    /**
     * resetBranchForm
     *
     * Description:
     * - Restablecer el formulario de sucursal.
     */
    function resetBranchForm() {
        setSelectedBranch(null);
        setBranchFormVersion((current) => current + 1);
    }

    /**
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas administradas por el usuario.
     */
    async function loadCompanies() {
        const isCurrentRequest = loadCompaniesGuard.begin();
        setIsLoadingCompanies(true);
        setErrorMessage("");

        try {
            const response = await getCompanies();
            if (!isCurrentRequest()) return;
            const companyList = response?.data || [];

            setCompanies(companyList);

            if (!branchCompanyId && companyList.length > 0) {
                setBranchCompanyId(String(companyList[0].id));
            }
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || t("No fue posible cargar las empresas."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingCompanies(false);
            }
        }
    }

    /**
     * loadBranches
     *
     * Description:
     * - Obtener las sucursales de una empresa.
     */
    async function loadBranches(companyId) {
        const isCurrentRequest = loadBranchesGuard.begin();
        if (!companyId) {
            setBranches([]);
            return;
        }

        setIsLoadingBranches(true);
        setErrorMessage("");

        try {
            const response = await getBranches(companyId);
            if (!isCurrentRequest()) return;

            setBranches(response?.data || []);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || t("No fue posible cargar las sucursales."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingBranches(false);
            }
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
        setCompanyFormVersion((current) => current + 1);

        clearMessages();
    }

    /**
     * handleCompanySubmit
     *
     * Description:
     * - Crear o actualizar una empresa.
     */
    async function handleCompanySubmit({
        name: companyName,
        code: companyCode,
        description: companyDescription,
    }) {
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

        const confirmed = window.confirm(`¿Desea desactivar la empresa "${selectedCompany.name}"?`);

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
        setBranchFormVersion((current) => current + 1);

        clearMessages();
    }

    /**
     * handleBranchSubmit
     *
     * Description:
     * - Crear o actualizar una sucursal.
     */
    async function handleBranchSubmit({
        name: branchName,
        code: branchCode,
        description: branchDescription,
    }) {
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
                await updateBranch(branchCompanyId, selectedBranch.id, branchData);

                setSuccessMessage(t("Sucursal actualizada correctamente."));
            } else {
                await createBranch(branchCompanyId, branchData);

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

        const confirmed = window.confirm(`¿Desea desactivar la sucursal "${selectedBranch.name}"?`);

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await deactivateBranch(branchCompanyId, selectedBranch.id);

            resetBranchForm();

            setSuccessMessage(t("Sucursal desactivada correctamente."));

            await loadBranches(branchCompanyId);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar la sucursal."));
        } finally {
            setIsDeleting(false);
        }
    }

    useResourceLifecycle(() => {
        loadCompanies();
    }, JSON.stringify([]));

    useResourceLifecycle(
        () => {
            if (branchCompanyId) {
                loadBranches(branchCompanyId);
            } else {
                setBranches([]);
            }
        },
        JSON.stringify([branchCompanyId]),
    );

    return (
        <Page
            as="section"
            title={t("Organización")}
            className={styles.organizationPage}
            header={{
                eyebrow: t("Administración"),
                title: t("Organización"),
                description: t("Administre las empresas y sucursales registradas en Dialoqo."),
            }}
        >
            <SectionTabs
                sections={SECTIONS}
                getLabel={t}
                activeSection={activeSection}
                onChange={handleSectionChange}
            />

            <AlertMessage message={errorMessage} type="error" />

            <AlertMessage message={successMessage} type="success" />

            <OrganizationCompaniesSection
                activeSection={activeSection}
                t={t}
                resetCompanyForm={resetCompanyForm}
                isLoadingCompanies={isLoadingCompanies}
                companies={companies}
                selectedCompany={selectedCompany}
                handleSelectCompany={handleSelectCompany}
                companyFormVersion={companyFormVersion}
                isSaving={isSaving}
                isDeleting={isDeleting}
                handleCompanySubmit={handleCompanySubmit}
                handleDeactivateCompany={handleDeactivateCompany}
            />

            <OrganizationBranchesSection
                activeSection={activeSection}
                t={t}
                branchCompanyId={branchCompanyId}
                handleBranchCompanyChange={handleBranchCompanyChange}
                isLoadingCompanies={isLoadingCompanies}
                companies={companies}
                resetBranchForm={resetBranchForm}
                isLoadingBranches={isLoadingBranches}
                branches={branches}
                selectedBranch={selectedBranch}
                handleSelectBranch={handleSelectBranch}
                branchFormVersion={branchFormVersion}
                isSaving={isSaving}
                isDeleting={isDeleting}
                handleBranchSubmit={handleBranchSubmit}
                handleDeactivateBranch={handleDeactivateBranch}
            />
        </Page>
    );
}

export default OrganizationPage;
