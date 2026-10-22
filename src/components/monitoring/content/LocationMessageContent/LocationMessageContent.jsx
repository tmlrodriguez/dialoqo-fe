import Button from "../../../common/buttons/Button/Button.jsx";

import { getFirstValue } from "../../../../utils/firstValue.js";

import styles from "./LocationMessageContent.module.css";

/**
 * LocationMessageContent
 * Description: Render a structured WhatsApp message without performing requests.
 */

function LocationMessageContent({ contentData, t }) {
    const latitude = getFirstValue(contentData, ["latitude", "lat"]);
    const longitude = getFirstValue(contentData, ["longitude", "lng", "lon"]);
    const name = getFirstValue(contentData, ["name", "location_name"]);
    const address = getFirstValue(contentData, ["address", "location_address"]);
    const hasCoordinates = latitude !== "" && longitude !== "";
    const mapUrl = hasCoordinates
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`
        : "";
    return (
        <div className={styles.locationCard}>
            <div className={styles.locationIcon}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                    <circle cx="12" cy="10" r="2.5" />
                </svg>
            </div>

            <div className={styles.locationInformation}>
                <strong>{name || t("Ubicación compartida")}</strong>

                {address && <span>{address}</span>}

                {hasCoordinates && (
                    <small>
                        {latitude}, {longitude}
                    </small>
                )}
            </div>

            {mapUrl && (
                <Button
                    className={styles.actionButton}
                    type="button"
                    onClick={() => {
                        window.open(mapUrl, "_blank", "noopener,noreferrer");
                    }}
                >
                    {t("Abrir mapa")}
                </Button>
            )}
        </div>
    );
}

export default LocationMessageContent;
