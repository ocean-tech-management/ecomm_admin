<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="操作类型">
        <!-- 拥有多种操作权限 -->
        <el-select v-if="$auths.includes('supplier/payGoods') && $auths.includes('supplier/afterPayRefund')" style="width: 220px" placeholder="选择类型" name="type" v-model="ctrlType" @change="changeCtrlType">
          <el-option label="对账操作" :value="1"></el-option>
          <el-option label="对账后退款结算操作" :value="2"></el-option>
        </el-select>
        <!-- 仅有对账或退款记录权限 -->
        <div v-else :class="ctrlTypeClass[ctrlType]">{{ctrlTypeTexts[ctrlType]}}</div>
      </el-form-item>
    </el-form>

    <!--
      批量上传excel表格
      element-ui是强制要求一个个上传的，不便于扩展。
      因自行处理相关信息需要额外的不少操作。
      特提到该弹窗来实现
    -->
    <template v-if="fileList.length == 0">
      <el-upload
        class="extend-uploader"
        style="margin-left: 100px"
        accept=".xls, .xlsx"
        action=""
        ref="order"
        :data="thumbData"
        :headers="token"
        :before-upload="orderWatcher"
        :on-error="uploadError"
        :on-exceed="exceedLimit"
        list-type="picture"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">点击此处上传文件</div>
        <div class="el-upload__tip" slot="tip">只能上传xls/xlsx文件，且文件大小不得超过2M。</div>
      </el-upload>
    </template>
    <template v-else>
      <div class="import-summary-title">
        导入文件成功，相关信息如下。
      </div>
      <el-table ref="fileDataTable" style="width: 100%" :data="fileDatas">

        <el-table-column label="文件名称" prop="name" width="350"></el-table-column>
        <el-table-column label="内容分析" prop="goods_sn">
          <template slot-scope="scope">
            共<span class="success-color">{{scope.row.orders.length || 0}}</span>条数据
            <template v-if="scope.row.errors && scope.row.errors.length > 0">
              ，其中存在异常数据<span class="error-color">{{scope.row.errors.length}}</span>条
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button v-if="scope.row.errors && scope.row.errors.length > 0" type="text" size="default" @click="showExcelError(scope.row)">
              查看错误
            </el-button>
          </template>
        </el-table-column>
      </el-table>


      <div v-if="duplicateDatas && duplicateDatas.length > 0" class="duplicate-tips">
        上传的文件中存在重复的数据，系统不允许要操作的数据有重复，请处理完后重新提交表格。 点此
        <el-button type="text" size="default" @click="showDuplicateDatas">
          查看详情
        </el-button>
      </div>

      <el-button style="margin-top: 20px;" type="primary" @click="resetFiles">重置</el-button>

      <!-- 文件里有错误 -->
      <el-dialog title="文件错误信息" width="530px" :visible.sync="errorVisible" :append-to-body="true">
        <div>
          <el-table ref="errorDataTabel" style="width: 100%" height="500px" :data="errorDatas">
            <el-table-column label="行数" prop="row" width="120"></el-table-column>
            <el-table-column label="错误点" prop="errorInfos">
            </el-table-column>
          </el-table>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="errorVisible = false">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 这批文件有重复数据 -->
      <el-dialog title="重复数据详情" width="730px" :visible.sync="duplicateVisible" :append-to-body="true">
        <div>
          <el-table ref="duplicateDataTabel" style="width: 100%" height="500px" :data="duplicateTableDatas">
            <el-table-column label="重复记录" prop="order_sn" width="260"></el-table-column>
            <el-table-column label="出现记录" prop="rows">
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.infos" :key="index">
                  <span class="tips-color">{{item.name}}</span>：第<span class="error-color"> {{item.rows}} </span>行
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px; color: #999">当订单号、产品编码、商品编码都一致时系统认为记录为重复数据</div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="duplicateVisible = false">确 定</el-button>
        </div>
      </el-dialog>

    </template>
  </div>
</template>

<script>
import XLSX from 'xlsx';

export default {
  name: "EditAttachInfos",
  data() {
    return {
      ctrlType: '',  //1对账操作，2对账后退款结算操作
      ctrlTypeTexts: {
        [1]: '对账操作',
        [2]: '对账后退款结算操作'
      },
      ctrlTypeClass: {
        [1]: 'success-color',
        [2]: 'warning-color'
      },

      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
      fileList: [],
      fileDatas: [],
      selection: [],

      // 查重
      validDatas:[],    //有效的订单号
      validArrays:[],   //有效的订单记录
      duplicateDatas:[],  //重复的订单号
      duplicateInfos:{},  //重复的数据记录
      orderPositions:[],  //每个表在有效数据列表中的边界

      errorDatas: [],
      errorVisible: false,

      duplicateTableDatas: [],
      duplicateVisible: false,

      logisticsCompanys: {},

    };
  },
  props: {
    formData: Object
  },
  mounted() {
    if(this.$auths.includes('supplier/payGoods')) {
      this.ctrlType = 1;
    } else if(this.$auths.includes('supplier/afterPayRefund')) {
      this.ctrlType = 2;
    }
  },
  methods: {
    resetFiles() {
      this.fileList = [];
      this.fileDatas = [];
      this.selection = [];

      this.validDatas = [];
      this.validArrays = [];
      this.duplicateDatas = [];
      this.duplicateInfos = [];
      this.orderPositions = [];

      this.$nextTick(() => {
        this.$refs.order.clearFiles();
      })
    },

    changeCtrlType() {
      this.resetFiles();
    },


    updateSelection(e){
      this.selection = e;
    },

    // 导入excel表格
    orderWatcher(file) {
      this.$loading({
        text: '导入中'
      });
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
        // 没有有效区间数据
        return this.$message.error('导入的excel文件的工作表里表格数据有问题，请检查。请检查是否有数据在表格中');
      }
      let validColIndexs = ['A', 'F', 'G']; //待校验的列索引
      let validColKeys = ['A', 'F', 'G']; //待读取的列索引
      let validColKeyNames = ['order_sn', 'goods_sn', 'sku_sn']; //待校验的列索引
      let validColPattern = ['normal_character', 'normal_character', 'normal_character'];

      if(this.ctrlType == 1) {
        // 对账结算
        validColIndexs.push('X');
        validColKeys.push('X', 'AA');
        validColKeyNames.push('supplier_pay_no', 'supplier_pay_remark');
        validColPattern.push('normal_character', null);
      } else if(this.ctrlType == 2) {
        // 记录结账后退款
        validColIndexs.push('Y', 'Z');
        validColKeys.push('Y', 'Z', 'AB');
        validColKeyNames.push('supplier_refund_after_pay_price', 'supplier_refund_after_pay_no', 'supplier_refund_after_pay_remark');
        validColPattern.push('price', 'normal_character', null);

      }

      let validColKeyNameTexts = {
        order_sn: '订单号',
        goods_sn: '产品编号',
        sku_sn: '商品编号',
        supplier_pay_no: '结算流水号',
        supplier_pay_remark: '备注',

        supplier_refund_after_pay_price: '对账后退款结算金额',
        supplier_refund_after_pay_no: '对账后退款结算流水号',
        supplier_refund_after_pay_remark: '对账后退款结算备注'
      };
      let sheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log(sheet,284)
      let validArea = sheet['!ref'].split(':');
      let validRowKeys = validArea[1] ? validArea[1].replace(/[^0-9]/ig,"") : validArea[0].replace(/[^0-9]/ig,"");  //检查有效范围，一般取第二个边界值。但是只有起始一格的情况下只会有第一个边界值
      validRowKeys = parseInt(validRowKeys);  //字符串格式转为数字格式，以便于作为循环判断边界

      /**
       * @var list excel中的数据集。
       * @var errorArray excel中数据集的异常数据。即上面项存在为空项
       */
      let list = [], errorArray = [];
      concatOrders: for(let i = 2; i <= validRowKeys; i++) { //要从索引2开始，即忽略第一行。要小于等于最后一行
        let item = { row: i },  //默认填充行数
            validData = true,
            errorInfos = [];
        for(let j = 0; j < validColKeys.length; j++) {
          // 拼装键值对
          item[validColKeyNames[j]] = sheet[validColKeys[j] + i] ? sheet[validColKeys[j] + i].v : '';
          if(typeof item[validColKeyNames[j]] == 'string') item[validColKeyNames[j]] = item[validColKeyNames[j]].trim(); //去掉前后空格
          // 检查是不是要进行验证的那几列
          if(validColIndexs.includes(validColKeys[j])) {
            if(
              !item[validColKeyNames[j]] || //无值
              item[validColKeyNames[j]] === '' ||  //空字符串
              (validColPattern[j] == 'price' && !/^(\d|[1-9]\d+)(\.\d+)?$/.test(item[validColKeyNames[j]])) || //金额格式
              (validColPattern[j] == 'normal_character' && !/^[a-zA-Z0-9]*$/.test(item[validColKeyNames[j]])) //常规字符格式
            ) {
              errorInfos.push(`${validColKeyNameTexts[validColKeyNames[j]]}不符合要求(不能为空且不能有特殊字符)`);
              validData = false;
            }
          }
        }
        if(!item.order_sn) continue concatOrders; //如果是没有订单号的，直接忽略
        list.push(item);
        if(!validData) errorArray.push({
          row: i,
          errorInfos: errorInfos
        });
      }

      let data = {
        name: fileItem.name,
        lastModified: fileItem.lastModified,
        orders: list,
        errors: errorArray
      }
      this.fileDatas.push(data);
      try {
        // 无论检查重复数据是否成功，都要关闭loading
        this.getDuplicateDatas(data);
        this.$loading().close();
      } catch (err) {
        console.log(err);
        this.$loading().close();
      }
    },

    getDuplicateDatas(fileData) {
      let fileName = fileData.name;
      let orders = fileData.orders;
      for(let i = 0; i < orders.length; i++) {
        let item = fileData.orders[i];
        let validKey = [item.order_sn || '', item.goods_sn || '', item.sku_sn || ''].join(',');
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
            order_sn: validKey,
            row: item.row
          })
        }
      }
      this.orderPositions.push(this.validDatas.length);  //划定已验证的表单数据中各个表格的范围边界

    },

    uploadError(err) {
      this.resetFiles();
      this.$message.error('文件未被正确上传，请检查文件合法性或检查您的网络哦');
    },

    exceedLimit() {
      this.resetFiles();
      this.$message.error('一批最多只能选择上传10个文件哦');
    },

    showExcelError(row) {
      // 查看错误数据
      let errorDatas = [];
      for(let i = 0; i < row.errors.length; i++) {
        errorDatas.push(JSON.parse(JSON.stringify(row.errors[i])));
      }
      for(let i = 0; i < errorDatas.length; i++) {
        errorDatas[i].errorInfos = errorDatas[i].errorInfos.join('、');
      }
      this.errorDatas = errorDatas;
      this.errorVisible = true;
    },

    showDuplicateDatas() {
      // 查看重复的记录信息
      try {
        let duplicateTableDatas = [];

        let order_sns = Object.keys(this.duplicateInfos);
        let infos = Object.values(this.duplicateInfos);
        for(let i = 0; i < order_sns.length; i++) {
          let item = {};
          item.order_sn = order_sns[i]; //取键名为订单号

          item.infos = []; //填充相关文件的数据记录
          let duplicateRecords = Object.keys(infos[i]);
          let duplicateRecordInfos = Object.values(infos[i]);
          for(let j = 0; j < duplicateRecords.length; j++) {
            let info = {};
            info.name = duplicateRecords[j];  //取记录里的键名为文件名
            info.rows = duplicateRecordInfos[j].rows.join('、');  //取记录里的值里的相关信息
            item.infos.push(info);
          }
          duplicateTableDatas.push(item);
        }
        this.duplicateTableDatas = duplicateTableDatas;
        this.duplicateVisible = true;
      } catch (error) {
        this.$message.error('重复记录生成异常，可能是您导入的文件有问题，请重新导表重试哦')
      }
    },

    getSelectResult() {
      // 因为只有一个文件
      this.selection = JSON.parse(JSON.stringify(this.fileDatas));

      if(!this.selection || this.selection.length == 0) {
        this.$message.error('未选择任何要处理的表格数据哦');
        return false;
      }
      for(let i = 0; i < this.selection.length; i++) {
        if(this.selection[i].errors && this.selection[i].errors.length > 0) {
          this.$message.error(`选中的 ${this.selection[i].name} 文件存在错误数据，请处理完再重新导入。可以选择其他正常文件进行操作处理`)
          return false;
        }

        let orders = this.selection[i].orders;
        for(let j = 0; j < orders.length; j++) {
          if(this.duplicateDatas.includes(orders[j].order_sn)) {
            this.$message.error(`${this.selection[i].name}中存在有不确定的和其他表格重复的数据，具体请查看 重复数据详情 。请处理完文件中的重复数据后，重置导入后重试`)
            return false;
          }
        }
      }
      let result = [];
      for(let i = 0; i < this.selection.length; i++) {
        result.push(...this.selection[i].orders);
      }
      return {
        ctrlType: this.ctrlType,
        selectResult: result
      };


    }
  }
};
</script>

<style lang="less">
  // 导入组件
  .extend-uploader .el-icon-upload {
    font-size: 67px;
    margin: 15px auto;
  }
  .extend-uploader {
    .el-upload {
      padding: 30px 50px;
      border: 2px dashed #999;
    }
  }

  .import-summary-title {
    font-size: 24px;
  }

  .tips-color {
    margin-top: 10px;
    color: #999;
  }
</style>
