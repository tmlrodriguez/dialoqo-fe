import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import BranchListItem from "../BranchListItem/BranchListItem.jsx";

/**
 * BranchList
 * Description: Render the branch collection.
 */
function BranchList({
    items = [],
    t,
    selectedBranch,
    handleSelectBranch,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((branch) => (
        <BranchListItem
            key={branch.id}
            item={branch}
            t={t}
            selectedBranch={selectedBranch}
            handleSelectBranch={handleSelectBranch}
        />
    ));
}

export default BranchList;
