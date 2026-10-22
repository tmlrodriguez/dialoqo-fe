import { Component, useEffect } from "react";

import AlertMessage from "../../feedback/AlertMessage/AlertMessage.jsx";
import Button from "../../buttons/Button/Button.jsx";
import LoadingState from "../../feedback/LoadingState/LoadingState.jsx";
import PageHeader from "../PageHeader/PageHeader.jsx";

import styles from "./Page.module.css";

/** PageBoundary: contain rendering failures within the current page. */
class PageBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div role="alert">
                    <p>No fue posible mostrar esta página.</p>
                    <Button onClick={() => this.setState({ hasError: false })}>Reintentar</Button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Page
 * Description: Own the page shell, document title, heading and feedback states.
 * Notes: Feature classes retain the existing responsive layout. Use padded for a standard inset.
 */
function Page({
    as: Element = "section",
    title = "Dialoqo",
    header = null,
    breadcrumbs = null,
    loading = false,
    loadingMessage = "Cargando...",
    error = "",
    padded = false,
    className = "",
    children,
    ...props
}) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title.includes("Dialoqo") ? title : `${title} | Dialoqo`;
        return () => {
            document.title = previousTitle;
        };
    }, [title]);

    return (
        <Element
            {...props}
            className={`${padded ? styles.padded : ""} ${className}`.trim() || undefined}
            aria-busy={loading || undefined}
        >
            {breadcrumbs && <nav aria-label="Breadcrumb">{breadcrumbs}</nav>}
            {header && <PageHeader {...header} />}
            <AlertMessage message={error} />
            <PageBoundary key={title}>
                {loading ? <LoadingState message={loadingMessage} /> : children}
            </PageBoundary>
        </Element>
    );
}

export default Page;
