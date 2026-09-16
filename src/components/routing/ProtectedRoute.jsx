import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";


/**
 * ProtectedRoute
 *
 * Description:
 * - Restringir rutas según autenticación y roles permitidos.
 *
 * Notes:
 * - Los usuarios no autenticados son enviados al login.
 * - Los usuarios autenticados sin acceso son enviados a la ruta inicial de su rol.
 * - Los roles desconocidos muestran un error en lugar de generar un ciclo de redirección.
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length === 0) {
        return children;
    }

    if (allowedRoles.includes(user?.role)) {
        return children;
    }

    if (user?.role === "ADMINISTRATOR") {
        return <Navigate to="/app/administration/organization" replace />;
    }

    if (user?.role === "MEMBER") {
        return <Navigate to="/app/monitoring" replace />;
    }

    if (user?.role === "MONITOR") {
        return <Navigate to="/app" replace />;
    }

    return (
        <main style={{ padding: "32px" }}>
            <h1>Acceso no disponible</h1>
            <p>El usuario autenticado no tiene un rol válido para utilizar Dialoqo.</p>
            <p>Rol recibido: <strong>{user?.role || "Sin rol"}</strong></p>
        </main>
    );
}

export default ProtectedRoute;