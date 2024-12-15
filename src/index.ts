import defaultConfig from './config'
import {
  MeasureCharsParams,
  MeasureCharsReturns,
  PageLayoutParams,
  LayoutReturns,
  TextToPageParams,
  TextToPageReturns,
  UserConfig,
} from './types'
import { textToPage as _textToPage } from './utils/index'

/**
 * 测量字符
 * @param {MeasureCharsParams} param // 参数对象
 */
export function measureChars (param: MeasureCharsParams) {
  const s = Date.now()
  const measures: MeasureCharsReturns['measures'] = {}
  // 有两个预设的字符
  ;[param.hyphen ?? defaultConfig.hyphen, '中'].map(item => {
    measures[item] = param.ctx.measureText(item).width
  })
  // 将文本转成数组，防止四字节字符问题
  const textArray = []
  // 测量字符宽度，填充文本数组
  for (const item of param.text) {
    textArray.push(item)
    if (!measures[item]) {
      measures[item] = param.ctx.measureText(item).width
    }
  }
  // tab符、换行符特殊处理
  if (measures['\t']) {
    measures['\t'] = measures['中'] * 2
  }
  if (measures['\r']) {
    measures['\r'] = 0
  }
  if (measures['\n']) {
    measures['\n'] = 0
  }
  console.log('measureChars + textArray:', Date.now() - s)
  return {
    textArray,
    measures,
  }
}

/**
 * 将文本分配到每一页
 * @param {TextToPageParams} param 参数对象
 */
export function textToPage (param: TextToPageParams) {
  return _textToPage(param)
}

/**
 * 计算页面排版细节
 * @param {PageLayoutParams} param 参数对象
 */
export function layout (param: PageLayoutParams) {
  const s = Date.now()

  const _params: PageLayoutParams & {
    lineWidth?: number
  } = { ...param, lineHeight: param.fontSize * param.lineHeight, lineWidth: param.width }

  const res: LayoutReturns = []

  _params.rows.map((item, row) => {
    let tempRowWidth = 0
    const rowInfo: LayoutReturns[number] = {
      startIndex: 0,
      endIndex: 0,
      completed: false,
      calculated: false,
      letterSpacing: 0,
      chars: [],
      charsRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      rowRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    }

    // 先计算rowSpace，后面计算字符位置需要用到
    rowInfo.rowRect = {
      x: 0,
      y: row * _params.lineHeight,
      width: _params.lineWidth ?? 0,
      height: _params.lineHeight,
    }

    // 如果是完整的一行，并且对齐是 justify，需要计算字间距，
    if (item.completed && _params.textAlign === 'justify' && _params.lineWidth) {
      let charsWidth = 0
      item.chars.map(chara => {
        charsWidth += _params.measures[chara]
      })
      rowInfo.letterSpacing = (_params.lineWidth - charsWidth) / (item.chars.length - 1)
    }
    // 计算字符位置
    const rowCharY = rowInfo.rowRect.y + (_params.lineHeight - _params.fontSize) / 2
    item.chars.map((chara, index) => {
      const position = {
        x: tempRowWidth,
        y: rowCharY,
        width: _params.measures[chara],
        height: _params.fontSize,
      }

      rowInfo.chars[index] = {
        char: chara,
        position,
      }
      // 更新 tempRowWidth
      tempRowWidth += _params.measures[chara] + rowInfo.letterSpacing
    })
    // 计算 charsRect
    if (rowInfo.chars.length === item.chars.length) {
      const last = rowInfo.chars[rowInfo.chars.length - 1]
      rowInfo.charsRect = {
        x: rowInfo.rowRect.x,
        y: rowInfo.rowRect.y,
        width: last ? last.position.x + last.position.width : 0,
        height: rowInfo.rowRect.height,
      }
    }

    // 以上是默认左对齐和两端对齐的计算，下面修正居中对齐和右对齐
    if (
      rowInfo.rowRect.width &&
      (_params.textAlign === 'center' || _params.textAlign === 'right')
    ) {
      const offsetX =
        (rowInfo.rowRect.width - rowInfo.charsRect.width) / (_params.textAlign === 'right' ? 1 : 2)
      rowInfo.charsRect.x += offsetX
      rowInfo.chars.map(item => {
        item.position.x += offsetX
      })
    }

    // 因为 rowRect 的 width 可能是 0，这里修正一下
    if (!rowInfo.rowRect.width) {
      rowInfo.rowRect.width = rowInfo.charsRect.width
    }

    res.push(rowInfo)
  })
  console.log('layout:', Date.now() - s)

  return res
}

export default class CanvasTextLayout {
  constructor (config?: UserConfig) {
    this.config = config ?? {}
  }

  config: UserConfig

  measuredData?: MeasureCharsReturns

  textToPageData?: TextToPageReturns

  layoutPagesData?: LayoutReturns[]

  run (config?: UserConfig) {
    if (config) {
      Object.assign(this.config, config)
    }
    this.measuredData = measureChars({
      text: this.config.text!,
      ctx: this.config.ctx!,
      hyphen: this.config.hyphen,
    })

    this.resize()
  }

  // 调整布局
  resize (config?: {
    width?: number
    height?: number
    textAlign?: UserConfig['textAlign']
    lineHeight?: number
  }) {
    if (!this.measuredData) throw new Error('Not Measured, please call run')

    this.config.width = config?.width ?? this.config.width
    this.config.height = config?.height ?? this.config.height
    this.config.textAlign = config?.textAlign ?? this.config.textAlign
    this.config.lineHeight = config?.lineHeight ?? this.config.lineHeight

    this.textToPageData = textToPage({
      ...this.measuredData,
      width: this.config.width,
      height: this.config.height,
      textOffsetIndex: 0,
      fontSize: this.config.fontSize!,
      lineHeight: this.config.lineHeight!,
      hyphen: this.config.hyphen ?? defaultConfig.hyphen,
    })

    if (this.textToPageData && this.textToPageData[0]) {
      this.layoutPagesData = this.textToPageData.map(page =>
        layout({
          ...page,
          width: this.config.width,
          fontSize: this.config.fontSize!,
          lineHeight: this.config.lineHeight!,
          textAlign: this.config.textAlign,
          measures: this.measuredData?.measures ?? {},
        })
      )
    }

    return this.layoutPagesData
  }

  // 绘制
  render (config: { offsetX?: number; offsetY?: number; page: number }) {
    if (!this.layoutPagesData) throw new Error('No Data To Render')

    const s = Date.now()

    const currentPage = this.layoutPagesData[config.page]

    const offsetX = config.offsetX ?? 0
    const offsetY = config.offsetY ?? 0

    currentPage.forEach(row => {
      row.chars.forEach(chara => {
        this.config.ctx?.fillText?.(
          chara.char,
          chara.position.x + offsetX,
          chara.position.y + offsetY
        )
      })
    })

    console.log('renderPage:', Date.now() - s)
  }
}
