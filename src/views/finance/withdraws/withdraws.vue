<template>
  <div>
    <div class="subpage-content subpage-content-ctrls">
      <div class="default-container">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
            <el-form-item label="提现编号" prop="order_sn">
              <el-input v-model="queryForm.order_sn" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="提现用户名" prop="username">
              <el-input v-model="queryForm.keyword" placeholder="请输入" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="提现时间" prop="keyword">
              <el-date-picker v-model="times" type="datetimerange" :picker-options="pickerOptions" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" value-format="timestamp" :clearable="false"
                align="right"></el-date-picker>
            </el-form-item>
            <el-form-item label="对账状态" prop="check_status">
              <el-select placeholder="不限" name="check_status" v-model="queryForm.check_status">
                <el-option label="不限" value></el-option>
                <el-option label="通过" :value="1"></el-option>
                <el-option label="不通过" :value="2"></el-option>
                <el-option label="待审核" :value="3"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
              <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
                @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
              <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
                <el-option label="10" :value="10"></el-option>
                <el-option label="500" :value="500"></el-option>
                <el-option label="1000" :value="1000"></el-option>
                <el-option label="2000" :value="2000"></el-option>
                <el-option label="3000" :value="3000"></el-option>
                <el-option label="5000" :value="5000"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">提现列表</div>
          <div class="table-ctrl">
            <template v-if="$auths.includes('excel/withdraw')">
              <el-button v-if="$auths.includes('excel/WithdrawExportList')" type="primary"
                @click="showWeekExcel">查看近7天导出表格</el-button>
              <el-button v-if="$auths.includes('excel/withdrawExport')" type="primary"
                @click="exportExcel">导出excel表格</el-button>
              <el-button v-if="$auths.includes('finance/batchCheckWithdraw')" type="primary"
                @click="importExcel">导入excel表格</el-button>
              <!-- <el-button v-if="$auths.includes('excel/withdrawExportPwd')"  type="primary" @click="getPassword">获取导出表密码</el-button> -->
            </template>
          </div>
        </div>
        <!-- <el-dialog class="importExcl" title="导入提现表格" width="100%" :close-on-click-modal="false" :visible.sync="importWithdrawsVisible">
          <importDrawer ref="importWithDraws"></importDrawer>
        </el-dialog> -->
        <div class="order-profit-overviews">
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城累计需支出奖金</div>
            <div class="order-profit-overview-val">{{ summary.needPayBonus }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城已提现奖金</div>
            <div class="order-profit-overview-val">{{ summary.allWithdrawBonus }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城可提现奖金</div>
            <div class="order-profit-overview-val">{{ summary.canWithdrawBonus }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城冻结奖金</div>
            <div class="order-profit-overview-val">{{ summary.freezeBonus }}</div>
          </div>

          <div class="order-profit-overview">
            <div class="order-profit-overview-title">商城实际支出</div>
            <div class="order-profit-overview-val">{{ summary.realWithdrawBonus }}</div>
          </div>
        </div>

        <div class="order-profit-overviews">
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼累计需支出奖金</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_needPayBonus }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼已提现奖金</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_allWithdrawBonus }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼可提现奖金</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_canWithdrawBonus }}</div>
          </div>
          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼冻结奖金</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_freezeBonus }}</div>
          </div>

          <div class="order-profit-overview">
            <div class="order-profit-overview-title">拼拼实际支出</div>
            <div class="order-profit-overview-val">{{ summary.ppyl_realWithdrawBonus }}</div>
          </div>
        </div>

        <div style="height: 20px"></div>

        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="提现编号" width="180" prop="order_sn"></el-table-column>
          <el-table-column label="用户昵称" prop="user_name">
            <template slot-scope="scope">
              <div class="form-content-static">
                <span>{{ scope.row.user_name }}</span>
                <span v-if="scope.row.related_user">
                  <el-tooltip class="item" effect="dark" content="该用户使用了其他账号的签约信息" placement="top">
                    <el-button style="font-size: 24px; vertical-align: middle" class="error-color" type="text"
                      icon="el-icon-warning" size="medium"></el-button>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="真实用户名" prop="user_real_name" width="100"></el-table-column>
          <el-table-column label="申请提现金额" width="120" prop="total_price"></el-table-column>
          <el-table-column label="提现手续费" width="100" prop="handing_fee"></el-table-column>
          <el-table-column label="提现金额" width="120" prop="price"></el-table-column>
          <el-table-column label="提现类型" width="100" align="center">
            <template slot-scope="scope">
              {{ withdrawTypeTexts[scope.row.withdraw_type] }}
            </template>
          </el-table-column>
          <el-table-column label="乐小活签约" width="100" align="center">
            <template slot-scope="scope">
              <div v-if="scope.row.contract_exempt_letfree">免签约</div>
              <div v-else-if="scope.row.contract_letfree">已签约</div>
              <div v-else class="warning-color">未签约</div>
            </template>
          </el-table-column>
          <el-table-column label="提现时间" width="150" prop="create_time"></el-table-column>
          <el-table-column label="到账时间" width="150" prop="payment_time"></el-table-column>
          <el-table-column label="审核状态" width="80" prop="check_status"></el-table-column>
          <el-table-column label="到账状态" width="80">
            <template slot-scope="scope">
              <div v-if="scope.row.payment_status == -1" class="error-color">{{ payStatusText[scope.row.payment_status] }}
              </div>
              <div v-else>{{ payStatusText[scope.row.payment_status] }}</div>
            </template>
          </el-table-column>
          <el-table-column label="打款方式" width="80">
            <template #default="{ row }">
              {{ pay_channelText[row.pay_channel] }}
            </template>
          </el-table-column>
          <el-table-column label="操作" wdith="200">
            <template slot-scope="scope">
              <template v-if="$auths.includes('finance/withdrawDetail')">
                <el-button type="text" size="default" @click="openDetail(scope.row)">详情</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-show="dataList && dataList.length > 0" class="pagination">
          <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
            layout="total, prev, pager, next" :page-count="count"></el-pagination>
        </div>
      </div>

      <el-dialog title="提现详情" width="1000px" :close-on-click-modal="false" :visible.sync="detailVisible">
        <WithdrawDetail :formData="formData" :dataList="dataList"></WithdrawDetail>
        <div slot="footer" class="dialog-footer">
          <template v-if="$auths.includes('finance/checkWithdraw')">
            <!--<el-button
            v-if="formData.check_status == 3"
            type="warning"
            size="default"
            @click="confirmItem"
          >同意申请</el-button>-->
            <el-button v-if="formData.check_status == 3" type="warning" size="default" plain
              @click="confirmWithOtherPlatform">同意申请</el-button>
            <el-button v-if="formData.check_status == 3" type="danger" size="default"
              @click="showRejectItem">拒绝申请</el-button>
          </template>
          <el-button type="primary" @click="detailVisible = false">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="拒绝理由" width="600px" :close-on-click-modal="false" :visible.sync="remarkVisible">
        <div>
          <el-form>
            <el-form-item label="拒绝理由" label-width="100px">
              <el-input style="width: 450px;" auto-complete="off" placeholder="请填写拒绝理由哦" v-model="remark"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="remarkVisible = false">取 消</el-button>
          <el-button type="primary" @click="rejectItem">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog @close="closeAgreementVisible" :visible.sync="agreementVisible">
        <template #title>
          <div class="agrermentTitle">用户隐私保护协议</div>
        </template>
        <div v-html="agreementText"></div>
        <template #footer>
          <div slot="footer" class="dialog-footer">
            <el-button @click="agreementTo" type="primary" :disabled="btnCodeCd">
              同意<span v-if="btnCodeCd">(阅读{{ long }}秒可提交)</span>
            </el-button>
          </div>
        </template>
      </el-dialog>
      <withdrawsDrawer :filter="filter" v-if="drawerVisible" :drawerVisible.sync="drawerVisible"></withdrawsDrawer>
      <importDrawer v-if="importDrawerVisible" :importDrawerVisible.sync="importDrawerVisible"></importDrawer>
      <!--      <showWeekTable  v-if="showWeekTableVisible" :showWeekTableVisible.sync="showWeekTableVisible"></showWeekTable>-->
      <el-dialog title="其他平台打款" :visible.sync="otherPayDialogVisible" width="400px" @close="otherPayClose">

        <el-row style="width: 100%;" type="flex" justify="center">
          <el-form :inline="true" label-width="100px" @submit.native.prevent>
            <el-form-item label="打款流水号">
              <el-input v-model="otherPay.payment_no" style="width: 220px;" placeholder="请输入打款流水号"
                @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item label="打款方式">
              <el-select v-model="otherPay.pay_channel" style="width: 220px;" placeholder="请选择打款方式" @change="paySystem">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-row style="width: 100%;" type="flex" justify=center>
            <el-button @click="otherPayDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="otherPaySubmit">确 定</el-button>
          </el-row>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import moment from "moment";

import WithdrawDetail from "@/partialviews/finance/withdraw/WithdrawDetail";
import withdrawsDrawer from '@/partialviews/finance/withdraw/WithdrawsDrawer'
import showWeekTable from "@/partialviews/finance/paySupplier/showWeekTable";
import importDrawer from '@/partialviews/finance/paySupplier/importDrawer';
export default {
  name: "withdraws",
  components: {
    WithdrawDetail,
    withdrawsDrawer,
    importDrawer,
    showWeekTable
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      agreementText:'<p><strong>广州美丽会生活科技有限公司 以下简称甲方, 厦门星兴晟科技有限公司 以下简称乙方</strong></p><p><br></p><p>鉴于甲方系统在与乙方使用者操作期间知悉、由于操作信息为个人隐私信息，具有保密性，为有效防止个人隐私信息被不当公开、揭露或泄露，避免因此给甲方造成经济损失，甲方与乙方协商一致签订如下保密协议，以明确双方权利义务。</p><p><br></p><p>一、保密内容，甲方与乙方双方确认，乙方应承担保密义务的甲方商业秘密范围包括但不限于以下内容:</p><p>1.1.不得以任何方式将文件信息提供给第三方。</p><p><br></p><p>二、双方的权利和义务</p><p>2.1.乙方于合作期限内及合作终止后任何时间内，均应严格遵守系统的保密制度，对合作期间所导出的一切有关系统的客户隐私信息均负有保密义务。未经甲方书面同意，乙方不得将任何客户隐私信息用于任何与执行合作无关之事项或以任何形式向任何第三方泄漏任何客户隐私信息。不得使用或允许任何第三方使用以不正当的手段所获取的任何有关客户个人隐私信息，或向任何第三方探寻与合作无关的客户隐私信息。</p><p><br></p><p>2.2.乙方持有或保管的一切记录有甲方系统下客户的隐私信息的文件均归甲方所有，无论这些信息有无商业上的价值，在双方结束时，乙方必须无条件，无保留地归还给甲方。</p><p><br></p><p>2.3.任何原因导致双方合作目的未能实现，乙方应在甲方接到通知后3日内返还并销毁其所获取的保密信息，包括但不局限于相关文件、资料，不得以任何理由和方式保留;</p><p><br></p><p>三、违约责任</p><p>3.1乙方未遵守本协议约定的保密义务，应向甲方承担违约赔偿责任，包括但不限于甲方获取或开发该商业秘密的全部费用以及未来全部合理的预见性利润;</p><p><br></p><p>3.2乙方因其违约获利则应把所得的利益支付给甲方，乙方违反保密义务而给甲方造成损失的，甲方还有权要求乙方因维权所需而方赔偿所有直接或间接损失，包括但不限于乙方因此所获取的利益或给甲方造成的实际损失，支付的咨询费、调查费、公证费、保全费、评估费、鉴定费、律师费、诉讼费等一切费用.</p><p><br></p><p>3.3乙方侵害甲方商业秘密情节严重，甲方有权将其移交司法机构，依法追究刑事责任.</p><p><br></p><p>3.4乙方如违反本协议的相关规定，甲方有权单方解除与乙方的合作关系，且不承担任何的损害赔偿责任。</p><p><br></p><p>3.5乙方承担违约赔偿责任并不免除其继续按照本协议的约定承担保密义务。</p><p><br></p><p>四、特此声明</p><p><strong style="font-size: 20px;">由于乙方未履行保密义务。所造成的一切损失均与系统无关！！</strong></p>',
      //协议模态框显示
      agreementVisible:false,
      //显示近七天导出的抽屉
      showWeekTableVisible:false,
      //获取密码的弹窗
      passwordDialogVisible:false,
      //打款方式
      otherPayDialogVisible:false,
      //form
      passwordForm:{
        admin_id:JSON.parse(localStorage.getItem('userInfo')).id||'',
        admin_pwd:'',
        file_export_id:'',
      },
      pay_channelText: {
        [1]: "微信支付",
        [2]: "汇聚支付",
        [3]: "衫德支付",
        [4]: "快商",
        [5]:"中数科",
        [88]: "线下打款"
      },
      exportExcelPassword:'',
      // 按钮是否CD
      btnCodeCd: true,
      // CD长度
      long: 10,
      //审核复选框
      //抽屉
      drawerVisible:false,
      importDrawerVisible:false,
      queryForm: {
        keyword: "",
        order_sn: "",
        check_status: "",
        exportPageNum: 1,
        exportNum: 1000
      },
      filter: {
        keyword: "",
        order_sn: "",
        check_status: "",
        start_time: moment().subtract(7, 'days').valueOf(),
        end_time: moment().valueOf(),
        exportPageNum: 1,
        exportNum: 1000
      },

      dataList: [],
      exclDataLsit:[],
      detailVisible: false,
      formData: {},
      summary: {
        needPayBonus: '——',
        allWithdrawBonus: '——',
        canWithdrawBonus: '——',
        realWithdrawBonus: '——',
        freezeBonus: '——'
      },

      typeText: {
        [1]: "常规分润",
        [2]: "普通用户推荐首单返积分",
        [3]: "会员推荐首次分润",
        [4]: "会员订单分润",
      },
      payStatusText: {
        [1]: '已到账',
        [2]: '',
        [-1]: '失败'
      },
      withdrawTypeTexts: {
        [2]: "商城提现",
        [5]: "H5提现",
        [7]: "体验提现"
      },
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
      },{
        value: '4',
        label: '快商'
      },{
        value: '5',
        label: '中数科'
      }, {
        value: '88',
        label: '线下打款'
      }],
      pickerOptions: {
        shortcuts: [{
          text: "今日",
          onClick(picker) {
            let start =  moment(moment().format('YYYY-MM-DD 00:00:00')).valueOf();
            let end = moment(moment().format('YYYY-MM-DD 23:59:59')).valueOf();
            picker.$emit("pick", [start, end]);
          },
        },
          {
            text: "本周",
            onClick(picker) {
              let weekOfday = parseInt(moment().format('d')) // 计算今天是这周第几天  周日为一周中的第一天
              let start = moment(moment().subtract(weekOfday, 'days').format('YYYY-MM-DD 00:00:00')).valueOf();
              let end = moment(moment().add(7 - weekOfday - 1, 'days').format('YYYY-MM-DD 23:59:59')).valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "本月",
            onClick(picker) {
              let start = moment(moment(moment().format('YYYY-MM') + '-01').format('YYYY-MM-DD 00:00:00')).valueOf();
              let end = moment(moment(start).add('month', 1).add('days', -1).format('YYYY-MM-DD 23:59:59')).valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一周",
            onClick(picker) {
              let start = moment().subtract(7, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              let start = moment().subtract(30, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              let start = moment().subtract(90, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      times: [moment().subtract(7, 'days').valueOf(), moment().valueOf()],

      remark: false,
      remarkVisible: false,
      //导入弹窗
      importWithdrawsVisible:false,
      // 审核提现申请
      otherPay: {
        payment_no: '',
        pay_channel: ''
      },
    };
  },
  mounted() {
    this.getList();
    this.getSummary();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //支付方式
    paySystem(val){
      this.otherPay.pay_channel = val;
    },
    otherPayClose(){
      this.otherPayDialogVisible=false
    },
    otherPaySubmit(){
      if (!this.otherPay.pay_channel || this.otherPay.pay_channel === '') {
        return this.$message.error("请选择打款方式");
      }
      let params = {
        id: this.formData.id,
        check_status: 3,
        payment_no: this.otherPay.payment_no,
        pay_channel: this.otherPay.pay_channel
      };
      this.$post("/admin/finance/checkWithdraw", params, (res) => {
        this.$message.success("操作成功");
        this.reloadPage();
        this.otherPay.payment_no = ''
        this.otherPay.pay_channel = ''
      });
      this.detailVisible = false;
      this.otherPayClose()
    },
    //获取导出表密码
    getPassword(){
      this.passwordDialogVisible=true;
    },
    resetPasswordForm(){
      this.$refs.passwordForm.resetFields();
      this.exportExcelPassword='';
      this.long=10
    },
    // closePasswordDialogVisible(){
    //    this.resetPasswordForm();
    //    this.passwordDialogVisible=false;
    // },
    // async submitGetPassword(){
    //    try {
    //     await this.$refs.passwordForm.validate()
    //     this.$post('/admin/excel/withdrawExportPwd',this.passwordForm,(res)=>{
    //       if(res.error_code==0){
    //         this.$message.success(`${res.msg}`);
    //         this.exportExcelPassword=res.data.code;
    //       }
    //       console.log(res);
    //     })
    //    } catch (error) {
    //     return error;
    //    }
    // },
    // 开启计时
    startCd(time){
      this.checkboxCodeCd=true;
      this.codeCd = true;
      if(this.timer){
        clearInterval(this.timer)
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
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: "",
        order_sn: "",
        check_status: "",

        start_time: moment().subtract(7, 'days').valueOf(),
        end_time: moment().valueOf(),

        exportPageNum: 1,
        exportNum: 1000
      };
      this.times = [moment().subtract(7, 'days').valueOf(), moment().valueOf()];
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        order_sn: this.queryForm.order_sn,
        check_status: this.queryForm.check_status,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      };
      if(this.times && this.times.length == 2) {
        this.filter.start_time = this.times[0];
        this.filter.end_time = this.times[1];
      }
      this.getList();
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        order_sn: this.filter.order_sn,
        keyword: this.filter.keyword,
        check_status: this.filter.check_status,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };

      this.$get("/admin/finance/withdrawList", queryVal, (res) => {
        this.dataList = res.data.list || [];

        this.count = res.data.pageTotal;
      });
    },
    getSummary() {
      if (!this.$auths.includes('finance/withdrawSummary')) return;
      let params = {
        order_sn: this.filter.order_sn,
        keyword: this.filter.keyword,
        check_status: this.filter.check_status,
      };


      // this.$sget("/admin/finance/withdrawSummary", params, (res) => {
      //   let data = res.data;
      //   if(data && !data.needPayBonus) data = null;
      //   this.summary = data || {
      //     needPayBonus: '——',
      //     allWithdrawBonus: '——',
      //     canWithdrawBonus: '——',
      //     realWithdrawBonus: '——',
      //     freezeBonus: '——'
      //   };
      // });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    openDetail(row) {
      let queryVal = {
        order_sn: row.order_sn,
      };

      this.$get("/admin/finance/withdrawDetail", queryVal, (res) => {
        this.formData = res.data;
        this.detailVisible = true;
      });
    },
    confirmItem() {
      this.$confirm("您将通过该提现申请，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          let params = {
            id: this.formData.id,
            check_status: 1,
          };
          this.$post("/admin/finance/checkWithdraw", params, (res) => {
            this.$message.success("通过申请成功");
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
    },
    confirmWithOtherPlatform() {
      this.otherPay.payment_no = ''
      this.otherPay.pay_channel = ''
      this.otherPayDialogVisible=true;
    },
    showRejectItem() {
      this.remark = "";
      this.remarkVisible = true;
    },
    rejectItem() {
      this.$confirm("您将拒绝该提现申请，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (this.remark === "") {
            return this.$message.error("请填写拒绝原因");
          }
          let params = {
            id: this.formData.id,
            check_status: 2,
            remark: this.remark,
          };
          this.$post("/admin/finance/checkWithdraw", params, (res) => {
            this.$message.success("拒绝申请成功");
            this.remarkVisible = false;
            this.detailVisible = false;
            this.reloadPage();
          });
        })
        .catch(() => {});
    },
    //导入excel表格
    importExcel(){
      this.importDrawerVisible=true;
    },
    //显示近七天导出的表格信息
    showWeekExcel(){
      // this.showWeekTableVisible=true;
      this.$router.push('/withdrawExportList');
    },
    //用户同意了协议
    agreementTo(){
      this.closeAgreementVisible()
      //显示导出
      this.drawerVisible=true;
    },
    closeAgreementVisible(){
      this.agreementVisible=false;
      this.btnCodeCd=true;
      this.long=10;
    },
    // 导出excel表格
    exportExcel() {
      this.agreementVisible=true
      this.startCd(10)
    },
  },
};
</script>


<style lang="less" scoped>
.order-profit-overviews {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}

.order-profit-overview {
  width: 160px;
  min-width: 140px;
  max-width: 160px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, .1);
}

.order-profit-overview-title {
  margin-top: 10px;
  font-size: 18px;
  white-space: nowrap;
}

.order-profit-overview-val {
  margin-top: 10px;
  font-size: 16px;
  white-space: nowrap;
}

.sku-select-trigger {
  color: #66b1ff;
  user-select: none;
  cursor: pointer;
}

.sku-select-trigge-clear {
  margin-left: 10px;
  color: #f00;
  user-select: none;
  cursor: pointer;
}

.agrermentTitle {
  text-align: center;
  font-weight: 700;
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

/deep/.el-dialog {
  border-radius: 10px !important;
}

/deep/.el-dialog__body {
  border-radius: 10px !important;
}
</style>
