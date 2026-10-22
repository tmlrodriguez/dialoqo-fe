import { useState } from "react";

import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";
import Button from "../../../common/buttons/Button/Button.jsx";
import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";

import styles from "./LoginForm.module.css";

/**
 * LoginForm
 * Description: Own credential input and delegate authentication to the page.
 */
function LoginForm({ onSubmit, errorMessage = "", isSubmitting = false }) {
    const { t } = usePageTranslation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        if (!isSubmitting) onSubmit({ username, password });
    }

    return (
        <Form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.loginField}>
                <label htmlFor="username">{t("Usuario")}</label>

                <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder={t("Ingresa tu usuario")}
                    disabled={isSubmitting}
                    required
                    autoFocus
                />
            </div>

            <div className={styles.loginField}>
                <label htmlFor="password">{t("Contraseña")}</label>

                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder={t("Ingresa tu contraseña")}
                    disabled={isSubmitting}
                    required
                />
            </div>

            {errorMessage && (
                <div className={styles.loginError} role="alert">
                    {errorMessage}
                </div>
            )}

            <Button className={styles.loginSubmit} type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("Iniciando sesión...") : t("Iniciar sesión")}
            </Button>
        </Form>
    );
}

export default LoginForm;
