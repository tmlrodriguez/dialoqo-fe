import { useTemplatePicker } from "../../../../hooks/useTemplatePicker.js";
import TemplatePickerView from "../TemplatePickerView/TemplatePickerView.jsx";

/**
 * TemplatePicker
 * Description: Connect monitoring behavior to its presentation.
 */
function TemplatePicker(props) {
    const state = useTemplatePicker(props);
    return <TemplatePickerView {...state} />;
}

export default TemplatePicker;
