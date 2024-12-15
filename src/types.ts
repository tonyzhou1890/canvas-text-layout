export interface UserConfig {
  // canvas 上下文
  ctx?: CanvasRenderingContext2D
  // 文本框宽度
  width?: number
  // 文本框高度
  height?: number
  // 文本
  text?: string
  // 英文断行连字符，默认 -
  hyphen?: string
  // 文本对齐，默认：justify
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  // 字体大小
  fontSize?: number
  // 行高：字体大小的倍数，最小1
  lineHeight?: number
}

export interface MeasureCharsParams {
  text: string // 要测量的文本
  ctx: CanvasRenderingContext2D
  hyphen?: string // 英文断行连字符，默认：-
}

export interface MeasureCharsReturns {
  measures: {
    [x: string]: number
  }
  textArray: string[]
}

export interface TextToPageParams extends MeasureCharsReturns {
  // 文本开始下标偏移量，比如分章节的时候
  textOffsetIndex: number
  // 文本框宽度
  width?: number
  // 文本框高度
  height?: number
  // 字体大小
  fontSize: number
  // 行高：字体大小的倍数，最小1
  lineHeight: number
  // 英文换行连字符
  hyphen: string
}

export type TextToPageReturns = Array<{
    // 页码
    page: number
    // 该页开始字符索引
    startIndex: number
    // 该页结束字符索引
    endIndex: number
    // 行信息
    rows: PageRow[]
  }>

export interface PageRow {
  // 该行开始字符索引
  startIndex: number
  // 该行结束字符索引
  endIndex: number
  // 该行是否完整
  completed: boolean
  // 该行是否空白
  empty: boolean
  // 该行字符
  chars: string[]
  // 最后换行连字符
  appendix?: string
}

export interface PageLayoutParams {
  rows: PageRow[]
  // 页面宽度
  width?: number
  // 字体大小
  fontSize: number
  // 行高
  lineHeight: number
  // 文本对齐，默认：left
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  measures: MeasureCharsReturns['measures']
}

export type RectPosition = {
  x: number
  y: number
  width: number
  height: number
}

export type LayoutReturns = Array<{
    startIndex: number
    endIndex: number
    completed: boolean
    calculated: boolean
    letterSpacing: number
    chars: {
      char: string
      position: RectPosition
    }[]
    // 此行字符占据的空间，除了换行，基本占据整行
    charsRect: RectPosition
    // 此行占据的空间，都是占据整行
    rowRect: RectPosition
  }>
