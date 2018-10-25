class MCGallery {
    constructor(option) {
        this.config = {
            wrapId : '',
            className : '',
            initCallback: null,
            hideCallback: null,
            showCallback: null,
            switchCallback: null
        };
        this.wrap = null;
        this.thumbnails = null;
        this.size = null;
        this.aSrc = [];
        this.oMain = null;
        this.oMenu = null;
        this.oContainer = null;
        this.oClose = null;

        this.oPic = null;
        this.oPicWidth = 0;
        this.oPicHeight = 0;
        this.oPicScaleWidth = 0;
        this.oPicScaleHeight = 0;
        this.oPicMaxTranslateX = 0;
        this.oPicMaxTranslateY = 0;

        this.screenWidth = null;
        this.screenHeight = null;

        this.index = 0;
        this.oldIndex = -1;
        this.oldX = 0;
        this.oldY = 0;
        this.singleMode = false;
        this.singleScale = 1;
        this.singleOldScale = 1;
        this.singleTranslateX = 0;
        this.singleTranslateY = 0;
        this.singleStartTranslateX = 0;
        this.singleStartTranslateY = 0;
        this.singleStartDistance = 0;

        this.quitMode = 0;
        this.multipleTranslateX = 0;
        this.multipleTranslateY = 0;
        this.multipleDistance = 0;
        this.lastClickTime = 0;
        this.hasMove = false;
        this.closeTimer = null;

        this.init(option);
    }

    init(option) {
        for (var i in option) {
            this.config[i] = option[i];
        }

        this.thumbnails = document.querySelectorAll('.'+this.config.className);
        this.size = this.thumbnails.length;
        
        this.__createDOM();
        this.__reSize();
        this.__addEvent();

        typeof this.config.initCallback === 'function' && this.config.initCallback(this);
    }

    __createElement(node, className, styles) {
        const dom = document.createElement(node);

        if (className) {
            dom.setAttribute('class', className);
        }

        if (styles) {
            this.__setStyles(dom, styles);
        }

        return dom;
    }

    __setStyles(ele, styles) {
        for (let key in styles) {
            ele.style[key] = styles[key];
        }
    }

    __createDOM() {
        this.oMain = this.__createElement('div', 'mc-gallery', {
            webkitTransform: 'translate3d(0,0,0)',
            display: 'none'
        })

        this.oContainer = this.__createElement('ul', 'mc-gallery-container');
        let str = '';
        for (var i = 0; i < this.size; i++) {
            this.thumbnails[i].setAttribute('data-index', i);
            this.aSrc.push({
                status: 0,
                url: this.thumbnails[i].getAttribute('data-src')
            })
            str +=  '<li>'
                +       '<img style="-webkit-transform:scale(1) translate(0,0);">'
                +       '<div class="mc-gallery-loader"><i></i></div>'
                +   '</li>';
        }
        this.oContainer.innerHTML = str;
        this.oMain.appendChild(this.oContainer);

        this.oMenu = this.__createElement('div', 'mc-gallery-menu');
        this.oMain.appendChild(this.oMenu);

        this.oClose = this.__createElement('div', 'mc-gallery-close');
        this.oMain.appendChild(this.oClose);

        document.body.appendChild(this.oMain);
    }

    __reSize() {
        this.screenWidth = document.documentElement.clientWidth;
        this.screenHeight = document.documentElement.clientHeight;
    }

    __toDouble(num) {
        return num <= 9 ? '0' + num : num;
    }

    __zoomDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 2);
    }

    __updatePicOption() {
        this.oPicScaleWidth = this.oPicWidth * this.singleScale;
        this.oPicScaleHeight = this.oPicHeight * this.singleScale;
        this.oPicMaxTranslateX = parseInt(((this.oPicScaleWidth - this.oPicWidth) - (this.screenWidth - this.oPicWidth)) / 2 / this.singleScale);
        this.oPicMaxTranslateY = parseInt(((this.oPicScaleHeight - this.oPicHeight) - (this.screenHeight - this.oPicHeight)) / 2 / this.singleScale);
    }

    __adsorption() {
        if (this.oPicScaleWidth < this.screenWidth) {
            this.singleTranslateX = 0;
        } else if (this.singleTranslateX !== 0 && Math.abs(this.singleTranslateX) > this.oPicMaxTranslateX) {
            this.singleTranslateX = this.singleTranslateX > 0 ? this.oPicMaxTranslateX : -this.oPicMaxTranslateX;
        }

        if (this.oPicScaleHeight < this.screenHeight) {
            this.singleTranslateY = 0;
        } else if (this.singleTranslateY !== 0 && Math.abs(this.singleTranslateY) > this.oPicMaxTranslateY) {
            this.singleTranslateY = this.singleTranslateY > 0 ? this.oPicMaxTranslateY : -this.oPicMaxTranslateY;
        }

        this.oPic.style.webkitTransitionDuration = '300ms';
        this.singleControl();
    }

    singleControl() {
        this.oPic.style.webkitTransform = `scale(${this.singleScale}) translate3d(${this.singleTranslateX}px,${this.singleTranslateY}px, 0)`;
    }

    multipleSwitch() {
        this.multipleTranslateX = this.index * -this.screenWidth;
        if (this.oldIndex === -1) {
            setTimeout(() => {
                this.__setStyles(this.oMain, {
                    webkitTransform: 'translate3d(0,0,0) scale(1)',
                    opacity: 1
                })
            }, 0)
        }
        this.__setStyles(this.oContainer, {
            webkitTransform: `translate(${this.multipleTranslateX}px, 0px)`,
            webkitTransition: '300ms ease'
        })

        if (this.oldIndex !== this.index) {
            this.oMenu.innerHTML = this.__toDouble(this.index + 1) + ' / ' + this.__toDouble(this.size);

            this.oPic = this.oContainer.querySelectorAll('li')[this.index].querySelector('img');
            if (!this.aSrc[this.index].status) {
                let loadImg = new Image(),
                    index = this.index,
                    target = this.oPic;

                loadImg.onload = () => {
                    target.setAttribute('src', this.aSrc[index].url);
                    target.setAttribute('loaded', '');
                    target.parentNode.removeChild(target.nextSibling);
                    this.aSrc[index].status = 2;
                    if (this.index === index) {
                        this.oPicWidth = this.oPic.offsetWidth;
                        this.oPicHeight = this.oPic.offsetHeight;
                    }
                }
                this.aSrc[index].status = 1;
                loadImg.src = this.aSrc[index].url;
            } else {
                this.oPicWidth = this.oPic.offsetWidth;
                this.oPicHeight = this.oPic.offsetHeight;
            }

            typeof this.config.switchCallback === 'function' && this.config.switchCallback(this);
        }
    }

    __touchStartEvent(event) {
        event.preventDefault();

        clearTimeout(this.closeTimer);
        this.hasMove = false;

        if (event.touches.length == 1) {
            const nowTime = Date.now(),
                x = event.touches[0].pageX,
                y = event.touches[0].pageY;

            if (nowTime - this.lastClickTime < 400 && Math.abs(x - this.oldX) < 50 && Math.abs(y - this.oldY) < 50) {
                if (this.singleMode) {
                    this.singleScale = 1;
                    this.singleTranslateX = 0;
                    this.singleTranslateY = 0;

                    this.oMenu.style.opacity = 1;
                    this.oClose.style.opacity = 1;
                } else {
                    this.singleScale = 3;
                    this.singleTranslateX = this.screenWidth / 2 - x;
                    this.singleTranslateY = this.screenHeight / 2 - y;
                    this.__updatePicOption();

                    this.oMenu.style.opacity = 0;
                    this.oClose.style.opacity = 0;
                }

                this.__adsorption();
                this.singleMode = !this.singleMode;
                this.lastClickTime = 0;

            } else {
                this.oPic.style.webkitTransitionDuration = '0ms';
                this.lastClickTime = nowTime;
            }

            this.oldX = event.touches[0].pageX;
            this.oldY = event.touches[0].pageY;

            this.singleStartTranslateX = this.singleTranslateX;
            this.singleStartTranslateY = this.singleTranslateY;

            this.oMain.style.webkitTransition = '0ms';
            this.oContainer.style.webkitTransition = '0ms';

            this.multipleDistance = 0;
            this.multipleTranslateY = 0;

        } else if (!this.multipleDistance && this.aSrc[this.index].status == 2) {
            this.singleMode = true;
            this.oPic.style.webkitTransitionDuration = '0ms';
            this.singleOldScale = this.singleScale;
            this.singleStartDistance = this.__zoomDistance(event.touches[0].pageX, event.touches[0].pageY, event.touches[1].pageX, event.touches[1].pageY);
        }

    }

    __touchMoveEvent(event) {
        event.preventDefault();

        const x = event.changedTouches[0].pageX - this.oldX,
              y = event.changedTouches[0].pageY - this.oldY;
        let moveRate = 1,
            opacity = 0;

        this.hasMove = true;

        if (event.touches.length === 1) {

            if (this.singleMode) {

                this.singleTranslateX = parseInt(x / this.singleScale + this.singleStartTranslateX);
                this.singleTranslateY = parseInt(y / this.singleScale + this.singleStartTranslateY);
                this.singleControl();
            } else {

                if (this.quitMode === 0) {
                    if (Math.abs(x) > 10) {
                        this.quitMode = 1;
                    } else if (Math.abs(y) > 10) {
                        this.quitMode = 2;
                    }
                }

                if (this.quitMode === 1) {

                    this.multipleDistance = x;
                    if (x + this.multipleTranslateX > 0 || x + this.multipleTranslateX < (this.size - 1) * -this.screenWidth) { moveRate = 3 }

                } else if (this.quitMode === 2) {

                    opacity = (100 - Math.abs(y) / 4) / 100;
                    this.multipleTranslateY = y;
                    this.oMain.style.opacity = opacity < .1 ? .1 : opacity;

                }

                this.oContainer.style.webkitTransform = `translate(${(this.multipleDistance / moveRate + this.multipleTranslateX)}px, ${this.multipleTranslateY}px)`;

            }
        } else if (this.singleMode) {

            this.singleScale = (this.singleOldScale * (this.__zoomDistance(event.touches[0].pageX, event.touches[0].pageY, event.touches[1].pageX, event.touches[1].pageY) / this.singleStartDistance)).toFixed(2);

            if (this.singleScale < 1) {
                this.singleScale = 1;
            } else if (this.singleScale > 5) {
                this.singleScale = 5;
            }

            this.singleControl();

            this.oMenu.style.opacity = 0;
            this.oClose.style.opacity = 0;
        }
    }

    __touchEndEvent(evnet) {
        event.preventDefault();

        if (this.singleMode) {
            if (this.singleScale == 1) {
                this.singleMode = false;
                this.singleTranslateX = 0;
                this.singleTranslateY = 0;
                this.oMenu.style.opacity = 1;
                this.oClose.style.opacity = 1;
            }

            if (this.singleOldScale !== this.singleScale) { this.__updatePicOption() }
            this.__adsorption();
        } else {
            if (this.multipleDistance) {
                this.oldIndex = this.index;
                if (Math.abs(this.multipleDistance) > this.screenWidth / 3 || Date.now() - this.lastClickTime < 300 && Math.abs(this.multipleDistance) > 30) {
                    if (this.multipleDistance > 0 && this.index > 0) {
                        this.index -= 1;
                    } else if (this.multipleDistance < 0 && this.index < this.size - 1) {
                        this.index += 1;
                    }
                }
                this.multipleSwitch();
            } else if (this.multipleTranslateY) {
                if (Math.abs(this.multipleTranslateY) > 120) {
                    this.hide();
                } else {
                    this.multipleSwitch();
                }
            }

            this.quitMode = 0;
        }
        if (this.singleTranslateX !== this.singleStartTranslateX || this.singleTranslateY != this.singleStartTranslateY || this.multipleDistance || this.multipleTranslateY) {
            this.lastClickTime = 0;
        } else if (this.lastClickTime && !this.hasMove){
            this.closeTimer = setTimeout(this.hide.bind(this), 400)
        }

    }

    __addEvent() {
        document.body.style.cursor = 'pointer';

        this.wrap = this.config.wrapId ? document.querySelector('#' + this.config.wrapId) : document.body;

        this.wrap.addEventListener('click', this.show.bind(this), false);

        this.oContainer.addEventListener('touchstart', this.__touchStartEvent.bind(this), false);

        this.oContainer.addEventListener('touchmove', this.__touchMoveEvent.bind(this), false);

        this.oContainer.addEventListener('touchend', this.__touchEndEvent.bind(this), false);

        this.oMain.addEventListener('webkitTransitionEnd', this.__mainTransitionEvent.bind(this), false);

        this.oClose.addEventListener('click', this.hide.bind(this), false);

        window.addEventListener('resize', () => {
            this.__reSize();
            this.multipleSwitch();
        }, false);
    }

    __closet(ele, target, topNode) {
        let result = null;
        while (ele.nodeType != 1 || ele != topNode) {
            if (ele.className == target) {
                result = ele;
                break;
            } else {
                ele = ele.parentNode;
            }
        }
        return result;
    }

    show(event) {
        const target = this.__closet(event.target, this.config.className, this.wrap);
        if (target) {
            this.__setStyles(this.oMain, {
                display: 'block',
                webkitTransition: '200ms',
                webkitTransformOrigin: '0 0 0',
                webkitTransform: `translate3d(${target.getBoundingClientRect().left}px, ${target.getBoundingClientRect().top}px, 0) scale(${target.offsetWidth / this.screenWidth}, ${target.offsetHeight / this.screenHeight})`
            })
            
            this.index = Number(target.getAttribute('data-index'));
            this.multipleSwitch();

            typeof this.config.showCallback === 'function' && this.config.showCallback(this);
        }
    }

    hide() {
        this.__setStyles(this.oMain, {
            webkitTransition: '200ms',
            opacity: 0
        })
        typeof this.config.hideCallback === 'function' && this.config.hideCallback(this);
    }

    __mainTransitionEvent() {
        if (this.oMain.style.opacity == 0) {
            this.oMain.style.display = 'none';
            this.oldIndex = -1;
            this.singleScale = 1;
            this.singleTranslateX = 0;
            this.singleTranslateY = 0;
            this.oMenu.style.opacity = 1;
            this.oClose.style.opacity = 1;
            this.singleControl();
        }
    }
}