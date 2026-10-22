import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import MemberListItem from "../MemberListItem/MemberListItem.jsx";

/**
 * MemberList
 * Description: Render the member collection.
 */
function MemberList({
    items = [],
    t,
    selectedMember,
    isLoadingMemberDetail,
    handleSelectMember,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((member) => (
        <MemberListItem
            key={member.id}
            item={member}
            t={t}
            selectedMember={selectedMember}
            isLoadingMemberDetail={isLoadingMemberDetail}
            handleSelectMember={handleSelectMember}
        />
    ));
}

export default MemberList;
