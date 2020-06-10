(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CropBox"] = factory();
	else
		root["CropBox"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/crop.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/crop.js":
/*!*********************!*\
  !*** ./src/crop.js ***!
  \*********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return MobileAvatarCropBox; });\n/* harmony import */ var _function__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./function */ \"./src/function.js\");\n/* harmony import */ var _tool__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tool */ \"./src/tool.js\");\n/* eslint-disable no-underscore-dangle */\n\n\n\n// todo resize\n// Safari 缩放兼容性,Object.assign\n// 节流\n// 最大缩放比例\n\n// tofix\n// 双指放开闪动\n\n// setZoom(this._dynamicPosition,this._staticPosition,this._img)\n\n/*\n  这里暂时记录一下对应的数据结构\n  {\n    _dynamicPosition: {\n      touchInfo: initTouchInfo(),\n      rotate: 0, // 图片选装的角度 deg\n      width: 1, // 图片宽度 占裁剪框宽度的比例\n      left: 0, // 图片左边到裁剪框左边的距离 占裁剪框宽度的比例\n      top: 0, // 图片顶边到裁剪框顶边的距离 占裁剪框高度的比例\n    },\n    this._staticPosition{\n      box:{\n        height: 603,\n        width: 375\n      },\n      crop:{\n        aspectRatio: 1\n        height: 0.4975124378109453\n        isCircle: false\n        left: 0.1\n        top: 0.2512437810945274\n        width: 0.8\n      }\n    }\n    _img:{\n      aspectRatio: 1,\n      src: \"https://yun.dui88.com/h5/miniprogram/kejiji/images/homeimg.png\"\n    }\n  }\n*/\nfunction initTouchInfo(isScaleInit = true) {\n  const result = {\n    startWidth: 0, // 缩放开始时候图片宽度比例\n    startDistance: 0, // 缩放开始时候两指之间距离（保存具体数值）\n    startLeft: 0, // 缩放开始时候图片距离左边的比例\n    startTop: 0, // 缩放开始时候图片距离顶部的比例\n    startCenterX: 0, // 缩放开始时候两指触碰中点水平位置（保存具体数值）\n    startCenterY: 0, // 缩放开始时候两指触碰中点竖直位置（保存具体数值）\n    curDistance: 0, // 缩放进行中记录两指之间距离（保存具体数值）\n  };\n  if (!isScaleInit) {\n    Object.assign(result, {\n      curMoveX: 0, // 用于图片的平移（保存具体数值）\n      curMoveY: 0, // 用于图片的平移（保存具体数值）\n    });\n  }\n  return result;\n}\n\nclass MobileAvatarCropBox {\n  constructor(options = {}) {\n    const {\n      id, // DOM id\n      isCircle = false, // 裁剪区域是否展示圆形\n      boxWidth = window.screen.availWidth, // 容器宽度\n      boxHeight = window.screen.availHeight, // 容器高度\n      cropAspectRatio = 1, // 裁剪的宽高比\n      cropSizeRatio = 0.8, // 裁剪框占外部容器的大小比例\n      // showOptionBar = true, // 是否展示操作框\n    } = options;\n\n    this._id = id || null;\n    this._dom = {};\n    this._img = {};\n    this._dynamicPosition = {};\n    // todo 减掉showOptionBar高度\n    this._staticPosition = Object(_function__WEBPACK_IMPORTED_MODULE_0__[\"initStaticPosition\"])({\n      boxWidth, boxHeight, cropAspectRatio, cropSizeRatio, isCircle,\n    });\n    this.handleTouchStart = this.handleTouchStart.bind(this);\n    this.handleTouchMove = this.handleTouchMove.bind(this);\n    this.handleTouchEnd = this.handleTouchEnd.bind(this);\n  }\n\n  // rotate(isClockwise) {\n\n  // }\n\n  // reset() {\n\n  // }\n\n  // save() {\n\n  // }\n\n  // cancel() {\n\n  // }\n\n  initDom({ imgLink }) {\n    const domList = {\n      img: {\n        moveImg: 'position:absolute;',\n        bgPicture: 'position:absolute;',\n      },\n      div: {\n        box: 'position:fixed;top:0;left:0;overflow:hidden;background-color:#333;', // todo 临时样式 'position:relative;overflow:hidden;background-color:#333;';\n        crop: `position:absolute;overflow:hidden;background-color:#555;border-radius:${this._staticPosition.crop.isCircle ? '50%' : 0};`,\n        bgPictureContainer: 'width:100%;height:100%;position:absolute;top:0;left:0;',\n      },\n    };\n    Object.keys(domList).forEach((tag) => {\n      Object.keys(domList[tag]).forEach((key) => {\n        this._dom[key] = document.createElement(tag);\n        this._dom[key].style = domList[tag][key];\n        if (tag === 'img') {\n          this._dom[key].src = imgLink;\n        }\n      });\n    });\n    // id存在在对应的DOM下追加，否则追加在document上\n    // box 内的结构如下\n    // box---- bgPictureContainer -- bgPicture\n    //     |\n    //      -- box -- moveImg\n    const outContainer = this._id ? document.getElementById(this._id) : document.body;\n    outContainer.appendChild(this._dom.box);\n    this._dom.box.appendChild(this._dom.bgPictureContainer);\n    this._dom.bgPictureContainer.appendChild(this._dom.bgPicture);\n    this._dom.box.appendChild(this._dom.crop);\n    this._dom.crop.appendChild(this._dom.moveImg);\n  }\n\n  initDynamicPosition() {\n    Object.assign(this._dynamicPosition, {\n      touchInfo: initTouchInfo(false),\n      left: 0,\n      top: 0,\n      rotate: 0,\n      width: 1,\n    });\n\n    const imgAspectRatio = this._img.aspectRatio;\n    const cropAspectRatio = this._staticPosition.crop.aspectRatio;\n\n    if (imgAspectRatio < cropAspectRatio) {\n      this._dynamicPosition.width = 1;\n      this._dynamicPosition.top = (1 - (cropAspectRatio / imgAspectRatio)) / 2;\n    } else {\n      this._dynamicPosition.width = imgAspectRatio / cropAspectRatio;\n      this._dynamicPosition.left = (1 - this._dynamicPosition.width) / 2;\n    }\n    this.updateDynamicPositionInfo();\n  }\n\n  updateDynamicPositionInfo() {\n    // 动态的位置数据主要针对moveImg和bgPicture元素\n    const {\n      left, top, rotate, width,\n    } = this._dynamicPosition;\n    const {\n      left: cropLeft,\n      top: cropTop,\n      width: cropWidth,\n      height: cropHeight,\n    } = this._staticPosition.crop;\n\n    const moveImgStyle = {\n      height: 'auto',\n      width: `${width * 100}%`,\n      left: `${left * 100}%`,\n      top: `${top * 100}%`,\n      transform: `rotate(${rotate}deg)`,\n    };\n    const bgPictureStyle = {\n      height: 'auto',\n      width: `${width * cropWidth * 100}%`,\n      left: `${(cropLeft + (left * cropWidth)) * 100}%`,\n      top: `${(cropTop + (top * cropHeight)) * 100}%`,\n      transform: `rotate(${rotate}deg)`,\n    };\n    Object.assign(this._dom.moveImg.style, moveImgStyle);\n    Object.assign(this._dom.bgPicture.style, bgPictureStyle);\n  }\n\n  updateStaticPositionInfo() {\n    // 静态的位置数据初始化一次，主要针对容器（box、crop、bgPictureContainer）之间的相对位置，\n    const boxStyle = {\n      width: `${this._staticPosition.box.width}px`,\n      height: `${this._staticPosition.box.height}px`,\n    };\n    const cropStyle = {\n      width: `${this._staticPosition.crop.width * 100}%`,\n      height: `${this._staticPosition.crop.height * 100}%`,\n      top: `${this._staticPosition.crop.top * 100}%`,\n      left: `${this._staticPosition.crop.left * 100}%`,\n    };\n    Object.assign(this._dom.box.style, boxStyle);\n    Object.assign(this._dom.crop.style, cropStyle);\n    this.toggleGaussianBlur(true);\n  }\n\n  toggleGaussianBlur(isMoving = false) {\n    Object.assign(this._dom.bgPictureContainer.style, {\n      filter: isMoving ? 'blur(15px) brightness(50%)' : 'brightness(50%)',\n    });\n  }\n\n  handleTouchStart(e) {\n    Object.assign(this._dynamicPosition.touchInfo, {\n      curMoveX: e.touches[0].clientX,\n      curMoveY: e.touches[0].clientY,\n    });\n    this.toggleGaussianBlur(true);\n  }\n\n  handleTouchMove(e) {\n    this.updateDynamicPositionInfo();\n    this.toggleGaussianBlur(false);\n\n    const { touchInfo } = this._dynamicPosition;\n    const cropRealWidth = this._staticPosition.box.width * this._staticPosition.crop.width;\n    const cropRealHeight = this._staticPosition.box.height * this._staticPosition.crop.height;\n\n    // 处理缩放\n    if (e.touches.length > 1) {\n      touchInfo.curMoveX = 0;\n      touchInfo.curMoveY = 0;\n      Object(_function__WEBPACK_IMPORTED_MODULE_0__[\"handleZoom\"])(this._dynamicPosition, this._staticPosition, this._img, e);\n      return;\n    }\n    Object.assign(touchInfo, initTouchInfo());\n\n    const curPositionX = e.touches[0].clientX;\n    const curPositionY = e.touches[0].clientY;\n    // const { touchInfo } = this._dynamicPosition;\n\n    // 防止缩放之后curMoveX｜Y 的初始数据的影响移动\n    const isInitData = touchInfo.curMoveX === 0 && touchInfo.curMoveY === 0;\n    if (!isInitData) {\n      // 旧的实际距离\n      const oldRealLeft = this._dynamicPosition.left * cropRealWidth;\n      const oldRealTop = this._dynamicPosition.top * cropRealHeight;\n      // 新的实际距离\n      const newRealLeft = curPositionX - touchInfo.curMoveX + oldRealLeft;\n      const newRealTop = curPositionY - touchInfo.curMoveY + oldRealTop;\n      // 转换成比例\n      this._dynamicPosition.left = newRealLeft / cropRealWidth;\n      this._dynamicPosition.top = newRealTop / cropRealHeight;\n    }\n    touchInfo.curMoveX = curPositionX;\n    touchInfo.curMoveY = curPositionY;\n  }\n\n  handleTouchEnd(e) {\n    if (e.touches.length === 0) {\n      this.toggleGaussianBlur(true);\n      Object(_function__WEBPACK_IMPORTED_MODULE_0__[\"handleOverflow\"])(this._img, this._staticPosition.crop, this._dynamicPosition);\n      Object.assign(this._dynamicPosition.touchInfo, initTouchInfo());\n      this.updateDynamicPositionInfo();\n    }\n  }\n\n  initTouchEvent() {\n    // 对最外面的容器注册touch事件\n    this._dom.box.addEventListener('touchstart', this.handleTouchStart);\n    this._dom.box.addEventListener('touchmove', this.handleTouchMove);\n    this._dom.box.addEventListener('touchend', this.handleTouchEnd);\n  }\n\n  removeTouchEvent() {\n    this._dom.box.removeEventListener('touchstart', this.handleTouchStart);\n    this._dom.box.removeEventListener('touchmove', this.handleTouchMove);\n    this._dom.box.removeEventListener('touchend', this.handleTouchEnd);\n  }\n\n  async open(link) {\n    // todo 图片加载异常处理\n    const img = await Object(_tool__WEBPACK_IMPORTED_MODULE_1__[\"loadImage\"])(link);\n    this._img = {\n      src: img.src,\n      aspectRatio: img.width / img.height,\n    };\n    this.initDom({ imgLink: img.src });\n    this.updateStaticPositionInfo();\n    this.initDynamicPosition();\n    // 事件初始化\n    this.initTouchEvent();\n  }\n\n  rotate(isClockwise = true) {\n    const rotateDeg = isClockwise ? 90 : -90;\n    this._dynamicPosition.rotate += rotateDeg;\n    Object(_function__WEBPACK_IMPORTED_MODULE_0__[\"handleOverflow\"])(this._img, this._staticPosition.crop, this._dynamicPosition);\n    this.updateDynamicPositionInfo();\n  }\n\n  reset() {\n    this.initDynamicPosition();\n  }\n\n  destroy() {\n    this.removeTouchEvent();\n  }\n}\n\n\n//# sourceURL=webpack://CropBox/./src/crop.js?");

/***/ }),

/***/ "./src/function.js":
/*!*************************!*\
  !*** ./src/function.js ***!
  \*************************/
/*! exports provided: initStaticPosition, handleZoom, handleOverflow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"initStaticPosition\", function() { return initStaticPosition; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"handleZoom\", function() { return handleZoom; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"handleOverflow\", function() { return handleOverflow; });\n/** touchmove事件中，获取多个触点中前两个触点的距离\n * @param {List} touches 触点列表\n * @returns {Number} 前两个触点的距离\n */\nfunction getTouchesDistance(touchFirst, touchSecond) {\n  const diffX = touchFirst.clientX - touchSecond.clientX;\n  const diffY = touchFirst.clientY - touchSecond.clientY;\n  const distance = Math.sqrt(diffX ** 2 + diffY ** 2);\n  return distance;\n}\n\n/** 获取裁剪框的最佳位置\n * @param {Number} boxWidth 外部容器宽度\n * @param {Number} boxHeight 外部容器高度\n * @param {Number} cropAspectRatio 裁剪框的宽高比\n * @param {Number} cropSizeRatio 裁剪框占外部容器的比例（以contain的位置来计算）\n * @returns {Object} 裁剪框在外部容器中的比例信息\n */\nfunction getCropPosition(boxWidth, boxHeight, cropAspectRatio, cropSizeRatio) {\n  const boxRatio = boxWidth / boxHeight;\n  let height;\n  let width;\n  let top;\n  let left;\n  // 这里是实际数值\n  if (boxRatio > cropAspectRatio) {\n    height = cropSizeRatio * boxHeight;\n    width = height * cropAspectRatio;\n    top = (boxHeight - height) / 2;\n    left = (boxWidth - width) / 2;\n  } else {\n    width = cropSizeRatio * boxWidth;\n    height = width / cropAspectRatio;\n    top = (boxHeight - height) / 2;\n    left = (boxWidth - width) / 2;\n  }\n  // 这里是比例\n  height /= boxHeight;\n  width /= boxWidth;\n  top /= boxHeight;\n  left /= boxWidth;\n  return {\n    height, width, top, left,\n  };\n}\n\nfunction initStaticPosition({\n  boxWidth, boxHeight, cropAspectRatio, cropSizeRatio, isCircle,\n}) {\n  return {\n    // 容器\n    box: {\n      width: boxWidth,\n      height: boxHeight,\n    },\n    // 裁剪框在容器中的位置\n    crop: {\n      ...getCropPosition(boxWidth, boxHeight, cropAspectRatio, cropSizeRatio),\n      isCircle,\n      aspectRatio: cropAspectRatio,\n    },\n  };\n}\n\n\nfunction handleZoom(dynamicPosition, staticPosition, img, e) {\n  const { box, crop } = staticPosition;\n  const cropRealWidth = box.width * crop.width;\n  const cropRealHeight = box.height * crop.height;\n  const { touchInfo } = dynamicPosition;\n  // 保存前两个触点位置信息\n  const [touchFirst, touchSecond] = e.touches;\n  const curTouchesDistance = getTouchesDistance(touchFirst, touchSecond);\n  const { clientX: touchFirstX, clientY: touchFirstY } = touchFirst;\n  const { clientX: touchSecondX, clientY: touchSecondY } = touchSecond;\n\n  // 判断缩放开始\n  if (touchInfo.startDistance === 0) {\n    touchInfo.startDistance = curTouchesDistance;\n    // 记录一些用于缩放临时数据\n    touchInfo.startLeft = dynamicPosition.left;\n    touchInfo.startTop = dynamicPosition.top;\n    touchInfo.startWidth = dynamicPosition.width;\n    // 记录两指中点的位移\n    touchInfo.startCenterX = (touchFirstX + touchSecondX) / 2;\n    touchInfo.startCenterY = (touchFirstY + touchSecondY) / 2;\n    return;\n  }\n  // 计算缩放时候的移动距离\n  const centerX = (touchFirstX + touchSecondX) / 2;\n  const centerY = (touchFirstY + touchSecondY) / 2;\n  const diffX = centerX - touchInfo.startCenterX;\n  const diffY = centerY - touchInfo.startCenterY;\n  const temporaryXRate = diffX / cropRealWidth;\n  const temporaryYRate = diffY / cropRealHeight;\n\n  // todo 待优化成距离两指中心的缩放\n  touchInfo.curDistance = curTouchesDistance;\n  const width = (touchInfo.curDistance / touchInfo.startDistance) * touchInfo.startWidth;\n  const zoomWidthRate = dynamicPosition.width - touchInfo.startWidth;\n  const zoomHeightRate = zoomWidthRate * img.aspectRatio * crop.aspectRatio;\n  const left = touchInfo.startLeft - (zoomWidthRate / 2) + temporaryXRate;\n  const top = touchInfo.startTop - (zoomHeightRate / 2) + temporaryYRate;\n  Object.assign(dynamicPosition, { width, left, top });\n}\n\n/** 图片溢出就把图片移动回裁剪框内\n * @param {Number} positionInfoData 图片移动的位置信息\n */\nfunction overflow(img, crop, dynamicPosition) {\n  let { width, left, top } = dynamicPosition;\n  const { rotate } = dynamicPosition;\n  const { aspectRatio: cropAspectRatio } = crop;\n  const { aspectRatio: imgAspectRatio } = img;\n  if (rotate % 180 === 0) {\n    const heightRate = (width * cropAspectRatio) / imgAspectRatio;\n    // 左边\n    if (left > 0) {\n      left = 0;\n    }\n    // 上边\n    if (top > 0) {\n      top = 0;\n    }\n    // 宽度\n    if (width < 1 && imgAspectRatio < cropAspectRatio) {\n      width = 1;\n    }\n    // 高度\n    if (heightRate < 1 && imgAspectRatio >= cropAspectRatio) {\n      width = imgAspectRatio / cropAspectRatio;\n    }\n    // 右边\n    if (left + width < 1) {\n      left = 1 - width;\n    }\n    // 下边\n    if (heightRate + top < 1) {\n      top = 1 - heightRate;\n    }\n  } else {\n    const leftRate = ((imgAspectRatio - 1) / imgAspectRatio / 2) * width;\n    const topRate = -leftRate * cropAspectRatio;\n    // 右边\n    if (left + (width / imgAspectRatio) + leftRate < 1) {\n      left = 1 - (width / imgAspectRatio) - leftRate;\n    }\n    // 左边\n    if (left + leftRate > 0) {\n      left = -leftRate;\n    }\n    // 宽度\n    if (width / imgAspectRatio < 1) {\n      width = imgAspectRatio;\n    }\n    // 上边\n    if (left + topRate > 0) {\n      left = -topRate;\n    }\n    // 下边\n    if ((width * cropAspectRatio) + top + topRate < 1) {\n      top = 1 - (width * cropAspectRatio) - topRate;\n    }\n    // 高度\n    if (width * cropAspectRatio < 1) {\n      width = 1 / cropAspectRatio;\n    }\n  }\n  Object.assign(dynamicPosition, { width, left, top });\n}\n\n/** 图片溢出就把图片移动回裁剪框内\n * @param {Number} positionInfoData 图片移动的位置信息\n */\nfunction handleOverflow(img, crop, dynamicPosition) {\n  // 判断溢出需要执行两次\n  overflow(img, crop, dynamicPosition);\n  overflow(img, crop, dynamicPosition);\n}\n\n\n//# sourceURL=webpack://CropBox/./src/function.js?");

/***/ }),

/***/ "./src/tool.js":
/*!*********************!*\
  !*** ./src/tool.js ***!
  \*********************/
/*! exports provided: loadImage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"loadImage\", function() { return loadImage; });\nfunction loadImage(url) {\n  return new Promise((resolve, reject) => {\n    const img = new Image();\n    img.setAttribute('crossOrigin', 'Anonymous');\n    img.onload = () => resolve(img);\n    img.onerror = reject;\n    img.src = url;\n  });\n}\n\n\n//# sourceURL=webpack://CropBox/./src/tool.js?");

/***/ })

/******/ });
});