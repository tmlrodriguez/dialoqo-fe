const META_APP_ID = import.meta.env.VITE_META_APP_ID;
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID;

const FACEBOOK_SDK_URL =
    "https://connect.facebook.net/en_US/sdk.js";

const FACEBOOK_SDK_ID = "facebook-jssdk";

const META_GRAPH_API_VERSION = "v26.0";

const EMBEDDED_SIGNUP_FEATURE_TYPE =
    "whatsapp_business_app_onboarding";

const EMBEDDED_SIGNUP_SESSION_VERSION = "3";

const EMBEDDED_SIGNUP_MESSAGE_TYPE =
    "WA_EMBEDDED_SIGNUP";

const EMBEDDED_SIGNUP_COMPLETION_EVENTS = new Set([
    "FINISH",
    "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
]);

const EMBEDDED_SIGNUP_CANCELLATION_EVENTS = new Set([
    "CANCEL",
    "CANCEL_WHATSAPP_BUSINESS_APP_ONBOARDING",
]);

const META_ALLOWED_ORIGINS = new Set([
    "https://www.facebook.com",
    "https://web.facebook.com",
]);

const EMBEDDED_SIGNUP_TIMEOUT = 300000;

const FACEBOOK_SDK_TIMEOUT = 30000;

const DEBUG_ENABLED = import.meta.env.DEV;

let facebookSdkPromise = null;

let embeddedSignupInProgress = false;


/* =========================================================
   DEVELOPMENT LOGGING
   ========================================================= */

/**
 * logEmbeddedSignup
 *
 * Description:
 * - Write development-only diagnostic events.
 * - Provide consistent logging for Meta Embedded Signup.
 *
 * Notes:
 * - Logging is disabled in production.
 * - Authorization codes and access tokens are never logged.
 * - Only explicitly selected diagnostic fields are included.
 */
function logEmbeddedSignup(eventName, details = {}) {
    if (!DEBUG_ENABLED) {
        return;
    }

    const timestamp = new Date().toISOString();

    console.info(
        `[Dialoqo Embedded Signup] ${timestamp} | ${eventName}`,
        details
    );
}


/**
 * logEmbeddedSignupWarning
 *
 * Description:
 * - Write development-only warnings.
 */
function logEmbeddedSignupWarning(eventName, details = {}) {
    if (!DEBUG_ENABLED) {
        return;
    }

    console.warn(
        `[Dialoqo Embedded Signup] ${eventName}`,
        details
    );
}


/**
 * logEmbeddedSignupError
 *
 * Description:
 * - Write development-only errors.
 *
 * Notes:
 * - Arbitrary Meta error objects are never logged.
 * - Sensitive authorization information is excluded.
 */
function logEmbeddedSignupError(eventName, details = {}) {
    if (!DEBUG_ENABLED) {
        return;
    }

    console.error(
        `[Dialoqo Embedded Signup] ${eventName}`,
        details
    );
}


/* =========================================================
   CONFIGURATION
   ========================================================= */

/**
 * validateMetaEmbeddedSignupConfiguration
 *
 * Description:
 * - Validate the public configuration required to launch
 *   WhatsApp Embedded Signup.
 *
 * Notes:
 * - Meta App ID and Configuration ID are public identifiers.
 * - App Secret and operational tokens remain in Django.
 */
function validateMetaEmbeddedSignupConfiguration() {
    if (!META_APP_ID) {
        throw new Error(
            "VITE_META_APP_ID is not configured."
        );
    }

    if (!META_CONFIG_ID) {
        throw new Error(
            "VITE_META_CONFIG_ID is not configured."
        );
    }

    logEmbeddedSignup("CONFIGURATION_VALIDATED", {
        app_id_configured: true,
        config_id_configured: true,
        graph_api_version: META_GRAPH_API_VERSION,
        feature_type: EMBEDDED_SIGNUP_FEATURE_TYPE,
        session_info_version: EMBEDDED_SIGNUP_SESSION_VERSION,
    });
}


/* =========================================================
   FACEBOOK SDK INITIALIZATION
   ========================================================= */

/**
 * initializeFacebookSdk
 *
 * Description:
 * - Initialize the Meta JavaScript SDK.
 *
 * Notes:
 * - Uses Dialoqo's global Meta App ID.
 * - No sensitive credentials are exposed.
 */
function initializeFacebookSdk() {
    validateMetaEmbeddedSignupConfiguration();

    if (!window.FB) {
        throw new Error(
            "The Meta JavaScript SDK was loaded but FB is unavailable."
        );
    }

    window.FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: false,
        version: META_GRAPH_API_VERSION,
    });

    logEmbeddedSignup("SDK_INITIALIZED", {
        initialized: true,
        graph_api_version: META_GRAPH_API_VERSION,
    });

    return window.FB;
}


/**
 * loadFacebookSdk
 *
 * Description:
 * - Load the Facebook JavaScript SDK.
 * - Reuse an existing SDK installation.
 * - Prevent duplicate SDK loading.
 *
 * Notes:
 * - Concurrent requests share one Promise.
 * - Failed loading attempts can be retried.
 * - A timeout prevents indefinite initialization.
 */
export function loadFacebookSdk() {
    validateMetaEmbeddedSignupConfiguration();

    if (window.FB) {
        try {
            return Promise.resolve(
                initializeFacebookSdk()
            );
        } catch (error) {
            return Promise.reject(error);
        }
    }

    if (facebookSdkPromise) {
        return facebookSdkPromise;
    }

    logEmbeddedSignup("SDK_LOADING_STARTED", {
        sdk_url: FACEBOOK_SDK_URL,
    });

    facebookSdkPromise = new Promise((resolve, reject) => {
        const existingScript =
            document.getElementById(FACEBOOK_SDK_ID);

        let completed = false;

        let loadingTimeout = null;


        /**
         * cleanup
         *
         * Description:
         * - Clear SDK loading resources.
         */
        function cleanup() {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
                loadingTimeout = null;
            }
        }


        /**
         * finishLoading
         *
         * Description:
         * - Resolve SDK initialization once.
         */
        function finishLoading(FB) {
            if (completed) {
                return;
            }

            completed = true;

            cleanup();

            logEmbeddedSignup("SDK_LOADING_COMPLETED", {
                loaded: true,
            });

            resolve(FB);
        }


        /**
         * failLoading
         *
         * Description:
         * - Reject SDK initialization once.
         */
        function failLoading(error) {
            if (completed) {
                return;
            }

            completed = true;

            cleanup();

            facebookSdkPromise = null;

            logEmbeddedSignupError("SDK_LOADING_FAILED", {
                error_message: error.message,
            });

            reject(error);
        }


        /**
         * initializeSdkCallback
         *
         * Description:
         * - Initialize the SDK after Meta loads it.
         */
        function initializeSdkCallback() {
            try {
                const FB = initializeFacebookSdk();

                finishLoading(FB);
            } catch (error) {
                failLoading(error);
            }
        }


        window.fbAsyncInit = initializeSdkCallback;

        loadingTimeout = setTimeout(() => {
            failLoading(
                new Error(
                    "Meta JavaScript SDK initialization timed out."
                )
            );
        }, FACEBOOK_SDK_TIMEOUT);


        if (existingScript) {
            logEmbeddedSignup("SDK_SCRIPT_ALREADY_PRESENT", {
                script_id: FACEBOOK_SDK_ID,
            });

            if (window.FB) {
                initializeSdkCallback();
            }

            return;
        }


        const script = document.createElement("script");

        script.id = FACEBOOK_SDK_ID;
        script.src = FACEBOOK_SDK_URL;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
            failLoading(
                new Error(
                    "The Meta JavaScript SDK could not be loaded."
                )
            );
        };

        document.body.appendChild(script);
    });

    return facebookSdkPromise;
}


/* =========================================================
   META SESSION EVENT PARSING
   ========================================================= */

/**
 * parseEmbeddedSignupMessage
 *
 * Description:
 * - Parse trusted WhatsApp Embedded Signup messages.
 *
 * Notes:
 * - Only approved Facebook origins are accepted.
 * - Unrelated postMessage events are ignored.
 * - Invalid JSON is ignored safely.
 * - Raw event payloads are never logged.
 */
function parseEmbeddedSignupMessage(event) {
    if (!META_ALLOWED_ORIGINS.has(event.origin)) {
        return null;
    }

    let data = event.data;

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            return null;
        }
    }

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data) ||
        data.type !== EMBEDDED_SIGNUP_MESSAGE_TYPE
    ) {
        return null;
    }

    return data;
}


/**
 * extractEmbeddedSignupIdentifiers
 *
 * Description:
 * - Extract Meta identifiers from Embedded Signup.
 *
 * Notes:
 * - Supports standard and coexistence onboarding.
 * - Identifiers are not authoritative until Django validates them.
 * - Missing identifiers are represented as null.
 */
function extractEmbeddedSignupIdentifiers(sessionInfo) {
    const data = sessionInfo?.data || {};

    return {
        waba_id:
            data.waba_id ||
            data.wabaId ||
            null,

        phone_number_id:
            data.phone_number_id ||
            data.phoneNumberId ||
            null,

        business_id:
            data.business_id ||
            data.business_portfolio_id ||
            data.businessId ||
            null,
    };
}


/**
 * extractEmbeddedSignupDiagnosticData
 *
 * Description:
 * - Build a controlled diagnostic representation.
 *
 * Notes:
 * - Authorization codes and tokens are excluded.
 * - Phone numbers and customer conversations are excluded.
 * - Only explicitly selected diagnostic fields are returned.
 */
function extractEmbeddedSignupDiagnosticData(sessionInfo) {
    const identifiers =
        extractEmbeddedSignupIdentifiers(sessionInfo);

    const data = sessionInfo?.data || {};

    return {
        event: sessionInfo?.event || null,

        waba_id: identifiers.waba_id,

        phone_number_id: identifiers.phone_number_id,

        business_id: identifiers.business_id,

        has_error_code: Boolean(data.error_code),

        error_code:
            typeof data.error_code === "string" ||
            typeof data.error_code === "number"
                ? String(data.error_code)
                : null,

        has_error_message: Boolean(data.error_message),

        has_current_step: Boolean(data.current_step),
    };
}


/**
 * extractLoginDiagnosticData
 *
 * Description:
 * - Build safe diagnostics for the Facebook login callback.
 *
 * Notes:
 * - Authorization codes are never logged.
 * - Complete authResponse objects are never logged.
 */
function extractLoginDiagnosticData(response) {
    return {
        response_received: Boolean(response),

        status:
            typeof response?.status === "string"
                ? response.status
                : null,

        authorization_received:
            Boolean(response?.authResponse),

        authorization_code_received:
            Boolean(response?.authResponse?.code),
    };
}


/* =========================================================
   RESULT NORMALIZATION
   ========================================================= */

/**
 * buildEmbeddedSignupResult
 *
 * Description:
 * - Normalize the result returned to WabaForm.
 *
 * Notes:
 * - The authorization code is returned only to the caller.
 * - Django must exchange the authorization code.
 * - The frontend never receives the Meta App Secret.
 */
function buildEmbeddedSignupResult({
    authorizationCode = null,
    sessionInfo = null,
    cancelled = false,
}) {
    return {
        authorization: authorizationCode
            ? {
                code: authorizationCode,
            }
            : null,

        session: sessionInfo,

        identifiers:
            extractEmbeddedSignupIdentifiers(sessionInfo),

        cancelled,
    };
}


/* =========================================================
   EMBEDDED SIGNUP
   ========================================================= */

/**
 * launchWhatsAppEmbeddedSignup
 *
 * Description:
 * - Launch Meta WhatsApp Embedded Signup.
 * - Support WhatsApp Business App Coexistence.
 * - Capture the OAuth authorization code.
 * - Capture Meta's onboarding completion event.
 * - Return the authorization information to WabaForm.
 *
 * Notes:
 * - Supports FINISH and FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING.
 * - The OAuth callback and session event may arrive in either order.
 * - Both are required for successful completion.
 * - Only one signup session may run at a time.
 * - Duplicate completion events are ignored.
 * - Django remains responsible for validating all Meta identifiers.
 * - The frontend never exchanges authorization codes directly.
 * - A timeout prevents indefinitely pending onboarding sessions.
 */
export async function launchWhatsAppEmbeddedSignup() {
    if (embeddedSignupInProgress) {
        throw new Error(
            "A WhatsApp Embedded Signup session is already in progress."
        );
    }

    embeddedSignupInProgress = true;

    logEmbeddedSignup("SIGNUP_INITIALIZING", {
        feature_type: EMBEDDED_SIGNUP_FEATURE_TYPE,
        session_info_version: EMBEDDED_SIGNUP_SESSION_VERSION,
    });

    let FB;

    try {
        FB = await loadFacebookSdk();
    } catch (error) {
        embeddedSignupInProgress = false;

        logEmbeddedSignupError("SIGNUP_INITIALIZATION_FAILED", {
            error_message: error.message,
        });

        throw error;
    }

    return new Promise((resolve, reject) => {
        let sessionInfo = null;

        let authorizationCode = null;

        let loginCallbackReceived = false;

        let finishEventReceived = false;

        let settled = false;

        let signupTimeout = null;


        /* -----------------------------------------------------
           CLEANUP
           ----------------------------------------------------- */

        /**
         * cleanup
         *
         * Description:
         * - Remove temporary event listeners.
         * - Clear onboarding timeout.
         * - Release the signup execution lock.
         */
        function cleanup() {
            window.removeEventListener(
                "message",
                handleMessage
            );

            if (signupTimeout) {
                clearTimeout(signupTimeout);
                signupTimeout = null;
            }

            embeddedSignupInProgress = false;
        }


        /* -----------------------------------------------------
           RESOLVE SIGNUP
           ----------------------------------------------------- */

        /**
         * finish
         *
         * Description:
         * - Resolve the signup Promise exactly once.
         */
        function finish(result) {
            if (settled) {
                return;
            }

            settled = true;

            cleanup();

            resolve(result);
        }


        /* -----------------------------------------------------
           REJECT SIGNUP
           ----------------------------------------------------- */

        /**
         * fail
         *
         * Description:
         * - Reject the signup Promise exactly once.
         */
        function fail(error) {
            if (settled) {
                return;
            }

            settled = true;

            cleanup();

            logEmbeddedSignupError("SIGNUP_FAILED", {
                error_message: error.message,
            });

            reject(error);
        }


        /* -----------------------------------------------------
           COMPLETE SIGNUP
           ----------------------------------------------------- */

        /**
         * completeSignup
         *
         * Description:
         * - Complete onboarding after receiving both:
         *   1. Meta's successful session event.
         *   2. The OAuth authorization code.
         *
         * Notes:
         * - Callback order is not guaranteed.
         * - Missing authorization rejects completion.
         * - Django validates the identifiers after submission.
         */
        function completeSignup() {
            if (
                settled ||
                !finishEventReceived ||
                !loginCallbackReceived
            ) {
                return;
            }

            if (!authorizationCode) {
                fail(
                    new Error(
                        "Meta completed Embedded Signup but did not return an authorization code."
                    )
                );

                return;
            }

            const identifiers =
                extractEmbeddedSignupIdentifiers(sessionInfo);

            if (
                !identifiers.waba_id ||
                !identifiers.phone_number_id
            ) {
                fail(
                    new Error(
                        "Meta completed Embedded Signup but did not return the required WABA and Phone Number IDs."
                    )
                );

                return;
            }

            logEmbeddedSignup("SIGNUP_COMPLETED", {
                completion_event: sessionInfo?.event,

                authorization_code_received: true,

                waba_id: identifiers.waba_id,

                phone_number_id: identifiers.phone_number_id,

                business_id: identifiers.business_id,
            });

            finish(
                buildEmbeddedSignupResult({
                    authorizationCode,
                    sessionInfo,
                    cancelled: false,
                })
            );
        }


        /* -----------------------------------------------------
           META SESSION MESSAGE HANDLER
           ----------------------------------------------------- */

        /**
         * handleMessage
         *
         * Description:
         * - Process trusted WA_EMBEDDED_SIGNUP events.
         * - Recognize standard and coexistence completion.
         */
        function handleMessage(event) {
            if (settled) {
                return;
            }

            const embeddedSignupEvent =
                parseEmbeddedSignupMessage(event);

            if (!embeddedSignupEvent) {
                return;
            }

            const eventName =
                embeddedSignupEvent.event || "UNKNOWN";

            const diagnosticData =
                extractEmbeddedSignupDiagnosticData(
                    embeddedSignupEvent
                );

            logEmbeddedSignup(
                "SIGNUP_SESSION_EVENT",
                diagnosticData
            );


            /* -------------------------------------------------
               SUCCESSFUL COMPLETION
               ------------------------------------------------- */

            if (
                EMBEDDED_SIGNUP_COMPLETION_EVENTS.has(
                    eventName
                )
            ) {
                sessionInfo = embeddedSignupEvent;

                finishEventReceived = true;

                logEmbeddedSignup(
                    "SIGNUP_FINISH_RECEIVED",
                    {
                        ...diagnosticData,

                        authorization_code_received:
                            Boolean(authorizationCode),
                    }
                );

                completeSignup();

                return;
            }


            /* -------------------------------------------------
               USER CANCELLATION
               ------------------------------------------------- */

            if (
                EMBEDDED_SIGNUP_CANCELLATION_EVENTS.has(
                    eventName
                )
            ) {
                sessionInfo = embeddedSignupEvent;

                logEmbeddedSignupWarning(
                    "SIGNUP_CANCELLED",
                    diagnosticData
                );

                finish(
                    buildEmbeddedSignupResult({
                        authorizationCode: null,
                        sessionInfo,
                        cancelled: true,
                    })
                );

                return;
            }


            /* -------------------------------------------------
               META ERROR
               ------------------------------------------------- */

            if (eventName === "ERROR") {
                sessionInfo = embeddedSignupEvent;

                logEmbeddedSignupError(
                    "SIGNUP_META_ERROR",
                    diagnosticData
                );

                fail(
                    new Error(
                        "Meta reported an error during WhatsApp Embedded Signup."
                    )
                );

                return;
            }


            /* -------------------------------------------------
               OTHER SESSION EVENTS
               ------------------------------------------------- */

            logEmbeddedSignup(
                "SIGNUP_EVENT_RECEIVED",
                {
                    event: eventName,
                }
            );
        }


        /* -----------------------------------------------------
           FACEBOOK LOGIN CALLBACK
           ----------------------------------------------------- */

        /**
         * handleLoginResponse
         *
         * Description:
         * - Process the Facebook JavaScript SDK login callback.
         * - Extract the authorization code.
         *
         * Notes:
         * - The authorization code is never logged.
         * - The session event may arrive before the callback.
         */
                function handleLoginResponse(response) {
            if (settled) {
                return;
            }

            loginCallbackReceived = true;

            const diagnosticData =
                extractLoginDiagnosticData(response);

            logEmbeddedSignup(
                "SIGNUP_LOGIN_CALLBACK",
                diagnosticData
            );

            /* -------------------------------------------------
               MISSING LOGIN RESPONSE
               ------------------------------------------------- */

            if (!response) {
                fail(
                    new Error(
                        "Meta did not return a login response."
                    )
                );

                return;
            }

            /* -------------------------------------------------
               LOGIN CANCELLED
               ------------------------------------------------- */

            if (!response.authResponse) {
                logEmbeddedSignupWarning(
                    "SIGNUP_LOGIN_CANCELLED",
                    {
                        status: diagnosticData.status,
                    }
                );

                // A successful session event takes precedence.
                // If Meta reported successful onboarding, do not
                // silently classify the operation as cancelled.

                if (finishEventReceived) {
                    fail(
                        new Error(
                            "Meta completed onboarding but did not return an authorization response."
                        )
                    );

                    return;
                }

                finish(
                    buildEmbeddedSignupResult({
                        authorizationCode: null,
                        sessionInfo,
                        cancelled: true,
                    })
                );

                return;
            }

            /* -------------------------------------------------
               EXTRACT AUTHORIZATION CODE
               ------------------------------------------------- */

            authorizationCode =
                response.authResponse.code || null;

            if (authorizationCode) {
                logEmbeddedSignup(
                    "SIGNUP_CODE_RECEIVED",
                    {
                        received: true,
                    }
                );
            } else {
                logEmbeddedSignupWarning(
                    "SIGNUP_CODE_MISSING",
                    {
                        authorization_received: true,
                    }
                );

                fail(
                    new Error(
                        "Meta returned an authorization response without an authorization code."
                    )
                );

                return;
            }

            /* -------------------------------------------------
               COMPLETE IF SESSION ALREADY FINISHED
               ------------------------------------------------- */

            if (finishEventReceived) {
                logEmbeddedSignup(
                    "SIGNUP_COMPLETING_AFTER_LOGIN",
                    {
                        authorization_code_received: true,
                        finish_event_received: true,
                    }
                );

                completeSignup();

                return;
            }

            /* -------------------------------------------------
               WAIT FOR META SESSION COMPLETION
               ------------------------------------------------- */

            logEmbeddedSignup(
                "SIGNUP_WAITING_FOR_SESSION",
                {
                    authorization_code_received:
                        Boolean(authorizationCode),

                    finish_event_received:
                        finishEventReceived,
                }
            );
        }


        /* =====================================================
           REGISTER META SESSION LISTENER
           ===================================================== */

        window.addEventListener(
            "message",
            handleMessage
        );


        /* =====================================================
           ONBOARDING TIMEOUT
           ===================================================== */

        /**
         * signupTimeout
         *
         * Description:
         * - Prevent indefinitely pending Embedded Signup sessions.
         * - Release the execution lock when Meta does not complete.
         *
         * Notes:
         * - Timeout does not cancel operations already performed
         *   inside Meta.
         * - A timeout does not imply that Meta registration failed.
         * - Authorization codes are never included in errors.
         */

        signupTimeout = setTimeout(() => {
            if (settled) {
                return;
            }

            logEmbeddedSignupError(
                "SIGNUP_TIMEOUT",
                {
                    login_callback_received:
                        loginCallbackReceived,

                    authorization_code_received:
                        Boolean(authorizationCode),

                    finish_event_received:
                        finishEventReceived,

                    session_event:
                        sessionInfo?.event || null,
                }
            );

            fail(
                new Error(
                    "Meta Embedded Signup timed out before the authorization process could be completed. " +
                    "The Meta account may already have been registered. " +
                    "Verify its status before attempting onboarding again."
                )
            );
        }, EMBEDDED_SIGNUP_TIMEOUT);


        /* =====================================================
           START EMBEDDED SIGNUP
           ===================================================== */

        logEmbeddedSignup(
            "SIGNUP_STARTED",
            {
                feature_type:
                    EMBEDDED_SIGNUP_FEATURE_TYPE,

                session_info_version:
                    EMBEDDED_SIGNUP_SESSION_VERSION,

                sdk_initialized: true,

                timeout_ms:
                    EMBEDDED_SIGNUP_TIMEOUT,
            }
        );


        /* =====================================================
           FACEBOOK LOGIN
           ===================================================== */

        try {
            FB.login(
                handleLoginResponse,
                {
                    config_id: META_CONFIG_ID,

                    response_type: "code",

                    override_default_response_type: true,

                    extras: {
                        setup: {},

                        featureType:
                            EMBEDDED_SIGNUP_FEATURE_TYPE,

                        sessionInfoVersion:
                            EMBEDDED_SIGNUP_SESSION_VERSION,
                    },
                }
            );

            logEmbeddedSignup(
                "SIGNUP_DIALOG_REQUESTED",
                {
                    configuration_present:
                        Boolean(META_CONFIG_ID),

                    feature_type:
                        EMBEDDED_SIGNUP_FEATURE_TYPE,

                    session_info_version:
                        EMBEDDED_SIGNUP_SESSION_VERSION,
                }
            );

        } catch (error) {
            logEmbeddedSignupError(
                "SIGNUP_DIALOG_LAUNCH_FAILED",
                {
                    error_type:
                        error?.name || "Error",
                }
            );

            fail(
                new Error(
                    "Unable to launch Meta Embedded Signup."
                )
            );
        }
    });
}