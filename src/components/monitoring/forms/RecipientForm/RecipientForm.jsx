import { useState } from "react";

import AlertMessage from "../../../common/feedback/AlertMessage/AlertMessage.jsx";
import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";

import styles from "./RecipientForm.module.css";

/**
 * RecipientForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function RecipientForm({ onSubmit, t, initialPhoneNumber, onClose }) {
    const [recipientPhoneNumber, setRecipientPhoneNumber] = useState(initialPhoneNumber);
    const [errorMessage, setErrorMessage] = useState("");

    function handleRecipientSubmit(event) {
        event.preventDefault();
        const phoneNumber = String(recipientPhoneNumber || "").replace(/\D/g, "");
        if (phoneNumber.length < 8) {
            setErrorMessage(
                t("Debe proporcionar un número de WhatsApp válido incluyendo el código de país."),
            );
            return;
        }
        setErrorMessage("");
        onSubmit(phoneNumber);
    }

    return (
        <Form className={styles.recipientForm} onSubmit={handleRecipientSubmit}>
            <AlertMessage message={errorMessage} />
            <div className={styles.stepHeader}>
                <span className={styles.eyebrow}>{t("Nueva conversación")}</span>

                <h2>{t("Seleccione el destinatario")}</h2>

                <p>
                    {t("Ingrese el número de WhatsApp del cliente incluyendo su código de país.")}
                </p>
            </div>

            <label className={styles.field}>
                <span>{t("Número de WhatsApp")}</span>

                <div className={styles.phoneInput}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="6" y="2.5" width="12" height="19" rx="2" />

                        <path d="M10 18h4" />
                    </svg>

                    <Input
                        type="tel"
                        value={recipientPhoneNumber}
                        onChange={(event) => setRecipientPhoneNumber(event.target.value)}
                        placeholder="50499999999"
                        autoFocus
                    />
                </div>

                <small>{t("Ejemplo para Honduras: 50499999999")}</small>
            </label>

            <div className={styles.actions}>
                <Button className={styles.secondaryButton} type="button" onClick={onClose}>
                    {t("Cancelar")}
                </Button>

                <Button
                    className={styles.primaryButton}
                    type="submit"
                    disabled={!recipientPhoneNumber.trim()}
                >
                    {t("Continuar")}

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </Button>
            </div>
        </Form>
    );
}

export default RecipientForm;
