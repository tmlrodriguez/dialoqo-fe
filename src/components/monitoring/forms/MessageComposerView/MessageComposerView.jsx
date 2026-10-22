import MessageTextForm from "../MessageTextForm/MessageTextForm.jsx";

import TemplateParameterForm from "../TemplateParameterForm/TemplateParameterForm.jsx";
import TemplatePicker from "../../panels/TemplatePicker/TemplatePicker.jsx";

import styles from "./MessageComposerView.module.css";

/**
 * MessageComposerView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function MessageComposerView({
    isTemplatePanelOpen,
    selectedTemplate,
    isSending,
    setSelectedTemplate,
    handleTemplateSubmit,
    companyId,
    branchId,
    numberId,
    closeTemplatePanel,
    onError,
    conversationId,
    handleTextSubmit,
    setIsTemplatePanelOpen,
    t,
}) {
    return (
        <div className={styles.composerContainer}>
            {isTemplatePanelOpen && (
                <div className={styles.templateOverlay}>
                    <div className={styles.templatePanel}>
                        {selectedTemplate ? (
                            <TemplateParameterForm
                                template={selectedTemplate}
                                isSending={isSending}
                                onBack={() => setSelectedTemplate(null)}
                                onSubmit={handleTemplateSubmit}
                            />
                        ) : (
                            <TemplatePicker
                                companyId={companyId}
                                branchId={branchId}
                                numberId={numberId}
                                selectedTemplateId={selectedTemplate?.id}
                                onSelect={setSelectedTemplate}
                                onClose={closeTemplatePanel}
                                onError={onError}
                            />
                        )}
                    </div>
                </div>
            )}

            <MessageTextForm
                conversationId={conversationId}
                onSubmit={handleTextSubmit}

                setSelectedTemplate={setSelectedTemplate}
                setIsTemplatePanelOpen={setIsTemplatePanelOpen}
                isSending={isSending}
                t={t}
            />
        </div>
    );
}

export default MessageComposerView;
