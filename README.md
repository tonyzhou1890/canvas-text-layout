# text-in-canvas

这是一个 canvas 文本排版库，可以实现中英文在 canvas 上的排版渲染。这对于制作海报、小游戏等可能会有所帮助。

## 用法

```shell
yarn add text-in-canvas
```

```javascript
import TextInCanvas from 'text-in-canvas'

const ctl = new TextInCanvas({
  ctx
})

ctl.run({
  width,
  height,
  text,
  fontSize,
  lineHeight,
  textAlign
})

ctl.render({
  offsetX,
  offsetY,
  page // page index
})
```

实际上，这个包的代码来自我好几年之前写的一个 txt 阅读器：

源码：https://github.com/tonyzhou1890/reader2

在线体验：https://reader.dowhat.top/

所以，代码质量就不苛求了，能跑。至于 canvas 上翻页、滚动、选择文本、高亮、编辑等功能，不是这个包的目的，业务自行实现。翻页和滚动代码在 doc 目录下的 index.html 可以找到。