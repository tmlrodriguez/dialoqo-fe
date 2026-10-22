import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import CompanyListItem from "../CompanyListItem/CompanyListItem.jsx";

/**
 * CompanyList
 * Description: Render the company collection.
 */
function CompanyList({
    items = [],
    t,
    selectedCompany,
    handleSelectCompany,
    isLoading = false,
    emptyState = null,
    loadingState = <LoadingState />,
}) {
    if (isLoading) return loadingState;
    if (items.length === 0) return emptyState;

    return items.map((company) => (
        <CompanyListItem
            key={company.id}
            item={company}
            t={t}
            selectedCompany={selectedCompany}
            handleSelectCompany={handleSelectCompany}
        />
    ));
}

export default CompanyList;
