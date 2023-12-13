<template>
  <div class="subpage-content">
    <div class="default-container">
      <!-- <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入操作人姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div> -->
      <div class="table-ctrls">
        <div class="table-title">
          会员操作记录列表
          <SloganTip type="danger"></SloganTip>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('manager/updateUserPwd')">
            <el-button type="primary" @click="showResetPwd">操作</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="80">
        </el-table-column>
        <el-table-column label="用户昵称" width="100" prop="user_name">
        </el-table-column>
        <el-table-column label="用户手机号码" width="120" prop="user_phone"></el-table-column>
        <el-table-column label="操作人" width="140" prop="admin_name"></el-table-column>
        <el-table-column label="操作类型" width="240">
          <template slot-scope="scope">
            {{ operTypeTexts[scope.row.oper_type] }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="240" prop="remark"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="showDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog title="操作记录详情" width="800px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <Detail ref="detail" :formData="formData"></Detail>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重置/修改密码" width="800px" :close-on-click-modal="false" :visible.sync="resetPwdVisible">
      <div slot="title" class="el-dialog__title">
        重置/修改密码
        <SloganTip type="danger"></SloganTip>
      </div>
      <ResetPwd ref="reset"></ResetPwd>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="validResetInfo">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="请输入管理员操作密码" width="400px" :close-on-click-modal="false" :visible.sync="validResetVisible">
      <div>
        <el-form label-width="100px">
          <el-form-item label="操作" prop="oper_pwd">
            <el-input style="width: 250px" v-model="oper_pwd" type="password" maxlength="24"
              placeholder="请输入操作密码"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmResetInfo">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import ResetPwd from '@/partialviews/user/userOpreate/ResetPwd';
import Detail from '@/partialviews/user/userOpreate/Detail';
import SloganTip from '@/components/SloganTip';
export default {
  components: {
    ResetPwd,
    Detail,
    SloganTip
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        topUserPhone: ''
      },
      filter: {
        keyword: '',
        topUserPhone: ''
      },
      dataList: [],

      operTypeTexts: {
        [1]: '重置登录密码为手机号码后四位',
        [2]: '初始化支付密码'
      },

      formData: {},
      detailVisible: false,

      resetInfo: {},
      resetPwdVisible: false,

      oper_pwd: '',
      validResetVisible: false,

    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        topUserPhone: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        topUserPhone: this.queryForm.topUserPhone
      };
      this.getList();
      this.getUserCount();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        topUserPhone: this.filter.topUserPhone
      };

      if(queryVal.topUserPhone !== '' && !/^1[3456789]\d{9}$/.test(queryVal.topUserPhone)) {
        return this.$message.warning(
          "上级手机号码有误，请提供精准的上级手机号码或留空"
        );
      }

      this.$get('/admin/manager/updateUserPwdList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showResetPwd() {
      if(this.$refs.reset) {
        this.$refs.reset.reInit();
      }
      this.resetPwdVisible = true;
    },

    validResetInfo() {
      let result = this.$refs.reset.confirmResult();
      if(!result) return;
      this.resetInfo = result;
      this.oper_pwd = '';
      this.validResetVisible = true;
    },
    confirmResetInfo() {
      if(this.oper_pwd == undefined || this.oper_pwd == null || this.oper_pwd === '') {
        this.$message.error('请填写操作密码');
        return false;
      }
      this.resetInfo.oper_pwd = this.oper_pwd;
      this.$post('/admin/manager/updateUserPwd', this.resetInfo, res => {
        this.$message.success('操作成功');
        this.resetPwdVisible = false;
        this.validResetVisible = false;
        this.reloadPage();
      });
    },

    showDetail(row) {
      this.formData = row;
      this.detailVisible = true
    }


  }
}
</script>