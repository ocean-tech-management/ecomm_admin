<template>
  <el-upload
    ref="import"
    id="excel-uploader"
    class="excel-uploader"
    :show-file-list="false"
    :before-upload="excelWatcher"
    :on-error="uploadError"
    :on-exceed="exceedLimit"
    accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    action=""
    auto-upload
  >
    <slot></slot>
  </el-upload>
</template>
<script>
/**
 * 导入<无查重>
 */
import XLSX from 'xlsx';
import { REG_PHONE, REG_DECIMAL } from '@/util/regExp';
export default {
  name: 'ExcelUpload',
  data() {
    return {
      thumbData: null,
      fileList: [],
      fileDatas: [],
      selection: [],
      // 查重
      validDatas:[],    //有效的标识
      validArrays:[],   //有效的记录
      duplicateDatas:[],  //重复的标识
      duplicateInfos:{},  //重复的数据记录
      orderPositions:[],  //每个表在有效数据列表中的边界
    }
  },
  props: {
    /**
     * [{ key!: 'user_phone', text!: '用户手机号码', require?: true, pattern?: /^1[3456789]\d{9}$/ }]
     */
    validCol: {
      type: [Array],
      required: true,
      default() {
        return []
      }
    }
  },
  methods: {
    /**
     * 重置变量
     */
    resetData() {
      this.fileList = [];
      this.fileDatas = [];
      this.selection = [];
      this.validDatas = [];
      this.validArrays = [];
      this.duplicateDatas = [];
      this.duplicateInfos = [];
      this.orderPositions = [];
    },
    /**
     * 清除导入
     */
    resetFiles() {
      this.resetData();
      this.$refs.import && this.$refs.import.clearFiles();
    },
    /**
     * 导入excel表格
     * @param file
     * @returns {boolean}
     */
    excelWatcher(file) {
      this.resetData();
      if (this.validCol.length === 0) return this.$message.error('请输入列表变量哦');
      this.$loading({
        text: '导入中'
      });
      this.fileName = file.name
      if (file.type != 'application/vnd.ms-excel' && file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        if(file.type == '' && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
          this.resetFiles();
          this.$message.error('只能上传正确的.xls或.xlsx文件哦');
          this.$loading().close();
          return false;
        }
      }

      // 涉及到文件的读取，有可能执行脚本失败，多加两步catch，避免脚本卡机
      try {
        for(let i = 0; i < this.fileList.length; i++) {
          if(this.fileList[i].name == file.name) {
            this.$message.warning(`存在同名文件，系统已忽略同名的文件信息`);
            return false;
          }
        }
        let fileItem = {
          name: file.name,
          lastModified: file.lastModified
        }
        this.fileList.push(file);

        let reader = new FileReader();  //创建文件读取器
        reader.onload = e => {  //挂载load函数，监听读取文件完毕时的处理函数在此
          try {
            let data = new Uint8Array(e.target.result);
            let workbook = XLSX.read(data, {type: 'array'});
            this.ValidImportExcelData(workbook, fileItem);
          } catch(err) {
            console.log(err, this);
            this.$message.error('尝试读取文件内容失败，请重试');
            this.$loading().close();
          }
        }
        reader.readAsArrayBuffer(file); //读取上传的excel文件
      } catch(err) {
        this.$message.error('读取文件内容失败，请重试');
        this.$loading().close();
      }
      return false; //无论最后校验如何，都不往服务器上传。
    },
    /**
     * @param workbook 读取到的excel信息
     * @param fileItem 当前excel的最基本信息。包含名称和更新时间
     */
    ValidImportExcelData(workbook, fileItem) {
      if(!workbook.SheetNames || workbook.SheetNames.length == 0) {
        this.resetFiles();
        // 没有工作表表名，有问题
        return this.$message.error('导入的excel文件的工作表有问题，请检查。 请注意：系统只读excel里第一个工作表。');
      }
      if(!workbook.SheetNames[0] || !workbook.Sheets[workbook.SheetNames[0]] || !workbook.Sheets[workbook.SheetNames[0]]['!ref']) {
        this.resetFiles();
        // 没有有效区间的数据
        return this.$message.error('导入的excel文件的工作表里表格数据有问题，请检查。请检查是否有数据在表格中');
      }
      let validCol = JSON.parse(JSON.stringify(this.validCol));
      /**
       * 获取正则
       * @param key
       * @returns {*|string}
       */
      const defaultPattern = (key) => {
        if (key.indexOf('phone') !== -1) return REG_PHONE;
        else if (key.indexOf('price') !== -1) return REG_DECIMAL
        else return ''
      }
      validCol = validCol.map((e, i) => {
        return {
          text: e.text,
          key: e.key,
          require: e.require || false, // 是否需要检测
          pattern: e.pattern || false, // 检测是否应用正则, 否则默认
          colKeys: String.fromCharCode(65 + i) // 英文A、B、C...
        }
      })

      let sheet = workbook.Sheets[workbook.SheetNames[0]];
      let validArea = sheet['!ref'].split(':');
      let validRowKeys = validArea[1] ? validArea[1].replace(/[^0-9]/ig,"") : validArea[0].replace(/[^0-9]/ig,"");  //检查有效范围，一般取第二个边界值。但是只有起始一格的情况下只会有第一个边界值
      validRowKeys = parseInt(validRowKeys);  //字符串格式转为数字格式，以便于作为循环判断边界

      /**
       * @var list excel中的数据集。
       * @var errorArray excel中数据集的异常数据。即上面项存在为空项
       */
      let list = [], errorArray = [];
      for(let i = 2; i <= validRowKeys; i++) { //要从索引2开始，即忽略第一行。要小于等于最后一行
        let item = { row: i },  //默认填充行数
          validData = true,
          errorInfos = [];

        // 过滤无效行
        let isVoidRow = true; // 是否存在无效行、默认无效

        for (const colItem of validCol) {
          const { key, text, require, pattern, colKeys } = colItem
          item[key] = sheet[colKeys + i] ? sheet[colKeys + i].v : '';
          if(typeof item[key] == 'string') item[key] = item[key].trim(); //去掉前后空格
          /**
           * 检测
           * require: validCol里的key，是否需要检测
           * pattern: validCol里的key，正则公式
           * defaultPattern: 默认的正则公式，匹配value里有phone/price
           */
          if (
            require &&
            (
              !item[key] || //无值
              item[key] === '' ||  //空字符串
              (pattern && !pattern.test(item[key])) ||
              (!pattern && defaultPattern(key) && !defaultPattern(key).test(item[key]))
            )
          ) {
            errorInfos.push(`${text}不符合要求(不能为空且不能有特殊字符)`);
            validData = false;
          }
          // 判断是否有效行 判断空值、空字符串
          if (!(!item[key] || item[key] === '')) {
            isVoidRow = false; // 有效行，只要有一个有值就有效
          }
        }
        if (isVoidRow) continue; // 存在无效行
        if(!validData) errorArray.push({
          row: i,
          errorInfos: errorInfos
        });
        list.push(item);
      }
      let data = {
        name: fileItem.name,
        lastModified: fileItem.lastModified,
        list,
        errors: errorArray
      }
      this.fileDatas.push(data);
      try {
        // 无论检查重复数据是否成功，都要关闭loading
        // this.getDuplicateDatas(data);
        this.validResult();
        this.$loading().close();
      } catch (err) {
        console.log(err);
        this.$loading().close();
      }
    },
    // 查重
    getDuplicateDatas(fileData) {
      let fileName = fileData.name;
      let list = fileData.list;
      for(let i = 0; i < list.length; i++) {
        let item = list[i];
        let validKey = [item.phone || '', item.price || ''].join(',');
        if(this.validDatas.includes(validKey)) {
          // 如果已经存在了该订单编号
          if(!this.duplicateDatas.includes(validKey)) {
            // 如果未记录重复项
            // 先去找原先那条数据是在哪个文件的
            let originIndex = this.validDatas.indexOf(validKey);
            // 如果是在本表，直接操作
            if(
              this.orderPositions.length == 0 || //还没有表记录，第一张
              (this.orderPositions.length > 0 && originIndex > this.orderPositions[this.orderPositions.length - 1])  //当前表
            ) {
              this.duplicateDatas.push(validKey);
              this.duplicateInfos[validKey] = {
                [`${fileName}`]: {
                  num: 2,
                  rows: [this.validArrays[originIndex].row, item.row]  //直接记录两条记录
                }
              }
            }
            for(let edge = 0; edge < this.orderPositions.length; edge++) {
              if(originIndex < this.orderPositions[edge]) {
                // 找到了原来的那条数据记录
                this.duplicateDatas.push(validKey);
                this.duplicateInfos[validKey] = {
                  [`${fileName}`]: {  //当前的记录
                    num: 1,
                    rows: [item.row]
                  },
                  [`${this.fileDatas[edge].name}`]: { //找到的那张表的记录
                    num: 1,
                    rows: [this.validArrays[originIndex].row]
                  }
                }
                break;

              }
            }
          } else {
            // 如果已经记录了重复项，进行编辑操作
            if(this.duplicateInfos[validKey][fileName]) {
              // 这边表已经记录了一次了。
              this.duplicateInfos[validKey][fileName].num++;
              this.duplicateInfos[validKey][fileName].rows.push(item.row);
            } else {
              // 如果这条数据在这张表是第一次记录到
              this.duplicateInfos[validKey][fileName] = {
                num: 1,
                rows: [item.row]
              };
            }
          }
        } else {
          this.validDatas.push(validKey); //还是第一次检验这条订单号
          this.validArrays.push({  //记录这单号对应的行数，用来做校验溯源用
            keys: validKey,
            row: item.row
          })
        }
      }
      this.orderPositions.push(this.validDatas.length);  //划定已验证的表单数据中各个表格的范围边界
      // 检测导入
      this.validResult();
    },
    // 检测导入结果
    validResult() {
      let result = this.getSelectResult();
      if(!result) return;
      let selectResult = result.selectResult;
      if(selectResult.length == 0) {
        return this.$message.error('未检查到任何导入数据')
      }
      this.$emit('success', { result, selectResult })
    },
    uploadError(err) {
      this.resetFiles();
      this.$message.error('文件未被正确上传，请检查文件合法性或检查您的网络哦');
    },
    exceedLimit() {
      this.resetFiles();
      this.$message.error('一批最多只能选择上传10个文件哦');
    },
    // 获取导入结果
    getSelectResult() {
      // 因为只有一个文件
      this.selection = JSON.parse(JSON.stringify(this.fileDatas));

      if(!this.selection || this.selection.length == 0) {
        this.$message.error('未选择任何要处理的表格数据哦');
        return false;
      }
      let len = 0;  //总源数据长度
      for(let i = 0; i < this.selection.length; i++) {
        if(this.selection[i].errors && this.selection[i].errors.length > 0) {
          const row = this.selection[i].errors[0].row || null;
          const rowTips = row !== null ? `第${row}行` : '';
          this.$message.error(`选中的 ${this.selection[i].name} 文件${ rowTips }存在错误数据，请处理完再重新导入。可以选择其他正常文件进行操作处理`)
          return false;
        }

        // let list = this.selection[i].list;
        // len += list.length || 0;
        // for(let j = 0; j < list.length; j++) {
        //   if(this.duplicateDatas.includes(list[j].order_sn)) {
        //     this.$message.error(`${this.selection[i].name}中存在有不确定的和其他表格重复的数据 。请处理完文件中的重复数据后，重置导入后重试`)
        //     return false;
        //   }
        // }
      }
      let splitResult = this.selection.reduce((previousValue, currentValue) => {
        const list = currentValue.list.map(e => {
          return this.validCol.reduce((pv, cv) => {
            return {
              ...pv,
              [cv.key]: e[cv.key]
            }
          }, {})
        });
        return [...previousValue, ...list]
      }, []);
      return {
        selectResult: splitResult.slice(0),
        len: len
      };
    }
  }
}
</script>
<style lang="less" scoped></style>
