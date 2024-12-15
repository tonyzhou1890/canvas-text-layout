import { TextToPageParams, PageRow, TextToPageReturns } from '../types'
import config from '../config'
import { strToMap } from './helpers'

/**
 * 将文本分配到每一页
 * @param {TextToPageParams} param 参数对象
 */
export function textToPage (param: TextToPageParams) {
  if (!param.textArray.length) {
    return []
  }
  // 后面使用的变量
  const { prePunctuation, postPunctuation, englishChars } = config
  const prePunctuationMap = strToMap(prePunctuation)
  const postPunctuationMap = strToMap(postPunctuation)
  const englishCharsMap = strToMap(englishChars)

  // 参数预处理
  const _params: TextToPageParams & {
    rowNum: number
  } = { ...param, rowNum: 0 }

  _params.width = typeof _params.width !== 'number' ? Infinity : _params.width
  _params.lineHeight = param.fontSize * param.lineHeight
  _params.rowNum =
    typeof param.height === 'number' ? Math.floor(param.height / _params.lineHeight) : Infinity

  // console.log('rowNum: ', _params.rowNum, param.height)

  const pages: TextToPageReturns = [] // 存储每页信息
  const len = _params.textArray.length
  let page = 0
  let rows: PageRow[] = []
  let row = 0
  let rowChars: string[] = []
  let rowWidth = 0
  let curChar = ''
  let tempRowWidth = 0
  const breakMaxChars = config.breakMaxChars < 0 ? 0 : config.breakMaxChars
  const englishMaxWrapChars = config.englishMaxWrapChars < 0 ? 0 : config.englishMaxWrapChars
  let backCharInfo:
    | boolean
    | {
        prevPage?: TextToPageReturns[number] | null
        prevRow?: PageRow
        endIndex: number
        appendix?: string
      } = false // 回溯信息
  // 遍历字符分行分页
  for (let i = 0; i < len; i++) {
    // 当前字符
    curChar = _params.textArray[i]
    // 如果是新页，初始化本页数据
    if (row === 0 && rowWidth === 0) {
      pages[page] = {
        page,
        startIndex: i,
        endIndex: 0,
        rows: [],
      }
    }

    // 如果是新行，初始化新行数据
    if (rowWidth === 0) {
      rows[row] = {
        startIndex: i,
        endIndex: 0,
        chars: [],
        empty: false,
        completed: true,
      }
    }
    // 如果是换行符，结束此行
    if (curChar === '\r' || curChar === '\n') {
      rowChars[rowChars.length] = curChar
      // 如果这个字符是\r，下一个是\n，i+1
      if (curChar === '\r' && _params.textArray[i + 1] === '\n') {
        rowChars[rowChars.length] = _params.textArray[i + 1]
        i++
      }
      rows[row].completed = false
      endRow(i)
    } else {
      tempRowWidth = rowWidth + _params.measures[curChar]
      /**
       * 普通字符（包括其余各种符号）处理
       * 1 有剩余空间(包括0)
       *    1.1 行首后置符号
       *      1.1.1 上一行最后一个字符（前一个字符）为换行符，不回溯换行
       *      1.1.2 最大回溯字符数以内，回溯换行
       *      1.1.3 超过最大回溯字符数，不回溯换行
       *      1.1.4 上一个字符为英文，不回溯换行
       *      1.1.5 判断：一行第一个字符，并且是后置字符，并且前一个字符有值且非换行符、非英文，并且回溯字符数以内有非后置字符
       *    1.2 行尾前置符号
       *      1.2.1 下一个字符为换行字符，不提前换行
       *      1.2.2 剩余空间小于下一个非换行字符，提前换行
       *      1.2.3 回溯字符数以内遇到非前置字符，非前置字符后提前换行
       *      1.2.4 判断：下一个字符非换行字符，且剩余空间小于下一个字符，然后函数回溯
       *    1.3 行尾英文字符
       *      1.3.1 下一个字符也是英文，回溯换行
       *      1.3.2 最大英文回溯字符以内，回溯换行
       *      1.3.3 超过最大英文回溯字符数，添加连字符换行
       *    1.4 行首空格
       *      1.4.1 行首半角空格，下一个字符非半角空格，上一行最后一个字符是英文，空格压入上一行
       *    1.5 其余情况，常规处理--改变当前行宽度，当前字符加入当前行
       * 2 没有剩余空间，换行
       */
      if (typeof _params.width !== 'number' || _params.width - tempRowWidth >= 0) {
        // 行首后置符号
        if (
          !rowWidth &&
          postPunctuationMap.has(curChar) &&
          _params.textArray[i - 1] &&
          _params.textArray[i - 1] !== '\r' &&
          _params.textArray[i - 1] !== '\n' &&
          (backCharInfo = validPostBack(i))
        ) {
          backCharInfo.prevRow!.endIndex = backCharInfo.endIndex
          // 修正上一页最后一个字符位置
          if (backCharInfo.prevPage) {
            backCharInfo.prevPage.endIndex = backCharInfo.endIndex
          }
          i = backCharInfo.endIndex
        } else if (
          // 行尾前置符号
          prePunctuationMap.has(curChar) &&
          _params.textArray[i - 1] &&
          _params.textArray[i - 1] !== '\r' &&
          _params.textArray[i - 1] !== '\n' &&
          !englishCharsMap.has(_params.textArray[i - 1]) &&
          _params.width - tempRowWidth < _params.measures[_params.textArray[i - 1]] &&
          (backCharInfo = validPreBack(i))
        ) {
          rowChars.splice(backCharInfo.endIndex - rows[row].startIndex + 1)
          endRow(backCharInfo.endIndex)
          i = backCharInfo.endIndex
        } else if (
          // 行尾连续英文
          englishCharsMap.has(curChar) &&
          _params.textArray[i - 1] &&
          _params.textArray[i + 1] &&
          englishCharsMap.has(_params.textArray[i + 1]) &&
          _params.width - tempRowWidth < _params.measures[_params.textArray[i + 1]] &&
          (backCharInfo = validEnglishPreBack(i))
        ) {
          rowChars.splice(backCharInfo.endIndex - rows[row].startIndex + 1)
          if (backCharInfo.appendix) {
            rows[row].appendix = backCharInfo.appendix
            rowChars[rowChars.length] = backCharInfo.appendix
          }
          endRow(backCharInfo.endIndex)
          i = backCharInfo.endIndex
        } else if (
          !rowWidth &&
          curChar === ' ' &&
          row &&
          rows[row - 1].chars[rows[row - 1].chars.length - 1] !== ' ' &&
          _params.textArray[i + 1] !== ' '
        ) {
          // 行首半角空格
          rows[row - 1].endIndex++
          rows[row - 1].chars.push(curChar)
          // console.log(rows[row - 1].chars.length, row, curChar, i)
          // console.log(tempRowWidth)
        } else {
          // 其余情况
          rowWidth = tempRowWidth
          rowChars[rowChars.length] = curChar
        }
      } else {
        i--
        endRow(i)
      }
    }
  }
  // 遍历结束后
  // 检查最后一个字符是否为非换行符，如果是非换行符，需要结束行和页
  if (_params.textArray[len - 1] !== '\r' && _params.textArray[len - 1] !== '\n') {
    endRow(len - 1)
  }
  // 最后一页的最后一行不需要填充空隙
  const tempRowLen = pages[page - 1].rows.length
  pages[page - 1].rows[tempRowLen - 1].completed = false

  // 对页和行进行章节偏移量处理
  for (let i = 0; i < page; i++) {
    pages[i].startIndex += _params.textOffsetIndex
    pages[i].endIndex += _params.textOffsetIndex
    const rowsLen = pages[i].rows.length
    for (let r = 0; r < rowsLen; r++) {
      pages[i].rows[r].startIndex += _params.textOffsetIndex
      pages[i].rows[r].endIndex += _params.textOffsetIndex
    }
  }
  // console.log('pages: ', pages)
  // 返回结果
  return pages

  /**
   * 结束此行
   */
  function endRow (index: number) {
    rows[row].endIndex = index
    rows[row].chars = rowChars
    rows[row].empty = rowChars.join('').trim().length === 0
    row++
    rowChars = []
    rowWidth = 0
    // 如果达到最大行/最后一个字符，结束此页
    if (row >= _params.rowNum || index === len - 1) {
      endPage(index)
    }
  }

  /**
   * 结束此页
   */
  function endPage (index: number) {
    pages[page].endIndex = index
    pages[page].rows = rows
    page++
    rows = []
    row = 0
  }

  /**
   * 行首后置字符回溯是否有效
   */
  function validPostBack (i: number) {
    // 零页零行不处理
    if (!page && !row) return false

    let prevRow = null
    let prevPage = null
    // 上一行在前页
    if (!row) {
      prevPage = pages[page - 1]
      prevRow = pages[page - 1].rows[_params.rowNum - 1]
    } else {
      // 上一行不在前页
      prevRow = rows[row - 1]
    }
    // 如果只回溯一个，直接返回i-2
    if (breakMaxChars === 0) {
      return {
        prevRow,
        endIndex: i - 2,
      }
    }
    // 否则深度回溯
    let start = i - 1 - breakMaxChars - 1
    let index = null
    start = prevRow.startIndex > start ? prevRow.startIndex : start
    for (index = i - 1; index > start; index--) {
      if (!postPunctuationMap.has(_params.textArray[index])) {
        return {
          prevPage,
          prevRow,
          endIndex: index - 1,
        }
      }
    }
    return false
  }

  /**
   * 行尾前置字符回溯是否有效
   */
  function validPreBack (i: number) {
    // 如果不回溯，直接返回 i-1
    if (breakMaxChars === 0 || typeof _params.width !== 'number') {
      return {
        endIndex: i - 1,
      }
    }
    // 否则深度回溯
    let start = i - 1 - breakMaxChars
    let index = null
    start = rows[row].startIndex > start ? rows[row].startIndex : start
    for (index = i - 1; index > start; index--) {
      if (!prePunctuationMap.has(_params.textArray[index])) {
        return {
          endIndex: index,
        }
      }
    }
    return false
  }

  /**
   * 行尾连续英文回溯是否有效
   */
  function validEnglishPreBack (i: number) {
    const temp = {
      endIndex: i - 1,
      appendix: '',
    }
    // 否则深度回溯
    let start = i - 1 - englishMaxWrapChars
    let index = null
    start = rows[row].startIndex > start ? rows[row].startIndex : start
    for (index = i - 1; index > start; index--) {
      if (!englishCharsMap.has(_params.textArray[index])) {
        temp.endIndex = index
        break
      }
    }
    // 如果换行后本行最后一个字符是英文，需要添加连字符，并且重置最后一个字符位置
    if (englishCharsMap.has(_params.textArray[temp.endIndex])) {
      temp.endIndex = i - 1
      temp.appendix = _params.hyphen
    }
    // if (page < 2) {
    //   console.log(temp, start, index)
    // }
    return temp
  }
}
