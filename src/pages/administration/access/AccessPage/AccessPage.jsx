import { useState } from "react";

import AlertMessage from "../../../../components/common/feedback/AlertMessage/AlertMessage.jsx";
import SectionTabs from "../../../../components/common/navigation/SectionTabs/SectionTabs.jsx";
import Page from "../../../../components/common/layout/Page/Page.jsx";
import AccessAssignmentsSection from "../../../../components/access/sections/AccessAssignmentsSection/AccessAssignmentsSection.jsx";
import AccessMembersSection from "../../../../components/access/sections/AccessMembersSection/AccessMembersSection.jsx";
import AccessMonitorsSection from "../../../../components/access/sections/AccessMonitorsSection/AccessMonitorsSection.jsx";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";
import { useRequestGuard } from "../../../../hooks/useRequestGuard.js";
import { useResourceLifecycle } from "../../../../hooks/useResourceLifecycle.js";
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
} from "../../../../services/access.js";
import {
    getCompanies,
    getCompanyAccesses,
    grantCompanyAccess,
    revokeCompanyAccess,
} from "../../../../services/organizations.js";

import styles from "./AccessPage.module.css";

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
    const [monitorFormVersion, setMonitorFormVersion] = useState(0);
    const [memberFormVersion, setMemberFormVersion] = useState(0);
    const [activeSection, setActiveSection] = useState("monitors");

    const [monitors, setMonitors] = useState([]);
    const [selectedMonitor, setSelectedMonitor] = useState(null);

    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

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

    const loadMonitorsGuard = useRequestGuard("monitors");
    const loadMembersGuard = useRequestGuard("members");
    const loadCompaniesGuard = useRequestGuard("companies");
    const loadCompanyAccessesGuard = useRequestGuard("accesses");
    const handleSelectMonitorGuard = useRequestGuard(activeSection);
    const handleSelectMemberGuard = useRequestGuard(activeSection);

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
        setMonitorFormVersion((current) => current + 1);
    }

    /**
     * resetMemberForm
     *
     * Description:
     * - Restablecer el formulario de miembro.
     */
    function resetMemberForm() {
        setSelectedMember(null);
        setMemberFormVersion((current) => current + 1);
    }

    /**
     * loadMonitors
     *
     * Description:
     * - Obtener los monitores administrados por el usuario.
     */
    async function loadMonitors() {
        const isCurrentRequest = loadMonitorsGuard.begin();
        setIsLoadingMonitors(true);
        setErrorMessage("");

        try {
            const response = await getMonitors();
            if (!isCurrentRequest()) return;
            const monitorList = response?.data || [];

            setMonitors(monitorList);

            if (!accessMonitorId && monitorList.length > 0) {
                setAccessMonitorId(String(monitorList[0].id));
            }
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || "No fue posible cargar los monitores.");
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingMonitors(false);
            }
        }
    }

    /**
     * loadMembers
     *
     * Description:
     * - Obtener los miembros administrados por el usuario.
     */
    async function loadMembers() {
        const isCurrentRequest = loadMembersGuard.begin();
        setIsLoadingMembers(true);
        setErrorMessage("");

        try {
            const response = await getMembers();
            if (!isCurrentRequest()) return;

            setMembers(response?.data || []);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || t("No fue posible cargar los miembros."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingMembers(false);
            }
        }
    }

    /**
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas disponibles para asignación.
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

            if (!accessCompanyId && companyList.length > 0) {
                setAccessCompanyId(String(companyList[0].id));
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
     * loadCompanyAccesses
     *
     * Description:
     * - Obtener los accesos de monitores a empresas.
     */
    async function loadCompanyAccesses() {
        const isCurrentRequest = loadCompanyAccessesGuard.begin();
        setIsLoadingAccesses(true);
        setErrorMessage("");

        try {
            const response = await getCompanyAccesses();
            if (!isCurrentRequest()) return;

            setCompanyAccesses(response?.data || []);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || t("No fue posible cargar los accesos."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingAccesses(false);
            }
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
        const isCurrentRequest = handleSelectMonitorGuard.begin();
        if (isLoadingMonitorDetail) {
            return;
        }

        setIsLoadingMonitorDetail(true);
        clearMessages();

        try {
            const response = await getMonitor(monitor.id);
            if (!isCurrentRequest()) return;
            const monitorDetail = getDetailData(response, "monitor");

            if (!monitorDetail) {
                throw new Error(t("No fue posible obtener la información del monitor."));
            }

            setSelectedMonitor(monitorDetail);
            setMonitorFormVersion((current) => current + 1);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || t("No fue posible cargar el monitor."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingMonitorDetail(false);
            }
        }
    }

    /**
     * handleSelectMember
     *
     * Description:
     * - Obtener y seleccionar un miembro para edición.
     */
    async function handleSelectMember(member) {
        const isCurrentRequest = handleSelectMemberGuard.begin();
        if (isLoadingMemberDetail) {
            return;
        }

        setIsLoadingMemberDetail(true);
        clearMessages();

        try {
            const response = await getMember(member.id);
            if (!isCurrentRequest()) return;
            const memberDetail = getDetailData(response, "member");

            if (!memberDetail) {
                throw new Error(t("No fue posible obtener la información del miembro."));
            }

            setSelectedMember(memberDetail);
            setMemberFormVersion((current) => current + 1);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setErrorMessage(error.message || t("No fue posible cargar el miembro."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingMemberDetail(false);
            }
        }
    }

    /**
     * handleMonitorSubmit
     *
     * Description:
     * - Crear o actualizar un monitor.
     */
    async function handleMonitorSubmit({
        username: monitorUsername,
        email: monitorEmail,
        firstName: monitorFirstName,
        lastName: monitorLastName,
        password: monitorPassword,
    }) {
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
                    setMonitorFormVersion((current) => current + 1);
                }

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
    async function handleMemberSubmit({
        username: memberUsername,
        email: memberEmail,
        firstName: memberFirstName,
        lastName: memberLastName,
        password: memberPassword,
    }) {
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
                    setMemberFormVersion((current) => current + 1);
                }

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

        const monitorName =
            [selectedMonitor.first_name, selectedMonitor.last_name].filter(Boolean).join(" ") ||
            selectedMonitor.username;

        const confirmed = window.confirm(`¿Desea desactivar el monitor "${monitorName}"?`);

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

        const memberName =
            [selectedMember.first_name, selectedMember.last_name].filter(Boolean).join(" ") ||
            selectedMember.username;

        const confirmed = window.confirm(`¿Desea desactivar el miembro "${memberName}"?`);

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

        const monitorName =
            [access.user?.first_name, access.user?.last_name].filter(Boolean).join(" ") ||
            access.user?.username ||
            t("Monitor");
        const companyName = access.company?.name || "empresa";

        const confirmed = window.confirm(
            `¿Desea revocar el acceso de "${monitorName}" a "${companyName}"?`,
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

    useResourceLifecycle(() => {
        loadMonitors();
    }, JSON.stringify([]));

    const activeAccesses = companyAccesses.filter((access) => access.is_active);
    const historicalAccesses = companyAccesses.filter((access) => !access.is_active);

    return (
        <Page
            as="section"
            title={t("Usuarios y accesos")}
            className={styles.accessPage}
            header={{
                eyebrow: t("Administración"),
                title: t("Usuarios y accesos"),
                description: t(
                    "Administre monitores, miembros y accesos de monitoreo a empresas.",
                ),
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

            <AccessMonitorsSection
                activeSection={activeSection}
                t={t}
                resetMonitorForm={resetMonitorForm}
                isLoadingMonitors={isLoadingMonitors}
                monitors={monitors}
                selectedMonitor={selectedMonitor}
                isLoadingMonitorDetail={isLoadingMonitorDetail}
                handleSelectMonitor={handleSelectMonitor}
                monitorFormVersion={monitorFormVersion}
                isSaving={isSaving}
                isDeleting={isDeleting}
                handleMonitorSubmit={handleMonitorSubmit}
                handleDeactivateMonitor={handleDeactivateMonitor}
            />

            <AccessMembersSection
                activeSection={activeSection}
                t={t}
                resetMemberForm={resetMemberForm}
                isLoadingMembers={isLoadingMembers}
                members={members}
                selectedMember={selectedMember}
                isLoadingMemberDetail={isLoadingMemberDetail}
                handleSelectMember={handleSelectMember}
                memberFormVersion={memberFormVersion}
                isSaving={isSaving}
                isDeleting={isDeleting}
                handleMemberSubmit={handleMemberSubmit}
                handleDeactivateMember={handleDeactivateMember}
            />

            <AccessAssignmentsSection
                activeSection={activeSection}
                accessMonitorId={accessMonitorId}
                accessCompanyId={accessCompanyId}
                monitors={monitors}
                companies={companies}
                isSaving={isSaving}
                isLoadingMonitors={isLoadingMonitors}
                isLoadingCompanies={isLoadingCompanies}
                setAccessMonitorId={setAccessMonitorId}
                setAccessCompanyId={setAccessCompanyId}
                handleGrantAccess={handleGrantAccess}
                t={t}
                isLoadingAccesses={isLoadingAccesses}
                activeAccesses={activeAccesses}
                handleRevokeAccess={handleRevokeAccess}
                isDeleting={isDeleting}
                historicalAccesses={historicalAccesses}
            />
        </Page>
    );
}

export default AccessPage;
