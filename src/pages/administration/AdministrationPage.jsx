import { useEffect, useState } from "react";

import {
    createMonitor,
    deactivateMonitor,
    getMonitor,
    getMonitors,
    updateMonitor,
} from "../../services/access.js";

import {
    createBranch,
    createCompany,
    deactivateBranch,
    deactivateCompany,
    getBranches,
    getCompanies,
    getCompanyAccesses,
    grantCompanyAccess,
    revokeCompanyAccess,
    updateBranch,
    updateCompany,
} from "../../services/organizations.js";

import styles from "./AdministrationPage.module.css";
import { usePageTranslation } from "../usePageTranslation.js";


/**
 * AdministrationPage
 *
 * Description:
 * - Proporcionar la interfaz administrativa principal de Dialoqo.
 *
 * Notes:
 * - Gestiona empresas, sucursales, monitores y accesos a empresas.
 */
function AdministrationPage() {
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

    const [monitors, setMonitors] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState(null);
    const [monitorUsername, setMonitorUsername] = useState("");
    const [monitorEmail, setMonitorEmail] = useState("");
    const [monitorFirstName, setMonitorFirstName] = useState("");
    const [monitorLastName, setMonitorLastName] = useState("");
    const [monitorPassword, setMonitorPassword] = useState("");

    const [companyAccesses, setCompanyAccesses] = useState([]);
    const [accessMonitorId, setAccessMonitorId] = useState("");
    const [accessCompanyId, setAccessCompanyId] = useState("");

    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingMonitors, setIsLoadingMonitors] = useState(false);
    const [isLoadingMonitorDetail, setIsLoadingMonitorDetail] = useState(false);
    const [isLoadingAccesses, setIsLoadingAccesses] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    /**
     * clearMessages
     *
     * Description:
     * - Limpiar los mensajes visibles de la interfaz.
     *
     * Notes:
     * - Se utiliza antes de iniciar nuevas operaciones.
     */
    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }


    /**
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas disponibles para el usuario autenticado.
     *
     * Notes:
     * - Las empresas también son utilizadas por sucursales y accesos.
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

            if (!accessCompanyId && companyList.length > 0) {
                setAccessCompanyId(String(companyList[0].id));
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
     * - Obtener las sucursales activas de la empresa seleccionada.
     *
     * Notes:
     * - La lista se limpia cuando no existe una empresa seleccionada.
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
     * loadMonitors
     *
     * Description:
     * - Obtener los monitores administrados por el usuario autenticado.
     *
     * Notes:
     * - Los monitores también son utilizados para asignar accesos.
     */
    async function loadMonitors() {
        setIsLoadingMonitors(true);
        setErrorMessage("");

        try {
            const response = await getMonitors();
            const monitorList = response?.data || [];

            setMonitors(monitorList);

            if (!accessMonitorId && monitorList.length > 0) {
                setAccessMonitorId(String(monitorList[0].id));
            }
        } catch (error) {
            setErrorMessage(error.message || "No fue posible cargar los monitores.");
        } finally {
            setIsLoadingMonitors(false);
        }
    }


    /**
     * loadCompanyAccesses
     *
     * Description:
     * - Obtener las asignaciones de acceso entre monitores y empresas.
     *
     * Notes:
     * - Incluye registros activos e históricos devueltos por el backend.
     */
    async function loadCompanyAccesses() {
        setIsLoadingAccesses(true);
        setErrorMessage("");

        try {
            const response = await getCompanyAccesses();
            setCompanyAccesses(response?.data || []);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible cargar los accesos."));
        } finally {
            setIsLoadingAccesses(false);
        }
    }


    /**
     * resetCompanyForm
     *
     * Description:
     * - Restablecer el formulario de empresa.
     *
     * Notes:
     * - También elimina la empresa actualmente seleccionada.
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
     *
     * Notes:
     * - Conserva la empresa actualmente seleccionada.
     */
    function resetBranchForm() {
        setSelectedBranch(null);
        setBranchName("");
        setBranchCode("");
        setBranchDescription("");
    }


    /**
     * resetMonitorForm
     *
     * Description:
     * - Restablecer el formulario de monitor.
     *
     * Notes:
     * - La contraseña solo se utiliza durante la creación.
     */
    function resetMonitorForm() {
        setSelectedMonitor(null);
        setMonitorUsername("");
        setMonitorEmail("");
        setMonitorFirstName("");
        setMonitorLastName("");
        setMonitorPassword("");
    }


    /**
     * handleSectionChange
     *
     * Description:
     * - Cambiar la sección administrativa visible.
     *
     * Notes:
     * - Carga la información requerida por la sección seleccionada.
     */
    async function handleSectionChange(section) {
        setActiveSection(section);
        clearMessages();

        if (section === "companies") {
            resetCompanyForm();
        }

        if (section === "branches") {
            resetBranchForm();
        }

        if (section === "monitors") {
            resetMonitorForm();

            if (monitors.length === 0) {
                await loadMonitors();
            }
        }

        if (section === "accesses") {
            if (monitors.length === 0) {
                await loadMonitors();
            }

            await loadCompanyAccesses();
        }
    }


    /**
     * handleSelectCompany
     *
     * Description:
     * - Cargar una empresa existente dentro del formulario.
     *
     * Notes:
     * - Permite modificar los datos de la empresa seleccionada.
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
     * - Crear una empresa nueva o actualizar una empresa existente.
     *
     * Notes:
     * - La operación depende de si existe una empresa seleccionada.
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
     *
     * Notes:
     * - La empresa permanece preservada en el backend.
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
            setSuccessMessage(t("Empresa desactivada correctamente."));

            if (String(selectedCompany.id) === String(branchCompanyId)) {
                setBranchCompanyId("");
                setBranches([]);
                resetBranchForm();
            }

            if (String(selectedCompany.id) === String(accessCompanyId)) {
                setAccessCompanyId("");
            }

            resetCompanyForm();
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
     *
     * Notes:
     * - Restablece cualquier sucursal seleccionada.
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
     * - Cargar una sucursal existente dentro del formulario.
     *
     * Notes:
     * - Permite modificar los datos de la sucursal seleccionada.
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
     * - Crear una sucursal nueva o actualizar una sucursal existente.
     *
     * Notes:
     * - La sucursal siempre pertenece a la empresa seleccionada.
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
     *
     * Notes:
     * - La sucursal permanece preservada en el backend.
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
            setSuccessMessage(t("Sucursal desactivada correctamente."));
            resetBranchForm();
            await loadBranches(branchCompanyId);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar la sucursal."));
        } finally {
            setIsDeleting(false);
        }
    }


    /**
     * handleSelectMonitor
     *
     * Description:
     * - Obtener y cargar la información completa de un monitor.
     *
     * Notes:
     * - El detalle incluye información no disponible en la representación resumida.
     */
    async function handleSelectMonitor(monitor) {
        if (isLoadingMonitorDetail) {
            return;
        }

        setIsLoadingMonitorDetail(true);
        clearMessages();

        try {
            const response = await getMonitor(monitor.id);
            const monitorDetail = response?.data;

            if (!monitorDetail) {
                throw new Error(t("No fue posible obtener la información del monitor."));
            }

            setSelectedMonitor(monitorDetail);
            setMonitorUsername(monitorDetail.username || "");
            setMonitorEmail(monitorDetail.email || "");
            setMonitorFirstName(monitorDetail.first_name || "");
            setMonitorLastName(monitorDetail.last_name || "");
            setMonitorPassword("");
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible cargar el monitor."));
        } finally {
            setIsLoadingMonitorDetail(false);
        }
    }


    /**
     * handleMonitorSubmit
     *
     * Description:
     * - Crear un monitor nuevo o actualizar un monitor existente.
     *
     * Notes:
     * - La contraseña se envía únicamente durante la creación.
     */
    async function handleMonitorSubmit(event) {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        const monitorData = {
            username: monitorUsername.trim(),
            email: monitorEmail.trim(),
            first_name: monitorFirstName.trim(),
            last_name: monitorLastName.trim(),
        };

        if (!selectedMonitor) {
            monitorData.password = monitorPassword;
        }

        try {
            if (selectedMonitor) {
                await updateMonitor(selectedMonitor.id, monitorData);
                setSuccessMessage(t("Monitor actualizado correctamente."));
            } else {
                await createMonitor(monitorData);
                setSuccessMessage(t("Monitor creado correctamente."));
            }

            resetMonitorForm();
            await loadMonitors();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible guardar el monitor."));
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleDeactivateMonitor
     *
     * Description:
     * - Desactivar el monitor seleccionado.
     *
     * Notes:
     * - El usuario permanece preservado para mantener su historial.
     */
    async function handleDeactivateMonitor() {
        if (!selectedMonitor || isDeleting) {
            return;
        }

        const monitorLabel = [selectedMonitor.first_name, selectedMonitor.last_name].filter(Boolean).join(" ") || selectedMonitor.username;
        const confirmed = window.confirm(`¿Desea desactivar el monitor "${monitorLabel}"?`);

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await deactivateMonitor(selectedMonitor.id);
            setSuccessMessage(t("Monitor desactivado correctamente."));

            if (String(selectedMonitor.id) === String(accessMonitorId)) {
                setAccessMonitorId("");
            }

            resetMonitorForm();
            await loadMonitors();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar el monitor."));
        } finally {
            setIsDeleting(false);
        }
    }


    /**
     * handleGrantAccess
     *
     * Description:
     * - Otorgar acceso de una empresa al monitor seleccionado.
     *
     * Notes:
     * - El monitor y la empresa deben pertenecer al administrador autenticado.
     */
    async function handleGrantAccess(event) {
        event.preventDefault();

        if (!accessMonitorId || !accessCompanyId || isSaving) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        const accessData = {
            user: Number(accessMonitorId),
            company: Number(accessCompanyId),
        };

        try {
            await grantCompanyAccess(accessData);
            setSuccessMessage(t("Acceso de empresa asignado correctamente."));
            await loadCompanyAccesses();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible asignar el acceso."));
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleRevokeAccess
     *
     * Description:
     * - Revocar un acceso activo de monitor a empresa.
     *
     * Notes:
     * - El registro histórico permanece preservado.
     */
    async function handleRevokeAccess(access) {
        if (!access?.is_active || isDeleting) {
            return;
        }

        const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username || t("Monitor");
        const companyName = access.company?.name || "empresa";
        const confirmed = window.confirm(`¿Desea revocar el acceso de "${monitorName}" a "${companyName}"?`);

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await revokeCompanyAccess(access.id);
            setSuccessMessage(t("Acceso de empresa revocado correctamente."));
            await loadCompanyAccesses();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible revocar el acceso."));
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

    const activeAccesses = companyAccesses.filter((access) => access.is_active);
    const historicalAccesses = companyAccesses.filter((access) => !access.is_active);

    return (
        <section className={styles.administrationPage}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>{t("Administración")}</span>
                    <h1>{t("Gestión administrativa")}</h1>
                    <p>{t("Administre las empresas, sucursales, monitores y accesos de Dialoqo.")}</p>
                </div>
            </header>

            <div className={styles.sectionTabs}>
                <button className={`${styles.sectionTab} ${activeSection === "companies" ? styles.sectionTabActive : ""}`} type="button" onClick={() => handleSectionChange("companies")}>
                    {t("Empresas")}
                </button>

                <button className={`${styles.sectionTab} ${activeSection === "branches" ? styles.sectionTabActive : ""}`} type="button" onClick={() => handleSectionChange("branches")}>
                    {t("Sucursales")}
                </button>

                <button className={`${styles.sectionTab} ${activeSection === "monitors" ? styles.sectionTabActive : ""}`} type="button" onClick={() => handleSectionChange("monitors")}>
                    {t("Monitores")}
                </button>

                <button className={`${styles.sectionTab} ${activeSection === "accesses" ? styles.sectionTabActive : ""}`} type="button" onClick={() => handleSectionChange("accesses")}>
                    Accesos
                </button>
            </div>

            {errorMessage && (
                <div className={styles.errorMessage} role="alert">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className={styles.successMessage} role="status">
                    {successMessage}
                </div>
            )}

            {activeSection === "companies" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Empresas")}</h2>
                                <p>{t("Empresas activas administradas por su usuario.")}</p>
                            </div>

                            <button className={styles.secondaryButton} type="button" onClick={resetCompanyForm}>
                                {t("Nueva empresa")}
                            </button>
                        </div>

                        {isLoadingCompanies ? (
                            <div className={styles.loadingState}>{t("Cargando empresas...")}</div>
                        ) : companies.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>▦</div>
                                <strong>{t("No existen empresas registradas.")}</strong>
                                <span>{t("Cree la primera empresa para comenzar a configurar Dialoqo.")}</span>
                            </div>
                        ) : (
                            <div className={styles.entityList}>
                                {companies.map((company) => (
                                    <button
                                        key={company.id}
                                        className={`${styles.entityCard} ${selectedCompany?.id === company.id ? styles.entityCardActive : ""}`}
                                        type="button"
                                        onClick={() => handleSelectCompany(company)}
                                    >
                                        <div className={styles.entityCardMain}>
                                            <div className={styles.entityAvatar}>
                                                {(company.name || "E").charAt(0).toUpperCase()}
                                            </div>

                                            <div className={styles.entityInformation}>
                                                <strong>{company.name}</strong>
                                                <span>{company.code}</span>
                                            </div>
                                        </div>

                                        <span className={styles.statusBadge}>{t("Activa")}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className={styles.formPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{selectedCompany ? t("Editar empresa") : t("Nueva empresa")}</h2>
                                <p>{selectedCompany ? t("Modifique la información de la empresa seleccionada.") : t("Complete la información para registrar una nueva empresa.")}</p>
                            </div>
                        </div>

                        <form className={styles.entityForm} onSubmit={handleCompanySubmit}>
                            <div className={styles.formField}>
                                <label htmlFor="company-name">{t("Nombre")}</label>
                                <input id="company-name" type="text" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder={t("Nombre de la empresa")} disabled={isSaving || isDeleting} required />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="company-code">{t("Código")}</label>
                                <input id="company-code" type="text" value={companyCode} onChange={(event) => setCompanyCode(event.target.value)} placeholder={t("Código único")} disabled={isSaving || isDeleting} required />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="company-description">{t("Descripción")}</label>
                                <textarea id="company-description" value={companyDescription} onChange={(event) => setCompanyDescription(event.target.value)} placeholder={t("Descripción opcional")} disabled={isSaving || isDeleting} rows="5" />
                            </div>

                            <div className={styles.formActions}>
                                {selectedCompany && (
                                    <button className={styles.dangerButton} type="button" onClick={handleDeactivateCompany} disabled={isSaving || isDeleting}>
                                        {isDeleting ? t("Desactivando...") : t("Desactivar")}
                                    </button>
                                )}

                                <div className={styles.formPrimaryActions}>
                                    {selectedCompany && (
                                        <button className={styles.secondaryButton} type="button" onClick={resetCompanyForm} disabled={isSaving || isDeleting}>
                                            {t("Cancelar")}
                                        </button>
                                    )}

                                    <button className={styles.primaryButton} type="submit" disabled={isSaving || isDeleting}>
                                        {isSaving ? t("Guardando...") : selectedCompany ? t("Guardar cambios") : t("Crear empresa")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {activeSection === "branches" && (
                <>
                    <div className={styles.contextBar}>
                        <div className={styles.contextField}>
                            <label htmlFor="branch-company">{t("Empresa")}</label>

                            <select id="branch-company" value={branchCompanyId} onChange={handleBranchCompanyChange} disabled={isLoadingCompanies || companies.length === 0}>
                                {companies.length === 0 && (
                                    <option value="">{t("No existen empresas disponibles")}</option>
                                )}

                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
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

                                <button className={styles.secondaryButton} type="button" onClick={resetBranchForm} disabled={!branchCompanyId}>
                                    {t("Nueva sucursal")}
                                </button>
                            </div>

                            {!branchCompanyId ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyStateIcon}>⌂</div>
                                    <strong>{t("Seleccione una empresa.")}</strong>
                                    <span>{t("Debe seleccionar una empresa antes de administrar sus sucursales.")}</span>
                                </div>
                            ) : isLoadingBranches ? (
                                <div className={styles.loadingState}>{t("Cargando sucursales...")}</div>
                            ) : branches.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyStateIcon}>⌂</div>
                                    <strong>{t("No existen sucursales registradas.")}</strong>
                                    <span>{t("Cree la primera sucursal para la empresa seleccionada.")}</span>
                                </div>
                            ) : (
                                <div className={styles.entityList}>
                                    {branches.map((branch) => (
                                        <button
                                            key={branch.id}
                                            className={`${styles.entityCard} ${selectedBranch?.id === branch.id ? styles.entityCardActive : ""}`}
                                            type="button"
                                            onClick={() => handleSelectBranch(branch)}
                                        >
                                            <div className={styles.entityCardMain}>
                                                <div className={styles.entityAvatar}>
                                                    {(branch.name || "S").charAt(0).toUpperCase()}
                                                </div>

                                                <div className={styles.entityInformation}>
                                                    <strong>{branch.name}</strong>
                                                    <span>{branch.code}</span>
                                                </div>
                                            </div>

                                            <span className={styles.statusBadge}>{t("Activa")}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.formPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>{selectedBranch ? t("Editar sucursal") : t("Nueva sucursal")}</h2>
                                    <p>{selectedBranch ? t("Modifique la información de la sucursal seleccionada.") : t("Complete la información para registrar una nueva sucursal.")}</p>
                                </div>
                            </div>

                            <form className={styles.entityForm} onSubmit={handleBranchSubmit}>
                                <div className={styles.formField}>
                                    <label htmlFor="branch-name">{t("Nombre")}</label>
                                    <input id="branch-name" type="text" value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder={t("Nombre de la sucursal")} disabled={!branchCompanyId || isSaving || isDeleting} required />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="branch-code">{t("Código")}</label>
                                    <input id="branch-code" type="text" value={branchCode} onChange={(event) => setBranchCode(event.target.value)} placeholder={t("Código de la sucursal")} disabled={!branchCompanyId || isSaving || isDeleting} required />
                                </div>

                                <div className={styles.formField}>
                                    <label htmlFor="branch-description">{t("Descripción")}</label>
                                    <textarea id="branch-description" value={branchDescription} onChange={(event) => setBranchDescription(event.target.value)} placeholder={t("Descripción opcional")} disabled={!branchCompanyId || isSaving || isDeleting} rows="5" />
                                </div>

                                <div className={styles.formActions}>
                                    {selectedBranch && (
                                        <button className={styles.dangerButton} type="button" onClick={handleDeactivateBranch} disabled={isSaving || isDeleting}>
                                            {isDeleting ? t("Desactivando...") : t("Desactivar")}
                                        </button>
                                    )}

                                    <div className={styles.formPrimaryActions}>
                                        {selectedBranch && (
                                            <button className={styles.secondaryButton} type="button" onClick={resetBranchForm} disabled={isSaving || isDeleting}>
                                                {t("Cancelar")}
                                            </button>
                                        )}

                                        <button className={styles.primaryButton} type="submit" disabled={!branchCompanyId || isSaving || isDeleting}>
                                            {isSaving ? t("Guardando...") : selectedBranch ? t("Guardar cambios") : t("Crear sucursal")}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </section>
                    </div>
                </>
            )}

            {activeSection === "monitors" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Monitores")}</h2>
                                <p>{t("Usuarios de monitoreo administrados por su usuario.")}</p>
                            </div>

                            <button className={styles.secondaryButton} type="button" onClick={resetMonitorForm}>
                                {t("Nuevo monitor")}
                            </button>
                        </div>

                        {isLoadingMonitors ? (
                            <div className={styles.loadingState}>{t("Cargando monitores...")}</div>
                        ) : monitors.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>●</div>
                                <strong>{t("No existen monitores registrados.")}</strong>
                                <span>{t("Cree el primer monitor para posteriormente asignarle acceso a empresas.")}</span>
                            </div>
                        ) : (
                            <div className={styles.entityList}>
                                {monitors.map((monitor) => {
                                    const monitorName = [monitor.first_name, monitor.last_name].filter(Boolean).join(" ") || monitor.username;

                                    return (
                                        <button
                                            key={monitor.id}
                                            className={`${styles.entityCard} ${selectedMonitor?.id === monitor.id ? styles.entityCardActive : ""}`}
                                            type="button"
                                            onClick={() => handleSelectMonitor(monitor)}
                                            disabled={isLoadingMonitorDetail}
                                        >
                                            <div className={styles.entityCardMain}>
                                                <div className={styles.entityAvatar}>
                                                    {(monitor.first_name || monitor.username || "M").charAt(0).toUpperCase()}
                                                </div>

                                                <div className={styles.entityInformation}>
                                                    <strong>{monitorName}</strong>
                                                    <span>{monitor.username}</span>
                                                </div>
                                            </div>

                                            <span className={styles.statusBadge}>{t("Activo")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className={styles.formPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{selectedMonitor ? t("Editar monitor") : t("Nuevo monitor")}</h2>
                                <p>{selectedMonitor ? t("Modifique la información del monitor seleccionado.") : t("Complete la información para registrar un nuevo monitor.")}</p>
                            </div>
                        </div>

                        <form className={styles.entityForm} onSubmit={handleMonitorSubmit}>
                            <div className={styles.formField}>
                                <label htmlFor="monitor-first-name">{t("Nombre")}</label>
                                <input id="monitor-first-name" type="text" value={monitorFirstName} onChange={(event) => setMonitorFirstName(event.target.value)} placeholder={t("Nombre")} disabled={isSaving || isDeleting || isLoadingMonitorDetail} />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="monitor-last-name">{t("Apellido")}</label>
                                <input id="monitor-last-name" type="text" value={monitorLastName} onChange={(event) => setMonitorLastName(event.target.value)} placeholder={t("Apellido")} disabled={isSaving || isDeleting || isLoadingMonitorDetail} />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="monitor-username">{t("Usuario")}</label>
                                <input id="monitor-username" type="text" value={monitorUsername} onChange={(event) => setMonitorUsername(event.target.value)} placeholder={t("Nombre de usuario")} autoComplete="off" disabled={isSaving || isDeleting || isLoadingMonitorDetail} required />
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="monitor-email">{t("Correo electrónico")}</label>
                                <input id="monitor-email" type="email" value={monitorEmail} onChange={(event) => setMonitorEmail(event.target.value)} placeholder="correo@empresa.com" autoComplete="off" disabled={isSaving || isDeleting || isLoadingMonitorDetail} />
                            </div>

                            {!selectedMonitor && (
                                <div className={styles.formField}>
                                    <label htmlFor="monitor-password">{t("Contraseña")}</label>
                                    <input id="monitor-password" type="password" value={monitorPassword} onChange={(event) => setMonitorPassword(event.target.value)} placeholder={t("Contraseña inicial")} autoComplete="new-password" disabled={isSaving || isDeleting} required />
                                </div>
                            )}

                            <div className={styles.formActions}>
                                {selectedMonitor && (
                                    <button className={styles.dangerButton} type="button" onClick={handleDeactivateMonitor} disabled={isSaving || isDeleting || isLoadingMonitorDetail}>
                                        {isDeleting ? t("Desactivando...") : t("Desactivar")}
                                    </button>
                                )}

                                <div className={styles.formPrimaryActions}>
                                    {selectedMonitor && (
                                        <button className={styles.secondaryButton} type="button" onClick={resetMonitorForm} disabled={isSaving || isDeleting}>
                                            {t("Cancelar")}
                                        </button>
                                    )}

                                    <button className={styles.primaryButton} type="submit" disabled={isSaving || isDeleting || isLoadingMonitorDetail}>
                                        {isSaving ? t("Guardando...") : selectedMonitor ? t("Guardar cambios") : t("Crear monitor")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {activeSection === "accesses" && (
                <div className={styles.accessWorkspace}>
                    <section className={styles.formPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Asignar acceso")}</h2>
                                <p>{t("Seleccione un monitor y una empresa para autorizar su monitoreo.")}</p>
                            </div>
                        </div>

                        <form className={styles.entityForm} onSubmit={handleGrantAccess}>
                            <div className={styles.formField}>
                                <label htmlFor="access-monitor">{t("Monitor")}</label>

                                <select
                                    id="access-monitor"
                                    value={accessMonitorId}
                                    onChange={(event) => setAccessMonitorId(event.target.value)}
                                    disabled={isLoadingMonitors || monitors.length === 0 || isSaving}
                                    required
                                >
                                    {monitors.length === 0 && (
                                        <option value="">{t("No existen monitores disponibles")}</option>
                                    )}

                                    {monitors.map((monitor) => {
                                        const monitorName = [monitor.first_name, monitor.last_name].filter(Boolean).join(" ") || monitor.username;

                                        return (
                                            <option key={monitor.id} value={monitor.id}>
                                                {monitorName} ({monitor.username})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className={styles.formField}>
                                <label htmlFor="access-company">{t("Empresa")}</label>

                                <select
                                    id="access-company"
                                    value={accessCompanyId}
                                    onChange={(event) => setAccessCompanyId(event.target.value)}
                                    disabled={isLoadingCompanies || companies.length === 0 || isSaving}
                                    required
                                >
                                    {companies.length === 0 && (
                                        <option value="">{t("No existen empresas disponibles")}</option>
                                    )}

                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formActions}>
                                <div className={styles.formPrimaryActions}>
                                    <button className={styles.primaryButton} type="submit" disabled={!accessMonitorId || !accessCompanyId || isSaving}>
                                        {isSaving ? t("Asignando...") : t("Asignar acceso")}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>

                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Accesos activos")}</h2>
                                <p>{t("Asignaciones de monitoreo actualmente vigentes.")}</p>
                            </div>
                        </div>

                        {isLoadingAccesses ? (
                            <div className={styles.loadingState}>{t("Cargando accesos...")}</div>
                        ) : activeAccesses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>✓</div>
                                <strong>{t("No existen accesos activos.")}</strong>
                                <span>{t("Asigne una empresa a un monitor para comenzar.")}</span>
                            </div>
                        ) : (
                            <div className={styles.accessList}>
                                {activeAccesses.map((access) => {
                                    const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username;

                                    return (
                                        <div key={access.id} className={styles.accessCard}>
                                            <div className={styles.accessInformation}>
                                                <div className={styles.entityAvatar}>
                                                    {(access.user?.first_name || access.user?.username || "M").charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>{monitorName}</strong>
                                                    <span>{access.company?.name}</span>
                                                </div>
                                            </div>

                                            <div className={styles.accessActions}>
                                                <span className={styles.statusBadge}>{t("Activo")}</span>

                                                <button className={styles.dangerButtonSmall} type="button" onClick={() => handleRevokeAccess(access)} disabled={isDeleting}>
                                                    {t("Revocar")}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {historicalAccesses.length > 0 && (
                        <section className={styles.historyPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <h2>{t("Historial de accesos")}</h2>
                                    <p>{t("Accesos anteriormente revocados.")}</p>
                                </div>
                            </div>

                            <div className={styles.accessList}>
                                {historicalAccesses.map((access) => {
                                    const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username;

                                    return (
                                        <div key={access.id} className={styles.accessCard}>
                                            <div className={styles.accessInformation}>
                                                <div className={styles.entityAvatarMuted}>
                                                    {(access.user?.first_name || access.user?.username || "M").charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>{monitorName}</strong>
                                                    <span>{access.company?.name}</span>
                                                </div>
                                            </div>

                                            <span className={styles.inactiveBadge}>{t("Revocado")}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </section>
    );
}

export default AdministrationPage;
