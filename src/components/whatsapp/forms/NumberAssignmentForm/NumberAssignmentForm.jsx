import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";

import styles from "./NumberAssignmentForm.module.css";

/**
 * NumberAssignmentForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function NumberAssignmentForm({
    handleAssign,
    t,
    selectedMemberId,
    setSelectedMemberId,
    isLoadingMembers,
    members,
    operationInProgress,
    getMemberName,
    getMemberDescription,
    isAssigning,
    currentAssignment,
}) {
    return (
        <Form className={styles.assignmentForm} onSubmit={handleAssign}>
            <div className={styles.formField}>
                <label htmlFor="assignment-member">{t("Miembro")}</label>

                <Input
                    as="select"
                    id="assignment-member"
                    value={selectedMemberId}
                    onChange={(event) => setSelectedMemberId(event.target.value)}
                    disabled={isLoadingMembers || members.length === 0 || operationInProgress}
                    required
                >
                    {members.length === 0 && (
                        <option value="">{t("No existen miembros disponibles")}</option>
                    )}

                    <OptionList
                        items={members}
                        getValue={(member) => member.id}
                        getLabel={(member) => (
                            <>
                                {getMemberName(member)}
                                {getMemberDescription(member)
                                    ? ` — ${getMemberDescription(member)}`
                                    : ""}
                            </>
                        )}
                    />
                </Input>

                <span className={styles.fieldHelp}>
                    {t("Se muestran los usuarios MEMBER administrados por su cuenta.")}
                </span>
            </div>

            <div className={styles.formActions}>
                <Button
                    className={styles.primaryButton}
                    type="submit"
                    disabled={!selectedMemberId || members.length === 0 || operationInProgress}
                >
                    {isAssigning
                        ? t("Asignando...")
                        : currentAssignment
                          ? t("Reasignar número")
                          : t("Asignar número")}
                </Button>
            </div>
        </Form>
    );
}

export default NumberAssignmentForm;
