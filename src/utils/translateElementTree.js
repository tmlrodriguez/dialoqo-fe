import { translateText } from "./i18n.js";

const textTranslationState = new WeakMap();
const attributeTranslationState = new WeakMap();

export function translateElementTree(root, language) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    for (const node of textNodes) {
        if (!node.parentElement || ["SCRIPT", "STYLE"].includes(node.parentElement.tagName))
            continue;

        const currentText = node.nodeValue || "";
        const previousState = textTranslationState.get(node);
        let originalText = previousState?.original ?? currentText;

        // React can reuse an existing Text node when dynamic data changes. If the
        // current DOM value is different from the value last rendered by the
        // translator, treat it as new application content instead of restoring
        // the first value ever seen on this node.
        if (previousState && currentText !== previousState.rendered) originalText = currentText;

        const targetText = language === "en" ? translateText(originalText, "en") : originalText;
        textTranslationState.set(node, { original: originalText, rendered: targetText });

        if (currentText !== targetText) node.nodeValue = targetText;
    }

    const elements =
        root.nodeType === Node.ELEMENT_NODE
            ? [root, ...root.querySelectorAll("*")]
            : [...document.querySelectorAll("*")];
    for (const element of elements) {
        let elementState = attributeTranslationState.get(element);
        if (!elementState) {
            elementState = {};
            attributeTranslationState.set(element, elementState);
        }

        for (const attribute of ["placeholder", "aria-label", "title"]) {
            if (!element.hasAttribute?.(attribute)) continue;

            const currentValue = element.getAttribute(attribute) || "";
            const previousState = elementState[attribute];
            let originalValue = previousState?.original ?? currentValue;

            if (previousState && currentValue !== previousState.rendered)
                originalValue = currentValue;

            const targetValue =
                language === "en" ? translateText(originalValue, "en") : originalValue;
            elementState[attribute] = { original: originalValue, rendered: targetValue };

            if (currentValue !== targetValue) element.setAttribute(attribute, targetValue);
        }
    }
}
