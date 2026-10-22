import EntityListItem from "../../../common/lists/EntityListItem/EntityListItem.jsx";

/**
 * MemberListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function MemberListItem({
    item: member,
    t,
    selectedMember,
    isLoadingMemberDetail,
    handleSelectMember,
}) {
    const memberName =
        [member.first_name, member.last_name].filter(Boolean).join(" ") || member.username;
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
}

export default MemberListItem;
