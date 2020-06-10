/* eslint-disable no-underscore-dangle */
import { initStaticPosition, handleZoom, handleOverflow } from './function';
import { loadImage } from './tool';

// todo resize
// Safari 缩放兼容性,Object.assign
// 节流
// 最大缩放比例

// tofix
// 双指放开闪动

// setZoom(this._dynamicPosition,this._staticPosition,this._img)

/*
  这里暂时记录一下对应的数据结构
  {
    _dynamicPosition: {
      touchInfo: initTouchInfo(),
      rotate: 0, // 图片选装的角度 deg
      width: 1, // 图片宽度 占裁剪框宽度的比例
      left: 0, // 图片左边到裁剪框左边的距离 占裁剪框宽度的比例
      top: 0, // 图片顶边到裁剪框顶边的距离 占裁剪框高度的比例
    },
    this._staticPosition{
      box:{
        height: 603,
        width: 375
      },
      crop:{
        aspectRatio: 1
        height: 0.4975124378109453
        isCircle: false
        left: 0.1
        top: 0.2512437810945274
        width: 0.8
      }
    }
    _img:{
      aspectRatio: 1,
      src: "https://yun.dui88.com/h5/miniprogram/kejiji/images/homeimg.png"
    }
  }
*/
function initTouchInfo(isScaleInit = true) {
  const result = {
    startWidth: 0, // 缩放开始时候图片宽度比例
    startDistance: 0, // 缩放开始时候两指之间距离（保存具体数值）
    startLeft: 0, // 缩放开始时候图片距离左边的比例
    startTop: 0, // 缩放开始时候图片距离顶部的比例
    startCenterX: 0, // 缩放开始时候两指触碰中点水平位置（保存具体数值）
    startCenterY: 0, // 缩放开始时候两指触碰中点竖直位置（保存具体数值）
    curDistance: 0, // 缩放进行中记录两指之间距离（保存具体数值）
  };
  if (!isScaleInit) {
    Object.assign(result, {
      curMoveX: 0, // 用于图片的平移（保存具体数值）
      curMoveY: 0, // 用于图片的平移（保存具体数值）
    });
  }
  return result;
}

export default class MobileAvatarCropBox {
  constructor(options = {}) {
    const {
      id, // DOM id
      isCircle = false, // 裁剪区域是否展示圆形
      boxWidth = window.screen.availWidth, // 容器宽度
      boxHeight = window.screen.availHeight, // 容器高度
      cropAspectRatio = 1, // 裁剪的宽高比
      cropSizeRatio = 0.8, // 裁剪框占外部容器的大小比例
      // showOptionBar = true, // 是否展示操作框
    } = options;

    this._id = id || null;
    this._dom = {};
    this._img = {};
    this._dynamicPosition = {};
    // todo 减掉showOptionBar高度
    this._staticPosition = initStaticPosition({
      boxWidth, boxHeight, cropAspectRatio, cropSizeRatio, isCircle,
    });
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
  }

  // rotate(isClockwise) {

  // }

  // reset() {

  // }

  // save() {

  // }

  // cancel() {

  // }

  initDom({ imgLink }) {
    const domList = {
      img: {
        moveImg: 'position:absolute;',
        bgPicture: 'position:absolute;',
      },
      div: {
        box: 'position:fixed;top:0;left:0;overflow:hidden;background-color:#333;', // todo 临时样式 'position:relative;overflow:hidden;background-color:#333;';
        crop: `position:absolute;overflow:hidden;background-color:#555;border-radius:${this._staticPosition.crop.isCircle ? '50%' : 0};`,
        bgPictureContainer: 'width:100%;height:100%;position:absolute;top:0;left:0;',
      },
    };
    Object.keys(domList).forEach((tag) => {
      Object.keys(domList[tag]).forEach((key) => {
        this._dom[key] = document.createElement(tag);
        this._dom[key].style = domList[tag][key];
        if (tag === 'img') {
          this._dom[key].src = imgLink;
        }
      });
    });
    // id存在在对应的DOM下追加，否则追加在document上
    // box 内的结构如下
    // box---- bgPictureContainer -- bgPicture
    //     |
    //      -- box -- moveImg
    const outContainer = this._id ? document.getElementById(this._id) : document.body;
    outContainer.appendChild(this._dom.box);
    this._dom.box.appendChild(this._dom.bgPictureContainer);
    this._dom.bgPictureContainer.appendChild(this._dom.bgPicture);
    this._dom.box.appendChild(this._dom.crop);
    this._dom.crop.appendChild(this._dom.moveImg);
  }

  initDynamicPosition() {
    Object.assign(this._dynamicPosition, {
      touchInfo: initTouchInfo(false),
      left: 0,
      top: 0,
      rotate: 0,
      width: 1,
    });

    const imgAspectRatio = this._img.aspectRatio;
    const cropAspectRatio = this._staticPosition.crop.aspectRatio;

    if (imgAspectRatio < cropAspectRatio) {
      this._dynamicPosition.width = 1;
      this._dynamicPosition.top = (1 - (cropAspectRatio / imgAspectRatio)) / 2;
    } else {
      this._dynamicPosition.width = imgAspectRatio / cropAspectRatio;
      this._dynamicPosition.left = (1 - this._dynamicPosition.width) / 2;
    }
    this.updateDynamicPositionInfo();
  }

  updateDynamicPositionInfo() {
    // 动态的位置数据主要针对moveImg和bgPicture元素
    const {
      left, top, rotate, width,
    } = this._dynamicPosition;
    const {
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    } = this._staticPosition.crop;

    const moveImgStyle = {
      height: 'auto',
      width: `${width * 100}%`,
      left: `${left * 100}%`,
      top: `${top * 100}%`,
      transform: `rotate(${rotate}deg)`,
    };
    const bgPictureStyle = {
      height: 'auto',
      width: `${width * cropWidth * 100}%`,
      left: `${(cropLeft + (left * cropWidth)) * 100}%`,
      top: `${(cropTop + (top * cropHeight)) * 100}%`,
      transform: `rotate(${rotate}deg)`,
    };
    Object.assign(this._dom.moveImg.style, moveImgStyle);
    Object.assign(this._dom.bgPicture.style, bgPictureStyle);
  }

  updateStaticPositionInfo() {
    // 静态的位置数据初始化一次，主要针对容器（box、crop、bgPictureContainer）之间的相对位置，
    const boxStyle = {
      width: `${this._staticPosition.box.width}px`,
      height: `${this._staticPosition.box.height}px`,
    };
    const cropStyle = {
      width: `${this._staticPosition.crop.width * 100}%`,
      height: `${this._staticPosition.crop.height * 100}%`,
      top: `${this._staticPosition.crop.top * 100}%`,
      left: `${this._staticPosition.crop.left * 100}%`,
    };
    Object.assign(this._dom.box.style, boxStyle);
    Object.assign(this._dom.crop.style, cropStyle);
    this.toggleGaussianBlur(false);
  }

  toggleGaussianBlur(isMoving = false) {
    console.log(this._dom.bgPictureContainer.style.filter);
    Object.assign(this._dom.bgPictureContainer.style, {
      filter: isMoving ? 'brightness(50%)' : 'blur(15px) brightness(50%)',
    });
    Object.assign(this._dom.moveImg.style, {
      transition: `all ${isMoving ? 0 : 0.2}s`,
    });
    Object.assign(this._dom.bgPicture.style, {
      transition: `all ${isMoving ? 0 : 0.2}s`,
    });
  }

  handleTouchStart(e) {
    Object.assign(this._dynamicPosition.touchInfo, {
      curMoveX: e.touches[0].clientX,
      curMoveY: e.touches[0].clientY,
    });
    this.toggleGaussianBlur(true);
  }

  handleTouchMove(e) {
    this.updateDynamicPositionInfo();
    this.toggleGaussianBlur(true);

    const { touchInfo } = this._dynamicPosition;
    const cropRealWidth = this._staticPosition.box.width * this._staticPosition.crop.width;
    const cropRealHeight = this._staticPosition.box.height * this._staticPosition.crop.height;

    // 处理缩放
    if (e.touches.length > 1) {
      touchInfo.curMoveX = 0;
      touchInfo.curMoveY = 0;
      handleZoom(this._dynamicPosition, this._staticPosition, this._img, e);
      return;
    }
    Object.assign(touchInfo, initTouchInfo());

    const curPositionX = e.touches[0].clientX;
    const curPositionY = e.touches[0].clientY;
    // const { touchInfo } = this._dynamicPosition;

    // 防止缩放之后curMoveX｜Y 的初始数据的影响移动
    const isInitData = touchInfo.curMoveX === 0 && touchInfo.curMoveY === 0;
    if (!isInitData) {
      // 旧的实际距离
      const oldRealLeft = this._dynamicPosition.left * cropRealWidth;
      const oldRealTop = this._dynamicPosition.top * cropRealHeight;
      // 新的实际距离
      const newRealLeft = curPositionX - touchInfo.curMoveX + oldRealLeft;
      const newRealTop = curPositionY - touchInfo.curMoveY + oldRealTop;
      // 转换成比例
      this._dynamicPosition.left = newRealLeft / cropRealWidth;
      this._dynamicPosition.top = newRealTop / cropRealHeight;
    }
    touchInfo.curMoveX = curPositionX;
    touchInfo.curMoveY = curPositionY;
  }

  handleTouchEnd(e) {
    if (e.touches.length === 0) {
      this.toggleGaussianBlur(false);
      handleOverflow(this._img, this._staticPosition.crop, this._dynamicPosition);
      Object.assign(this._dynamicPosition.touchInfo, initTouchInfo());
      this.updateDynamicPositionInfo();
    }
  }

  initTouchEvent() {
    // 对最外面的容器注册touch事件
    this._dom.box.addEventListener('touchstart', this.handleTouchStart);
    this._dom.box.addEventListener('touchmove', this.handleTouchMove);
    this._dom.box.addEventListener('touchend', this.handleTouchEnd);
  }

  removeTouchEvent() {
    this._dom.box.removeEventListener('touchstart', this.handleTouchStart);
    this._dom.box.removeEventListener('touchmove', this.handleTouchMove);
    this._dom.box.removeEventListener('touchend', this.handleTouchEnd);
  }

  async open(link) {
    // todo 图片加载异常处理
    const img = await loadImage(link);
    this._img = {
      src: img.src,
      aspectRatio: img.width / img.height,
    };
    this.initDom({ imgLink: img.src });
    this.updateStaticPositionInfo();
    this.initDynamicPosition();
    // 事件初始化
    this.initTouchEvent();
  }

  rotate(isClockwise = true) {
    const rotateDeg = isClockwise ? 90 : -90;
    this._dynamicPosition.rotate += rotateDeg;
    handleOverflow(this._img, this._staticPosition.crop, this._dynamicPosition);
    this.updateDynamicPositionInfo();
  }

  reset() {
    this.initDynamicPosition();
  }

  destroy() {
    this.removeTouchEvent();
  }
}
