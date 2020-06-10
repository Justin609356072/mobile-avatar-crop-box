/** In the touchmove event, get the distance between the first two contacts of multiple contacts
 * @param {List} touches Touch point list
 * @returns {Number} Distance between the first two contacts
 */
function getTouchesDistance([touchFirst, touchSecond]) {
  const diffX = touchFirst.clientX - touchSecond.clientX;
  const diffY = touchFirst.clientY - touchSecond.clientY;
  const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
  return distance;
}

/** Get the best position of the crop
 * @param {Number} boxWidth width of box
 * @param {Number} boxHeight height of box
 * @param {Number} cropAspectRatio Aspect ratio of crop
 * @param {Number} cropSizeRatio The proportion of the crop in the box（calculate in the style of "contain"）
 * @returns {Object} The proportion information of the crop in the box
 */
function getCropPosition(boxWidth, boxHeight, cropAspectRatio, cropSizeRatio) {
  const boxRatio = boxWidth / boxHeight;
  let height;
  let width;
  let top;
  let left;
  // Here are the actual values
  if (boxRatio > cropAspectRatio) {
    height = cropSizeRatio * boxHeight;
    width = height * cropAspectRatio;
    top = (boxHeight - height) / 2;
    left = (boxWidth - width) / 2;
  } else {
    width = cropSizeRatio * boxWidth;
    height = width / cropAspectRatio;
    top = (boxHeight - height) / 2;
    left = (boxWidth - width) / 2;
  }
  // Here is the ratio
  height /= boxHeight;
  width /= boxWidth;
  top /= boxHeight;
  left /= boxWidth;
  return {
    height, width, top, left,
  };
}

/** Functions that handle scaling
 * @param {Number} params.boxWidth width of box
 * @param {Number} params.boxHeight height of box
 * @param {Number} params.cropAspectRatio  Aspect ratio of crop
 * @param {Number} params.cropSizeRatio The proportion of the crop in the box（calculate in the style of "contain"）
 * @param {Boolean} params.isCircle width of box
 * @returns {Object} base64 info of picture
 */
export function initStaticPosition({
  boxWidth, boxHeight, cropAspectRatio, cropSizeRatio, isCircle,
}) {
  return {
    // box
    box: {
      width: boxWidth,
      height: boxHeight,
    },
    // Position of the crop box in the box
    crop: {
      ...getCropPosition(boxWidth, boxHeight, cropAspectRatio, cropSizeRatio),
      isCircle,
      aspectRatio: cropAspectRatio,
    },
  };
}

/** Functions that handle scaling
 * @param {Object} dynamicPosition Dynamic position information
 * @param {Object} staticPosition Static position information
 * @param {Object} img Image information
 * @param {Object} e Touch event object
 */
export function handleZoom(dynamicPosition, staticPosition, img, e) {
  const { box, crop } = staticPosition;
  const cropRealWidth = box.width * crop.width;
  const cropRealHeight = box.height * crop.height;
  const { touchInfo } = dynamicPosition;
  // Save the position information of the first two touch points
  const [touchFirst, touchSecond] = e.touches;
  const curTouchesDistance = getTouchesDistance([touchFirst, touchSecond]);
  const { clientX: touchFirstX, clientY: touchFirstY } = touchFirst;
  const { clientX: touchSecondX, clientY: touchSecondY } = touchSecond;

  // Judging the start of zooming
  if (touchInfo.startDistance === 0) {
    touchInfo.startDistance = curTouchesDistance;
    // Record some temporary data for scaling
    touchInfo.startLeft = dynamicPosition.left;
    touchInfo.startTop = dynamicPosition.top;
    touchInfo.startWidth = dynamicPosition.width;
    // Record the displacement of the midpoint of two fingers
    touchInfo.startCenterX = (touchFirstX + touchSecondX) / 2;
    touchInfo.startCenterY = (touchFirstY + touchSecondY) / 2;
    return;
  }
  // Calculate the moving distance when zooming
  const centerX = (touchFirstX + touchSecondX) / 2;
  const centerY = (touchFirstY + touchSecondY) / 2;
  const diffX = centerX - touchInfo.startCenterX;
  const diffY = centerY - touchInfo.startCenterY;
  const temporaryXRate = diffX / cropRealWidth;
  const temporaryYRate = diffY / cropRealHeight;

  // todo: Optimized to zoom from the center of two fingers
  touchInfo.curDistance = curTouchesDistance;
  const width = (touchInfo.curDistance / touchInfo.startDistance) * touchInfo.startWidth;
  const zoomWidthRate = dynamicPosition.width - touchInfo.startWidth;
  const zoomHeightRate = zoomWidthRate * img.aspectRatio * crop.aspectRatio;
  const left = touchInfo.startLeft - (zoomWidthRate / 2) + temporaryXRate;
  const top = touchInfo.startTop - (zoomHeightRate / 2) + temporaryYRate;
  const result = { left, top };
  // Maximum magnification
  if (width < 3) {
    result.width = width;
  }
  Object.assign(dynamicPosition, result);
}

/** When the picture overflows, move the picture back to the crop box
 * @param {Object} img Image information
 * @param {Object} crop Position information of crop container
 * @param {Object} dynamicPosition Dynamic position data
 */
function overflow(img, crop, dynamicPosition) {
  let { width, left, top } = dynamicPosition;
  const { rotate } = dynamicPosition;
  const { aspectRatio: cropAspectRatio } = crop;
  const { aspectRatio: imgAspectRatio } = img;
  if (rotate % 180 === 0) {
    const heightRate = (width * cropAspectRatio) / imgAspectRatio;
    // left
    if (left > 0) {
      left = 0;
    }
    // top
    if (top > 0) {
      top = 0;
    }
    // width
    if (width < 1 && imgAspectRatio < cropAspectRatio) {
      width = 1;
    }
    // height
    if (heightRate < 1 && imgAspectRatio >= cropAspectRatio) {
      width = imgAspectRatio / cropAspectRatio;
    }
    // right
    if (left + width < 1) {
      left = 1 - width;
    }
    // bottom
    if (heightRate + top < 1) {
      top = 1 - heightRate;
    }
  } else {
    const leftRate = ((imgAspectRatio - 1) / imgAspectRatio / 2) * width;
    const topRate = -leftRate * cropAspectRatio;
    // right
    if (left + (width / imgAspectRatio) + leftRate < 1) {
      left = 1 - (width / imgAspectRatio) - leftRate;
    }
    // left
    if (left + leftRate > 0) {
      left = -leftRate;
    }
    // width
    if (width / imgAspectRatio < 1) {
      width = imgAspectRatio;
    }
    // top
    if (left + topRate > 0) {
      left = -topRate;
    }
    // bottom
    if ((width * cropAspectRatio) + top + topRate < 1) {
      top = 1 - (width * cropAspectRatio) - topRate;
    }
    // height
    if (width * cropAspectRatio < 1) {
      width = 1 / cropAspectRatio;
    }
  }
  Object.assign(dynamicPosition, { width, left, top });
}

/** When the picture overflows, move the picture back to the crop box
 * @param {Object} img Image information
 * @param {Object} crop Position information of crop container
 * @param {Object} dynamicPosition Dynamic position data
 */
export function handleOverflow(img, crop, dynamicPosition) {
  // The method of judging overflow needs to be executed twice
  overflow(img, crop, dynamicPosition);
  overflow(img, crop, dynamicPosition);
}

/** Get cropped pictures by location information
 * @param {Object} img Image information
 * @param {Object} crop Position information of crop container
 * @param {Object} dynamicPosition Dynamic position data
 * @returns {String} base64 info of picture
 */
export async function getImage(img, crop, dynamicPosition) {
  const {
    width, left, top, rotate,
  } = dynamicPosition;
  const { aspectRatio: cropAspectRatio } = crop;
  const { aspectRatio: imgAspectRatio, originalPicture } = img;

  const canvas = document.createElement('canvas');
  const canvasWidth = 750;

  canvas.width = canvasWidth;
  canvas.height = canvasWidth / cropAspectRatio;
  const ctx = canvas.getContext('2d');
  const drawLeft = canvas.width * left;
  const drawTop = canvas.height * top;
  const drawWidth = canvas.width * width;
  const drawHeight = (canvas.width * width) / imgAspectRatio;
  const rotateCenterX = drawLeft + drawWidth / 2;
  const rotateCenterY = drawTop + drawHeight / 2;

  ctx.translate(rotateCenterX, rotateCenterY);
  ctx.rotate((Math.PI / 180) * rotate);
  ctx.translate(-rotateCenterX, -rotateCenterY);
  ctx.drawImage(originalPicture, drawLeft, drawTop, drawWidth, drawHeight);

  const imgBase64 = canvas.toDataURL('image/png');

  return imgBase64;
}
