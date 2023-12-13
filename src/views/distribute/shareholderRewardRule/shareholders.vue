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
        <div class="table-title">股东列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('shareholderMember/assign')">
            <el-button type="primary" @click="showVipAssignPopup(1)">指定股东</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column label="序号"  width="150" prop="uid">
        </el-table-column> -->
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="user_name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
        <el-table-column label="余额" width="100" prop="total_balance"></el-table-column>
        <el-table-column label="销售额" width="90" prop="team_sales_price"></el-table-column>
        <el-table-column label="销售额偏移量" width="110" prop="team_sales_price_offset"></el-table-column>
        <el-table-column label="身份" width="100" prop="vip_name"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('shareholderMember/assign')">
              <el-button type="text" size="small" @click="showVipAssignPopup(2, scope.row)">调整身份</el-button>
              <el-button class="error-color" type="text" size="small" @click="cancelLevel(scope.row)">取消身份</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :pager-count="7"
          layout="total, prev, pager, next"
          :page-count="count"
        ></el-pagination>
      </div>
    </div>
    <el-dialog title="指定股东" width="800px" :close-on-click-modal="false" :visible.sync="vipAssignVisible">
      <Assign :formData="formData" :leaderData="leaderData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="vipAssignVisible = false">取 消</el-button>
        <el-button type="primary" @click="vipAssign">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Assign from '@/partialviews/distribute/shareholderRewardRule/AssignShareholder';
import moment from 'moment';

export default {
  name: 'shareholders',
  components: {
    Assign
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
      leaderData: [],

      formData: {},
      stepsData: [],

      vipAssignVisible: false,
      stepVisible: false
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

      this.$get('/admin/shareholderMember/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    showVipAssignPopup(type, row = {}) {
      this.formData = {
        name: row.user_name || null,
        uid: row.uid || '',
        assign_type: 1,
        type: type
      }
      if(this.leaderData[0]) {
        if(!row.level) {
          this.formData.level = '';
        } else {
          this.formData.level = row.level;
        }
        this.vipAssignVisible = true;
      } else {
        this.$get('/admin/shareholderVdc/list', null, res => {
          let leaderData = [];
          for(let i = res.data.length - 1; i >= 0; i--) {
            leaderData.push(res.data[i]);
          }
          this.leaderData = leaderData;
          if(!row.level) {
            this.formData.level = '';
          } else {
            this.formData.level = row.level;
          }
          this.vipAssignVisible = true;
        });
      }
    },
    vipAssign() {
      // 指定升级
      let params = {
        uid: this.formData.uid,
        level: this.formData.level,
        assign_type: this.formData.assign_type
      }
      this.$confirm(`是否确定${params.assign_type == 1 ? '指定用户股东身份' : '取消用户股东身份'}操作`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
        this.$post('/admin/shareholderMember/assign', params, res => {
          this.$message.success(`${params.assign_type == 1 ? '指定' : '取消'}股东成功`);
          this.vipAssignVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
    cancelLevel(row) {
      // 指定升级
      let params = {
        uid: row.uid,
        assign_type: 2
      }
      this.$confirm('是否取消该用户的股东身份', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
        this.$post('/admin/shareholderMember/assign', params, res => {
          this.$message.success('取消股东身份成功');
          this.cancelVipVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },


  }
};
</script>
