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
        <div class="table-title">广宣奖发放明细 <span class="success-color">{{planData.plan_name || ''}}</span></div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('excel/propagandaRewardList')">
            <el-button style="margin-right: 15px;" type="primary" @click="exportExcel">
              导出发放明细
            </el-button>
          </template>
        </div>
      </div>
      <div v-if="planData.total_reward_price" class="propaganda-info-overviews">
        <div class="propaganda-info-overview">
          <div class="propaganda-info-overview-title">奖池总金额</div>
          <div class="propaganda-info-overview-val">{{planData.total_reward_price}}</div>
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

import moment from 'moment';
import XLSX from 'xlsx';
export default {
  name: 'propagandaRewardGrantInfo',
  data() {
    return {
      currentPage: 1,
      count: 1,

      plan_sn: null,
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
        window.location.replace('/#/propagandaRewardPlans');
      }, 2000)
    }
    this.getList();
    if(this.$auths.includes('propagandaRewardPlan/info')) {
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

      this.$get('/admin/propagandaReward/rewardList', queryVal, res => {
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
      this.$get('/admin/propagandaRewardPlan/info', params, res => {
        let data = res.data;
        this.planData = data;
        
      });
    },
    
    // 导出excel表格
    exportExcel() {
      // 不分页，全部导出
      let params = {
        plan_sn: this.plan_sn
      };

      this.$get('/admin/excel/propagandaRewardList', params, res => {
        let data = res.data || [];  //全返，无list分页
        

        let excelData = [];
        excelData.push([
          '用户名', 
          '手机号码',
          '奖励层级', 
          '奖励比例', 
          '奖励金额', 
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.name, 
            item.phone,
            item.level,
            item.vdc,
            item.real_divide_price
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 130}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let c4 = XLSX.utils.encode_cell({r: i , c: 4});
          ws[c4].t = 'n';
          
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "广宣奖发放明细");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `广宣奖_${this.planData.plan_name || ''}发放明细${time}.xlsx`);
      });
    }
    

  }
};
</script>


<style lang="less" scope>
.propaganda-info-overviews {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}
.propaganda-info-overview {
  width: 120px;
  min-width: 120px;
  height: 80px;
  padding: 5px 10px;
  margin-right: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 0 5px 1px rgba(0,0,0,.1);
}
.propaganda-info-overview-title {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}
.propaganda-info-overview-val {
  margin-top: 10px;
  font-size: 16px;
  color: #999;
  white-space: nowrap;
}



</style>
