import { useEffect, useState } from "react";

import AlertMessage from "../../../components/common/AlertMessage/AlertMessage.jsx";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";
import EntityList from "../../../components/common/EntityList/EntityList.jsx";
import EntityListItem from "../../../components/common/EntityList/EntityListItem.jsx";
import LoadingState from "../../../components/common/LoadingState/LoadingState.jsx";
import PageHeader from "../../../components/common/PageHeader/PageHeader.jsx";
import SectionTabs from "../../../components/common/SectionTabs/SectionTabs.jsx";

import {
    createMember,
    createMonitor,
    deactivateMember,
    deactivateMonitor,
    getMember,
    getMembers,
    getMonitor,
    getMonitors,
    updateMember,
    updateMonitor,
} from "../../../services/access.js";

import {
    getCompanies,
    getCompanyAccesses,
    grantCompanyAccess,
    revokeCompanyAccess,
} from "../../../services/organizations.js";

import CompanyAccessForm from "./components/CompanyAccessForm.jsx";
import MemberForm from "./components/MemberForm.jsx";
import MonitorForm from "./components/MonitorForm.jsx";

import styles from "./AccessPage.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


const SECTIONS = [
    {
        value: "monitors",
        label: "Monitores",
    },
    {
        value: "members",
        label: "Miembros",
    },
    {
        value: "accesses",
        label: "Accesos de Monitores",
    },
];


/**
 * AccessPage
 *
 * Description:
 * - Gestionar usuarios MONITOR, usuarios MEMBER y accesos de MONITOR a empresas.
 *
 * Notes:
 * - Los monitores son usuarios autorizados para funciones de monitoreo.
 * - Los miembros son usuarios autenticados que pueden recibir asignaciones de números.
 * - Los accesos de monitoreo a empresas se asignan exclusivamente a usuarios MONITOR.
 */
function AccessPage() {
    const { t } = usePageTranslation();
    const [activeSection, setActiveSection] = useState("monitors");

    const [monitors, setMonitors] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState(null);

    const [monitorUsername, setMonitorUsername] = useState("");
    const [monitorEmail, setMonitorEmail] = useState("");
    const [monitorFirstName, setMonitorFirstName] = useState("");
    const [monitorLastName, setMonitorLastName] = useState("");
    const [monitorPassword, setMonitorPassword] = useState("");

    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

    const [memberUsername, setMemberUsername] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [memberFirstName, setMemberFirstName] = useState("");
    const [memberLastName, setMemberLastName] = useState("");
    const [memberPassword, setMemberPassword] = useState("");

    const [companies, setCompanies] = useState([]);
    const [companyAccesses, setCompanyAccesses] = useState([]);

    const [accessMonitorId, setAccessMonitorId] = useState("");
    const [accessCompanyId, setAccessCompanyId] = useState("");

    const [isLoadingMonitors, setIsLoadingMonitors] = useState(true);
    const [isLoadingMonitorDetail, setIsLoadingMonitorDetail] = useState(false);

    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isLoadingMemberDetail, setIsLoadingMemberDetail] = useState(false);

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
     * getDetailData
     *
     * Description:
     * - Normalizar respuestas de detalle tanto planas como envueltas por recurso.
     */
    function getDetailData(response, resourceKey) {
        const data = response?.data;
        if (!data) return null;
        return data?.[resourceKey] || data?.user || data;
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
     * resetMemberForm
     *
     * Description:
     * - Restablecer el formulario de miembro.
     */
    function resetMemberForm() {
        setSelectedMember(null);
        setMemberUsername("");
        setMemberEmail("");
        setMemberFirstName("");
        setMemberLastName("");
        setMemberPassword("");
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
     * loadMembers
     *
     * Description:
     * - Obtener los miembros administrados por el usuario.
     */
    async function loadMembers() {
        setIsLoadingMembers(true);
        setErrorMessage("");

        try {
            const response = await getMembers();

            setMembers(response?.data || []);
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible cargar los miembros."));
        } finally {
            setIsLoadingMembers(false);
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
            setErrorMessage(error.message || t("No fue posible cargar las empresas."));
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
            setErrorMessage(error.message || t("No fue posible cargar los accesos."));
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

        if (section === "members") {
            resetMemberForm();

            if (members.length === 0) {
                await loadMembers();
            }
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
            const monitorDetail = getDetailData(response, "monitor");

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
     * handleSelectMember
     *
     * Description:
     * - Obtener y seleccionar un miembro para edición.
     */
    async function handleSelectMember(member) {
        if (isLoadingMemberDetail) {
            return;
        }

        setIsLoadingMemberDetail(true);
        clearMessages();

        try {
            const response = await getMember(member.id);
            const memberDetail = getDetailData(response, "member");

            if (!memberDetail) {
                throw new Error(t("No fue posible obtener la información del miembro."));
            }

            setSelectedMember(memberDetail);
            setMemberUsername(memberDetail.username || "");
            setMemberEmail(memberDetail.email || "");
            setMemberFirstName(memberDetail.first_name || "");
            setMemberLastName(memberDetail.last_name || "");
            setMemberPassword("");
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible cargar el miembro."));
        } finally {
            setIsLoadingMemberDetail(false);
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
                const monitorId = selectedMonitor.id;
                await updateMonitor(monitorId, monitorData);
                await loadMonitors();

                const detailResponse = await getMonitor(monitorId);
                const monitorDetail = getDetailData(detailResponse, "monitor");
                if (monitorDetail) {
                    setSelectedMonitor(monitorDetail);
                    setMonitorUsername(monitorDetail.username || "");
                    setMonitorEmail(monitorDetail.email || "");
                    setMonitorFirstName(monitorDetail.first_name || "");
                    setMonitorLastName(monitorDetail.last_name || "");
                }

                setMonitorPassword("");
                setSuccessMessage(t("Monitor actualizado correctamente."));
            } else {
                await createMonitor(monitorData);
                resetMonitorForm();
                await loadMonitors();
                setSuccessMessage(t("Monitor creado correctamente."));
            }
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible guardar el monitor."));
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleMemberSubmit
     *
     * Description:
     * - Crear o actualizar un miembro.
     */
    async function handleMemberSubmit(event) {
        event.preventDefault();

        if (isSaving) {
            return;
        }

        setIsSaving(true);
        clearMessages();

        const memberData = {
            username: memberUsername.trim(),
            email: memberEmail.trim(),
            first_name: memberFirstName.trim(),
            last_name: memberLastName.trim(),
        };

        if (!selectedMember) {
            memberData.password = memberPassword;
        }

        try {
            if (selectedMember) {
                const memberId = selectedMember.id;
                await updateMember(memberId, memberData);
                await loadMembers();

                const detailResponse = await getMember(memberId);
                const memberDetail = getDetailData(detailResponse, "member");
                if (memberDetail) {
                    setSelectedMember(memberDetail);
                    setMemberUsername(memberDetail.username || "");
                    setMemberEmail(memberDetail.email || "");
                    setMemberFirstName(memberDetail.first_name || "");
                    setMemberLastName(memberDetail.last_name || "");
                }

                setMemberPassword("");
                setSuccessMessage(t("Miembro actualizado correctamente."));
            } else {
                await createMember(memberData);
                resetMemberForm();
                await loadMembers();
                setSuccessMessage(t("Miembro creado correctamente."));
            }
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible guardar el miembro."));
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

            setSuccessMessage(t("Monitor desactivado correctamente."));

            await loadMonitors();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar el monitor."));
        } finally {
            setIsDeleting(false);
        }
    }


    /**
     * handleDeactivateMember
     *
     * Description:
     * - Desactivar el miembro seleccionado.
     */
    async function handleDeactivateMember() {
        if (!selectedMember || isDeleting) {
            return;
        }

        const memberName = [selectedMember.first_name, selectedMember.last_name].filter(Boolean).join(" ") || selectedMember.username;

        const confirmed = window.confirm(
            `¿Desea desactivar el miembro "${memberName}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearMessages();

        try {
            await deactivateMember(selectedMember.id);

            resetMemberForm();

            setSuccessMessage(t("Miembro desactivado correctamente."));

            await loadMembers();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible desactivar el miembro."));
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
     * - Revocar un acceso activo.
     */
    async function handleRevokeAccess(access) {
        if (!access?.is_active || isDeleting) {
            return;
        }

        const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username || t("Monitor");
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

            setSuccessMessage(t("Acceso de empresa revocado correctamente."));

            await loadCompanyAccesses();
        } catch (error) {
            setErrorMessage(error.message || t("No fue posible revocar el acceso."));
        } finally {
            setIsDeleting(false);
        }
    }


    useEffect(() => {
        loadMonitors();
    }, []);


    const activeAccesses = companyAccesses.filter((access) => access.is_active);
    const historicalAccesses = companyAccesses.filter((access) => !access.is_active);


    return (
        <section className={styles.accessPage}>
            <PageHeader
                eyebrow={t("Administración")}
                title={t("Usuarios y accesos")}
                description={t("Administre usuarios MONITOR, usuarios MEMBER y accesos de monitoreo a empresas.")}
            />

            <SectionTabs
                sections={SECTIONS.map((section) => ({ ...section, label: t(section.label) }))}
                activeSection={activeSection}
                onChange={handleSectionChange}
            />

            <AlertMessage message={errorMessage} type="error" />
            <AlertMessage message={successMessage} type="success" />

            {activeSection === "monitors" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Monitores")}</h2>
                                <p>{t("Usuarios autorizados para utilizar las funciones de monitoreo.")}</p>
                            </div>

                            <button className={styles.secondaryButton} type="button" onClick={resetMonitorForm}>
                                {t("Nuevo monitor")}
                            </button>
                        </div>

                        {isLoadingMonitors ? (
                            <LoadingState message={t("Cargando monitores...")} />
                        ) : monitors.length === 0 ? (
                            <EmptyState icon="●" title={t("No existen monitores registrados.")} description={t("Cree el primer monitor para posteriormente asignarle acceso a empresas.")} />
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
                                            status={t("Activo")}
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

            {activeSection === "members" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Miembros")}</h2>
                                <p>{t("Usuarios que pueden recibir la asignación de números corporativos.")}</p>
                            </div>

                            <button className={styles.secondaryButton} type="button" onClick={resetMemberForm}>
                                {t("Nuevo miembro")}
                            </button>
                        </div>

                        {isLoadingMembers ? (
                            <LoadingState message={t("Cargando miembros...")} />
                        ) : members.length === 0 ? (
                            <EmptyState icon="●" title={t("No existen miembros registrados.")} description={t("Cree el primer miembro para posteriormente asignarle un número corporativo.")} />
                        ) : (
                            <EntityList>
                                {members.map((member) => {
                                    const memberName = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.username;

                                    return (
                                        <EntityListItem
                                            key={member.id}
                                            title={memberName}
                                            subtitle={member.username}
                                            initial={(member.first_name || member.username || "M").charAt(0).toUpperCase()}
                                            status={t("Activo")}
                                            isActive={selectedMember?.id === member.id}
                                            disabled={isLoadingMemberDetail}
                                            onClick={() => handleSelectMember(member)}
                                        />
                                    );
                                })}
                            </EntityList>
                        )}
                    </section>

                    <MemberForm
                        selectedMember={selectedMember}
                        username={memberUsername}
                        email={memberEmail}
                        firstName={memberFirstName}
                        lastName={memberLastName}
                        password={memberPassword}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        isLoadingDetail={isLoadingMemberDetail}
                        onUsernameChange={(event) => setMemberUsername(event.target.value)}
                        onEmailChange={(event) => setMemberEmail(event.target.value)}
                        onFirstNameChange={(event) => setMemberFirstName(event.target.value)}
                        onLastNameChange={(event) => setMemberLastName(event.target.value)}
                        onPasswordChange={(event) => setMemberPassword(event.target.value)}
                        onSubmit={handleMemberSubmit}
                        onReset={resetMemberForm}
                        onDeactivate={handleDeactivateMember}
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
                                <h2>{t("Accesos de Monitores activos")}</h2>
                                <p>{t("Empresas que cada usuario MONITOR tiene autorizadas para supervisión.")}</p>
                            </div>
                        </div>

                        {isLoadingAccesses ? (
                            <LoadingState message={t("Cargando accesos...")} />
                        ) : activeAccesses.length === 0 ? (
                            <EmptyState icon="✓" title={t("No existen accesos activos.")} description={t("Asigne una empresa a un monitor para comenzar.")} />
                        ) : (
                            <div className={styles.accessList}>
                                {activeAccesses.map((access) => {
                                    const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username;

                                    return (
                                        <div key={access.id} className={styles.accessCard}>
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
                                    <h2>{t("Historial de Accesos de Monitores")}</h2>
                                    <p>{t("Accesos que fueron revocados anteriormente.")}</p>
                                </div>
                            </div>

                            <div className={styles.accessList}>
                                {historicalAccesses.map((access) => {
                                    const monitorName = [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") || access.user?.username;

                                    return (
                                        <div key={access.id} className={styles.accessCard}>
                                            <div className={styles.accessInformation}>
                                                <div className={styles.accessAvatarMuted}>
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

export default AccessPage;
