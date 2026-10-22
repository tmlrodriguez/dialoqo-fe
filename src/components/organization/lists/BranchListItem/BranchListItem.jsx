import EntityListItem from "../../../common/lists/EntityListItem/EntityListItem.jsx";

/**
 * BranchListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function BranchListItem({ item: branch, t, selectedBranch, handleSelectBranch }) {
    return (
        <EntityListItem
            key={branch.id}
            title={branch.name}
            subtitle={branch.code}
            initial={(branch.name || "S").charAt(0).toUpperCase()}
            status={t("Activa")}
            isActive={selectedBranch?.id === branch.id}
            onClick={() => handleSelectBranch(branch)}
        />
    );
}

export default BranchListItem;
