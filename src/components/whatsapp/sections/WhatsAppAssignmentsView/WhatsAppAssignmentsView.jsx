import Button from "../../../common/buttons/Button/Button.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";
import AssignmentHistoryList from "../../lists/AssignmentHistoryList/AssignmentHistoryList.jsx";

import NumberAssignmentForm from "../../forms/NumberAssignmentForm/NumberAssignmentForm.jsx";

import styles from "./WhatsAppAssignmentsView.module.css";

/**
 * WhatsAppAssignmentsView
 * Description: Present WhatsApp resources and delegate all operations to the page.
 */
function WhatsAppAssignmentsView({
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
}) {
    return (
        <>
            <div className={styles.contextBar}>
                <div className={styles.contextGrid}>
                    <div className={styles.contextField}>
                        <label htmlFor="assignment-branch">{t("Sucursal")}</label>

                        <Input
                            as="select"
                            id="assignment-branch"
                            value={selectedBranchId}
                            onChange={handleBranchChange}
                            disabled={
                                isLoadingBranches || branches.length === 0 || operationInProgress
                            }
                        >
                            {branches.length === 0 && (
                                <option value="">{t("No existen sucursales disponibles")}</option>
                            )}

                            <OptionList
                                items={branches}
                                getValue={(branch) => branch.id}
                                getLabel={(branch) => <>{branch.name}</>}
                            />
                        </Input>
                    </div>

                    <div className={styles.contextField}>
                        <label htmlFor="assignment-number">{t("Número de WhatsApp")}</label>

                        <Input
                            as="select"
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
                                <option value="">{t("No existen números disponibles")}</option>
                            )}

                            <OptionList
                                items={numbers}
                                getValue={(number) => number.id}
                                getLabel={(number) => (
                                    <>
                                        {number.display_name} — {number.phone_number}
                                    </>
                                )}
                            />
                        </Input>
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

                    <strong>{t("Seleccione una sucursal.")}</strong>

                    <span>
                        {t(
                            "Las asignaciones se administran dentro del contexto de los números de cada sucursal.",
                        )}
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

                    <strong>{t("Seleccione un número de WhatsApp.")}</strong>

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

                                <h2>{t("Asignación")}</h2>

                                <p>
                                    {selectedNumber
                                        ? `${selectedNumber.display_name} · ${selectedNumber.phone_number}`
                                        : t("Número seleccionado")}
                                </p>
                            </div>

                            {currentAssignment && (
                                <span className={styles.activeBadge}>{t("Activa")}</span>
                            )}
                        </div>

                        {isLoadingAssignments ? (
                            <div className={styles.loadingState}>{t("Cargando asignación...")}</div>
                        ) : currentAssignment ? (
                            <div className={styles.currentAssignment}>
                                <div className={styles.memberSummary}>
                                    <div className={styles.memberAvatar}>
                                        {(
                                            currentAssignment.member?.first_name ||
                                            currentAssignment.member?.username ||
                                            "M"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className={styles.memberInformation}>
                                        <strong>{getMemberName(currentAssignment.member)}</strong>

                                        <span>
                                            {getMemberDescription(currentAssignment.member) ||
                                                t("Usuario MEMBER")}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.assignmentMetadata}>
                                    <div>
                                        <span>{t("Asignado desde")}</span>

                                        <strong>
                                            {formatDateTime(currentAssignment.assigned_at)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>{t("Sucursal del número")}</span>

                                        <strong>{selectedBranch?.name || "—"}</strong>
                                    </div>
                                </div>

                                <Button
                                    className={styles.unassignButton}
                                    type="button"
                                    onClick={handleUnassign}
                                    disabled={operationInProgress}
                                >
                                    {isUnassigning
                                        ? t("Finalizando asignación...")
                                        : t("Finalizar asignación")}
                                </Button>
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

                                <strong>{t("El número no tiene responsable.")}</strong>

                                <span>
                                    {t(
                                        "Seleccione un usuario MEMBER para establecer la responsabilidad actual.",
                                    )}
                                </span>
                            </div>
                        )}

                        <NumberAssignmentForm
                            handleAssign={handleAssign}
                            t={t}
                            selectedMemberId={selectedMemberId}
                            setSelectedMemberId={setSelectedMemberId}
                            isLoadingMembers={isLoadingMembers}
                            members={members}
                            operationInProgress={operationInProgress}
                            getMemberName={getMemberName}
                            getMemberDescription={getMemberDescription}
                            isAssigning={isAssigning}
                            currentAssignment={currentAssignment}
                        />
                    </section>

                    <section className={styles.historyPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <span className={styles.eyebrow}>{t("Trazabilidad")}</span>

                                <h2>{t("Historial")}</h2>

                                <p>{t("Responsables actuales y anteriores del número.")}</p>
                            </div>
                        </div>

                        {isLoadingAssignments ? (
                            <div className={styles.loadingState}>{t("Cargando historial...")}</div>
                        ) : assignmentHistory.length === 0 ? (
                            <div className={styles.historyEmpty}>
                                <strong>{t("No existen asignaciones históricas.")}</strong>

                                <span>
                                    {t("El historial aparecerá cuando el número sea asignado.")}
                                </span>
                            </div>
                        ) : (
                            <div className={styles.historyList}>
                                <AssignmentHistoryList
                                    items={assignmentHistory}
                                    getMemberName={getMemberName}
                                    getMemberDescription={getMemberDescription}
                                    t={t}
                                    formatDateTime={formatDateTime}
                                />
                            </div>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}

export default WhatsAppAssignmentsView;
