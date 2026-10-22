import OptionListItem from "../OptionListItem/OptionListItem.jsx";

/**
 * OptionList
 * Description: Render native select options without repeating selection markup.
 */
function OptionList({ items = [], getValue, getLabel, getDisabled = () => false }) {
    return items.map((item) => (
        <OptionListItem key={getValue(item)} value={getValue(item)} disabled={getDisabled(item)}>
            {getLabel(item)}
        </OptionListItem>
    ));
}

export default OptionList;
