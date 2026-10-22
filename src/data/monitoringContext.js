import { getConversations } from "../services/monitoring.js";

export /**
 * getAvailableNumberContexts
 *
 * Description:
 * - Obtener todas las combinaciones empresa, sucursal y número entregadas por el backend.
 *
 * Notes:
 * - Para MEMBER el backend debe devolver exclusivamente números asignados al usuario autenticado.
 */
function getAvailableNumberContexts(companyList) {
    return companyList.flatMap((company) =>
        (company.branches || []).flatMap((branch) =>
            (branch.numbers || []).map((number) => ({
                company,
                branch,
                number,
            })),
        ),
    );
}

/**
 * hydrateMonitorNumberAssignments
 *
 * Description:
 * - Completar el responsable visible de cada número cuando el contexto de monitoreo no incluye current_assignment.
 *
 * Notes:
 * - Utiliza exclusivamente el endpoint de conversaciones ya autorizado para MONITOR.
 * - No concede permisos adicionales ni consulta endpoints administrativos.
 * - El backend continúa siendo la autoridad de acceso.
 * - Si un número todavía no tiene conversaciones, conserva el snapshot recibido por monitoring/context.
 */

export /**
 * hydrateMonitorNumberAssignments
 *
 * Description:
 * - Completar el responsable visible de cada número cuando el contexto de monitoreo no incluye current_assignment.
 *
 * Notes:
 * - Utiliza exclusivamente el endpoint de conversaciones ya autorizado para MONITOR.
 * - No concede permisos adicionales ni consulta endpoints administrativos.
 * - El backend continúa siendo la autoridad de acceso.
 * - Si un número todavía no tiene conversaciones, conserva el snapshot recibido por monitoring/context.
 */
async function hydrateMonitorNumberAssignments(companyList, role) {
    if (role !== "MONITOR") {
        return companyList;
    }
    const clonedCompanies = companyList.map((company) => ({
        ...company,
        branches: (company.branches || []).map((branch) => ({
            ...branch,
            numbers: (branch.numbers || []).map((number) => ({
                ...number,
            })),
        })),
    }));
    const numberContexts = getAvailableNumberContexts(clonedCompanies);
    await Promise.all(
        numberContexts.map(async ({ company, branch, number }) => {
            const hasAssignment = Boolean(
                number?.current_assignment?.member ||
                number?.assignment?.member ||
                number?.active_assignment?.member ||
                number?.assigned_member ||
                number?.responsible_member ||
                number?.current_member ||
                number?.responsible,
            );
            if (hasAssignment) {
                return;
            }
            try {
                const response = await getConversations(company.id, branch.id, number.id, {
                    ordering: "-last_message_at",
                    page: 1,
                    pageSize: 1,
                });
                const firstConversation = response?.data?.results?.[0];
                if (firstConversation?.current_assignment?.member) {
                    number.current_assignment = firstConversation.current_assignment;
                }
            } catch {
                // La carga principal de monitoreo no debe fallar por una hidratación visual opcional.
            }
        }),
    );
    return clonedCompanies;
}
