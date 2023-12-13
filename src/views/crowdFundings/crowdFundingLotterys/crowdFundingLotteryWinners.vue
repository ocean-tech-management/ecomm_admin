<template>
  <div class="subpage-content">
    <div class="default-container">
      <!-- <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div> -->
      <div class="table-ctrls">
        <div class="table-title">抽奖活动中奖者列表 <span class="success-color">{{planInfo.title}}</span></div>
        <div class="table-ctrl">
        </div>
      </div>
      <div v-for="(item, index) in dataList" :key="index">
        <div style="font-size: 18px; font-weight: 500; margin-top: 40px; color: #f00">{{item.win_level}}等奖</div>
        <el-table style="width: 100%" :data="item.list">
          <el-table-column label="序号"  width="150" type="index">
          </el-table-column>
          <el-table-column label="头像" width="80">
            <template slot-scope="scope">
              <img v-if="scope.row.user" class="thumb-img" :src="scope.row.user.avatarUrl"/>
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.user">{{scope.row.user.name}}</span>
            </template>
          </el-table-column>
          <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
          <el-table-column label="操作">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'crowdFundingLotteryWinners',
  data() {
    return {
      plan_sn: null,

      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],
      planInfo: {},

    };
  },
  mounted() {
    this.plan_sn = this.$route.query.sn;
    if(!this.plan_sn) {
      this.$message.error('抽奖活动不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/crowdFundingLotterys');
      }, 2000)
      return;
    }
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
        plan_sn: this.plan_sn
      };

      this.$get('/admin/crowdFundingLottery/winInfo', queryVal, res => {
        this.planData = res.data.planInfo;
        let list = res.data.winList;
        let dataList = [];
        for(let i = 0; i < list.length; i++) {
          let item = {
            win_level: list[i][0].win_level,  //确定是中了几等奖
            list: list[i]
          }
          dataList.push(item);
        }
        this.dataList = dataList || [];
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },


  }
};
</script>
