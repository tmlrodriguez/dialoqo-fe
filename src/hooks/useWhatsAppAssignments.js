import { useState } from "react";

import { usePageTranslation } from "./usePageTranslation.js";

import { useRequestGuard } from "./useRequestGuard.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { getMembers } from "../services/access.js";
import { getBranches } from "../services/organizations.js";
import {
    assignWhatsAppNumber,
    getNumberAssignments,
    getWhatsAppNumbers,
    unassignWhatsAppNumber,
} from "../services/whatsapp.js";
import { getLanguageLocale } from "../utils/i18n.js";

/**
 * useWhatsAppAssignments
 * Description: Own the selected company resource, mutations and request lifecycle.
 */
export function useWhatsAppAssignments({ companyId, onError, onSuccess }) {
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

    const loadBranchesGuard = useRequestGuard(companyId);
    const loadMembersGuard = useRequestGuard(companyId);
    const loadNumbersGuard = useRequestGuard(JSON.stringify([companyId, selectedBranchId]));
    const loadAssignmentsGuard = useRequestGuard(
        JSON.stringify([companyId, selectedBranchId, selectedNumberId]),
    );

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
        const isCurrentRequest = loadBranchesGuard.begin();
        if (!companyId) {
            setBranches([]);
            setSelectedBranchId("");
            return;
        }

        setIsLoadingBranches(true);

        try {
            const response = await getBranches(companyId);
            if (!isCurrentRequest()) return;
            const branchList = response?.data || [];

            setBranches(branchList);

            setSelectedBranchId((currentBranchId) => {
                const branchExists = branchList.some(
                    (branch) => String(branch.id) === String(currentBranchId),
                );

                if (branchExists) {
                    return currentBranchId;
                }

                return branchList.length > 0 ? String(branchList[0].id) : "";
            });
        } catch (error) {
            if (!isCurrentRequest()) return;
            setBranches([]);
            setSelectedBranchId("");

            onError?.(error.message || t("No fue posible cargar las sucursales."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingBranches(false);
            }
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
        const isCurrentRequest = loadMembersGuard.begin();
        if (!companyId) {
            setMembers([]);
            setSelectedMemberId("");
            return;
        }

        setIsLoadingMembers(true);

        try {
            const response = await getMembers();
            if (!isCurrentRequest()) return;
            const memberList = response?.data || [];

            setMembers(memberList);

            setSelectedMemberId((currentMemberId) => {
                const memberExists = memberList.some(
                    (member) => String(member.id) === String(currentMemberId),
                );

                if (memberExists) {
                    return currentMemberId;
                }

                return memberList.length > 0 ? String(memberList[0].id) : "";
            });
        } catch (error) {
            if (!isCurrentRequest()) return;
            setMembers([]);
            setSelectedMemberId("");

            onError?.(error.message || t("No fue posible cargar los miembros."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingMembers(false);
            }
        }
    }

    /**
     * loadNumbers
     *
     * Description:
     * - Obtener los números activos de la sucursal seleccionada.
     */
    async function loadNumbers(branchId) {
        const isCurrentRequest = loadNumbersGuard.begin();
        if (!companyId || !branchId) {
            setNumbers([]);
            setSelectedNumberId("");
            return;
        }

        setIsLoadingNumbers(true);

        try {
            const response = await getWhatsAppNumbers(companyId, branchId);
            if (!isCurrentRequest()) return;

            const numberList = response?.data || [];

            setNumbers(numberList);

            setSelectedNumberId((currentNumberId) => {
                const numberExists = numberList.some(
                    (number) => String(number.id) === String(currentNumberId),
                );

                if (numberExists) {
                    return currentNumberId;
                }

                return numberList.length > 0 ? String(numberList[0].id) : "";
            });
        } catch (error) {
            if (!isCurrentRequest()) return;
            setNumbers([]);
            setSelectedNumberId("");

            onError?.(error.message || t("No fue posible cargar los números de WhatsApp."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingNumbers(false);
            }
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
        const isCurrentRequest = loadAssignmentsGuard.begin();
        if (!companyId || !selectedBranchId || !numberId) {
            resetAssignmentState();
            return;
        }

        setIsLoadingAssignments(true);

        try {
            const response = await getNumberAssignments(companyId, selectedBranchId, numberId);
            if (!isCurrentRequest()) return;

            const assignmentData = response?.data || {};
            const activeAssignment = assignmentData.current_assignment || null;

            setCurrentAssignment(activeAssignment);
            setAssignmentHistory(assignmentData.history || []);

            if (activeAssignment?.member?.id) {
                setSelectedMemberId(String(activeAssignment.member.id));
            } else {
                setSelectedMemberId((currentMemberId) => {
                    const memberExists = members.some(
                        (member) => String(member.id) === String(currentMemberId),
                    );

                    if (memberExists) {
                        return currentMemberId;
                    }

                    return members.length > 0 ? String(members[0].id) : "";
                });
            }
        } catch (error) {
            if (!isCurrentRequest()) return;
            resetAssignmentState();

            onError?.(error.message || t("No fue posible cargar las asignaciones del número."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingAssignments(false);
            }
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
            onError?.(t("El número ya se encuentra asignado al miembro seleccionado."));

            return;
        }

        let confirmed = true;

        if (currentAssignment) {
            const currentMemberName = getMemberName(currentAssignment.member);

            const nextMember = members.find(
                (member) => String(member.id) === String(selectedMemberId),
            );

            const nextMemberName = getMemberName(nextMember);

            confirmed = window.confirm(
                `${t("El número se encuentra actualmente asignado a")} "${currentMemberName}". ${t("¿Desea reasignarlo a")} "${nextMemberName}"?`,
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
                Number(selectedMemberId),
            );

            onSuccess?.(
                response?.success_message || t("Número de WhatsApp asignado correctamente."),
            );

            await loadAssignments(selectedNumberId);
        } catch (error) {
            onError?.(error.message || t("No fue posible asignar el número de WhatsApp."));
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

        const memberName = getMemberName(currentAssignment.member);

        const confirmed = window.confirm(
            `${t("¿Desea finalizar la asignación de")} "${memberName}" ${t("para este número?")}`,
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
                selectedNumberId,
            );

            onSuccess?.(
                response?.success_message || t("Número de WhatsApp desasignado correctamente."),
            );

            await loadAssignments(selectedNumberId);
        } catch (error) {
            onError?.(error.message || t("No fue posible finalizar la asignación."));
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

        const fullName = [member.first_name, member.last_name].filter(Boolean).join(" ");

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
        return numbers.find((number) => String(number.id) === String(selectedNumberId)) || null;
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

    const selectedBranch =
        branches.find((branch) => String(branch.id) === String(selectedBranchId)) || null;

    const operationInProgress = isAssigning || isUnassigning;

    useResourceLifecycle(
        () => {
            setBranches([]);
            setNumbers([]);
            setMembers([]);

            setSelectedBranchId("");
            setSelectedNumberId("");

            resetMemberSelection();
            resetAssignmentState();

            loadBranches();
            loadMembers();
        },
        JSON.stringify([companyId]),
    );

    useResourceLifecycle(
        () => {
            setNumbers([]);
            setSelectedNumberId("");

            resetAssignmentState();

            if (selectedBranchId) {
                loadNumbers(selectedBranchId);
            }
        },
        JSON.stringify([selectedBranchId]),
    );

    useResourceLifecycle(
        () => {
            resetAssignmentState();

            if (selectedNumberId) {
                loadAssignments(selectedNumberId);
            }
        },
        JSON.stringify([selectedNumberId]),
    );

    return {
        t,
        selectedBranchId,
        handleBranchChange,
        isLoadingBranches,
        branches,
        operationInProgress,
        selectedNumberId,
        handleNumberChange,
        isLoadingNumbers,
        numbers,
        selectedNumber,
        currentAssignment,
        isLoadingAssignments,
        getMemberName,
        getMemberDescription,
        formatDateTime,
        selectedBranch,
        handleUnassign,
        isUnassigning,
        handleAssign,
        selectedMemberId,
        setSelectedMemberId,
        isLoadingMembers,
        members,
        isAssigning,
        assignmentHistory,
    };
}
