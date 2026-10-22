import { useEffect, useRef } from "react";

import Button from "../../buttons/Button/Button.jsx";

import styles from "./Modal.module.css";

/**
 * Modal
 * Description: Provide a native modal dialog with focus restoration and Escape handling.
 */
function Modal({ open = false, title, onClose, closeLabel = "Cerrar", children }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (open) dialog.showModal();
        else dialog.close();
        return () => {
            dialog.close();
        };
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className={styles.modal}
            aria-label={title}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <header className={styles.header}>
                <h2>{title}</h2>
                <Button variant="ghost" onClick={onClose} aria-label={closeLabel}>
                    ×
                </Button>
            </header>
            {children}
        </dialog>
    );
}

export default Modal;
