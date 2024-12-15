/**
 * @module helpers
 */

/**
 * @name noop
 * @description empty function
 */
export function noop () {
  /* noop */
}

/**
 * @name isFunc
 */
export function isFunc (f: any) {
  return typeof f === 'function'
}

/**
 * isOdd
 */
export function isOdd (a: number) {
  return !!(a % 2)
}

/**
 * 字符串转 map
 * @param s
 * @returns
 */
export function strToMap (s: string) {
  const m = new Map()
  ;[...s].forEach(item => m.set(item, true))
  return m
}
