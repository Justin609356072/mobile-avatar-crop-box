import md5 from 'md5';

/** Generate image element with links
 * @param {String} url image link
 * @returns {Object} DOM element
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Get parent container by id
 * @param {String} id id
 * @returns {Object} DOM element
 */
export function getParentNode(id) {
  // If the id exists, append it under the DOM corresponding to the id,
  // otherwise append it to the document
  return id ? document.getElementById(id) : document.body;
}

/** Get hash class name
 * @param {String} className class name
 * @returns {String} computed class name
 */
export function getClassName(className) {
  return `${className}-${md5(className).slice(0, 10)}`;
}


/** Get style compatible values
 * @param {String} value Style key-value pairs
 * @returns {String} computed value
 */
export function getCssValue(value) {
  const cssPreFix = ['', '-webkit-', '-moz-', '-ms-'];
  const values = cssPreFix.map((preFix) => preFix + value);
  return values.join('');
}
