import { Suspense } from "react";

import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";

/**
 * RoutePage
 * Description: Load route code within the existing application layout.
 */
function RoutePage({ children }) {
    return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

export default RoutePage;
