import { useEffect, useState } from "react";

import { getMembers } from "../../../services/access.js";
import { getBranches } from "../../../services/organizations.js";
import {
    assignWhatsAppNumber,
    getNumberAssignments,
    getWhatsAppNumbers,
    unassignWhatsAppNumber,
} from "../../../services/whatsapp.js";

import styles from "./NumberAssignmentPanel.module.css";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * NumberAssignmentPanel
 *
 * Description:
 * - Administrar la responsabilidad de números corporativos de WhatsApp mediante usuarios MEMBER.
 *
 * Notes:
 * - La empresa es determinada por la página administrativa padre.
 * - La sucursal determina el contexto del número de WhatsApp.
 * - Los responsables son usuarios autenticados de Dialoqo con rol MEMBER.
 * - Los MEMBER son administrados por el mismo ADMINISTRATOR propietario de la empresa.
 * - Solo una asignación activa puede existir por número.
 * - Las reasignaciones preservan el historial en el backend.
 */
function NumberAssignmentPanel({
    companyId,
    onError,
    onSuccess,
}) {
    const { t } = usePageTranslation();
    const [branches, setBranches] = useState([]);
    const [numbers, setNumbers] = useState([]);
    const [members, setMembers] = useState([]);

    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [selectedNumberId, setSelectedNumberId] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");

    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [assignmentHistory, setAssignmentHistory] = useState([]);

    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

    const [isAssigning, setIsAssigning] = useState(false);
    const [isUnassigning, setIsUnassigning] = useState(false);


    /**
     * clearParentMessages
     *
     * Description:
     * - Limpiar los mensajes administrados por la página padre.
     */
    function clearParentMessages() {
        onError?.("");
        onSuccess?.("");
    }


    /**
     * resetAssignmentState
     *
     * Description:
     * - Limpiar la asignación actual y su historial.
     *
     * Notes:
     * - No modifica selectedMemberId para preservar la selección disponible.
     */
    function resetAssignmentState() {
        setCurrentAssignment(null);
        setAssignmentHistory([]);
    }


    /**
     * resetMemberSelection
     *
     * Description:
     * - Limpiar explícitamente la selección del usuario MEMBER.
     */
    function resetMemberSelection() {
        setSelectedMemberId("");
    }


    /**
     * loadBranches
     *
     * Description:
     * - Obtener las sucursales activas de la empresa seleccionada.
     */
    async function loadBranches() {
        if (!companyId) {
            setBranches([]);
            setSelectedBranchId("");
            return;
        }

        setIsLoadingBranches(true);

        try {
            const response = await getBranches(companyId);
            const branchList = response?.data || [];

            setBranches(branchList);

            setSelectedBranchId((currentBranchId) => {
                const branchExists = branchList.some(
                    (branch) => String(branch.id) === String(currentBranchId)
                );

                if (branchExists) {
                    return currentBranchId;
                }

                return branchList.length > 0
                    ? String(branchList[0].id)
                    : "";
            });
        } catch (error) {
            setBranches([]);
            setSelectedBranchId("");

            onError?.(
                error.message ||
                t("No fue posible cargar las sucursales.")
            );
        } finally {
            setIsLoadingBranches(false);
        }
    }


    /**
     * loadMembers
     *
     * Description:
     * - Obtener los usuarios MEMBER administrados por el usuario autenticado.
     *
     * Notes:
     * - Los MEMBER no dependen de la sucursal seleccionada.
     * - Selecciona automáticamente el primer MEMBER disponible.
     * - La autorización final de asignación es validada nuevamente por el backend.
     */
    async function loadMembers() {
        if (!companyId) {
            setMembers([]);
            setSelectedMemberId("");
            return;
        }

        setIsLoadingMembers(true);

        try {
            const response = await getMembers();
            const memberList = response?.data || [];

            setMembers(memberList);

            setSelectedMemberId((currentMemberId) => {
                const memberExists = memberList.some(
                    (member) => String(member.id) === String(currentMemberId)
                );

                if (memberExists) {
                    return currentMemberId;
                }

                return memberList.length > 0
                    ? String(memberList[0].id)
                    : "";
            });
        } catch (error) {
            setMembers([]);
            setSelectedMemberId("");

            onError?.(
                error.message ||
                t("No fue posible cargar los miembros.")
            );
        } finally {
            setIsLoadingMembers(false);
        }
    }


    /**
     * loadNumbers
     *
     * Description:
     * - Obtener los números activos de la sucursal seleccionada.
     */
    async function loadNumbers(branchId) {
        if (!companyId || !branchId) {
            setNumbers([]);
            setSelectedNumberId("");
            return;
        }

        setIsLoadingNumbers(true);

        try {
            const response = await getWhatsAppNumbers(
                companyId,
                branchId
            );

            const numberList = response?.data || [];

            setNumbers(numberList);

            setSelectedNumberId((currentNumberId) => {
                const numberExists = numberList.some(
                    (number) => String(number.id) === String(currentNumberId)
                );

                if (numberExists) {
                    return currentNumberId;
                }

                return numberList.length > 0
                    ? String(numberList[0].id)
                    : "";
            });
        } catch (error) {
            setNumbers([]);
            setSelectedNumberId("");

            onError?.(
                error.message ||
                t("No fue posible cargar los números de WhatsApp.")
            );
        } finally {
            setIsLoadingNumbers(false);
        }
    }


    /**
     * loadAssignments
     *
     * Description:
     * - Obtener la asignación actual y el historial del número seleccionado.
     *
     * Notes:
     * - Si existe una asignación activa, selecciona su MEMBER.
     * - Si no existe asignación, conserva el MEMBER disponible seleccionado.
     */
    async function loadAssignments(numberId) {
        if (!companyId || !selectedBranchId || !numberId) {
            resetAssignmentState();
            return;
        }

        setIsLoadingAssignments(true);

        try {
            const response = await getNumberAssignments(
                companyId,
                selectedBranchId,
                numberId
            );

            const assignmentData = response?.data || {};
            const activeAssignment = assignmentData.current_assignment || null;

            setCurrentAssignment(activeAssignment);
            setAssignmentHistory(assignmentData.history || []);

            if (activeAssignment?.member?.id) {
                setSelectedMemberId(
                    String(activeAssignment.member.id)
                );
            } else {
                setSelectedMemberId((currentMemberId) => {
                    const memberExists = members.some(
                        (member) => String(member.id) === String(currentMemberId)
                    );

                    if (memberExists) {
                        return currentMemberId;
                    }

                    return members.length > 0
                        ? String(members[0].id)
                        : "";
                });
            }
        } catch (error) {
            resetAssignmentState();

            onError?.(
                error.message ||
                t("No fue posible cargar las asignaciones del número.")
            );
        } finally {
            setIsLoadingAssignments(false);
        }
    }


    /**
     * handleBranchChange
     *
     * Description:
     * - Cambiar la sucursal utilizada para administrar los números.
     */
    function handleBranchChange(event) {
        const branchId = event.target.value;

        clearParentMessages();

        setSelectedBranchId(branchId);
        setSelectedNumberId("");
        setNumbers([]);

        resetAssignmentState();
    }


    /**
     * handleNumberChange
     *
     * Description:
     * - Cambiar el número utilizado para administrar la responsabilidad.
     */
    function handleNumberChange(event) {
        clearParentMessages();

        setSelectedNumberId(event.target.value);

        resetAssignmentState();
    }


    /**
     * handleAssign
     *
     * Description:
     * - Asignar o reasignar el número seleccionado a un usuario MEMBER.
     */
    async function handleAssign(event) {
        event.preventDefault();

        if (
            !companyId ||
            !selectedBranchId ||
            !selectedNumberId ||
            !selectedMemberId ||
            isAssigning
        ) {
            return;
        }

        if (
            currentAssignment &&
            String(currentAssignment.member?.id) === String(selectedMemberId)
        ) {
            onError?.(
                t("El número ya se encuentra asignado al miembro seleccionado.")
            );

            return;
        }

        let confirmed = true;

        if (currentAssignment) {
            const currentMemberName = getMemberName(
                currentAssignment.member
            );

            const nextMember = members.find(
                (member) => String(member.id) === String(selectedMemberId)
            );

            const nextMemberName = getMemberName(nextMember);

            confirmed = window.confirm(
                `${t("El número se encuentra actualmente asignado a")} "${currentMemberName}". ${t("¿Desea reasignarlo a")} "${nextMemberName}"?`
            );
        }

        if (!confirmed) {
            return;
        }

        setIsAssigning(true);
        clearParentMessages();

        try {
            const response = await assignWhatsAppNumber(
                companyId,
                selectedBranchId,
                selectedNumberId,
                Number(selectedMemberId)
            );

            onSuccess?.(
                response?.success_message ||
                t("Número de WhatsApp asignado correctamente.")
            );

            await loadAssignments(selectedNumberId);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible asignar el número de WhatsApp.")
            );
        } finally {
            setIsAssigning(false);
        }
    }


    /**
     * handleUnassign
     *
     * Description:
     * - Finalizar la asignación activa del número seleccionado.
     */
    async function handleUnassign() {
        if (
            !companyId ||
            !selectedBranchId ||
            !selectedNumberId ||
            !currentAssignment ||
            isUnassigning
        ) {
            return;
        }

        const memberName = getMemberName(
            currentAssignment.member
        );

        const confirmed = window.confirm(
            `${t("¿Desea finalizar la asignación de")} "${memberName}" ${t("para este número?")}`
        );

        if (!confirmed) {
            return;
        }

        setIsUnassigning(true);
        clearParentMessages();

        try {
            const response = await unassignWhatsAppNumber(
                companyId,
                selectedBranchId,
                selectedNumberId
            );

            onSuccess?.(
                response?.success_message ||
                t("Número de WhatsApp desasignado correctamente.")
            );

            await loadAssignments(selectedNumberId);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible finalizar la asignación.")
            );
        } finally {
            setIsUnassigning(false);
        }
    }


    /**
     * getMemberName
     *
     * Description:
     * - Obtener el nombre visible de un usuario MEMBER.
     */
    function getMemberName(member) {
        if (!member) {
            return t("Miembro");
        }

        const fullName = [
            member.first_name,
            member.last_name,
        ]
            .filter(Boolean)
            .join(" ");

        return fullName || member.username || t("Miembro");
    }


    /**
     * getMemberDescription
     *
     * Description:
     * - Obtener información secundaria para identificar al usuario MEMBER.
     */
    function getMemberDescription(member) {
        if (!member) {
            return "";
        }

        return member.username || "";
    }


    /**
     * getSelectedNumber
     *
     * Description:
     * - Obtener el número actualmente seleccionado.
     */
    function getSelectedNumber() {
        return numbers.find(
            (number) => String(number.id) === String(selectedNumberId)
        ) || null;
    }


    /**
     * formatDateTime
     *
     * Description:
     * - Convertir una fecha ISO a una representación legible.
     */
    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(getLanguageLocale(), {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }


    const selectedNumber = getSelectedNumber();

    const selectedBranch = branches.find(
        (branch) => String(branch.id) === String(selectedBranchId)
    ) || null;

    const operationInProgress =
        isAssigning ||
        isUnassigning;


    useEffect(() => {
        setBranches([]);
        setNumbers([]);
        setMembers([]);

        setSelectedBranchId("");
        setSelectedNumberId("");

        resetMemberSelection();
        resetAssignmentState();

        loadBranches();
        loadMembers();
    }, [companyId]);


    useEffect(() => {
        setNumbers([]);
        setSelectedNumberId("");

        resetAssignmentState();

        if (selectedBranchId) {
            loadNumbers(selectedBranchId);
        }
    }, [selectedBranchId]);


    useEffect(() => {
        resetAssignmentState();

        if (selectedNumberId) {
            loadAssignments(selectedNumberId);
        }
    }, [selectedNumberId]);


    return (
        <div className={styles.assignmentSection}>
            <div className={styles.contextBar}>
                <div className={styles.contextGrid}>
                    <div className={styles.contextField}>
                        <label htmlFor="assignment-branch">
                            {t("Sucursal")}
                        </label>

                        <select
                            id="assignment-branch"
                            value={selectedBranchId}
                            onChange={handleBranchChange}
                            disabled={
                                isLoadingBranches ||
                                branches.length === 0 ||
                                operationInProgress
                            }
                        >
                            {branches.length === 0 && (
                                <option value="">
                                    {t("No existen sucursales disponibles")}
                                </option>
                            )}

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.contextField}>
                        <label htmlFor="assignment-number">
                            {t("Número de WhatsApp")}
                        </label>

                        <select
                            id="assignment-number"
                            value={selectedNumberId}
                            onChange={handleNumberChange}
                            disabled={
                                !selectedBranchId ||
                                isLoadingNumbers ||
                                numbers.length === 0 ||
                                operationInProgress
                            }
                        >
                            {numbers.length === 0 && (
                                <option value="">
                                    {t("No existen números disponibles")}
                                </option>
                            )}

                            {numbers.map((number) => (
                                <option
                                    key={number.id}
                                    value={number.id}
                                >
                                    {number.display_name} — {number.phone_number}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {!selectedBranchId ? (
                <section className={styles.emptyPanel}>
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
                            <path d="M8 7a4 4 0 1 0 8 0" />
                            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                        </svg>
                    </div>

                    <strong>
                        {t("Seleccione una sucursal.")}
                    </strong>

                    <span>
                        {t("Las asignaciones se administran dentro del contexto de los números de cada sucursal.")}
                    </span>
                </section>
            ) : !selectedNumberId ? (
                <section className={styles.emptyPanel}>
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
                            <rect x="6" y="2.5" width="12" height="19" rx="2" />
                            <path d="M10 18h4" />
                        </svg>
                    </div>

                    <strong>
                        {t("Seleccione un número de WhatsApp.")}
                    </strong>

                    <span>
                        {t("Debe seleccionar un número para consultar o modificar su responsable.")}
                    </span>
                </section>
            ) : (
                <div className={styles.assignmentWorkspace}>
                    <section className={styles.currentPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.eyebrow}>
                                    {t("Responsabilidad actual")}
                                </span>

                                <h2>
                                    {t("Asignación")}
                                </h2>

                                <p>
                                    {selectedNumber
                                        ? `${selectedNumber.display_name} · ${selectedNumber.phone_number}`
                                        : t("Número seleccionado")}
                                </p>
                            </div>

                            {currentAssignment && (
                                <span className={styles.activeBadge}>
                                    {t("Activa")}
                                </span>
                            )}
                        </div>

                        {isLoadingAssignments ? (
                            <div className={styles.loadingState}>
                                {t("Cargando asignación...")}
                            </div>
                        ) : currentAssignment ? (
                            <div className={styles.currentAssignment}>
                                <div className={styles.memberSummary}>
                                    <div className={styles.memberAvatar}>
                                        {(currentAssignment.member?.first_name || currentAssignment.member?.username || "M")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className={styles.memberInformation}>
                                        <strong>
                                            {getMemberName(currentAssignment.member)}
                                        </strong>

                                        <span>
                                            {getMemberDescription(currentAssignment.member) || t("Usuario MEMBER")}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.assignmentMetadata}>
                                    <div>
                                        <span>
                                            {t("Asignado desde")}
                                        </span>

                                        <strong>
                                            {formatDateTime(currentAssignment.assigned_at)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            {t("Sucursal del número")}
                                        </span>

                                        <strong>
                                            {selectedBranch?.name || "—"}
                                        </strong>
                                    </div>
                                </div>

                                <button
                                    className={styles.unassignButton}
                                    type="button"
                                    onClick={handleUnassign}
                                    disabled={operationInProgress}
                                >
                                    {isUnassigning
                                        ? t("Finalizando asignación...")
                                        : t("Finalizar asignación")}
                                </button>
                            </div>
                        ) : (
                            <div className={styles.noAssignment}>
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
                                        <path d="M8 7a4 4 0 1 0 8 0" />
                                        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                                    </svg>
                                </div>

                                <strong>
                                    {t("El número no tiene responsable.")}
                                </strong>

                                <span>
                                    {t("Seleccione un usuario MEMBER para establecer la responsabilidad actual.")}
                                </span>
                            </div>
                        )}

                        <form
                            className={styles.assignmentForm}
                            onSubmit={handleAssign}
                        >
                            <div className={styles.formField}>
                                <label htmlFor="assignment-member">
                                    {t("Miembro")}
                                </label>

                                <select
                                    id="assignment-member"
                                    value={selectedMemberId}
                                    onChange={(event) => setSelectedMemberId(event.target.value)}
                                    disabled={
                                        isLoadingMembers ||
                                        members.length === 0 ||
                                        operationInProgress
                                    }
                                    required
                                >
                                    {members.length === 0 && (
                                        <option value="">
                                            {t("No existen miembros disponibles")}
                                        </option>
                                    )}

                                    {members.map((member) => (
                                        <option
                                            key={member.id}
                                            value={member.id}
                                        >
                                            {getMemberName(member)}
                                            {getMemberDescription(member)
                                                ? ` — ${getMemberDescription(member)}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                <span className={styles.fieldHelp}>
                                    {t("Se muestran los usuarios MEMBER administrados por su cuenta.")}
                                </span>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    className={styles.primaryButton}
                                    type="submit"
                                    disabled={
                                        !selectedMemberId ||
                                        members.length === 0 ||
                                        operationInProgress
                                    }
                                >
                                    {isAssigning
                                        ? t("Asignando...")
                                        : currentAssignment
                                            ? t("Reasignar número")
                                            : t("Asignar número")}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className={styles.historyPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.eyebrow}>
                                    {t("Trazabilidad")}
                                </span>

                                <h2>
                                    {t("Historial")}
                                </h2>

                                <p>
                                    {t("Responsables actuales y anteriores del número.")}
                                </p>
                            </div>
                        </div>

                        {isLoadingAssignments ? (
                            <div className={styles.loadingState}>
                                {t("Cargando historial...")}
                            </div>
                        ) : assignmentHistory.length === 0 ? (
                            <div className={styles.historyEmpty}>
                                <strong>
                                    {t("No existen asignaciones históricas.")}
                                </strong>

                                <span>
                                    {t("El historial aparecerá cuando el número sea asignado.")}
                                </span>
                            </div>
                        ) : (
                            <div className={styles.historyList}>
                                {assignmentHistory.map((assignment) => (
                                    <article
                                        key={assignment.id}
                                        className={styles.historyCard}
                                    >
                                        <div className={styles.historyMain}>
                                            <div
                                                className={
                                                    assignment.is_active
                                                        ? styles.historyAvatarActive
                                                        : styles.historyAvatar
                                                }
                                            >
                                                {(assignment.member?.first_name || assignment.member?.username || "M")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className={styles.historyInformation}>
                                                <strong>
                                                    {getMemberName(assignment.member)}
                                                </strong>

                                                <span>
                                                    {getMemberDescription(assignment.member) || t("Usuario MEMBER")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.historyDates}>
                                            <span>
                                                {formatDateTime(assignment.assigned_at)}
                                            </span>

                                            <span>
                                                {assignment.is_active
                                                    ? t("Actual")
                                                    : `${t("Hasta el")} ${formatDateTime(assignment.unassigned_at)}`}
                                            </span>
                                        </div>

                                        <span
                                            className={
                                                assignment.is_active
                                                    ? styles.activeBadge
                                                    : styles.inactiveBadge
                                            }
                                        >
                                            {assignment.is_active
                                                ? t("Activa")
                                                : t("Finalizada")}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

export default NumberAssignmentPanel;
