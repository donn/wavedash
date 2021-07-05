/**
 * @callback scopedElement
 * @param {HTMLElement}
 */
/**
 * 
 * @param {string} tag 
 * @param {scopedElement} scope
 * @returns {HTMLElement}
 */
export const n = (tag, scope) => {
    let newElement = document.createElement(tag);
    scope(newElement);
    return newElement;
}
export const g = document.querySelector.bind(document);

