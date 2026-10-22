import { useState } from "react";

import AlertMessage from "../../../components/common/feedback/AlertMessage/AlertMessage.jsx";
import Page from "../../../components/common/layout/Page/Page.jsx";
import AuditCompanyForm from "../../../components/auditing/forms/AuditCompanyForm/AuditCompanyForm.jsx";
import AuditEventDetail from "../../../components/auditing/panels/AuditEventDetail/AuditEventDetail.jsx";
import AuditEventList from "../../../components/auditing/lists/AuditEventList/AuditEventList.jsx";
import AuditFilters from "../../../components/auditing/forms/AuditFilters/AuditFilters.jsx";
import { INITIAL_FILTERS } from "../../../data/auditFilters.js";
import { usePageTranslation } from "../../../hooks/usePageTranslation.js";

import { useRequestGuard } from "../../../hooks/useRequestGuard.js";
import { useResourceLifecycle } from "../../../hooks/useResourceLifecycle.js";
import { getAuditEvent, getAuditEvents } from "../../../services/auditing.js";
import { getBranches, getCompanies } from "../../../services/organizations.js";

import styles from "./AuditEventsPage.module.css";

/**
 * AuditEventsPage
 *
 * Description:
 * - Proporcionar la interfaz administrativa de auditoría de Dialoqo.
 *
 * Notes:
 * - Los eventos se consultan dentro del contexto de una empresa.
 * - Los filtros son enviados al backend exclusivamente al aplicarlos.
 * - El listado utiliza paginación proporcionada por el backend.
 * - El detalle completo se obtiene al seleccionar un evento.
 * - Los eventos de auditoría son exclusivamente de lectura.
 */
function AuditEventsPage() {
    const { language, t } = usePageTranslation();
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");

    const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);

    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isLoadingEventDetail, setIsLoadingEventDetail] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const loadCompaniesGuard = useRequestGuard("companies");
    const loadBranchesGuard = useRequestGuard(selectedCompanyId);
    const loadAuditEventsGuard = useRequestGuard(selectedCompanyId);
    const handleSelectEventGuard = useRequestGuard(selectedCompanyId);

    /**
     * clearMessages
     *
     * Description:
     * - Limpiar los mensajes visibles de la página.
     */
    function clearMessages() {
        setErrorMessage("");
    }

    /**
     * resetEventState
     *
     * Description:
     * - Limpiar listado, selección y paginación de auditoría.
     */
    function resetEventState() {
        setEvents([]);
        setSelectedEvent(null);
        setCount(0);
        setPage(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
    }

    /**
     * loadCompanies
     *
     * Description:
     * - Obtener las empresas administradas por el usuario autenticado.
     *
     * Notes:
     * - Selecciona automáticamente la primera empresa disponible.
     */
    async function loadCompanies() {
        const isCurrentRequest = loadCompaniesGuard.begin();
        setIsLoadingCompanies(true);
        clearMessages();

        try {
            const response = await getCompanies();
            if (!isCurrentRequest()) return;
            const companyList = response?.data || [];

            setCompanies(companyList);

            setSelectedCompanyId((currentCompanyId) => {
                const companyExists = companyList.some(
                    (company) => String(company.id) === String(currentCompanyId),
                );

                if (companyExists) {
                    return currentCompanyId;
                }

                if (companyList.length > 0) {
                    return String(companyList[0].id);
                }

                return "";
            });
        } catch (error) {
            if (!isCurrentRequest()) return;
            setCompanies([]);
            setSelectedCompanyId("");

            setErrorMessage(error.message || t("No fue posible cargar las empresas."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingCompanies(false);
            }
        }
    }

    /**
     * loadBranches
     *
     * Description:
     * - Obtener las sucursales de la empresa seleccionada.
     */
    async function loadBranches(companyId) {
        const isCurrentRequest = loadBranchesGuard.begin();
        if (!companyId) {
            setBranches([]);
            return;
        }

        setIsLoadingBranches(true);

        try {
            const response = await getBranches(companyId);
            if (!isCurrentRequest()) return;

            setBranches(response?.data || []);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setBranches([]);

            setErrorMessage(error.message || t("No fue posible cargar las sucursales."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingBranches(false);
            }
        }
    }

    /**
     * loadAuditEvents
     *
     * Description:
     * - Obtener una página de eventos de auditoría.
     *
     * Notes:
     * - Utiliza únicamente los filtros que fueron aplicados.
     */
    async function loadAuditEvents(companyId, currentFilters, requestedPage) {
        const isCurrentRequest = loadAuditEventsGuard.begin();
        if (!companyId) {
            resetEventState();
            return;
        }

        setIsLoadingEvents(true);
        clearMessages();

        try {
            const response = await getAuditEvents(companyId, {
                ...currentFilters,
                page: requestedPage,
                pageSize,
            });
            if (!isCurrentRequest()) return;

            const paginationData = response?.data || {};
            const eventList = paginationData.results || [];

            setEvents(eventList);
            setCount(paginationData.count || 0);
            setHasNextPage(Boolean(paginationData.next));
            setHasPreviousPage(Boolean(paginationData.previous));
            setPage(requestedPage);

            setSelectedEvent((currentEvent) => {
                if (!currentEvent) {
                    return null;
                }

                const eventStillVisible = eventList.some((event) => event.id === currentEvent.id);

                return eventStillVisible ? currentEvent : null;
            });
        } catch (error) {
            if (!isCurrentRequest()) return;
            setEvents([]);
            setSelectedEvent(null);
            setCount(0);
            setHasNextPage(false);
            setHasPreviousPage(false);

            setErrorMessage(error.message || t("No fue posible cargar los eventos de auditoría."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingEvents(false);
            }
        }
    }

    /**
     * handleCompanyChange
     *
     * Description:
     * - Cambiar la empresa utilizada como contexto de auditoría.
     *
     * Notes:
     * - Restablece filtros, selección y paginación.
     */
    function handleCompanyChange(event) {
        const companyId = event.target.value;

        clearMessages();

        setSelectedCompanyId(companyId);
        setBranches([]);

        setAppliedFilters({
            ...INITIAL_FILTERS,
        });

        resetEventState();
    }

    /**
     * handleApplyFilters
     * Description: Apply submitted filters and restart pagination.
     */
    async function handleApplyFilters(nextFilters) {
        if (!selectedCompanyId || isLoadingEvents) {
            return;
        }

        setAppliedFilters(nextFilters);
        setPage(1);
        setSelectedEvent(null);

        await loadAuditEvents(selectedCompanyId, nextFilters, 1);
    }

    /**
     * handleResetFilters
     *
     * Description:
     * - Limpiar todos los filtros y volver a cargar el historial.
     */
    async function handleResetFilters() {
        if (isLoadingEvents) {
            return;
        }

        const cleanFilters = {
            ...INITIAL_FILTERS,
        };

        setAppliedFilters(cleanFilters);
        setSelectedEvent(null);
        setPage(1);

        if (selectedCompanyId) {
            await loadAuditEvents(selectedCompanyId, cleanFilters, 1);
        }
    }

    /**
     * handlePageChange
     *
     * Description:
     * - Cambiar la página actual del historial.
     */
    async function handlePageChange(nextPage) {
        if (!selectedCompanyId || isLoadingEvents || nextPage < 1) {
            return;
        }

        setSelectedEvent(null);

        await loadAuditEvents(selectedCompanyId, appliedFilters, nextPage);
    }

    /**
     * handleSelectEvent
     *
     * Description:
     * - Obtener el detalle completo del evento seleccionado.
     */
    async function handleSelectEvent(event) {
        const isCurrentRequest = handleSelectEventGuard.begin();
        if (!selectedCompanyId || !event?.id || isLoadingEventDetail) {
            return;
        }

        setIsLoadingEventDetail(true);
        clearMessages();

        try {
            const response = await getAuditEvent(selectedCompanyId, event.id);
            if (!isCurrentRequest()) return;

            const eventDetail = response?.data;

            if (!eventDetail) {
                throw new Error(t("No fue posible obtener el detalle del evento."));
            }

            setSelectedEvent(eventDetail);
        } catch (error) {
            if (!isCurrentRequest()) return;
            setSelectedEvent(null);

            setErrorMessage(error.message || t("No fue posible cargar el detalle del evento."));
        } finally {
            if (isCurrentRequest()) {
                setIsLoadingEventDetail(false);
            }
        }
    }

    useResourceLifecycle(() => {
        loadCompanies();
    }, JSON.stringify([]));

    useResourceLifecycle(
        () => {
            if (!selectedCompanyId) {
                setBranches([]);
                resetEventState();
                return;
            }

            loadBranches(selectedCompanyId);

            loadAuditEvents(selectedCompanyId, INITIAL_FILTERS, 1);
        },
        JSON.stringify([selectedCompanyId]),
    );

    return (
        <Page
            as="section"
            title={t("Auditoría")}
            className={styles.auditEventsPage}
            header={{
                eyebrow: language === "en" ? "Control" : "Control",
                title: t("Auditoría"),
                description:
                    language === "en"
                        ? "Review and analyze the immutable history of administrative, operational, and security actions recorded in Dialoqo."
                        : "Consulte y analice el historial inmutable de acciones administrativas, operativas y de seguridad registradas en Dialoqo.",
            }}
        >
            <AuditCompanyForm
                t={t}
                selectedCompanyId={selectedCompanyId}
                handleCompanyChange={handleCompanyChange}
                isLoadingCompanies={isLoadingCompanies}
                companies={companies}
            />

            <AlertMessage message={errorMessage} type="error" />

            <AuditFilters
                resourceKey={selectedCompanyId}
                branches={branches}
                isLoadingBranches={isLoadingBranches}
                isLoading={isLoadingEvents}

                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            <div className={styles.auditWorkspace}>
                <AuditEventList
                    events={events}
                    selectedEventId={selectedEvent?.id || null}
                    count={count}
                    page={page}
                    pageSize={pageSize}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                    isLoading={isLoadingEvents}
                    onSelectEvent={handleSelectEvent}
                    onPageChange={handlePageChange}
                />

                <AuditEventDetail event={selectedEvent} isLoading={isLoadingEventDetail} />
            </div>
        </Page>
    );
}

export default AuditEventsPage;
