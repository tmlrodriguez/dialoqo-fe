import { useEffect, useState } from "react";

import AlertMessage from "../../../components/common/AlertMessage/AlertMessage.jsx";
import EmptyState from "../../../components/common/EmptyState/EmptyState.jsx";
import EntityList from "../../../components/common/EntityList/EntityList.jsx";
import EntityListItem from "../../../components/common/EntityList/EntityListItem.jsx";
import LoadingState from "../../../components/common/LoadingState/LoadingState.jsx";
import PageHeader from "../../../components/common/PageHeader/PageHeader.jsx";
import SectionTabs from "../../../components/common/SectionTabs/SectionTabs.jsx";
import { createMember, createPosition, deactivateMember, deactivatePosition, getMember, getMembers, getPosition, getPositions, updateMember, updatePosition } from "../../../services/members.js";
import { getBranches, getCompanies } from "../../../services/organizations.js";
import MemberForm from "./components/MemberForm.jsx";
import PositionForm from "./components/PositionForm.jsx";
import styles from "./MembersPage.module.css";

const SECTIONS = [
    { value: "members", label: "Miembros" },
    { value: "positions", label: "Posiciones" },
];

/**
 * MembersPage
 *
 * Description:
 * - Gestionar miembros y posiciones operativas.
 *
 * Notes:
 * - La empresa seleccionada establece el contexto administrativo.
 */
function MembersPage() {
    const [activeSection, setActiveSection] = useState("members");
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [branches, setBranches] = useState([]);
    const [positions, setPositions] = useState([]);
    const [members, setMembers] = useState([]);

    const [selectedPosition, setSelectedPosition] = useState(null);
    const [positionName, setPositionName] = useState("");
    const [positionCode, setPositionCode] = useState("");
    const [positionDescription, setPositionDescription] = useState("");

    const [selectedMember, setSelectedMember] = useState(null);
    const [memberBranchId, setMemberBranchId] = useState("");
    const [memberPositionId, setMemberPositionId] = useState("");
    const [memberCode, setMemberCode] = useState("");
    const [memberFirstName, setMemberFirstName] = useState("");
    const [memberLastName, setMemberLastName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [memberNotes, setMemberNotes] = useState("");

    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingPositions, setIsLoadingPositions] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isLoadingPositionDetail, setIsLoadingPositionDetail] = useState(false);
    const [isLoadingMemberDetail, setIsLoadingMemberDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    function clearMessages() {
        setErrorMessage("");
        setSuccessMessage("");
    }

    function resetPositionForm() {
        setSelectedPosition(null);
        setPositionName("");
        setPositionCode("");
        setPositionDescription("");
    }

    function resetMemberForm() {
        setSelectedMember(null);
        setMemberCode("");
        setMemberFirstName("");
        setMemberLastName("");
        setMemberEmail("");
        setMemberNotes("");
        setMemberBranchId(branches.length ? String(branches[0].id) : "");
        setMemberPositionId(positions.length ? String(positions[0].id) : "");
    }

    async function loadCompanies() {
        setIsLoadingCompanies(true);
        try {
            const response = await getCompanies();
            const data = response?.data || [];
            setCompanies(data);
            setSelectedCompanyId((current) => data.some((item) => String(item.id) === String(current)) ? current : data.length ? String(data[0].id) : "");
        } catch (error) {
            setCompanies([]);
            setSelectedCompanyId("");
            setErrorMessage(error.message || "No fue posible cargar las empresas.");
        } finally {
            setIsLoadingCompanies(false);
        }
    }

    async function loadBranches(companyId) {
        if (!companyId) {
            setBranches([]);
            setMemberBranchId("");
            return;
        }
        setIsLoadingBranches(true);
        try {
            const response = await getBranches(companyId);
            const data = response?.data || [];
            setBranches(data);
            setMemberBranchId((current) => data.some((item) => String(item.id) === String(current)) ? current : data.length ? String(data[0].id) : "");
        } catch (error) {
            setBranches([]);
            setMemberBranchId("");
            setErrorMessage(error.message || "No fue posible cargar las sucursales.");
        } finally {
            setIsLoadingBranches(false);
        }
    }

    async function loadPositions(companyId) {
        if (!companyId) {
            setPositions([]);
            setMemberPositionId("");
            return;
        }
        setIsLoadingPositions(true);
        try {
            const response = await getPositions(companyId);
            const data = response?.data || [];
            setPositions(data);
            setMemberPositionId((current) => data.some((item) => String(item.id) === String(current)) ? current : data.length ? String(data[0].id) : "");
        } catch (error) {
            setPositions([]);
            setMemberPositionId("");
            setErrorMessage(error.message || "No fue posible cargar las posiciones.");
        } finally {
            setIsLoadingPositions(false);
        }
    }

    async function loadMembers(companyId) {
        if (!companyId) {
            setMembers([]);
            return;
        }
        setIsLoadingMembers(true);
        try {
            const response = await getMembers(companyId);
            setMembers(response?.data || []);
        } catch (error) {
            setMembers([]);
            setErrorMessage(error.message || "No fue posible cargar los miembros.");
        } finally {
            setIsLoadingMembers(false);
        }
    }

    function handleCompanyChange(event) {
        clearMessages();
        resetPositionForm();
        setSelectedMember(null);
        setBranches([]);
        setPositions([]);
        setMembers([]);
        setMemberBranchId("");
        setMemberPositionId("");
        setMemberCode("");
        setMemberFirstName("");
        setMemberLastName("");
        setMemberEmail("");
        setMemberNotes("");
        setSelectedCompanyId(event.target.value);
    }

    function handleSectionChange(section) {
        setActiveSection(section);
        clearMessages();
        if (section === "members") resetMemberForm();
        if (section === "positions") resetPositionForm();
    }

    async function handleSelectPosition(position) {
        if (!selectedCompanyId || isLoadingPositionDetail) return;
        setIsLoadingPositionDetail(true);
        clearMessages();
        try {
            const response = await getPosition(selectedCompanyId, position.id);
            const detail = response?.data;
            if (!detail) throw new Error("No fue posible obtener la información de la posición.");
            setSelectedPosition(detail);
            setPositionName(detail.name || "");
            setPositionCode(detail.code || "");
            setPositionDescription(detail.description || "");
        } catch (error) {
            setErrorMessage(error.message || "No fue posible cargar la posición.");
        } finally {
            setIsLoadingPositionDetail(false);
        }
    }

    async function handlePositionSubmit(event) {
        event.preventDefault();
        if (!selectedCompanyId || isSaving) return;
        setIsSaving(true);
        clearMessages();
        const data = { name: positionName.trim(), code: positionCode.trim(), description: positionDescription.trim() };
        try {
            if (selectedPosition) {
                await updatePosition(selectedCompanyId, selectedPosition.id, data);
                setSuccessMessage("Posición actualizada correctamente.");
            } else {
                await createPosition(selectedCompanyId, data);
                setSuccessMessage("Posición creada correctamente.");
            }
            resetPositionForm();
            await loadPositions(selectedCompanyId);
        } catch (error) {
            setErrorMessage(error.message || "No fue posible guardar la posición.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeactivatePosition() {
        if (!selectedCompanyId || !selectedPosition || isDeleting) return;
        if (!window.confirm(`¿Desea desactivar la posición "${selectedPosition.name}"?`)) return;
        setIsDeleting(true);
        clearMessages();
        try {
            await deactivatePosition(selectedCompanyId, selectedPosition.id);
            resetPositionForm();
            setSuccessMessage("Posición desactivada correctamente.");
            await loadPositions(selectedCompanyId);
        } catch (error) {
            setErrorMessage(error.message || "No fue posible desactivar la posición.");
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleSelectMember(member) {
        if (!selectedCompanyId || isLoadingMemberDetail) return;
        setIsLoadingMemberDetail(true);
        clearMessages();
        try {
            const response = await getMember(selectedCompanyId, member.id);
            const detail = response?.data;
            if (!detail) throw new Error("No fue posible obtener la información del miembro.");
            setSelectedMember(detail);
            setMemberBranchId(String(detail.branch || ""));
            setMemberPositionId(String(detail.position || ""));
            setMemberCode(detail.member_code || "");
            setMemberFirstName(detail.first_name || "");
            setMemberLastName(detail.last_name || "");
            setMemberEmail(detail.email || "");
            setMemberNotes(detail.notes || "");
        } catch (error) {
            setErrorMessage(error.message || "No fue posible cargar el miembro.");
        } finally {
            setIsLoadingMemberDetail(false);
        }
    }

    async function handleMemberSubmit(event) {
        event.preventDefault();
        if (!selectedCompanyId || !memberBranchId || !memberPositionId || isSaving) return;
        setIsSaving(true);
        clearMessages();
        const data = {
            branch: Number(memberBranchId),
            position: Number(memberPositionId),
            member_code: memberCode.trim(),
            first_name: memberFirstName.trim(),
            last_name: memberLastName.trim(),
            email: memberEmail.trim(),
            notes: memberNotes.trim(),
        };
        try {
            if (selectedMember) {
                await updateMember(selectedCompanyId, selectedMember.id, data);
                setSuccessMessage("Miembro actualizado correctamente.");
            } else {
                await createMember(selectedCompanyId, data);
                setSuccessMessage("Miembro creado correctamente.");
            }
            resetMemberForm();
            await loadMembers(selectedCompanyId);
        } catch (error) {
            setErrorMessage(error.message || "No fue posible guardar el miembro.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeactivateMember() {
        if (!selectedCompanyId || !selectedMember || isDeleting) return;
        const name = [selectedMember.first_name, selectedMember.last_name].filter(Boolean).join(" ");
        if (!window.confirm(`¿Desea desactivar al miembro "${name}"?`)) return;
        setIsDeleting(true);
        clearMessages();
        try {
            await deactivateMember(selectedCompanyId, selectedMember.id);
            resetMemberForm();
            setSuccessMessage("Miembro desactivado correctamente.");
            await loadMembers(selectedCompanyId);
        } catch (error) {
            setErrorMessage(error.message || "No fue posible desactivar el miembro.");
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (!selectedCompanyId) {
            setBranches([]);
            setPositions([]);
            setMembers([]);
            return;
        }
        loadBranches(selectedCompanyId);
        loadPositions(selectedCompanyId);
        loadMembers(selectedCompanyId);
    }, [selectedCompanyId]);

    return (
        <section className={styles.membersPage}>
            <PageHeader eyebrow="Administración" title="Personal" description="Administre los miembros y posiciones operativas de las empresas registradas en Dialoqo." />

            <div className={styles.contextBar}>
                <div className={styles.contextField}>
                    <label htmlFor="members-company">Empresa</label>
                    <select id="members-company" value={selectedCompanyId} onChange={handleCompanyChange} disabled={isLoadingCompanies || companies.length === 0}>
                        {companies.length === 0 && <option value="">No existen empresas disponibles</option>}
                        {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
                    </select>
                </div>
            </div>

            <SectionTabs sections={SECTIONS} activeSection={activeSection} onChange={handleSectionChange} />
            <AlertMessage message={errorMessage} type="error" />
            <AlertMessage message={successMessage} type="success" />

            {activeSection === "members" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Miembros</h2>
                                <p>Miembros activos de la empresa seleccionada.</p>
                            </div>
                            <button className={styles.secondaryButton} type="button" onClick={resetMemberForm} disabled={!selectedCompanyId}>Nuevo miembro</button>
                        </div>

                        {!selectedCompanyId ? (
                            <EmptyState icon="●" title="Seleccione una empresa." description="Debe seleccionar una empresa antes de administrar sus miembros." />
                        ) : isLoadingMembers ? (
                            <LoadingState message="Cargando miembros..." />
                        ) : members.length === 0 ? (
                            <EmptyState icon="●" title="No existen miembros registrados." description="Cree el primer miembro para la empresa seleccionada." />
                        ) : (
                            <EntityList>
                                {members.map((member) => {
                                    const name = [member.first_name, member.last_name].filter(Boolean).join(" ");
                                    const subtitle = [member.member_code, member.position?.name].filter(Boolean).join(" · ");
                                    return (
                                        <EntityListItem
                                            key={member.id}
                                            title={name}
                                            subtitle={subtitle}
                                            initial={(member.first_name || "M").charAt(0).toUpperCase()}
                                            status="Activo"
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
                        companyId={selectedCompanyId}
                        branchId={memberBranchId}
                        positionId={memberPositionId}
                        memberCode={memberCode}
                        firstName={memberFirstName}
                        lastName={memberLastName}
                        email={memberEmail}
                        notes={memberNotes}
                        branches={branches}
                        positions={positions}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        isLoadingBranches={isLoadingBranches}
                        isLoadingPositions={isLoadingPositions}
                        onBranchChange={(event) => setMemberBranchId(event.target.value)}
                        onPositionChange={(event) => setMemberPositionId(event.target.value)}
                        onMemberCodeChange={(event) => setMemberCode(event.target.value)}
                        onFirstNameChange={(event) => setMemberFirstName(event.target.value)}
                        onLastNameChange={(event) => setMemberLastName(event.target.value)}
                        onEmailChange={(event) => setMemberEmail(event.target.value)}
                        onNotesChange={(event) => setMemberNotes(event.target.value)}
                        onSubmit={handleMemberSubmit}
                        onReset={resetMemberForm}
                        onDeactivate={handleDeactivateMember}
                    />
                </div>
            )}

            {activeSection === "positions" && (
                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Posiciones</h2>
                                <p>Posiciones activas de la empresa seleccionada.</p>
                            </div>
                            <button className={styles.secondaryButton} type="button" onClick={resetPositionForm} disabled={!selectedCompanyId}>Nueva posición</button>
                        </div>

                        {!selectedCompanyId ? (
                            <EmptyState icon="▦" title="Seleccione una empresa." description="Debe seleccionar una empresa antes de administrar sus posiciones." />
                        ) : isLoadingPositions ? (
                            <LoadingState message="Cargando posiciones..." />
                        ) : positions.length === 0 ? (
                            <EmptyState icon="▦" title="No existen posiciones registradas." description="Cree la primera posición para la empresa seleccionada." />
                        ) : (
                            <EntityList>
                                {positions.map((position) => (
                                    <EntityListItem
                                        key={position.id}
                                        title={position.name}
                                        subtitle={position.code}
                                        initial={(position.name || "P").charAt(0).toUpperCase()}
                                        status="Activa"
                                        isActive={selectedPosition?.id === position.id}
                                        disabled={isLoadingPositionDetail}
                                        onClick={() => handleSelectPosition(position)}
                                    />
                                ))}
                            </EntityList>
                        )}
                    </section>

                    <PositionForm
                        selectedPosition={selectedPosition}
                        companyId={selectedCompanyId}
                        name={positionName}
                        code={positionCode}
                        description={positionDescription}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        onNameChange={(event) => setPositionName(event.target.value)}
                        onCodeChange={(event) => setPositionCode(event.target.value)}
                        onDescriptionChange={(event) => setPositionDescription(event.target.value)}
                        onSubmit={handlePositionSubmit}
                        onReset={resetPositionForm}
                        onDeactivate={handleDeactivatePosition}
                    />
                </div>
            )}
        </section>
    );
}

export default MembersPage;
