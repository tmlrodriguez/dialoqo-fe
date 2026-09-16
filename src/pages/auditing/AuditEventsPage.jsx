import { useEffect, useState } from "react";

import AlertMessage from "../../components/common/AlertMessage/AlertMessage.jsx";
import PageHeader from "../../components/common/PageHeader/PageHeader.jsx";

import {
    getAuditEvent,
    getAuditEvents,
} from "../../services/auditing.js";

import {
    getBranches,
    getCompanies,
} from "../../services/organizations.js";

import AuditEventDetail from "./components/AuditEventDetail.jsx";
import AuditEventList from "./components/AuditEventList.jsx";
import AuditFilters from "./components/AuditFilters.jsx";

import styles from "./AuditEventsPage.module.css";
import { usePageTranslation } from "../usePageTranslation.js";


const INITIAL_FILTERS = {
    search: "",
    category: "",
    action: "",
    severity: "",
    actorId: "",
    branchId: "",
    targetApp: "",
    targetModel: "",
    targetId: "",
    requestId: "",
    dateFrom: "",
    dateTo: "",
};


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
    const { t } = usePageTranslation();
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState("");

    const [filters, setFilters] = useState(INITIAL_FILTERS);
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
        setIsLoadingCompanies(true);
        clearMessages();

        try {
            const response = await getCompanies();
            const companyList = response?.data || [];

            setCompanies(companyList);

            setSelectedCompanyId((currentCompanyId) => {
                const companyExists = companyList.some(
                    (company) => String(company.id) === String(currentCompanyId)
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
            setCompanies([]);
            setSelectedCompanyId("");

            setErrorMessage(
                error.message ||
                t("No fue posible cargar las empresas.")
            );
        } finally {
            setIsLoadingCompanies(false);
        }
    }


    /**
     * loadBranches
     *
     * Description:
     * - Obtener las sucursales de la empresa seleccionada.
     */
    async function loadBranches(companyId) {
        if (!companyId) {
            setBranches([]);
            return;
        }

        setIsLoadingBranches(true);

        try {
            const response = await getBranches(companyId);

            setBranches(response?.data || []);
        } catch (error) {
            setBranches([]);

            setErrorMessage(
                error.message ||
                t("No fue posible cargar las sucursales.")
            );
        } finally {
            setIsLoadingBranches(false);
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
    async function loadAuditEvents(
        companyId,
        currentFilters,
        requestedPage
    ) {
        if (!companyId) {
            resetEventState();
            return;
        }

        setIsLoadingEvents(true);
        clearMessages();

        try {
            const response = await getAuditEvents(
                companyId,
                {
                    ...currentFilters,
                    page: requestedPage,
                    pageSize,
                }
            );

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

                const eventStillVisible = eventList.some(
                    (event) => event.id === currentEvent.id
                );

                return eventStillVisible
                    ? currentEvent
                    : null;
            });
        } catch (error) {
            setEvents([]);
            setSelectedEvent(null);
            setCount(0);
            setHasNextPage(false);
            setHasPreviousPage(false);

            setErrorMessage(
                error.message ||
                t("No fue posible cargar los eventos de auditoría.")
            );
        } finally {
            setIsLoadingEvents(false);
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

        setFilters({
            ...INITIAL_FILTERS,
        });

        setAppliedFilters({
            ...INITIAL_FILTERS,
        });

        resetEventState();
    }


    /**
     * handleFilterChange
     *
     * Description:
     * - Actualizar un filtro pendiente de aplicar.
     */
    function handleFilterChange(field, value) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [field]: value,
        }));
    }


    /**
     * handleApplyFilters
     *
     * Description:
     * - Aplicar los filtros configurados por el usuario.
     *
     * Notes:
     * - Regresa a la primera página.
     */
    async function handleApplyFilters() {
        if (!selectedCompanyId || isLoadingEvents) {
            return;
        }

        const nextFilters = {
            ...filters,
        };

        setAppliedFilters(nextFilters);
        setPage(1);
        setSelectedEvent(null);

        await loadAuditEvents(
            selectedCompanyId,
            nextFilters,
            1
        );
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

        setFilters(cleanFilters);
        setAppliedFilters(cleanFilters);
        setSelectedEvent(null);
        setPage(1);

        if (selectedCompanyId) {
            await loadAuditEvents(
                selectedCompanyId,
                cleanFilters,
                1
            );
        }
    }


    /**
     * handlePageChange
     *
     * Description:
     * - Cambiar la página actual del historial.
     */
    async function handlePageChange(nextPage) {
        if (
            !selectedCompanyId ||
            isLoadingEvents ||
            nextPage < 1
        ) {
            return;
        }

        setSelectedEvent(null);

        await loadAuditEvents(
            selectedCompanyId,
            appliedFilters,
            nextPage
        );
    }


    /**
     * handleSelectEvent
     *
     * Description:
     * - Obtener el detalle completo del evento seleccionado.
     */
    async function handleSelectEvent(event) {
        if (
            !selectedCompanyId ||
            !event?.id ||
            isLoadingEventDetail
        ) {
            return;
        }

        setIsLoadingEventDetail(true);
        clearMessages();

        try {
            const response = await getAuditEvent(
                selectedCompanyId,
                event.id
            );

            const eventDetail = response?.data;

            if (!eventDetail) {
                throw new Error(
                    t("No fue posible obtener el detalle del evento.")
                );
            }

            setSelectedEvent(eventDetail);
        } catch (error) {
            setSelectedEvent(null);

            setErrorMessage(
                error.message ||
                t("No fue posible cargar el detalle del evento.")
            );
        } finally {
            setIsLoadingEventDetail(false);
        }
    }


    useEffect(() => {
        loadCompanies();
    }, []);


    useEffect(() => {
        if (!selectedCompanyId) {
            setBranches([]);
            resetEventState();
            return;
        }

        loadBranches(selectedCompanyId);

        loadAuditEvents(
            selectedCompanyId,
            INITIAL_FILTERS,
            1
        );
    }, [selectedCompanyId]);


    return (
        <section className={styles.auditEventsPage}>
            <PageHeader
                eyebrow="Control"
                title={t("Auditoría")}
                description="Consulte y analice el historial inmutable de acciones administrativas, operativas y de seguridad registradas en Dialoqo."
            />

            <div className={styles.contextBar}>
                <div className={styles.contextField}>
                    <label htmlFor="audit-company">
                        {t("Empresa")}
                    </label>

                    <select
                        id="audit-company"
                        value={selectedCompanyId}
                        onChange={handleCompanyChange}
                        disabled={
                            isLoadingCompanies ||
                            companies.length === 0
                        }
                    >
                        {companies.length === 0 && (
                            <option value="">
                                {t("No existen empresas disponibles")}
                            </option>
                        )}

                        {companies.map((company) => (
                            <option
                                key={company.id}
                                value={company.id}
                            >
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <AlertMessage
                message={errorMessage}
                type="error"
            />

            <AuditFilters
                filters={filters}
                branches={branches}
                isLoadingBranches={isLoadingBranches}
                isLoading={isLoadingEvents}
                onFilterChange={handleFilterChange}
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

                <AuditEventDetail
                    event={selectedEvent}
                    isLoading={isLoadingEventDetail}
                />
            </div>
        </section>
    );
}

export default AuditEventsPage;
