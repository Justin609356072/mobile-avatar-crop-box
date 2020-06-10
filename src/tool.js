
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
