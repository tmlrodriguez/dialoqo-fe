import { useEffect, useState } from "react";

import AlertMessage from "../../../components/common/AlertMessage/AlertMessage.jsx";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";
import EntityList from "../../../components/common/EntityList/EntityList.jsx";
import EntityListItem from "../../../components/common/EntityList/EntityListItem.jsx";
import LoadingState from "../../../components/common/LoadingState/LoadingState.jsx";
import PageHeader from "../../../components/common/PageHeader/PageHeader.jsx";
import SectionTabs from "../../../components/common/SectionTabs/SectionTabs.jsx";

import {
    createMonitor,
    deactivateMonitor,
    getMonitor,
    getMonitors,
    updateMonitor,
} from "../../../services/access.js";

import {
    getCompanies,
    getCompanyAccesses,
    grantCompanyAccess,
    revokeCompanyAccess,
} from "../../../services/organizations.js";

import CompanyAccessForm from "./components/CompanyAccessForm.jsx";
import MonitorForm from "./components/MonitorForm.jsx";

import styles from "./AccessPage.module.css";


const SECTIONS = [
    {
        value: "monitors",
        label: "Monitores",
    },
    {
        value: "accesses",
        label: "Accesos a empresas",
    },
];


/**
 * AccessPage
 *
 * Description:
 * - Gestionar monitores y accesos a empresas.
 *
 * Notes:
 * - Los monitores son usuarios autenticados de Dialoqo.
 * - Los accesos determinan qué empresas puede monitorear cada usuario.
 */
function AccessPage() {
    const [activeSection, setActiveSection] = useState("monitors");

    const [monitors, setMonitors] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState(null);

    const [monitorUsername, setMonitorUsername] = useState("");
    const [monitorEmail, setMonitorEmail] = useState("");
    const [monitorFirstName, setMonitorFirstName] = useState("");
    const [monitorLastName, setMonitorLastName] = useState("");
    const [monitorPassword, setMonitorPassword] = useState("");

    const [companies, setCompanies] = useState([]);
    const [companyAccesses, setCompanyAccesses] = useState([]);

    const [accessMonitorId, setAccessMonitorId] = useState("");
    const [accessCompanyId, setAccessCompanyId] = useState("");

    const [isLoadingMonitors, setIsLoadingMonitors] = useState(true);
    const [isLoadingMonitorDetail, setIsLoadingMonitorDetail] = useState(false);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    const [isLoadingAccesses, setIsLoadingAccesses] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    /**
     * clearMessages
     *
     * Description:
     * - Limpiar los mensajes visibles de la página.
     */
    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }


    /**
     * resetMonitorForm
     *
     * Description:
     * - Restablecer el formulario de monitor.
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
     * loadMonitors
     *
     * Description:
     * - Obtener los monitores administrados por el usuario.
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
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas disponibles para asignación.
     */
    async function loadCompanies() {
        setIsLoadingCompanies(true);
        setErrorMessage("");

        try {
            const response = await getCompanies();
            const companyList = response?.data || [];

            setCompanies(companyList);

            if (!accessCompanyId && companyList.length > 0) {
                setAccessCompanyId(String(companyList[0].id));
            }
        } catch (error) {
            setErrorMessage(error.message || "No fue posible cargar las empresas.");
        } finally {
            setIsLoadingCompanies(false);
        }
    }


    /**
     * loadCompanyAccesses
     *
     * Description:
     * - Obtener los accesos de monitores a empresas.
     */
    async function loadCompanyAccesses() {
        setIsLoadingAccesses(true);
        setErrorMessage("");

        try {
            const response = await getCompanyAccesses();

            setCompanyAccesses(response?.data || []);
        } catch (error) {
            setErrorMessage(error.message || "No fue posible cargar los accesos.");
        } finally {
            setIsLoadingAccesses(false);
        }
    }


    /**
     * handleSectionChange
     *
     * Description:
     * - Cambiar la sección visible.
     */
    async function handleSectionChange(section) {
        setActiveSection(section);
        clearMessages();

        if (section === "monitors") {
            resetMonitorForm();
        }

        if (section === "accesses") {
            if (companies.length === 0) {
                await loadCompanies();
            }

            await loadCompanyAccesses();
        }
    }


    /**
     * handleSelectMonitor
     *
     * Description:
     * - Obtener y seleccionar un monitor para edición.
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
                throw new Error("No fue posible obtener la información del monitor.");
            }

            setSelectedMonitor(monitorDetail);
            setMonitorUsername(monitorDetail.username || "");
            setMonitorEmail(monitorDetail.email || "");
            setMonitorFirstName(monitorDetail.first_name || "");
            setMonitorLastName(monitorDetail.last_name || "");
            setMonitorPassword("");
        } catch (error) {
            setErrorMessage(error.message || "No fue posible cargar el monitor.");
        } finally {
            setIsLoadingMonitorDetail(false);
        }
    }


    /**
     * handleMonitorSubmit
     *
     * Description:
     * - Crear o actualizar un monitor.
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
                setSuccessMessage("Monitor actualizado correctamente.");
            } else {
                await createMonitor(monitorData);
                setSuccessMessage("Monitor creado correctamente.");
            }

            resetMonitorForm();

            await loadMonitors();
        } catch (error) {
            setErrorMessage(error.message || "No fue posible guardar el monitor.");
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleDeactivateMonitor
     *
     * Description:
     * - Desactivar el monitor seleccionado.
     */
    async function handleDeactivateMonitor() {
        if (!selectedMonitor || isDeleting) {
            return;
        }

        const monitorName = [selectedMonitor.first_name, selectedMonitor.last_name].filter(Boolean).join(" ") || selectedMonitor.username;

        const confirmed = window.confirm(
            `¿Desea desactivar el monitor "${monitorName}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await deactivateMonitor(selectedMonitor.id);

            if (String(selectedMonitor.id) === String(accessMonitorId)) {
                setAccessMonitorId("");
            }

            resetMonitorForm();

            setSuccessMessage("Monitor desactivado correctamente.");

            await loadMonitors();
        } catch (error) {
            setErrorMessage(error.message || "No fue posible desactivar el monitor.");
        } finally {
            setIsDeleting(false);
        }
    }


    /**
     * handleGrantAccess
     *
     * Description:
     * - Asignar una empresa a un monitor.
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

            setSuccessMessage("Acceso de empresa asignado correctamente.");

            await loadCompanyAccesses();
        } catch (error) {
            setErrorMessage(error.message || "No fue posible asignar el acceso.");
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleRevokeAccess
     *
     * Description:
     * - Revocar un acceso activo.
     */
    async function handleRevokeAccess(access) {
        if (!access?.is_active || isDeleting) {
            return;
        }

        const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username || "Monitor";
        const companyName = access.company?.name || "empresa";

        const confirmed = window.confirm(
            `¿Desea revocar el acceso de "${monitorName}" a "${companyName}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await revokeCompanyAccess(access.id);

            setSuccessMessage("Acceso de empresa revocado correctamente.");

            await loadCompanyAccesses();
        } catch (error) {
            setErrorMessage(error.message || "No fue posible revocar el acceso.");
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        loadMonitors();
    }, []);

    const activeAccesses = companyAccesses.filter(
        (access) => access.is_active
    );

    const historicalAccesses = companyAccesses.filter(
        (access) => !access.is_active
    );

    return (
        <section className={styles.accessPage}>
            <PageHeader
                eyebrow="Administración"
                title="Usuarios y accesos"
                description="Administre los usuarios de monitoreo y las empresas que pueden consultar."
            />

            <SectionTabs
                sections={SECTIONS}
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

            {activeSection === "monitors" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Monitores</h2>
                                <p>Usuarios autorizados para utilizar las funciones de monitoreo.</p>
                            </div>

                            <button
                                className={styles.secondaryButton}
                                type="button"
                                onClick={resetMonitorForm}
                            >
                                Nuevo monitor
                            </button>
                        </div>

                        {isLoadingMonitors ? (
                            <LoadingState message="Cargando monitores..." />
                        ) : monitors.length === 0 ? (
                            <EmptyState
                                icon="●"
                                title="No existen monitores registrados."
                                description="Cree el primer monitor para posteriormente asignarle acceso a empresas."
                            />
                        ) : (
                            <EntityList>
                                {monitors.map((monitor) => {
                                    const monitorName = [monitor.first_name, monitor.last_name].filter(Boolean).join(" ") || monitor.username;

                                    return (
                                        <EntityListItem
                                            key={monitor.id}
                                            title={monitorName}
                                            subtitle={monitor.username}
                                            initial={(monitor.first_name || monitor.username || "M").charAt(0).toUpperCase()}
                                            status="Activo"
                                            isActive={selectedMonitor?.id === monitor.id}
                                            disabled={isLoadingMonitorDetail}
                                            onClick={() => handleSelectMonitor(monitor)}
                                        />
                                    );
                                })}
                            </EntityList>
                        )}
                    </section>

                    <MonitorForm
                        selectedMonitor={selectedMonitor}
                        username={monitorUsername}
                        email={monitorEmail}
                        firstName={monitorFirstName}
                        lastName={monitorLastName}
                        password={monitorPassword}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        isLoadingDetail={isLoadingMonitorDetail}
                        onUsernameChange={(event) => setMonitorUsername(event.target.value)}
                        onEmailChange={(event) => setMonitorEmail(event.target.value)}
                        onFirstNameChange={(event) => setMonitorFirstName(event.target.value)}
                        onLastNameChange={(event) => setMonitorLastName(event.target.value)}
                        onPasswordChange={(event) => setMonitorPassword(event.target.value)}
                        onSubmit={handleMonitorSubmit}
                        onReset={resetMonitorForm}
                        onDeactivate={handleDeactivateMonitor}
                    />
                </div>
            )}

            {activeSection === "accesses" && (
                <div className={styles.accessWorkspace}>
                    <CompanyAccessForm
                        monitorId={accessMonitorId}
                        companyId={accessCompanyId}
                        monitors={monitors}
                        companies={companies}
                        isSaving={isSaving}
                        isLoadingMonitors={isLoadingMonitors}
                        isLoadingCompanies={isLoadingCompanies}
                        onMonitorChange={(event) => setAccessMonitorId(event.target.value)}
                        onCompanyChange={(event) => setAccessCompanyId(event.target.value)}
                        onSubmit={handleGrantAccess}
                    />

                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Accesos activos</h2>
                                <p>Asignaciones de monitoreo actualmente vigentes.</p>
                            </div>
                        </div>

                        {isLoadingAccesses ? (
                            <LoadingState message="Cargando accesos..." />
                        ) : activeAccesses.length === 0 ? (
                            <EmptyState
                                icon="✓"
                                title="No existen accesos activos."
                                description="Asigne una empresa a un monitor para comenzar."
                            />
                        ) : (
                            <div className={styles.accessList}>
                                {activeAccesses.map((access) => {
                                    const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username;

                                    return (
                                        <div
                                            key={access.id}
                                            className={styles.accessCard}
                                        >
                                            <div className={styles.accessInformation}>
                                                <div className={styles.accessAvatar}>
                                                    {(access.user?.first_name || access.user?.username || "M").charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>{monitorName}</strong>
                                                    <span>{access.company?.name}</span>
                                                </div>
                                            </div>

                                            <div className={styles.accessActions}>
                                                <span className={styles.statusBadge}>
                                                    Activo
                                                </span>

                                                <button
                                                    className={styles.dangerButtonSmall}
                                                    type="button"
                                                    onClick={() => handleRevokeAccess(access)}
                                                    disabled={isDeleting}
                                                >
                                                    Revocar
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
                                    <h2>Historial de accesos</h2>
                                    <p>Accesos que fueron revocados anteriormente.</p>
                                </div>
                            </div>

                            <div className={styles.accessList}>
                                {historicalAccesses.map((access) => {
                                    const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username;

                                    return (
                                        <div
                                            key={access.id}
                                            className={styles.accessCard}
                                        >
                                            <div className={styles.accessInformation}>
                                                <div className={styles.accessAvatarMuted}>
                                                    {(access.user?.first_name || access.user?.username || "M").charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <strong>{monitorName}</strong>
                                                    <span>{access.company?.name}</span>
                                                </div>
                                            </div>

                                            <span className={styles.inactiveBadge}>
                                                Revocado
                                            </span>
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

export default AccessPage;