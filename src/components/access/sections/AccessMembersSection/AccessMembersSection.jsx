import Button from "../../../common/buttons/Button/Button.jsx";
import EmptyState from "../../../common/feedback/EmptyState/EmptyState.jsx";
import EntityList from "../../../common/lists/EntityList/EntityList.jsx";
import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MemberForm from "../../forms/MemberForm/MemberForm.jsx";

import MemberList from "../../lists/MemberList/MemberList.jsx";

import styles from "./AccessMembersSection.module.css";

/**
 * AccessMembersSection
 * Description: Present a page section with explicit data and action props.
 */
function AccessMembersSection({
    activeSection,
    t,
    resetMemberForm,
    isLoadingMembers,
    members,
    selectedMember,
    isLoadingMemberDetail,
    handleSelectMember,
    memberFormVersion,
    isSaving,
    isDeleting,
    handleMemberSubmit,
    handleDeactivateMember,
}) {
    return (
        activeSection === "members" && (
            <div className={styles.workspace}>
                <section className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>{t("Miembros")}</h2>
                            <p>
                                {t(
                                    "Usuarios que pueden recibir la asignación de números corporativos.",
                                )}
                            </p>
                        </div>

                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={resetMemberForm}
                        >
                            {t("Nuevo miembro")}
                        </Button>
                    </div>

                    {isLoadingMembers ? (
                        <LoadingState message={t("Cargando miembros...")} />
                    ) : members.length === 0 ? (
                        <EmptyState
                            icon="●"
                            title={t("No existen miembros registrados.")}
                            description={t(
                                "Cree el primer miembro para posteriormente asignarle un número corporativo.",
                            )}
                        />
                    ) : (
                        <EntityList>
                            <MemberList
                                items={members}
                                t={t}
                                selectedMember={selectedMember}
                                isLoadingMemberDetail={isLoadingMemberDetail}
                                handleSelectMember={handleSelectMember}
                            />
                        </EntityList>
                    )}
                </section>

                <MemberForm
                    key={memberFormVersion}
                    selectedMember={selectedMember}

                    isSaving={isSaving}
                    isDeleting={isDeleting}
                    isLoadingDetail={isLoadingMemberDetail}

                    onSubmit={handleMemberSubmit}
                    onReset={resetMemberForm}
                    onDeactivate={handleDeactivateMember}
                />
            </div>
        )
    );
}

export default AccessMembersSection;
