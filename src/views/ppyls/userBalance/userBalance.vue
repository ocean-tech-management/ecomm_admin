<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="真实姓名" prop="real_name">
            <el-input v-model="queryForm.real_name" placeholder="请输入真实姓名" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">佣金余额列表</div>
        <div class="table-ctrl">
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="真实姓名" width="90" prop="real_name"></el-table-column>
        <el-table-column label="等级" width="100" prop="vip_name"></el-table-column>
        <el-table-column label="拼拼佣金" width="80" prop="ppyl_balance"></el-table-column>
        <el-table-column label="商城佣金" width="80" prop="divide_balance"></el-table-column>
        <el-table-column label="总佣金" width="80" prop="total_reward"></el-table-column>
        <el-table-column label="拼拼待领取" width="90" prop="ppylNotReceiveReward"></el-table-column>
        <el-table-column label="拼拼冻结中" width="90" prop="ppylFrozenReward"></el-table-column>
        <el-table-column label="拼拼已到账" width="90" prop="ppylArriveReward"></el-table-column>
        <el-table-column label="已提现" width="80" prop="total_withdraw"></el-table-column>
        <el-table-column label="佣金余额" width="80" prop="total_balance"></el-table-column>
       
        <el-table-column label="操作">
          <template slot-scope="scope">
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
  </div>
</template>

<script>

export default {
  name: 'userBalance',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        real_name: ''
      },
      filter: {
        keyword: '',
        real_name: ''
      },
      dataList: [],
      leaderData: [],
      userCount: 0,

      formData: {},
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
        keyword: '',
        real_name: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        real_name: this.queryForm.real_name
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        real_name: this.filter.real_name
      };


      this.$get('/admin/ppyl/userList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAssign(row) {
      this.formData = {
        uid: row.uid,
        name: row.name,
        time_val: 0,
        time_type: 1
      }
      this.assignVisible = true
    },
    assignUser() {
      if(!(/^-?\d+$/.test(this.formData.time_val))) {
        return this.$message.error(`调整的有效期要为0，1，2，3，4这种整数，请检查下哈`)
      }
      if(this.formData.time_val == 0) return this.assignVisible = false;
      let params = {
        uid: this.formData.uid
      }
      
      if(this.formData.time_type === 1) {
        params.time = parseInt(this.formData.time_val) * 3600 * 24;
      } else if(this.formData.time_type === 2) {
        params.time = parseInt(this.formData.time_val) * 3600;
      } else if(this.formData.time_type === 3) {
        params.time = parseInt(this.formData.time_val) * 60;
      } else {
        params.time = parseInt(this.formData.time_val);
      }
      this.$post('/admin/ppylCVIP/assign', params, res => {
        this.$message.success(`调整成功`);
        this.assignVisible = false;
        this.reloadPage();
      });

    },
    showEditRepurchase() {
      this.repurchaseParams = {
        order_sn: '',
        number: 0
      }
      this.editRepurchaseVisible = true;
    },
    confirmEditRepurchase() {
      let params = {
        order_sn: this.repurchaseParams.order_sn.trim(),
        number: this.repurchaseParams.number
      }
      if(!params.order_sn || params.order_sn === '') {
        return this.$message.error(`请填写作为调整依据的订单号`)
      } 
      if(!params.number || params.number === '') {
        return this.$message.error(`请填写调整次数`)
      } 
      if(!(/^-?\d+$/.test(params.number))) {
        return this.$message.error(`调整的有效期要为0，1，2，3，4这种整数，请检查下哈`)
      }
      this.$post('/admin/ppyl/repurchase', params, res => {
        this.$message.success(`调整成功`);
        this.editRepurchaseVisible = false;
        this.reloadPage();
      });

    },
    showRepurchaseInfos(row) {
      this.userParams = {
        uid: row.uid,
        name: row.name
      }
      if(this.$refs.repurchseInfos) this.$refs.repurchseInfos.reloadData();
      this.repurchaseInfosVisible = true;
    }


  }
};
</script>
