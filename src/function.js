/** touchmove事件中，获取多个触点中前两个触点的距离
 * @param {List} touches 触点列表
 * @returns {Number} 前两个触点的距离
 */
function getTouchesDistance(touchFirst, touchSecond) {
  const diffX = touchFirst.clientX - touchSecond.clientX;
  const diffY = touchFirst.clientY - touchSecond.clientY;
  const distance = Math.sqrt(diffX ** 2 + diffY ** 2);
  return distance;
}

/** 获取裁剪框的最佳位置
 * @param {Number} boxWidth 外部容器宽度
 * @param {Number} boxHeight 外部容器高度
 * @param {Number} cropAspectRatio 裁剪框的宽高比
 * @param {Number} cropSizeRatio 裁剪框占外部容器的比例（以contain的位置来计算）
 * @returns {Object} 裁剪框在外部容器中的比例信息
 */
function getCropPosition(boxWidth, boxHeight, cropAspectRatio, cropSizeRatio) {
  const boxRatio = boxWidth / boxHeight;
  let height;
  let width;
  let top;
  let left;
  // 这里是实际数值
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
  // 这里是比例
  height /= boxHeight;
  width /= boxWidth;
  top /= boxHeight;
  left /= boxWidth;
  return {
    height, width, top, left,
  };
}

export function initStaticPosition({
  boxWidth, boxHeight, cropAspectRatio, cropSizeRatio, isCircle,
}) {
  return {
    // 容器
    box: {
      width: boxWidth,
      height: boxHeight,
    },
    // 裁剪框在容器中的位置
    crop: {
      ...getCropPosition(boxWidth, boxHeight, cropAspectRatio, cropSizeRatio),
      isCircle,
      aspectRatio: cropAspectRatio,
    },
  };
}


export function handleZoom(dynamicPosition, staticPosition, img, e) {
  const { box, crop } = staticPosition;
  const cropRealWidth = box.width * crop.width;
  const cropRealHeight = box.height * crop.height;
  const { touchInfo } = dynamicPosition;
  // 保存前两个触点位置信息
  const [touchFirst, touchSecond] = e.touches;
  const curTouchesDistance = getTouchesDistance(touchFirst, touchSecond);
  const { clientX: touchFirstX, clientY: touchFirstY } = touchFirst;
  const { clientX: touchSecondX, clientY: touchSecondY } = touchSecond;

  // 判断缩放开始
  if (touchInfo.startDistance === 0) {
    touchInfo.startDistance = curTouchesDistance;
    // 记录一些用于缩放临时数据
    touchInfo.startLeft = dynamicPosition.left;
    touchInfo.startTop = dynamicPosition.top;
    touchInfo.startWidth = dynamicPosition.width;
    // 记录两指中点的位移
    touchInfo.startCenterX = (touchFirstX + touchSecondX) / 2;
    touchInfo.startCenterY = (touchFirstY + touchSecondY) / 2;
    return;
  }
  // 计算缩放时候的移动距离
  const centerX = (touchFirstX + touchSecondX) / 2;
  const centerY = (touchFirstY + touchSecondY) / 2;
  const diffX = centerX - touchInfo.startCenterX;
  const diffY = centerY - touchInfo.startCenterY;
  const temporaryXRate = diffX / cropRealWidth;
  const temporaryYRate = diffY / cropRealHeight;

  // todo 待优化成距离两指中心的缩放
  touchInfo.curDistance = curTouchesDistance;
  const width = (touchInfo.curDistance / touchInfo.startDistance) * touchInfo.startWidth;
  const zoomWidthRate = dynamicPosition.width - touchInfo.startWidth;
  const zoomHeightRate = zoomWidthRate * img.aspectRatio * crop.aspectRatio;
  const left = touchInfo.startLeft - (zoomWidthRate / 2) + temporaryXRate;
  const top = touchInfo.startTop - (zoomHeightRate / 2) + temporaryYRate;
  Object.assign(dynamicPosition, { width, left, top });
}

/** 图片溢出就把图片移动回裁剪框内
 * @param {Number} positionInfoData 图片移动的位置信息
 */
function overflow(img, crop, dynamicPosition) {
  let { width, left, top } = dynamicPosition;
  const { rotate } = dynamicPosition;
  const { aspectRatio: cropAspectRatio } = crop;
  const { aspectRatio: imgAspectRatio } = img;
  if (rotate % 180 === 0) {
    const heightRate = (width * cropAspectRatio) / imgAspectRatio;
    // 左边
    if (left > 0) {
      left = 0;
    }
    // 上边
    if (top > 0) {
      top = 0;
    }
    // 宽度
    if (width < 1 && imgAspectRatio < cropAspectRatio) {
      width = 1;
    }
    // 高度
    if (heightRate < 1 && imgAspectRatio >= cropAspectRatio) {
      width = imgAspectRatio / cropAspectRatio;
    }
    // 右边
    if (left + width < 1) {
      left = 1 - width;
    }
    // 下边
    if (heightRate + top < 1) {
      top = 1 - heightRate;
    }
  } else {
    const leftRate = ((imgAspectRatio - 1) / imgAspectRatio / 2) * width;
    const topRate = -leftRate * cropAspectRatio;
    // 右边
    if (left + (width / imgAspectRatio) + leftRate < 1) {
      left = 1 - (width / imgAspectRatio) - leftRate;
    }
    // 左边
    if (left + leftRate > 0) {
      left = -leftRate;
    }
    // 宽度
    if (width / imgAspectRatio < 1) {
      width = imgAspectRatio;
    }
    // 上边
    if (left + topRate > 0) {
      left = -topRate;
    }
    // 下边
    if ((width * cropAspectRatio) + top + topRate < 1) {
      top = 1 - (width * cropAspectRatio) - topRate;
    }
    // 高度
    if (width * cropAspectRatio < 1) {
      width = 1 / cropAspectRatio;
    }
  }
  Object.assign(dynamicPosition, { width, left, top });
}

/** 图片溢出就把图片移动回裁剪框内
 * @param {Number} positionInfoData 图片移动的位置信息
 */
export function handleOverflow(img, crop, dynamicPosition) {
  // 判断溢出需要执行两次
  overflow(img, crop, dynamicPosition);
  overflow(img, crop, dynamicPosition);
}
