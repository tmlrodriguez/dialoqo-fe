import { useEffect, useState } from "react";

import {
    getBranches,
} from "../../../services/organizations.js";

import {
    activateWhatsAppMonitoring,
    createWhatsAppNumber,
    deactivateWhatsAppMonitoring,
    deactivateWhatsAppNumber,
    getWhatsAppBusinessAccounts,
    getWhatsAppNumber,
    getWhatsAppNumbers,
    updateWhatsAppNumber,
    validateWhatsAppNumber,
} from "../../../services/whatsapp.js";

import styles from "./WhatsAppNumberForm.module.css";


/**
 * WhatsAppNumberForm
 *
 * Description:
 * - Administrar los números corporativos de WhatsApp pertenecientes a una empresa.
 *
 * Notes:
 * - Los números se administran dentro del contexto de una sucursal.
 * - Cada número pertenece a una cuenta de WhatsApp Business de la misma empresa.
 * - Permite crear, consultar, actualizar y desactivar números.
 * - Permite validar el Phone Number ID contra Meta.
 * - Permite activar y desactivar explícitamente el monitoreo.
 * - Los campos de conexión y monitoreo son controlados exclusivamente por el backend.
 */
function WhatsAppNumberForm({
    companyId,
    onError,
    onSuccess,
}) {
    const [branches, setBranches] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [numbers, setNumbers] = useState([]);

    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [selectedNumber, setSelectedNumber] = useState(null);

    const [wabaId, setWabaId] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [metaPhoneNumberId, setMetaPhoneNumberId] = useState("");
    const [notes, setNotes] = useState("");

    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isChangingMonitoring, setIsChangingMonitoring] = useState(false);


    /**
     * clearParentMessages
     *
     * Description:
     * - Limpiar los mensajes administrados por la página padre.
     */
    function clearParentMessages() {
        onError?.("");
        onSuccess?.("");
    }


    /**
     * resetForm
     *
     * Description:
     * - Restablecer el formulario del número.
     *
     * Notes:
     * - Conserva la sucursal actualmente seleccionada.
     */
    function resetForm() {
        setSelectedNumber(null);
        setPhoneNumber("");
        setDisplayName("");
        setMetaPhoneNumberId("");
        setNotes("");

        setWabaId(
            accounts.length > 0
                ? String(accounts[0].id)
                : ""
        );
    }


    /**
     * loadBranches
     *
     * Description:
     * - Obtener las sucursales activas de la empresa.
     *
     * Notes:
     * - Selecciona automáticamente la primera sucursal disponible.
     */
    async function loadBranches() {
        if (!companyId) {
            setBranches([]);
            setSelectedBranchId("");
            return;
        }

        setIsLoadingBranches(true);

        try {
            const response = await getBranches(companyId);
            const branchList = response?.data || [];

            setBranches(branchList);

            setSelectedBranchId((currentBranchId) => {
                const branchExists = branchList.some(
                    (branch) =>
                        String(branch.id) === String(currentBranchId)
                );

                if (branchExists) {
                    return currentBranchId;
                }

                if (branchList.length > 0) {
                    return String(branchList[0].id);
                }

                return "";
            });
        } catch (error) {
            setBranches([]);
            setSelectedBranchId("");

            onError?.(
                error.message ||
                "No fue posible cargar las sucursales."
            );
        } finally {
            setIsLoadingBranches(false);
        }
    }


    /**
     * loadAccounts
     *
     * Description:
     * - Obtener las cuentas WABA activas de la empresa.
     *
     * Notes:
     * - Las cuentas disponibles son utilizadas para registrar números.
     */
    async function loadAccounts() {
        if (!companyId) {
            setAccounts([]);
            setWabaId("");
            return;
        }

        setIsLoadingAccounts(true);

        try {
            const response = await getWhatsAppBusinessAccounts(companyId);
            const accountList = response?.data || [];

            setAccounts(accountList);

            setWabaId((currentWabaId) => {
                const accountExists = accountList.some(
                    (account) =>
                        String(account.id) === String(currentWabaId)
                );

                if (accountExists) {
                    return currentWabaId;
                }

                if (accountList.length > 0) {
                    return String(accountList[0].id);
                }

                return "";
            });
        } catch (error) {
            setAccounts([]);
            setWabaId("");

            onError?.(
                error.message ||
                "No fue posible cargar las cuentas de WhatsApp Business."
            );
        } finally {
            setIsLoadingAccounts(false);
        }
    }


    /**
     * loadNumbers
     *
     * Description:
     * - Obtener los números activos de una sucursal.
     */
    async function loadNumbers(branchId) {
        if (
            !companyId ||
            !branchId
        ) {
            setNumbers([]);
            return;
        }

        setIsLoadingNumbers(true);

        try {
            const response = await getWhatsAppNumbers(
                companyId,
                branchId
            );

            setNumbers(response?.data || []);
        } catch (error) {
            setNumbers([]);

            onError?.(
                error.message ||
                "No fue posible cargar los números de WhatsApp."
            );
        } finally {
            setIsLoadingNumbers(false);
        }
    }


    /**
     * handleBranchChange
     *
     * Description:
     * - Cambiar la sucursal utilizada para administrar números.
     *
     * Notes:
     * - Restablece el número actualmente seleccionado.
     */
    function handleBranchChange(event) {
        const branchId = event.target.value;

        clearParentMessages();
        setSelectedBranchId(branchId);
        resetForm();
    }


    /**
     * handleNewNumber
     *
     * Description:
     * - Preparar el formulario para crear un nuevo número.
     */
    function handleNewNumber() {
        clearParentMessages();
        resetForm();
    }


    /**
     * handleSelectNumber
     *
     * Description:
     * - Obtener el detalle completo de un número seleccionado.
     */
    async function handleSelectNumber(number) {
        if (
            !companyId ||
            !selectedBranchId ||
            !number?.id ||
            isLoadingDetail
        ) {
            return;
        }

        setIsLoadingDetail(true);
        clearParentMessages();

        try {
            const response = await getWhatsAppNumber(
                companyId,
                selectedBranchId,
                number.id
            );

            const numberDetail = response?.data;

            if (!numberDetail) {
                throw new Error(
                    "No fue posible obtener el detalle del número."
                );
            }

            setSelectedNumber(numberDetail);

            setWabaId(
                numberDetail.whatsapp_business_account
                    ? String(numberDetail.whatsapp_business_account)
                    : ""
            );

            setPhoneNumber(numberDetail.phone_number || "");
            setDisplayName(numberDetail.display_name || "");
            setMetaPhoneNumberId(
                numberDetail.meta_phone_number_id || ""
            );
            setNotes(numberDetail.notes || "");
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible cargar el número de WhatsApp."
            );
        } finally {
            setIsLoadingDetail(false);
        }
    }


    /**
     * reloadSelectedNumber
     *
     * Description:
     * - Volver a consultar el número seleccionado después de una operación.
     *
     * Notes:
     * - Permite sincronizar el estado local con los campos controlados por el backend.
     */
    async function reloadSelectedNumber(numberId) {
        if (
            !companyId ||
            !selectedBranchId ||
            !numberId
        ) {
            return;
        }

        const response = await getWhatsAppNumber(
            companyId,
            selectedBranchId,
            numberId
        );

        const numberDetail = response?.data;

        if (!numberDetail) {
            return;
        }

        setSelectedNumber(numberDetail);

        setWabaId(
            numberDetail.whatsapp_business_account
                ? String(numberDetail.whatsapp_business_account)
                : ""
        );

        setPhoneNumber(numberDetail.phone_number || "");
        setDisplayName(numberDetail.display_name || "");
        setMetaPhoneNumberId(
            numberDetail.meta_phone_number_id || ""
        );
        setNotes(numberDetail.notes || "");
    }


    /**
     * handleSubmit
     *
     * Description:
     * - Crear un número nuevo o actualizar el número seleccionado.
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !companyId ||
            !selectedBranchId ||
            !wabaId ||
            isSaving
        ) {
            return;
        }

        setIsSaving(true);
        clearParentMessages();

        const numberData = {
            whatsapp_business_account: Number(wabaId),
            phone_number: phoneNumber.trim(),
            display_name: displayName.trim(),
            meta_phone_number_id: metaPhoneNumberId.trim(),
            notes: notes.trim(),
        };

        try {
            if (selectedNumber) {
                await updateWhatsAppNumber(
                    companyId,
                    selectedBranchId,
                    selectedNumber.id,
                    numberData
                );

                onSuccess?.(
                    "Número de WhatsApp actualizado correctamente."
                );
            } else {
                await createWhatsAppNumber(
                    companyId,
                    selectedBranchId,
                    numberData
                );

                onSuccess?.(
                    "Número de WhatsApp creado correctamente."
                );
            }

            resetForm();

            await loadNumbers(selectedBranchId);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible guardar el número de WhatsApp."
            );
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleValidate
     *
     * Description:
     * - Validar el Phone Number ID del número seleccionado contra Meta.
     *
     * Notes:
     * - El backend controla la actualización de is_connected.
     */
    async function handleValidate() {
        if (
            !companyId ||
            !selectedBranchId ||
            !selectedNumber ||
            isValidating
        ) {
            return;
        }

        setIsValidating(true);
        clearParentMessages();

        try {
            const response = await validateWhatsAppNumber(
                companyId,
                selectedBranchId,
                selectedNumber.id
            );

            onSuccess?.(
                response?.success_message ||
                "Número de WhatsApp validado correctamente."
            );

            await reloadSelectedNumber(selectedNumber.id);
            await loadNumbers(selectedBranchId);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible validar el número contra Meta."
            );
        } finally {
            setIsValidating(false);
        }
    }


    /**
     * handleActivateMonitoring
     *
     * Description:
     * - Activar la captura de mensajes para el número seleccionado.
     */
    async function handleActivateMonitoring() {
        if (
            !companyId ||
            !selectedBranchId ||
            !selectedNumber ||
            isChangingMonitoring
        ) {
            return;
        }

        setIsChangingMonitoring(true);
        clearParentMessages();

        try {
            const response = await activateWhatsAppMonitoring(
                companyId,
                selectedBranchId,
                selectedNumber.id
            );

            onSuccess?.(
                response?.success_message ||
                "Monitoreo de WhatsApp activado correctamente."
            );

            await reloadSelectedNumber(selectedNumber.id);
            await loadNumbers(selectedBranchId);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible activar el monitoreo."
            );
        } finally {
            setIsChangingMonitoring(false);
        }
    }


    /**
     * handleDeactivateMonitoring
     *
     * Description:
     * - Detener la captura monitoreada del número seleccionado.
     */
    async function handleDeactivateMonitoring() {
        if (
            !companyId ||
            !selectedBranchId ||
            !selectedNumber ||
            isChangingMonitoring
        ) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea detener el monitoreo del número "${selectedNumber.display_name}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsChangingMonitoring(true);
        clearParentMessages();

        try {
            const response = await deactivateWhatsAppMonitoring(
                companyId,
                selectedBranchId,
                selectedNumber.id
            );

            onSuccess?.(
                response?.success_message ||
                "Monitoreo de WhatsApp desactivado correctamente."
            );

            await reloadSelectedNumber(selectedNumber.id);
            await loadNumbers(selectedBranchId);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible desactivar el monitoreo."
            );
        } finally {
            setIsChangingMonitoring(false);
        }
    }


    /**
     * handleDeactivateNumber
     *
     * Description:
     * - Desactivar el número de WhatsApp seleccionado.
     *
     * Notes:
     * - El backend rechazará la operación cuando el monitoreo continúe activo.
     */
    async function handleDeactivateNumber() {
        if (
            !companyId ||
            !selectedBranchId ||
            !selectedNumber ||
            isDeleting
        ) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea desactivar el número "${selectedNumber.display_name}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearParentMessages();

        try {
            await deactivateWhatsAppNumber(
                companyId,
                selectedBranchId,
                selectedNumber.id
            );

            onSuccess?.(
                "Número de WhatsApp desactivado correctamente."
            );

            resetForm();

            await loadNumbers(selectedBranchId);
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible desactivar el número de WhatsApp."
            );
        } finally {
            setIsDeleting(false);
        }
    }


    /**
     * formatDateTime
     *
     * Description:
     * - Convertir una fecha ISO a una representación legible.
     */
    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("es-HN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }


    const operationInProgress =
        isSaving ||
        isDeleting ||
        isValidating ||
        isChangingMonitoring;


    useEffect(() => {
        setBranches([]);
        setAccounts([]);
        setNumbers([]);
        setSelectedBranchId("");
        setSelectedNumber(null);

        loadBranches();
        loadAccounts();
    }, [companyId]);


    useEffect(() => {
        resetForm();

        if (selectedBranchId) {
            loadNumbers(selectedBranchId);
        } else {
            setNumbers([]);
        }
    }, [selectedBranchId]);


    return (
        <div className={styles.numberSection}>
            <div className={styles.contextBar}>
                <div className={styles.contextField}>
                    <label htmlFor="number-branch">
                        Sucursal
                    </label>

                    <select
                        id="number-branch"
                        value={selectedBranchId}
                        onChange={handleBranchChange}
                        disabled={
                            isLoadingBranches ||
                            branches.length === 0 ||
                            operationInProgress
                        }
                    >
                        {branches.length === 0 && (
                            <option value="">
                                No existen sucursales disponibles
                            </option>
                        )}

                        {branches.map((branch) => (
                            <option
                                key={branch.id}
                                value={branch.id}
                            >
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.numberWorkspace}>
                <section className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>
                                Canales
                            </span>

                            <h2>
                                Números de WhatsApp
                            </h2>

                            <p>
                                Números activos pertenecientes a la sucursal seleccionada.
                            </p>
                        </div>

                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={handleNewNumber}
                            disabled={
                                !selectedBranchId ||
                                operationInProgress
                            }
                        >
                            Nuevo número
                        </button>
                    </div>

                    {!selectedBranchId ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
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
                            </div>

                            <strong>
                                Seleccione una sucursal.
                            </strong>

                            <span>
                                Los números de WhatsApp se administran dentro de una sucursal.
                            </span>
                        </div>
                    ) : isLoadingNumbers ? (
                        <div className={styles.loadingState}>
                            Cargando números...
                        </div>
                    ) : numbers.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
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
                            </div>

                            <strong>
                                No existen números registrados.
                            </strong>

                            <span>
                                Registre el primer número de WhatsApp para esta sucursal.
                            </span>
                        </div>
                    ) : (
                        <div className={styles.numberList}>
                            {numbers.map((number) => (
                                <button
                                    key={number.id}
                                    className={`${styles.numberCard} ${
                                        selectedNumber?.id === number.id
                                            ? styles.numberCardActive
                                            : ""
                                    }`}
                                    type="button"
                                    onClick={() => handleSelectNumber(number)}
                                    disabled={isLoadingDetail}
                                >
                                    <div className={styles.numberCardMain}>
                                        <div className={styles.numberIcon}>
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
                                        </div>

                                        <div className={styles.numberInformation}>
                                            <strong>
                                                {number.display_name}
                                            </strong>

                                            <span>
                                                {number.phone_number}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.statusGroup}>
                                        <span
                                            className={
                                                number.is_connected
                                                    ? styles.connectedBadge
                                                    : styles.disconnectedBadge
                                            }
                                        >
                                            {number.is_connected
                                                ? "Conectado"
                                                : "Sin validar"}
                                        </span>

                                        <span
                                            className={
                                                number.is_monitoring_enabled
                                                    ? styles.monitoringBadge
                                                    : styles.monitoringInactiveBadge
                                            }
                                        >
                                            {number.is_monitoring_enabled
                                                ? "Monitoreando"
                                                : "Sin monitoreo"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className={styles.formPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>
                                Configuración
                            </span>

                            <h2>
                                {selectedNumber
                                    ? "Editar número"
                                    : "Nuevo número"}
                            </h2>

                            <p>
                                {selectedNumber
                                    ? "Modifique el número o administre su estado operativo."
                                    : "Registre un número corporativo de WhatsApp."}
                            </p>
                        </div>

                        {selectedNumber && (
                            <span
                                className={
                                    selectedNumber.is_connected
                                        ? styles.connectedBadge
                                        : styles.disconnectedBadge
                                }
                            >
                                {selectedNumber.is_connected
                                    ? "Conectado"
                                    : "Sin validar"}
                            </span>
                        )}
                    </div>

                    <form
                        className={styles.numberForm}
                        onSubmit={handleSubmit}
                    >
                        <div className={styles.formField}>
                            <label htmlFor="number-waba">
                                Cuenta WABA
                            </label>

                            <select
                                id="number-waba"
                                value={wabaId}
                                onChange={(event) => setWabaId(event.target.value)}
                                disabled={
                                    isLoadingAccounts ||
                                    accounts.length === 0 ||
                                    operationInProgress
                                }
                                required
                            >
                                {accounts.length === 0 && (
                                    <option value="">
                                        No existen cuentas WABA disponibles
                                    </option>
                                )}

                                {accounts.map((account) => (
                                    <option
                                        key={account.id}
                                        value={account.id}
                                    >
                                        {account.display_name}
                                        {account.is_connected
                                            ? " — Conectada"
                                            : " — Desconectada"}
                                    </option>
                                ))}
                            </select>

                            <span className={styles.fieldHelp}>
                                El número utilizará esta cuenta de WhatsApp Business.
                            </span>
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="number-display-name">
                                Nombre
                            </label>

                            <input
                                id="number-display-name"
                                type="text"
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                placeholder="Nombre del número"
                                disabled={operationInProgress}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="number-phone">
                                Número telefónico
                            </label>

                            <input
                                id="number-phone"
                                type="text"
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                placeholder="+50499999999"
                                disabled={operationInProgress}
                                required
                            />

                            <span className={styles.fieldHelp}>
                                Utilice el número completo con código internacional.
                            </span>
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="number-meta-id">
                                Meta Phone Number ID
                            </label>

                            <input
                                id="number-meta-id"
                                type="text"
                                value={metaPhoneNumberId}
                                onChange={(event) => setMetaPhoneNumberId(event.target.value)}
                                placeholder="Identificador del número en Meta"
                                disabled={operationInProgress}
                                required
                            />
                        </div>

                        <div className={styles.formField}>
                            <label htmlFor="number-notes">
                                Notas
                            </label>

                            <textarea
                                id="number-notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Información administrativa opcional"
                                disabled={operationInProgress}
                                rows="4"
                            />
                        </div>

                        {selectedNumber && (
                            <div className={styles.lifecycleSection}>
                                <div className={styles.lifecycleHeader}>
                                    <div>
                                        <h3>
                                            Estado operativo
                                        </h3>

                                        <p>
                                            Conexión con Meta y estado actual de monitoreo.
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.lifecycleGrid}>
                                    <div className={styles.lifecycleField}>
                                        <span>
                                            Conexión
                                        </span>

                                        <strong>
                                            {selectedNumber.is_connected
                                                ? "Conectado"
                                                : "No validado"}
                                        </strong>
                                    </div>

                                    <div className={styles.lifecycleField}>
                                        <span>
                                            Monitoreo
                                        </span>

                                        <strong>
                                            {selectedNumber.is_monitoring_enabled
                                                ? "Activo"
                                                : "Inactivo"}
                                        </strong>
                                    </div>

                                    <div className={styles.lifecycleField}>
                                        <span>
                                            Inicio de monitoreo
                                        </span>

                                        <strong>
                                            {formatDateTime(
                                                selectedNumber.monitoring_started_at
                                            )}
                                        </strong>
                                    </div>

                                    <div className={styles.lifecycleField}>
                                        <span>
                                            Fin de monitoreo
                                        </span>

                                        <strong>
                                            {formatDateTime(
                                                selectedNumber.monitoring_stopped_at
                                            )}
                                        </strong>
                                    </div>
                                </div>

                                <div className={styles.lifecycleActions}>
                                    <button
                                        className={styles.validateButton}
                                        type="button"
                                        onClick={handleValidate}
                                        disabled={operationInProgress}
                                    >
                                        {isValidating
                                            ? "Validando..."
                                            : "Validar con Meta"}
                                    </button>

                                    {!selectedNumber.is_monitoring_enabled ? (
                                        <button
                                            className={styles.monitoringPrimaryButton}
                                            type="button"
                                            onClick={handleActivateMonitoring}
                                            disabled={
                                                operationInProgress ||
                                                !selectedNumber.is_connected
                                            }
                                        >
                                            {isChangingMonitoring
                                                ? "Activando..."
                                                : "Activar monitoreo"}
                                        </button>
                                    ) : (
                                        <button
                                            className={styles.monitoringDangerButton}
                                            type="button"
                                            onClick={handleDeactivateMonitoring}
                                            disabled={operationInProgress}
                                        >
                                            {isChangingMonitoring
                                                ? "Desactivando..."
                                                : "Detener monitoreo"}
                                        </button>
                                    )}
                                </div>

                                {!selectedNumber.is_connected && (
                                    <div className={styles.lifecycleNotice}>
                                        Valide primero el número contra Meta antes de activar el monitoreo.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.formActions}>
                            {selectedNumber && (
                                <button
                                    className={styles.dangerButton}
                                    type="button"
                                    onClick={handleDeactivateNumber}
                                    disabled={operationInProgress}
                                >
                                    {isDeleting
                                        ? "Desactivando..."
                                        : "Desactivar"}
                                </button>
                            )}

                            <div className={styles.primaryActions}>
                                {selectedNumber && (
                                    <button
                                        className={styles.secondaryButton}
                                        type="button"
                                        onClick={resetForm}
                                        disabled={operationInProgress}
                                    >
                                        Cancelar
                                    </button>
                                )}

                                <button
                                    className={styles.primaryButton}
                                    type="submit"
                                    disabled={
                                        !companyId ||
                                        !selectedBranchId ||
                                        !wabaId ||
                                        operationInProgress
                                    }
                                >
                                    {isSaving
                                        ? "Guardando..."
                                        : selectedNumber
                                            ? "Guardar cambios"
                                            : "Crear número"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default WhatsAppNumberForm;