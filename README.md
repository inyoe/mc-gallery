# mc-gallery
## 组件简介
* 移动端相册组件
* 全屏展示图片、原图放大加载
* 支持滑动切换、双指缩放、双击缩放、单击关闭、大图模式无缩放情况，往上或往下滑动关闭
* 只兼容移动端
<br>

## 组件包含文件：
* mc-gallery.js - 组件主功能
* ms-gallery.css - 组件样式
<br>

## DEMO：
![Image text](http://demo.rabifoo.com/gallery/qrcode.png)
<br>

## 使用方法：

*HTML*

``` html
<link rel="stylesheet" href="./src/mc-gallery.css">

<ul id="albumContent">
    <li class="photos" data-src="./img/01.jpg" style="background-image:url('./img/01_min.jpg')"></li>
    <li class="photos" data-src="./img/02.jpg" style="background-image:url('./img/02_min.jpg')"></li>
    <li class="photos" data-src="./img/03.jpg" style="background-image:url('./img/03_min.jpg')"></li>
    <li class="photos" data-src="./img/04.jpg" style="background-image:url('./img/04_min.jpg')"></li>
    <li class="photos" data-src="./img/05.jpg" style="background-image:url('./img/05_min.jpg')"></li>
    <li class="photos" data-src="./img/06.jpg" style="background-image:url('./img/06_min.jpg')"></li>
</ul>

<script src="./src/mc-gallery.js"></script>
```

*JavaScript(Global)*
``` javascript
new MCGallery({
    wrapId: 'albumContent',
    className: 'photos',
    initCallback: function(self) {
        console.log('init');
    },
    hideCallback:  function(self) {
        console.log('hide');
    },
    showCallback:  function(self) {
        console.log('show');
    },
    switchCallback:  function(self) {
        console.log('switch');
        console.log(self.index)
    }
})
```
<br>

## 配置参数

| params | type | description |
| --- | --- | --- |
| wrapId | String | 容器元素id。 |
| className | String | 每个被点击触发的元素class，元素必须添加属性:"data-src"，该属性值为大图地址。 |
| initCallback | Function | 组件初始化后回调。 |
| showCallback | Function | 组件显示后回调。 |
| hideCallback | Function | 组件隐藏后回调。 |
| switchCallback | Function | 图片切换后回调。 |
