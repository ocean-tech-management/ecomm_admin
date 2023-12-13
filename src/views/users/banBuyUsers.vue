<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">
          禁售用户列表
          <SloganTip type="danger"></SloganTip>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('user/banBuy')">
            <el-button type="primary" @click="showAssign">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="80">
        </el-table-column>
        <el-table-column label="姓名" width="220" prop="name">
        </el-table-column>
        <el-table-column label="手机号码" width="180" prop="phone"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('user/banBuy')">
              <el-button class="error-color" type="text" size="small" @click="cancelBanBuy(scope.row)">取消身份</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    <el-dialog width="800px" :close-on-click-modal="false" :visible.sync="assignVisible">
      <div slot="title" class="el-dialog__title">
        新增禁售人员
        <SloganTip type="danger"></SloganTip>
      </div>
      <Assign :formData="formData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignUser">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Assign from '@/partialviews/user/banBuyUser/Assign';
import SloganTip from '@/components/SloganTip'
export default {
  name: 'banBuyUsers',
  components: {
    Assign,
    SloganTip
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],

      formData: {},
      assignVisible: false

    };
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
        keyword: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/user/banBuyUserList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAssign() {
      this.formData = {
        uid: ''
      }
      this.assignVisible = true;
    },
    assignUser() {
      let params = {
        uid: this.formData.uid,
        ban_status: 1
      }
      this.$post('/admin/user/banBuy', params, res => {
        this.assignVisible = false;
        this.$message.success('操作成功');
        this.reloadPage();
      });
    },

    cancelBanBuy(row) {
      this.$confirm(`是否确定移除 ${row.name} 的禁售用户的身份？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          uid: row.uid,
          ban_status: 2
        }
        this.$post('/admin/user/banBuy', params, res => {
          this.$message.success('操作成功');
          this.reloadPage();
        });
      }).catch(() => {})
    },


  }
};
</script>
