import { apiRequest } from "../api/client.js";

/**
 * getCompanies
 *
 * Description:
 * - Obtener las empresas activas administradas por el usuario autenticado.
 *
 * Notes:
 * - Utiliza el endpoint administrativo de organizaciones.
 */
export function getCompanies() {
    return apiRequest("/organizations/companies/");
}

/**
 * getCompany
 *
 * Description:
 * - Obtener una empresa específica administrada por el usuario autenticado.
 *
 * Notes:
 * - La empresa debe pertenecer al usuario autenticado.
 */
export function getCompany(companyId) {
    return apiRequest(`/organizations/companies/${companyId}/`);
}

/**
 * createCompany
 *
 * Description:
 * - Crear una nueva empresa en CentralChat.
 *
 * Notes:
 * - La propiedad de la empresa es asignada por el backend.
 */
export function createCompany(companyData) {
    return apiRequest("/organizations/companies/", {
        method: "POST",
        body: JSON.stringify(companyData),
    });
}

/**
 * updateCompany
 *
 * Description:
 * - Actualizar parcialmente una empresa existente.
 *
 * Notes:
 * - Solo los campos proporcionados son enviados al backend.
 */
export function updateCompany(companyId, companyData) {
    return apiRequest(`/organizations/companies/${companyId}/`, {
        method: "PATCH",
        body: JSON.stringify(companyData),
    });
}

/**
 * deactivateCompany
 *
 * Description:
 * - Desactivar una empresa existente.
 *
 * Notes:
 * - La empresa no es eliminada físicamente.
 */
export function deactivateCompany(companyId) {
    return apiRequest(`/organizations/companies/${companyId}/`, {
        method: "DELETE",
    });
}

/**
 * getBranches
 *
 * Description:
 * - Obtener las sucursales activas de una empresa.
 *
 * Notes:
 * - La empresa debe pertenecer al usuario autenticado.
 */
export function getBranches(companyId) {
    return apiRequest(`/organizations/companies/${companyId}/branches/`);
}

/**
 * getBranch
 *
 * Description:
 * - Obtener una sucursal específica perteneciente a una empresa.
 *
 * Notes:
 * - La sucursal se resuelve dentro de su empresa.
 */
export function getBranch(companyId, branchId) {
    return apiRequest(`/organizations/companies/${companyId}/branches/${branchId}/`);
}

/**
 * createBranch
 *
 * Description:
 * - Crear una nueva sucursal dentro de una empresa.
 *
 * Notes:
 * - La relación con la empresa es controlada por el backend.
 */
export function createBranch(companyId, branchData) {
    return apiRequest(`/organizations/companies/${companyId}/branches/`, {
        method: "POST",
        body: JSON.stringify(branchData),
    });
}

/**
 * updateBranch
 *
 * Description:
 * - Actualizar parcialmente una sucursal existente.
 *
 * Notes:
 * - La sucursal permanece asociada a la misma empresa.
 */
export function updateBranch(companyId, branchId, branchData) {
    return apiRequest(`/organizations/companies/${companyId}/branches/${branchId}/`, {
        method: "PATCH",
        body: JSON.stringify(branchData),
    });
}

/**
 * deactivateBranch
 *
 * Description:
 * - Desactivar una sucursal existente.
 *
 * Notes:
 * - La sucursal no es eliminada físicamente.
 */
export function deactivateBranch(companyId, branchId) {
    return apiRequest(`/organizations/companies/${companyId}/branches/${branchId}/`, {
        method: "DELETE",
    });
}

/**
 * getCompanyAccesses
 *
 * Description:
 * - Obtener los accesos de monitores administrados por el usuario autenticado.
 *
 * Notes:
 * - Los accesos se encuentran limitados al mismo límite administrativo.
 */
export function getCompanyAccesses() {
    return apiRequest("/organizations/company-access/");
}

/**
 * getCompanyAccess
 *
 * Description:
 * - Obtener un acceso de empresa específico.
 *
 * Notes:
 * - El acceso debe pertenecer al límite administrativo del usuario autenticado.
 */
export function getCompanyAccess(accessId) {
    return apiRequest(`/organizations/company-access/${accessId}/`);
}

/**
 * grantCompanyAccess
 *
 * Description:
 * - Otorgar acceso de monitoreo de una empresa a un monitor.
 *
 * Notes:
 * - El monitor y la empresa deben pertenecer al administrador autenticado.
 */
export function grantCompanyAccess(accessData) {
    return apiRequest("/organizations/company-access/", {
        method: "POST",
        body: JSON.stringify(accessData),
    });
}

/**
 * revokeCompanyAccess
 *
 * Description:
 * - Revocar un acceso activo de monitor a empresa.
 *
 * Notes:
 * - El registro histórico permanece preservado en el backend.
 */
export function revokeCompanyAccess(accessId) {
    return apiRequest(`/organizations/company-access/${accessId}/`, {
        method: "DELETE",
    });
}

/**
 * getMyCompanies
 *
 * Description:
 * - Obtener las empresas asignadas al monitor autenticado.
 *
 * Notes:
 * - Solo devuelve empresas con acceso activo.
 */
export function getMyCompanies() {
    return apiRequest("/organizations/my-companies/");
}
