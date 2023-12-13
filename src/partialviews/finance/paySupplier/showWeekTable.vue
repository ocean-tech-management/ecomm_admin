<template>
  <div>
    <el-drawer
      title="近七天提现导出记录"
      :visible.sync="showWeekTableVisible"
      :before-close="changeDrawer"
      class="drawer"
      size="100%">
      <template #title>
        <span class="header-text">近七天提现导出记录</span>
      </template>
      <!-- 查询工具栏 -->
      <el-card class="card-margin">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="提现时间">
            <el-date-picker
              v-model="times"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="timestamp"
              :clearable="false"
              @change="dateChange"
              align="right"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="selectTable">查询</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <!-- 用来展示的数据 -->
      <el-card class="card-margin">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="file_name" label="文件名称" width="180"></el-table-column>
          <el-table-column prop="id" label="文件id" width="80"></el-table-column>
          <el-table-column prop="admin_name" width="90" label="导出人昵称"></el-table-column>
          <el-table-column prop="search_data" label="导出时你的筛选条件" width="150">
            <template #default="{row}" >
              <el-tooltip effect="light" placement="top">
                <div slot="content">
                  <div v-if="check_statusText[row.search_data.check_status]">审核状态：{{ check_statusText[row.search_data.check_status]  }}</div>
                  <div v-else>审核状态：<span style="color: #f7b077;">未选择</span> </div>
                  <div v-if="row.search_data.start_time">起始时间：{{ dateExchange(row.search_data.start_time) }}</div>
                  <div v-else>起始时间：<span style="color: #f7b077;">未选择</span> </div>
                  <div v-if="row.search_data.end_time">结束时间：{{ dateExchange(row.search_data.end_time) }}</div>
                  <div v-else>结束时间：<span style="color: #f7b077;">未选择</span> </div>
                  <div v-if="row.search_data.order_sn">提现编号：{{ row.search_data.order_sn }}</div>
                  <div v-else>提现编号：<span style="color: #f7b077;">未选择</span> </div>
                  <div v-if="row.search_data.time_type">是否是从2023-02-23之后的：{{ date_statusText[row.search_data.time_type] }}</div>
                  <div v-else>是否是从2023-02-23之后的：<span style="color: #f7b077;">未选择</span> </div>
                  <div v-if="row.search_data.payment_status">是否到账：{{ date_statusText[row.search_data.payment_status] }}</div>
                  <div v-else>是否到账：<span style="color: #f7b077;">未选择</span> </div>
                  <div v-if="row.search_data.keyword">关键查询：{{ row.search_data.keyword }}</div>
                  <div v-else>关键查询：<span style="color: #f7b077;">未选择</span> </div>
                </div>
                <el-button>筛选条件</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="create_time" width="180" label="导出时间"></el-table-column>
          <el-table-column prop="max_send_num" width="110" label="最大获取次数"></el-table-column>
          <el-table-column prop="send_num" width="80" label="剩余次数"></el-table-column>
          <el-table-column
            prop="file_path"
            label="文件下载路径">
            <template #default="{row}"><a class="a-down" title="这是文件路径，点击即可下载" :href="row.file_path">{{ row.file_path }}</a></template>
          </el-table-column>
          <el-table-column prop="admin_name" fixed="right" label="操作" width="100">
            <template #default="{row}">
              <el-button type="primary" size="small" @click="getPassword(row)">获取密码</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="block">
          <el-pagination
            :current-page="currentPage"
            :pager-count="7"
            :page-count="count"
            layout="total, prev, pager, next"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-card>
    </el-drawer>
    <el-dialog
      title="获取导出表格的密码"
      :visible.sync="passwordDialogVisible"
      @close="closePasswordDialogVisible"
      width="400px"
    >
      <el-form label-width="80px" :model="passwordForm" ref="passwordForm">
        <el-form-item label="操作密码" prop="admin_pwd" :rules="[{ required: true, message: '密码不能为空'}]">
          <el-input type="password" v-model="passwordForm.admin_pwd"></el-input>
        </el-form-item>
      </el-form>
      <div v-if="exportExcelPassword">
        <span class="exportExcelPassword">密码：{{ exportExcelPassword }}</span>
        <div style="color:red;font-weight: 700;text-align: center;">为了安全考虑!请记住密码且不要交给其他人</div>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="resetPasswordForm">重 置</el-button>
      <el-button type="primary" @click="submitGetPassword" :disabled="exportExcelPassword?true:false">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
/*
 *@Date: 2023-03-27 15:23:39
 *@Description: 模块描述
*/
import moment from 'moment';
export default {
  name: '',
  props:{
    showWeekTableVisible:false
  },
  data () {
    return {
      statusText:{
        [1]:"正常",
        [2]:"禁用",
        [-1]:"删除",
      },
      check_statusText:{
        [1]:"通过",
        [2]:"不通过",
        [3]:'待审核'
      },
      date_statusText:{
        [1]:"是",
        [2]:'否'
      },
      //打款方式
      paySutuasText: {
        [1]:'微信支付',
        [2]:'汇聚支付',
        [3]:'衫德支付',
        [4]:'快商',
        // [5]:'中数科',
        [88]:'线下打款'
      },
      passwordForm:{
        admin_id:'',
        admin_pwd:'',
        file_export_id:'',
      },
      passwordDialogVisible:false,
      exportExcelPassword:'',
      times: [moment().subtract(1, 'days').valueOf(), moment().valueOf()],
      queryForm: {
        type:'withdraw',
        start_time: moment().subtract(1, 'days').valueOf(),
        end_time: moment().valueOf(),
        page:'',
      },
      currentPage: 1,
      count: 1,
      pageTotal:0,
      pickerOptions:{
        shortcuts: [
          {
            text: "最近一天",
            onClick(picker) {
              let start = moment().subtract(1, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近俩天",
            onClick(picker) {
              let start = moment().subtract(2, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三天",
            onClick(picker) {
              let start = moment().subtract(3, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近四天",
            onClick(picker) {
              let start = moment().subtract(4, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近五天",
            onClick(picker) {
              let start = moment().subtract(5, 'days').valueOf();
              let end = moment().valueOf();
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近六天",
            onClick(picker) {
              let start = moment().subtract(6, 'days').valueOf();
              let end = moment().valueOf();
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
        ],
      },
      tableData: []
    }
  },
  created () {
    this.getList()
  },
  mounted () {},
  methods: {
    //获取数据
    getList(){
      let params={
        type:this.queryForm.type,
        start_time:this.queryForm.start_time,
        end_time:this.queryForm.end_time,
        page:this.currentPage,
      }
      this.$post('admin/excel/WithdrawExportList',params,(res)=>{
        this.tableData=res.data.list;
        this.count=res.data.pageTotal
      })
    },
    //时间戳转日期格式
    dateExchange(time){
      if(time){
        const timeType=Number(time);
        return moment(timeType).format('YYYY-MM-DD HH:mm:ss');
      }
    },
    resetPasswordForm(){
      this.$refs.passwordForm.resetFields();
      this.exportExcelPassword='';
    },
    closePasswordDialogVisible(){
      this.resetPasswordForm();
      this.passwordDialogVisible=false;
    },
    getPassword(row){
      this.passwordForm.admin_id=row.admin_uid;
      this.passwordForm.file_export_id=row.id;
      this.passwordDialogVisible=true;
    },
    handleNodeClick(data) {},
    //关闭之前
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});
    },
    //抽屉是否显示
    changeDrawer(){
      this.$confirm('确认退出？')
        .then(() => {
          this.$emit("update:showWeekTableVisible", !this.showWeekTableVisible);
        })
        .catch(() => {});
    },
    //筛选
    selectTable(){
      //此处调接口
      this.getList()
    },
    handleCurrentChange(value){
      this.currentPage = value;
      this.getList();
    },
    dateChange(val){
      this.queryForm.start_time=val[0];
      this.queryForm.end_time=val[1];
    },
    async submitGetPassword(){
      try {
        await this.$refs.passwordForm.validate()
        this.$post('/admin/excel/withdrawExportPwd',this.passwordForm,(res)=>{
          if(res.error_code==0&&res.data.code){
            this.$message.success(`${res.msg}`);
            this.exportExcelPassword=res.data.code;
            this.getList()
          }else{
            this.$message.error("获取密码失败，请重试")
          }
        })
      } catch (error) {
        return error;
      }
    },
  },
}
</script>

<style lang="less" scoped>
.header-text{
  color:black;
  font-weight: 700;
}
.card-margin{
  margin: 10px 20px;
}
/deep/ .el-dialog__close{
  color: red;
  font-size: 30px;
  font-weight: 700;
  transition: 1s all;
}
/deep/ .el-dialog__close:hover{
  transform: rotate(360deg);
}
/deep/ .el-form-item{
  // margin-bottom: 0px;
}
// 去掉eltable的hover效果
/deep/ .el-table tbody tr:hover > td {
  background-color: transparent !important;
}
.exportExcelPassword{
  color: #18a689;
  font-size: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
}
.a-down{
  outline: none;
  color: #128dff;
}
.ellipsis {
  /*强制文本在一行内显示*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/deep/.el-dialog {
  border-radius: 10px !important;
}
/deep/.el-dialog__body {
  border-radius: 10px !important;
}
</style>
