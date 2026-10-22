import { usePageTranslation } from "./usePageTranslation.js";

/**
 * useConversationPanel
 * Description: Derive the selected conversation header and delegate sends to the workspace event stream.
 */
export function useConversationPanel({
    companyId,
    branchId,
    numberId,
    conversation,
    canSendMessages = false,
    events,
    onBack,
    onMessageSent,
    onError,
}) {
    const { t } = usePageTranslation();

    function getCustomerName() {
        const customer = conversation?.customer || {};
        return (
            customer.display_name || customer.profile_name || customer.phone_number || t("Cliente")
        );
    }

    function getAssignmentName() {
        const member = conversation?.current_assignment?.member;
        if (!member) return "";
        return (
            [member.first_name, member.last_name].filter(Boolean).join(" ") ||
            member.member_code ||
            ""
        );
    }

    return {
        conversation,
        t,
        canSendMessages,
        getAssignmentName,
        events,
        onBack,
        getCustomerName,
        companyId,
        branchId,
        numberId,
        onError,
        handleMessageSent: onMessageSent,
    };
}
