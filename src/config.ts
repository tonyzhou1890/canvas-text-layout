export default {
  prePunctuation: '([{·‘“〈《「『【〔〖（．［｛￡￥', // 前置标点
  postPunctuation: '!),.:;?]}¨·ˇˉ―‖’”…∶、。〃々〉》」』】〕〗！＂＇），．：；？］｀｜｝～￠', // 后置标点
  breakMaxChars: 3, // 提前断行回溯最大字符数
  englishChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\'',
  englishMaxWrapChars: 5, // 英文提前换行最大字符数，否则添加连字符-
  hyphen: '-', // 连字符
  fontFamily: 'Microsoft YaHei', // 默认字体
  fontSize: 16, // 默认字体大小
  lineHeight: 1.5, // 默认行高
}
