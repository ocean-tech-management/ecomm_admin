<template>
  <div>
    <div v-if="step == 1">
      <div class="table-ctrls">
        <div class="table-title">
          <span class="success-color">1. </span>请选择专区
        </div>
      </div>
      <el-table key="areas" style="width: 100%" :data="areas">
        <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
        <el-table-column label="福利活动名称" prop="title" width="200"></el-table-column>
        <el-table-column label="福利头图" width="120">
            <template slot-scope="scope">
              <img class="thumb-img" :src="scope.row.background_image"/>
            </template>
          </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="confirmArea(scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else-if="step == 2">
      <el-button style="margin-bottom: 10px" type="primary" @click="step -= 1">返回上一步</el-button>
      <div class="table-ctrls">
        <div class="table-title">
          <span class="success-color">2. </span>请选择将用来抽奖的区
        </div>
      </div>
      <el-table key="stages" style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="60" align="center"></el-table-column>
        <el-table-column label="福利期次名称" prop="title" width="150"></el-table-column>
        <el-table-column label="轮数" prop="round_number" width="80" align="center"></el-table-column>
        <el-table-column label="期数" prop="period_number" width="80" align="center"></el-table-column>
        <el-table-column label="目标销售额" prop="sales_price" width="120" align="center"></el-table-column>
        <el-table-column label="创建时间" width="150" prop="create_time"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="confirmStage(scope.row)">选择</el-button>
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
  data() {
    return {
      step: 1,

      areas: [],
      selectAreaCode: null,

      currentPage: 1,
      count: 1,
      dataList: [],

    }
  },
  mounted() {
    this.getAreas();
  },
  methods: {
    reInit() {
      this.step = 1;
    },
    
    //获取区列表
    getAreas() {
      let params = {
      };

      this.$get('/admin/crowdFunding/activityList', params, res => {
        let dataList = res.data || [];

        this.areas = dataList;
      });
    },

    //获取列表
    getList() {
      let params = {
        page: this.currentPage,
        activity_code: this.selectAreaCode,
        result_status: 1  //只筛选已经成功的期
      };

      this.$get('/admin/crowdFunding/periodList', params, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    confirmArea(row) {
      this.selectAreaCode = row.activity_code;
      this.step += 1;
      this.getList();
    },
    confirmStage(row) {
      this.$emit('confirmStage', row);
    }
  }
}
</script>