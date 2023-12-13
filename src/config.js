import moment from "moment";
import configJson from './config.json';
// 配置各种基本信息
const systemName = configJson.name || configJson.systemName;


// 后台请求路径配置
// const baseURL = 'http://api.shop.andyoudao.cn';
const baseURL = 'http://shop.com';

// 请求配置
const axiosConfig = {
    headers: {
        'Content-type': 'application/json'
    },
    timeout: 60000
}


// 不需要加验证token过期与否的请求项
const noTokenReqs = [
    '/admin/login/login',
    '/admin/token/refresh'
];

// token过期时间前三十分钟，以用于提前更新token，避免token失效，保持常在线状态
const advanceTime = 1000 * 60 * 30;
const expireTime = 1000 * 60 * 60 * 2 - advanceTime;


// 设置系统上线日期，上线前无数据
const publishDate = '2019-07-05';

//定义富文本框编辑器的字体大小白名单
const sizeWhiteList = [ "10px", "12px", "14px", "16px", "18px", "20px", "22px", "24px", "26px", "28px", "30px", "32px"];
// const sizeWhiteList = [ "10px", "18px", "32px"];
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  // ["blockquote", "code-block"],

  // [{ header: 1 }, { header: 2 }], // custom button values
  // [{ list: "ordered" }, { list: "bullet" }],
  // [{ script: "sub" }, { script: "super" }], // superscript/subscript
  // [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  // [{ direction: "rtl" }], // text direction

  [{ size: sizeWhiteList }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }], // dropdown with defaults from theme
  // [{ font: [] }],
  [{ align: [] }],
  ["image"],
  ["clean"] // remove formatting button
];

// 常规时间选择器预选配置，主要用于筛选
const nTimePickerConfig = {
  pickerOptions: {
    shortcuts: [{
        text: "今日",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD 00:00:00');
          let end = moment().format('YYYY-MM-DD 23:59:59');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本周",
        onClick(picker) {
          let weekOfday = parseInt(moment().format('d')) // 计算今天是这周第几天  周日为一周中的第一天
          let start = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD 00:00:00');
          let end = moment().add(7 - weekOfday - 1, 'days').format('YYYY-MM-DD 23:59:59');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本月",
        onClick(picker) {
          let start = moment(moment().format('YYYY-MM') + '-01').format('YYYY-MM-DD 00:00:00');
          let end = moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD 23:59:59')
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近一周",
        onClick(picker) {
          let start = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近两周",
        onClick(picker) {
          let start = moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近一个月",
        onClick(picker) {
          let start = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "最近三个月",
        onClick(picker) {
          let start = moment().subtract(90, 'days').format('YYYY-MM-DD HH:mm:ss');
          let end = moment().format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
    ],
  },
}

// 表单常规的事件选择器配置，主要用于新增编辑
const formNTimePickerConfig = {
  formPickerOptions: {
    shortcuts: [{
        text: "今日",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD 00:00:00');
          let end = moment().format('YYYY-MM-DD 23:59:59');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本周",
        onClick(picker) {
          let weekOfday = parseInt(moment().format('d')) // 计算今天是这周第几天  周日为一周中的第一天
          let start = moment().subtract(weekOfday, 'days').format('YYYY-MM-DD 00:00:00');
          let end = moment().add(7 - weekOfday - 1, 'days').format('YYYY-MM-DD 23:59:59');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "本月",
        onClick(picker) {
          let start = moment(moment().format('YYYY-MM') + '-01').format('YYYY-MM-DD 00:00:00');
          let end = moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD 23:59:59')
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "持续一周",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD HH:mm:ss');
          let end = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "持续两周",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD HH:mm:ss');
          let end = moment().add(14, 'days').format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "持续一个月",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD HH:mm:ss');
          let end = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
      {
        text: "持续三个月",
        onClick(picker) {
          let start = moment().format('YYYY-MM-DD HH:mm:ss');
          let end = moment().add(90, 'days').format('YYYY-MM-DD HH:mm:ss');
          picker.$emit("pick", [start, end]);
        },
      },
    ],
  },
}

export {
  systemName,
  baseURL,
  axiosConfig,
  uploadConfig,
  noTokenReqs,
  expireTime,
  sizeWhiteList,
  toolbarOptions,
  nTimePickerConfig,
  formNTimePickerConfig,
  publishDate
}
