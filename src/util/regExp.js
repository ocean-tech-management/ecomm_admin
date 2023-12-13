/**
 * 正则
 */
export const REG_POSITIVE =  /^(\d|[1-9]\d+)(\.\d+)?$/; // 正数
export const REG_INTEGER = /^(0|[1-9][0-9]*)$/; // 正整数 包含零
export const REG_INTEGER_NO_EQUAL_ZERO = /^([1-9][0-9]*)$/; // 大于0正整数
export const REG_PHONE = /^1[3456789]\d{9}$/; // 手机号
export const REG_DECIMAL = /^[+-]?\d+(\.\d+)?$/; // 正负数字
export default {
  REG_POSITIVE,
  REG_INTEGER,
  REG_INTEGER_NO_EQUAL_ZERO,
  REG_PHONE,
  REG_DECIMAL
}
