import { apiRequest } from "../api/client.js";

/**
 * getAuditEvents
 *
 * Description:
 * - Obtener los eventos de auditoría pertenecientes a una empresa.
 *
 * Notes:
 * - Permite aplicar filtros soportados por el backend.
 * - Permite utilizar paginación por número de página.
 */
export function getAuditEvents(companyId, filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.category) {
        queryParams.set("category", filters.category);
    }

    if (filters.action) {
        queryParams.set("action", filters.action);
    }

    if (filters.severity) {
        queryParams.set("severity", filters.severity);
    }

    if (filters.actorId) {
        queryParams.set("actor_id", filters.actorId);
    }

    if (filters.branchId) {
        queryParams.set("branch_id", filters.branchId);
    }

    if (filters.targetApp) {
        queryParams.set("target_app", filters.targetApp);
    }

    if (filters.targetModel) {
        queryParams.set("target_model", filters.targetModel);
    }

    if (filters.targetId) {
        queryParams.set("target_id", filters.targetId);
    }

    if (filters.requestId) {
        queryParams.set("request_id", filters.requestId);
    }

    if (filters.search) {
        queryParams.set("search", filters.search);
    }

    if (filters.dateFrom) {
        queryParams.set("date_from", filters.dateFrom);
    }

    if (filters.dateTo) {
        queryParams.set("date_to", filters.dateTo);
    }

    if (filters.page) {
        queryParams.set("page", filters.page);
    }

    if (filters.pageSize) {
        queryParams.set("page_size", filters.pageSize);
    }

    const queryString = queryParams.toString();

    const endpoint = queryString
        ? `/auditing/companies/${companyId}/events/?${queryString}`
        : `/auditing/companies/${companyId}/events/`;

    return apiRequest(endpoint);
}

/**
 * getAuditEvent
 *
 * Description:
 * - Obtener el detalle completo de un evento de auditoría.
 *
 * Notes:
 * - El evento debe pertenecer a la empresa especificada.
 */
export function getAuditEvent(companyId, eventId) {
    return apiRequest(`/auditing/companies/${companyId}/events/${eventId}/`);
}
