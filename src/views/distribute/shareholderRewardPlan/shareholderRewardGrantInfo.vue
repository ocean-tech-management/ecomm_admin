<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <!-- <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form> -->
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">股东奖发放明细 <span class="success-color">{{planData.plan_name || ''}}</span></div>
      </div>
      <div v-if="planData.total_reward_price" class="shareholder-info-overviews">
        <div class="shareholder-info-overview">
          <div class="shareholder-info-overview-title">奖池总金额</div>
          <div class="shareholder-info-overview-val">{{planData.total_reward_price}}</div>
        </div>
      </div>

      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="80"></el-table-column>
        <el-table-column label="用户名" prop="name" width="150"></el-table-column>
        <el-table-column label="手机号码" prop="phone" width="150"></el-table-column>
        <el-table-column label="奖励层级" prop="level" width="140"></el-table-column>
        <el-table-column label="奖励比例" prop="vdc" width="140"></el-table-column>
        <el-table-column label="奖励金额" prop="real_divide_price" width="150"></el-table-column>
        <el-table-column label="操作"></el-table-column>
        
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
  name: 'shareholderRewardGrantInfo',
  data() {
    return {
      plan_sn: null,

      currentPage: 1,
      count: 1,

      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },

      planData: {},
      dataList: [],
      selection: [],
      formData: {},   //新增规则的数据

      
      statusTexts: {
        [1]: '启用中',
        [2]: '已禁用',
        [-1]: '已被删除'
      },

    };
  },
  mounted() {
    this.plan_sn = this.$route.query.plan_sn;
    if(!this.plan_sn) {
      this.$message.error('计划明细不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/shareholderRewardPlans');
      }, 2000)
    }
    this.getList();
    if(this.$auths.includes('shareholderRewardPlan/info')) {
      this.getData();
    }
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
      this.filter = {
        keyword: this.queryForm.keyword
      }
      this.currentPage = 1;
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        plan_sn: this.plan_sn
      };

      this.$get('/admin/shareholderReward/rewardList', queryVal, res => {
        this.dataList = res.data.list || [];
        
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    getData() {
      let params = {
        plan_sn: this.plan_sn
      }
      this.$get('/admin/shareholderRewardPlan/info', params, res => {
        let data = res.data;
        this.planData = data;
        
      });
    }
    

  }
};
</script>


<style lang="less" scope>
.shareholder-info-overviews {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.shareholder-info-overview {
  width: 120px;
  min-width: 120px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
}
.shareholder-info-overview-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}
.shareholder-info-overview-val {
  margin-top: 10px;
  font-size: 16px;
  color: #999;
  white-space: nowrap;
}



</style>
