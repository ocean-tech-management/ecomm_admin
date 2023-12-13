<template>
  <div>
    <el-drawer
      title="提现审核"
      :visible.sync="importDrawerVisible"
      :before-close="changeDrawer"
      size="100%"
    >
      <template #title>
        <span class="header-text">导入excel表格---请根据对应模板进行导入</span>
      </template>
      <template v-if="fileList.length == 0">
        <el-row style="padding: 20px 20px;">
          <el-radio-group v-model="radioModel" @input="radioModelChange">
            <el-radio :label="4">快商导入</el-radio>
            <el-radio :label="3">衫德导入</el-radio>
            <el-radio :label="5">中数科导入</el-radio>
          </el-radio-group>
        </el-row>
        <el-upload
          class="extend-uploader"
          accept=".xls, .xlsx"
          action=""
          ref="withraw"
          :before-upload="withrawWatcher"
          :on-error="uploadError"
          :limit=1
          list-type="picture"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">点击此处上传文件</div>
          <div class="el-upload__tip" slot="tip">
            只能上传xls/xlsx文件，且文件大小不得超过2M。
          </div>
        </el-upload>

        <el-button style="margin: 20px;" @click="useDialogVisible=true" type="primary" size="samll">查看指引</el-button>
      </template>
      <template v-else>
        <div class="import-summary-title">
          <div class="import-summary-title-box">
            <el-row type="flex">导入文件成功，<span class="danger">{{ fileName }}</span> 信息如下。</el-row>
            <el-row v-if="tableDataErrorList.length==0" style="float: right;">
              <el-select @change="paySystem" size="small" style="margin-right: 20px;" v-model="PayValue" placeholder="打款方式--对应导入模板">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-radio @input="radioInput" v-model="exportModel" label="1">全量导入</el-radio>
              <el-radio @input="radioInput" v-model="exportModel" label="2">筛选导入</el-radio>
            </el-row>
          </div>
          <div v-if="tableDataErrorList.length==0 &&this.duplicateDatas.length==0">
            <span v-if="radioModel == 4"
            >（选中）申请提现金额总计：<span class="red">{{
                total_price_total.toFixed(3)
              }}</span
            >元</span
            >
            <span v-if="radioModel == 4"
            >（选中）手续费总计：<span class="red">{{
                handing_fee_total.toFixed(3)
              }}</span
            >元</span
            >
            <span
            >（选中）提现金额总计：<span class="red">{{
                price_total.toFixed(3)
              }}</span
            >元</span
            >
            <span
            >当前选中：<span class="red">{{
                exportModel == '1' ? dataList.length : multipleSelection.length
              }}</span>
              条</span
            >
            <span v-if="personNum > 0" style="margin-left: 50px;color: black;"
            >导入总计：<span class="red">{{ dataList.length }}</span> 条，你需要随机抽取
              <span class="red">{{ personNum }}</span> 个人查看后才能导入</span
            >
          </div>
        </div>
        <template v-if="tableDataErrorList.length==0 &&this.duplicateDatas.length==0">
          <div class="subpage-content subpage-content-ctrls">
            <div class="default-container">
              <!-- 默认表格 -->
              <el-table
                max-height="600"
                style="width: 100%;"
                :data="tableData"
                @selection-change="handleSelectionChange"
                :row-key="getRowKeys"
                ref="multipleTable"
                tooltip-effect="dark"
              >
                <el-table-column :selectable="selectable" v-if="exportModel=='2'" :reserve-selection="true" type="selection" width="55"></el-table-column>
                <template v-for="(item, key) in fieldList">
                  <template v-if="item.value == 'user_name'">
                    <el-table-column :label="item.title" :width="item.front_width || '180'" :prop="item.value" :key="key">
                      <template slot-scope="scope">
                        <div class="form-content-static">
                          <span>{{ scope.row.user_name }}</span>
                          <span v-if="scope.row.related_user">
                            <el-tooltip class="item" effect="dark" content="该用户使用了其他账号的签约信息" placement="top">
                              <el-button
                                style="font-size: 24px; vertical-align: middle"
                                class="error-color"
                                type="text"
                                icon="el-icon-warning"
                                size="medium"
                              ></el-button>
                            </el-tooltip>
                          </span>
                        </div>
                      </template>
                    </el-table-column>
                  </template>
                  <template v-if="item.value == 'withdraw_type'">
                    <el-table-column :label="item.title" :width="item.front_width || '180'" align="center" :prop="item.value" :key="key">
                      <template slot-scope="scope">
                        {{ withdrawTypeTexts[scope.row.withdraw_type] }}
                      </template>
                    </el-table-column>
                  </template>
                  <template v-if="item.value == 'payment_status'">
                    <el-table-column :label="item.title" :width="item.front_width || '180'" align="center" :prop="item.value" :key="key">
                      <template slot-scope="scope">
                        <div v-if="scope.row.payment_status == -1" class="error-color">
                          {{ payStatusText[scope.row.payment_status] }}
                        </div>
                        <div v-else>{{ payStatusText[scope.row.payment_status] }}</div>
                      </template>
                    </el-table-column>
                  </template>
                  <el-table-column v-else :label="item.title" :width="item.front_width || '180'" :prop="item.value" align="center" :key="key"></el-table-column>
                </template>
                <el-table-column fixed="right" label="操作" wdith="250">
                  <template slot-scope="scope">
                    <template v-if="$auths.includes('finance/withdrawDetail')">
                      <el-button
                        type="text"
                        size="default"
                        @click="openDetail(scope.row)"
                      >详情
                      </el-button
                      >
                    </template>
                  </template>
                </el-table-column>
              </el-table>
              <div class="block">
                <!-- 底部的提交 -->
                <div class="exportBtn">
                  <el-checkbox
                    @change="startCd(60)"
                    :disabled="personNum>0"
                    v-model="checked"
                  >我已审核通过, 且数据无误
                  </el-checkbox
                  >
                  <el-button
                    type="primary"
                    @click="dialogShow"
                    :disabled="btnCodeCd"
                  >
                    确认导入
                    <span v-if="btnCodeCd">(确认无误后{{ long }}秒可提交)</span>
                  </el-button>
                </div>
              </div>
              <div class="block">
                <el-row
                  style="width: 100%;padding: 0px 20px;"
                  type="flex"
                  justify="space-between"
                >
                  <el-pagination
                    layout="total,sizes,prev,pager,next,jumper"
                    :page-size="size"
                    :current-page="page"
                    @current-change="handleCurrentChange"
                    @size-change="sizeChange"
                    :page-sizes="pageSizes"
                    :total="total"
                  >
                  </el-pagination>
                  <el-button
                    style="margin-top: 5px;"
                    type="primary"
                    @click="resetFiles"
                  >重置
                  </el-button
                  >
                </el-row>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <el-card class="errorCard">
            <el-row type="flex" justify="space-between">
              <el-col v-if="tableDataErrorList.length!=0">
                <h3>错误信息如下</h3>
                <div>
                  <div v-for="(item, index) in tableDataErrorList" :key="index">
                    第 <span class="red">{{ item.row }}</span> &nbsp;&nbsp;行&nbsp;
                    错误信息:
                    <div>
                      <div v-for="(item,index) in item.errorInfos" :key="index">
                        <p class="red">{{ item }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
              <el-col v-if="this.duplicateDatas.length!=0">
                <h3>重复信息如下</h3>
                <div>
                  <div v-for="(item,index) in duplicateDatas" :key="index">
                    第 <span class="red"> {{ item.row }} </span> 行
                    重复信息为：<span class="red">{{ item.validKey }}</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
          <el-button
            style="margin: 20px;"
            type="primary"
            @click="resetFiles"
          >重置
          </el-button
          >
        </template>
        <!-- 选择同意还是驳回模态框 -->
        <el-dialog
          :append-to-body="true"
          title="请选择同意还是驳回"
          :visible.sync="dialogVisible"
          width="30%"
        >
          <el-row type="flex" justify="space-around">
            <el-button @click="agreeSubmit('1')" type="success">同意</el-button>
            <el-button @click="agreeSubmit('2')" type="danger">驳回</el-button>
          </el-row>
        </el-dialog>
        <!-- 同意或者驳回弹出框 -->
        <el-dialog
          :append-to-body="true"
          :title="agressAndRefusText"
          :visible.sync="agressAndRefusdialogVisible"
          width="30%"
          :before-close="handleClose"
        >
          <el-form
            ref="epxortForm"
            :rules="rules"
            label-width="100px"
            :model="keyFormData"
          >
            <el-form-item prop="message" label="确认信息">
              <el-input
                v-model="keyFormData.message"
                placeholder="请输入-我已确认审核无误"
              />
            </el-form-item>
            <el-form-item prop="username" label="审核人">
              <el-input
                v-model="keyFormData.username"
                placeholder="请输入你的名字"
              />
            </el-form-item>
          </el-form>
          <el-row type="flex" justify="center">
            <span class='green' v-if="agreeAndRefuseType=='1'">您正在执行同意操作</span>
            <span class='danger' v-if="agreeAndRefuseType=='2'">您正在执行驳回操作</span>
          </el-row>
          <template slot="footer" class="dialog-footer">
            <el-button @click="closeAgreeAndRefuseDialog">取 消</el-button>
            <el-button type="primary" @click="submit">确 定</el-button>
          </template>
        </el-dialog>
      </template>
    </el-drawer>
    <el-dialog
      title="提现详情"
      width="1000px"
      :close-on-click-modal="false"
      :visible.sync="detailVisible"
    >
      <WithdrawDetail
        :formData="formData"
        :dataList="dataList"
      ></WithdrawDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="messageLook(formData.id)"
        >确 定
        </el-button
        >
      </div>
    </el-dialog>
    <!-- 使用指南 -->
    <el-dialog
      title="使用指南"
      :visible.sync="useDialogVisible"
      width="700px">
      <div style="height: 300px;">
        <el-steps direction="vertical">
          <el-step status="process" title="步骤 1">
            <template #description>
              你将需要选择与你即将导入模板一致的表格，且表格的格式与导出时相同，且需要把密码去掉，
              您还需更改表头最后一行的红色字体改为<br>
              <span style="color:red;font-weight: 700;">我已完成审核,且保证数据完全无误</span>
              否则将导入失败。
            </template>
          </el-step>
          <el-step status="process" title="步骤 2"
                   description="导入模板成功后，你需要抽取你导入数量的5%。作为审核案例,点击详情查看，无误后确认"></el-step>
          <el-step status="process" title="步骤 3"
                   description="再确认提交导入时。请先选择打款方式，如果你选择筛选导入，你需要勾选你要导入的数据"></el-step>
          <el-step status="process" title="步骤 4"
                   description="在确认提交框出现后，你可以选择导入申请、驳回两种方式，进行你的操作，到此，指引结束"></el-step>
        </el-steps>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="useDialogVisible = false">我已知晓</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
/*
 *@Date: 2023-03-22 19:45:15
 *@Description: 模块描述
*/
import WithdrawDetail from "@/partialviews/finance/withdraw/WithdrawDetail";
import XLSX from 'xlsx'

export default {
  name: '',
  components: {
    WithdrawDetail
  },
  props: {
    //抽屉显示
    importDrawerVisible: {
      type: Boolean,
      // 定义是否必须传
      required: true,
      // 定义默认值
      default: true,
      fileDatas: [],
    }
  },
  data() {
    return {
      //上传的文件列表
      fileList: [],
      //默认导入模板为1
      radioModel: 4,
      exportModel: '1',
      fileName: '',
      //查重
      validDatas: [],    //有效的提现编号
      validArrays: [],   //有效的提现记录
      duplicateDatas: [],  //重复的提现编号
      duplicateInfos: {},  //重复的数据记录
      withrawPositions: [],  //每个表在有效数据列表中的边界,

      useDialogVisible: true,
      //审核表单数据
      keyFormData: {
        message: "",
        username: ""
      },
      fieldList: [], // 后端返回的表头数组
      fieldStart: null, // 手段返回的{ column： 1, row: 2 } 从execl数据是哪一行开始
      //中：英
      zhToEnObj: {},
      //英：中
      EnToZnObj: {},
      //待读取的列索引
      ReadeRows: [],
      //读取字段名
      ReadeRowsKey: [],
      //读取待检验的索引
      checkArr: [],
      //读取验证类型
      checkArrPttern: [],
      //同意或者驳回---1标识同意，2标识驳回
      agreeAndRefuseType: '1',
      agressAndRefusdialogVisible: false,
      agressAndRefusText: '',
      //表单验证
      rules: {
        message: [
          {
            required: true,
            message: "请输入-我已确认审核无误",
            trigger: "blur"
          },
          {
            pattern: /^我已确认审核无误$/,
            message: "只能输入我已确认审核无误",
            trigger: "blur"
          }
        ],
        username: [
          {required: true, message: "请输入你的名字", trigger: "blur"},
          {min: 1, max: 15, message: "长度在 1 到 15 个字符", trigger: "blur"}
        ]
      },
      //表格需要显示的数据
      dataList: [],
      dialogVisible: false,
      selection: [],
      price_total: 0,
      handing_fee_total: 0,
      total_price_total: 0,
      code: "",
      checkboxCodeCd: true,
      checked: false,
      btnCodeCd: true,
      long: 60,
      tableDataErrorList: [],
      count: [],
      multipleSelection: [],
      PayValue: '快商',

      //打款方式
      options: [{
        value: '1',
        label: '微信支付'
      }, {
        value: '2',
        label: '汇聚支付'
      }, {
        value: '3',
        label: '衫德支付'
      }, {
        value: '4',
        label: '快商'
      },
      {
        value: '5',
        label: '中数科'
      },
      {
        value: '88',
        label: '线下打款'
      }],

      payStatusText: {
        [1]: "已到账",
        [2]: "",
        [-1]: "失败"
      },
      withdrawTypeTexts: {
        [2]: "商城提现",
        [5]: "H5提现",
        [7]: "福利提现"
      },
      pay_channelText: {
        [1]: "微信支付",
        [2]: "汇聚支付",
        [3]: "衫德支付",
        [4]: "快商",
        [5]: "中数科",
        [88]: "线下打款"
      },
      // userDefault: {
      //   乐小活签约: "contract_letfree",
      //   系统识别码: "id",
      //   提现编号: "order_sn",
      //   手续费: "handing_fee",
      //   手机号码: "user_phone",
      //   真实名称: "user_real_name",
      //   提现金额: "price",
      //   银行卡号: "bank_account",
      //   备注: "remark",
      //   状态: "check_status",
      //   用户昵称: "user_name",
      //   申请提现金额: "total_price",
      //   提现类型: "withdraw_type",
      //   提现时间: "create_time",
      //   到账时间: "payment_time",
      //   到账状态: "payment_status",
      //   支付编号: "payment_no",
      //   标识: "id",
      //   打款方式: "pay_channel",
      //   身份证号:"idCard"
      // },
      // userShanDe: {
      //   '序号（选填）': "key",
      //   打款方式: "pay_channel",
      //   提现编号: "order_sn",
      //   '收款人手机号（选填）': "user_phone",
      //   '收款方姓名（必填）': "user_real_name",
      //   '收款方银行卡号（必填）': "bank_account",
      //   用户注册时间: "user_create_time",
      //   系统提现标识: "id",
      //   '金额（必填，单位：元）': "price",
      //   '附言（选填）': "remark",
      // },
      // userZhongShuKe:{
      //   发放金额: "price",
      //   备注: "remark",
      //   实名手机: "user_phone",
      //   序号: "key",
      //   收款方账号: "bank_account",
      //   收款方账户名: "user_real_name",
      //   用户注册时间: "user_create_time",
      //   系统提现标识: "id",
      //   提现编号: "order_sn",
      // },
      detailVisible: false,
      excelPamary: {
        type: 1,
        file: ""
      },
      //用于记录财务人员查看了详情对应的id
      //导入衫德表格的序号
      index: 0,
      //导入中数科模板的合计列
      ZhongShuKeTotal: '',
      formData: {},
      //分页
      size: 20,
      page: 1,
      total: 0,
      tableData: [],
      pageSizes: [20, 40, 60, 80, 100],
      //需要抽取的人
      personNum: 0,
      //获取表头信息存起来
      tableHeaderData: [],
    }
  },
  created() {
  },
  mounted() {
    this.getTableHeader()
  },
  methods: {
    // 开启计时
    startCd(time) {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        this.long--;
        if (this.long <= 0) {
          this.long = time;
          this.btnCodeCd = false;
          clearInterval(this.timer);
        }
      }, 1000);
    },
    //计算总计
    getAllPrice(arr) {
      this.price_total = 0;
      this.total_price_total = 0;
      this.handing_fee_total = 0;
      arr.forEach(item => {
        for (const key in item) {
          if (key == "price") {
            this.price_total += Number(item[key])
          } else if (key == "handing_fee") {
            this.handing_fee_total += Number(item[key])
          } else if (key == "total_price") {
            this.total_price_total += Number(item[key])
          }
        }
      })
    },
    radioModelChange(val) {
      this.getTableHeader(val)
      this.PayValue = this.pay_channelText[val]
    },
    getTableHeader(val = 4) {
      this.$post('admin/excel/ExportField', {type: val}, res => {
        const arr = res.data.field
        this.fieldStart = res.data.start
        const listArr = [];
        const lineArr = [];
        let textObj = {};
        let resetTextObj = {};
        let checkObj = {};
        let checkArr = [];
        let checkArrPttern = []
        arr.splice(arr.length - 1, 1);
        arr.forEach(item => {
          // 表格字段对应的对象
          let obj = {};
          for (const key in item) {
            if (key == "title" || key == "value" || key == 'validates' || key == 'line') {
              obj[`${key}`] = item[key];
            }
            if (key == 'line') {
              lineArr.push(item[key])
            }
          }
          listArr.push(obj);
        });
        listArr.forEach((item) => {
          textObj[`${item.title}`] = item.value
          checkObj[`${item.line}`] = item.validates;
        })
        for (const key in checkObj) {
          if (checkObj[key]) {
            checkArr.push(key)
            checkArrPttern.push(checkObj[`${key}`])
          } else {
            checkArrPttern.push('normal_character')
          }
        }
        resetTextObj = this.swapKeysAndValues(textObj)
        this.fieldList = arr;
        //赋值中:英对象
        this.zhToEnObj = textObj;
        //赋值英:中对象
        this.EnToZnObj = resetTextObj;
        //赋值待读取的列
        this.ReadeRows = lineArr;
        //待校验的列索引
        this.checkArr = checkArr;
        this.checkArrPttern = checkArrPttern;
        this.ReadeRowsKey = Object.keys(resetTextObj)

      })
    },
    swapKeysAndValues(obj) {
      const swapped = Object.entries(obj).map(
        ([key, value]) => [value, key])
      return Object.fromEntries(swapped);
    },
    //表格数据每条的唯一标识key
    getRowKeys(row) {
      try {
        if (this.radioModel == 5) {
          return row.id;
        } else if (this.radioModel == 3 || this.radioModel == 4) {
          return row.order_sn;
        }
      } catch (error) {
        return error;
      }
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(() => {
          this.resetForm();
          done();
        })
        .catch(() => {
        });
    },
    //关闭模态框
    closeDialog() {
      this.dialogVisible = false;
    },
    //驳回还是同意
    agreeSubmit(val) {
      this.agreeAndRefuseType = val;
      this.closeDialog()
      this.agressAndRefusdialogVisible = true;
      if (this.agreeAndRefuseType == '1') {
        this.agressAndRefusText = '同意导入';
      } else if (this.agreeAndRefuseType == '2') {
        this.agressAndRefusText = '驳回导入';
      }
    },
    async submit() {
      //  执行导出表格的逻辑
      try {
        await this.$refs.epxortForm.validate()
        if (!this.PayValue) {
          this.agressAndRefusdialogVisible = false;
          return this.$message.error("请选择打款方式");
        }
        const list = this.exportModel == '1' ? this.arrToObj(this.dataList) : this.arrToObj(this.multipleSelection);
        if (list && list.length != 0) {
          const check_status = this.agreeAndRefuseType == '1' ? 3 : 2
          let pay_channel = 0;
          this.options.forEach((item, index) => {
            for (const key in item) {
              if (item[key] == this.PayValue) {
                pay_channel = item.value;
              }
            }
          })
          let params = {
            list,
            check_status,
            pay_channel
          };
          this.$post("/admin/finance/batchCheckWithdraw", params, res => {
            if (res.error_code == 0) {
              this.$message.success("成功");
              this.resetFiles()
            }
            this.agressAndRefusdialogVisible = false;
          });
        } else {
          this.agressAndRefusdialogVisible = false;
          return this.$message.error("您选中的数据为空")
        }
      } catch (error) {
        return error
      }
      this.closeDialog();
    },
    //表格复选框的选中事件
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.getAllPrice(this.multipleSelection);
    },
    //设置复选框是否可选
    selectable() {
      //代检验的人数
      if (this.personNum >= 0) {
        this.personNum = Math.ceil(this.total * 0.05) - this.count.length;
        if (this.personNum <= 0) {
          this.checkboxCodeCd = false;
          return true;
        } else {
          return false;
        }
      }
    },
    //代检验的人数
    checkPerson() {
      if (this.personNum >= 0) {
        this.personNum = Math.ceil((this.total) * 0.05) - this.count.length
      }
    },
    //显示模态框
    dialogShow() {
      //是否选中了导出的数据，
      if (this.multipleSelection.length != 0 || this.dataList != 0) {
        this.dialogVisible = true;
      } else {
        this.$message.warning("没有选中任何数据，请先选中你要导入的数据哦！");
      }
    },
    closeAgreeAndRefuseDialog() {
      this.agressAndRefusdialogVisible = false;
      this.resetForm();
    },
    // 分页
    handleCurrentChange(value) {
      this.page = value;
      this.getTableData();
    },
    //前端分页
    getTableData() {
      setTimeout(() => {
        this.tableData = this.dataList.slice(
          (this.page - 1) * this.size,
          this.page * this.size
        );
      })
      this.total = this.dataList.length;
    },
    sizeChange(val) {
      this.size = val;
      this.page = 1;
      this.getTableData();
    },
    //改变抽屉的显示与隐藏
    changeDrawer() {
      this.$confirm("确认取消导入？")
        .then(() => {
          this.$emit("update:importDrawerVisible", !this.importDrawerVisible);
          this.$parent.getList();
          this.checkboxCodeCd = true;
          this.checked = false;
          this.btnCodeCd = true;
          this.timer && clearInterval(this.timer);
          this.long = 60;
          this.resetFiles();
        })
        .catch(() => {
        });
    },
    //选择不同的导出方式
    radioInput(val) {
      if (val == '1') {
        this.getAllPrice(this.dataList)
      } else if (val == '2') {
        this.getAllPrice(this.multipleSelection)
      }
    },
    //导入之前
    withrawWatcher(file) {
      this.$loading({
        text: '导入中'
      });
      if (file.type != 'application/vnd.ms-excel' && file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        if (file.type == '' && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
          this.resetFiles();
          this.$message.error('只能上传正确的.xls或.xlsx文件哦');
          this.$loading().close();
          return false;
        }
      }

      // 涉及到文件的读取，有可能执行脚本失败，多加两步catch，避免脚本卡机
      try {
        for (let i = 0; i < this.fileList.length; i++) {
          if (this.fileList[i].name == file.name) {
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
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            /* 获取表头范围 */
            var header_range = XLSX.utils.decode_range(worksheet['!ref']);
            const {row: startRow} = this.fieldStart
            const headerRowIndex = startRow - 1 < 0 ? 0 : startRow - 1; // 命中行数，下标
            var header_col_range = {
              s: {c: header_range.s.c, r: headerRowIndex},
              e: {c: header_range.e.c, r: headerRowIndex}
            };
            /* 获取最后一个表头单元格的内容 */
            var last_header_cell = XLSX.utils.sheet_to_json(worksheet, {range: header_col_range, header: 1})[0].pop();
            if (last_header_cell != '我已完成审核,且保证数据完全无误') {
              this.resetFiles();
              this.$loading().close();
              return this.$message.error('导入表可能为没有审核的导出表--请修改表头红色文字为·我已完成审核,且保证数据完全无误·')
            }
            this.ValidImportExcelData(workbook, fileItem);
          } catch (err) {
            console.log(err);
            this.$message.error('读取文件内容失败，请检查表格是否完整或被密码保护重试');
            this.resetFiles();
            this.$loading().close();
          }
        }
        reader.readAsArrayBuffer(file); //读取上传的excel文件
      } catch (err) {
        console.log(err)
        this.$message.error('读取文件内容失败，请检查表格是否完整或被密码保护重试');
        this.resetFiles();
        this.$loading().close();
      }
      return false; //无论最后校验如何，都不往服务器上传。
    },
    //导入错误
    uploadError() {

    },
    /**
     * @param workbook 读取到的excel信息
     * @param fileItem 当前excel的最基本信息。包含名称和更新时间
     */
    ValidImportExcelData(workbook, fileItem) {
      let validColIndexs;
      let validColKeys;
      let validColKeyNames;
      let validColPattern;
      let validColKeyNameTexts;
      if (!workbook.SheetNames || workbook.SheetNames.length == 0) {
        this.resetFiles();
        // 没有工作表表名，有问题
        return this.$message.error('导入的excel文件的工作表有问题，请检查。 请注意：系统只读excel里第一个工作表。');
      }
      if (!workbook.SheetNames[0] || !workbook.Sheets[workbook.SheetNames[0]] || !workbook.Sheets[workbook.SheetNames[0]]['!ref']) {
        this.resetFiles();
        // 没有有效区间数据
        return this.$message.error('导入的excel文件的工作表里表格数据有问题，请检查。请检查是否有数据在表格中');
      }
      let outdata = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]); // 对应的行，如果有列值为空，那么json就没有对应的key
      if (outdata.length == 0) {
        this.resetFiles();
        this.$loading().close();
        return this.$message.error("请保证表格有数据")
      } else {
        for (let i = 0; i < outdata.length; i++) {
          for (const key in outdata[i]) {
            if (key == '__EMPTY') {
              this.resetFiles();
              this.$loading().close();
              return this.$message.error("有数据列表没有表头请检查")
            }
          }
        }
      }
      if (outdata.length > 100) {
        this.resetFiles();
        this.$loading().close();
        return this.$message.error("一次导入最多100条哦！");
      }
      //提取表格模板中特殊识别符
      validColIndexs = this.checkArr; //待校验的列索引
      validColKeys = this.ReadeRows; //待读取的列索引
      //带读取的索引列字段名
      validColKeyNames = this.ReadeRowsKey;
      //待校验的列索引的正则
      validColPattern = this.checkArrPttern;
      validColKeyNameTexts = this.EnToZnObj;
      const validColValues = Object.values(this.EnToZnObj); // 表头名，用于循环判断每一个表头是否跟用户上传的模板表头一致
      for (const key in outdata[0]) {
        const trimKey = key.trim();
        // 只要有一个匹配不上，就直接跳出
        if (!validColValues.includes(trimKey)) {
          this.resetFiles();
          this.$loading().close();
          return this.$message.error("导入表与你所选的模板表不一致，请检查");
        }
      }

      let sheet = workbook.Sheets[workbook.SheetNames[0]];
      const result = [];
      workbook.SheetNames.forEach(sheetName => {
        result.push({
          sheetName: sheetName,
          sheet: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],
            {
              head: 0,
              defval: " "
            }
          )
        });
      })
      // let validArea = sheet['!ref'].split(':');
      // let validRowKeys = validArea[1] ? validArea[1].replace(/[^0-9]/ig,"") : validArea[0].replace(/[^0-9]/ig,"");  //检查有效范围，一般取第二个边界值。但是只有起始一格的情况下只会有第一个边界值
      let validRowKeys = result[0].sheet.length;  //字符串格式转为数字格式，以便于作为循环判断边界
      // console.log(validRowKeys,1164)
      /**
       * @var list excel中的数据集。
       * @var errorArray excel中数据集的异常数据。即上面项存在为空项
       */
      let list = [], errorArray = [];
      const {row: startRow} = this.fieldStart;
      const startRowIndex = startRow + 1; // 获取后端返回的模板开始行数 + 1
      concatOrders:  for (let i = startRowIndex; i <= validRowKeys + startRow; i++) {
        //默认填充行数
        let item = {row: i}, validData = true, errorInfos = [];
        for (let j = 0; j < validColKeys.length; j++) {
          // 拼装键值对
          item[validColKeyNames[j]] = sheet[validColKeys[j] + i] ? sheet[validColKeys[j] + i].v : '';
          if (typeof item[validColKeyNames[j]] == 'string') item[validColKeyNames[j]] = item[validColKeyNames[j]].trim(); //去掉前后空格
          // // 检查是不是要进行验证的那几列
          if (validColIndexs.includes(validColKeys[j])) {
            if (
              (validColPattern[j] == 'mobile' && !/^1[3456789]\d{9}$/.test(item[validColKeyNames[j]])) || //常规字符格式
              (validColPattern[j] == 'require' && !(item[validColKeyNames[j]])) ||
              (validColPattern[j] == 'require|unique' && !(item[validColKeyNames[j]])) ||
              (validColPattern[j] == 'require|money' && !/^(\d|[1-9]\d+)(\.\d+)?$/.test(item[validColKeyNames[j]]))
              // (validColPattern[j] == 'require|unique' && !(item[validColKeyNames[j]]))
            ) {
              errorInfos.push(`${validColKeyNameTexts[validColKeyNames[j]]}不符合要求(不能为空且不能有特殊字符)`);
              validData = false;
            }
          }
        }
        if (!item.order_sn || !item.id) {
          this.$message.warning('检测到你有空的提现编号或者提现标识符，已给您删除')
          continue concatOrders
        };
        //如果是没有订单号的，直接忽略
        if (item.id && !/^\d+$/.test(item.id)) {
          errorInfos.push(`标识不符合要求(数字格式)`);
          validData = false;
        } else if (item.id === '') {
          delete item.id;
        }
        if (item.total_price && !/^(\d|[1-9]\d+)(\.\d+)?$/.test(item.total_price)) {
          errorInfos.push(`标识不符合要求(金额格式)`);
          validData = false;
        } else if (item.total_price === '') {
          delete item.total_price;
        }
        if (item.handing_fee && !/^(\d|[1-9]\d+)(\.\d+)?$/.test(item.handing_fee)) {
          errorInfos.push(`标识不符合要求(数字格式)`);
          validData = false;
        } else if (item.handing_fee === '') {
          delete item.handing_fee;
        }
        list.push(item);
        if (!validData) errorArray.push({
          row: i,
          errorInfos: errorInfos
        });
      }
      let data = {
        name: fileItem.name,
        lastModified: fileItem.lastModified,
        withraws: list,
        errors: errorArray
      }
      if (this.tableDataErrorList.length == 0) {
        this.rederTable(outdata, this.exportModel)
      }
      try {
        // 无论检查重复数据是否成功，都要关闭loading
        this.getDuplicateDatas(data, 'order_sn');
        this.getDuplicateDatas(data, 'id');
        this.$loading().close();
      } catch (err) {
        this.$loading().close();
      }
    },
    messageLook(id) {
      if (!id) return this.$message.error("这条数据有问题，请进行筛选导入，且不要勾选该数据")
      if (!this.count.includes(id)) {
        this.count.push(id);
      } else {
        this.detailVisible = false;
        return this.$message.warning("这条数据以审核，请审核其他数据")
      }
      this.checkPerson();
      this.selectable();
      this.detailVisible = false;
    },
    //如果表格没问题拿数据渲染表格
    rederTable(arrList, type) {
      const result = arrList.map(item => {
        return this.zhToEn(item, this.zhToEnObj);
      });
      this.dataList = result;
      this.getTableData();
      this.checkPerson();
      if (type == '1') {
        this.getAllPrice(this.dataList);
      } else if (type == '2' || type == '3') {
        this.getAllPrice(this.multipleSelection)
      }
    },
    //重置
    resetFiles() {
      this.fileList = [];
      this.fileDatas = [];
      this.selection = [];
      this.withrawPositions = [],
        this.price_total = 0;
      this.handing_fee_total = 0;
      this.total_price_total = 0;
      this.code = "";
      this.duplicateDatas = []
      this.checkboxCodeCd = true;
      this.checked = false;
      this.btnCodeCd = true;
      this.timer && clearInterval(this.timer);
      this.long = 60;
      this.tableDataErrorList = [];
      this.count = [];
      this.multipleSelection = [];
      this.fileName = '';
      this.validDatas = [];
      this.validArrays = [];
      this.tableData = [];
      this.$nextTick(() => {
        if (this.$refs.withraw) {
          this.$refs.withraw.clearFiles();
        }
      });
    },
    //详情
    openDetail(row) {
      let queryVal = {
        order_sn: row.order_sn || row.id
      };
      this.$get("/admin/finance/withdrawDetail", queryVal, res => {
        if (res.data) {
          this.formData = res.data;
          this.detailVisible = true;
        } else {
          return this.$message.warning(`该提现编号${res.msg}`)
        }
      });
    },
    // 中文属性名转换为英文属性名
    zhToEn(item, userArr) {
      const obj = {}; // 转换好的数据保存到obj中
      // 。。。转换过程
      // 定义一个中英文对照表
      //默认对照
      let userRelations = userArr;
      //状态词典对照表
      // '微信支付','汇聚支付','衫德支付','快商打款','线下打款'
      const wordArr = ["已到账", "", "失败", "商城提现", "H5提现", "福利提现",];
      for (const key in item) {
        // key 值是item对象中属性名（中文名）
        const enAttr = userRelations[key]; // 中文属性名对应的英文名
        const xx = wordArr.find(v => v == item[key]);
        if (xx) {
          if (xx == "已到账") {
            obj[enAttr] = "1";
            continue;
          } else if (xx == "") {
            obj[enAttr] = "2";
            continue;
          } else if (xx == "失败") {
            obj[enAttr] = "-1";
            continue;
          } else if (xx == "商城提现") {
            obj[enAttr] = "2";
            continue;
          } else if (xx == "H5提现") {
            obj[enAttr] = "5";
            continue;
          } else if (xx == "福利提现") {
            obj[enAttr] = "7";
            continue;
          } else if (xx == "微信支付") {
            obj[enAttr] = "1";
            continue;
          } else if (xx == "汇聚支付") {
            obj[enAttr] = "2";
            continue;
          } else if (xx == "衫德支付") {
            obj[enAttr] = "3";
            continue;
          } else if (xx == "快商打款") {
            obj[enAttr] = "77";
            continue;
          } else if (xx == "线下打款") {
            obj[enAttr] = "88";
            continue;
          }
        }
        obj[enAttr] = String(item[key]).trim(); // 为obj对象添加enAttr属性 并赋值为原来item中的key属性对应的值
      }
      return obj; // 返回转换好的数据对象
    },
    //支付方式
    paySystem(val) {
      this.PayValue = val

    },
    //接口参数转换
    arrToObj(arr) {
      const listArr = [];
      arr.forEach(item => {
        let obj = {};
        for (const key in item) {
          if (
            key == "bank_account" ||
            key == "payment_no" ||
            key == "price" ||
            key == "user_real_name"
          ) {
            obj[`${key}`] = item[key];
          } else if (!(key == "payment_no")) {
            obj.payment_no = null;
          }
          if (key == "id") {
            obj.withdraw_id = item[key];
          }
        }
        listArr.push(obj);
      });
      return listArr;
    },
    //重置表单
    resetForm() {
      this.$refs.epxortForm.resetFields();
    },
    //查重
    getDuplicateDatas(fileData, type) {
      this.tableDataErrorList = fileData.errors
      this.fileName = fileData.name
      let withraws = fileData.withraws;
      this.dataList = withraws
      for (let i = 0; i < withraws.length; i++) {
        let item = fileData.withraws[i];
        let validKey = item[type] || '';
        if (this.validDatas.includes(validKey)) {
          // 如果已经存在了该订单编号
          if (!this.duplicateDatas.includes(validKey)) {
            let originIndex = this.validDatas.indexOf(validKey);
            this.duplicateDatas.push({validKey, row: item.row});
          }
        } else {
          this.validDatas.push(validKey); //还是第一次检验这条订单号
          if (this.radioModel == 5) {
            this.validArrays.push({  //记录这单号对应的行数，用来做校验溯源用
              id: validKey,
              row: item.row,
            })
          } else if (this.radioModel == 3 || this.radioModel == 4) {
            this.validArrays.push({  //记录这单号对应的行数，用来做校验溯源用
              order_sn: validKey,
              row: item.row,
            })
          }
        }
      }
      this.withrawPositions.push(this.validDatas.length);  //划定已验证的表单数据中各个表格的范围边界
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .el-drawer__body {
  overflow: auto;
  /* overflow-x: auto; */
}

.header-text {
  font-weight: 700;
  color: black;
}

/*2.隐藏滚动条，太丑了*/

// /deep/ .el-drawer__container ::-webkit-scrollbar {
//   display: none;
// }
/deep/ .el-drawer__header {
  padding-left: 25px;
  margin-bottom: 0px;
}

/deep/ .el-radio__label {
  font-weight: 700;
}

.error-box {
  display: flex;
  justify-content: space-around;

  .red-error {
    color: red;
  }
}

.errorCard {
  margin: 0px 20px;
  max-height: 500px;
  overflow: scroll;
}

.text {
  font-weight: 700;
  color: black;
  font-size: 20px;
}

/deep/ .el-dialog__close {
  color: red;
  font-size: 30px;
  font-weight: 700;
  transition: 1s all;
}

/deep/ .el-dialog__close:hover {
  transform: rotate(360deg);
}

.exportBtn {
  padding: 25px 20px 20px 25px;
  display: flex;
  justify-content: space-between;
  .el-checkbox {
    display: flex;
    align-items: center;
  }
  .exportBtn-col {
    display: flex;
    justify-content: space-between;

    /deep/ .el-checkbox__label {
      font-weight: 700;
    }
  }
}

.extend-uploader .el-icon-upload {
  font-size: 67px;
}

.extend-uploader {
  margin-left: 20px;

  /deep/ .el-upload {
    padding: 30px 50px;
    border: 2px dashed #a89e9e !important;
  }
}

.import-summary-title {
  font-size: 18px;
  padding: 20px 25px;
  display: flex;
  flex-direction: column;

  .import-summary-title-box {
    display: flex;
    justify-content: space-between;
  }
}

.tips-color {
  margin-top: 10px;
  color: #999;
}

.red {
  color: red;
}

.danger {
  color: #f56c6c;
  font-size: 18px;
  font-weight: 700;
}

.green {
  color: #67c23a;
  font-size: 18px;
  font-weight: 700;
}

/deep/ .el-step__description {
  font-size: 16px;
}

/deep/ .el-dialog {
  border-radius: 10px !important;
}

/deep/ .el-dialog__body {
  border-radius: 10px !important;
}
</style>
