<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="类型" prop="used_code">
            <!-- 使用场景 -->
            <el-select placeholder="不限" name="used_code" v-model="queryForm.used_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in use_types" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优惠类型" prop="type_code">
            <!-- 使用类型 -->
            <el-select placeholder="不限" name="type_code" v-model="queryForm.type_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in types" :label="item.t_name" :value="item.t_type" :key="item.t_type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title warning-color">已销毁的优惠券列表</div>
        <div class="table-ctrl">

        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="170" prop="code"></el-table-column>
        <el-table-column label="优惠名称" prop="name" width="250"></el-table-column>
        <el-table-column label="优惠方式" width="150">
          <template slot-scope="scope">
            <div class="coupon-used">
              {{scope.row.u_name || ''}}
            </div>
            <div>{{couponTypeContent(scope.row)}}  </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">{{scope.row.t_name || ''}}</template>
        </el-table-column>
        <el-table-column label="谁可领" width="100">
          <template slot-scope="scope">{{scope.row.us_name || ''}}</template>
        </el-table-column>
        <el-table-column label="发行量" width="70" prop="number"></el-table-column>
        <el-table-column label="已使用/已发出/剩余数量" width="100">
          <template slot-scope="scope">{{scope.row.used_count}}/{{scope.row.take_count}}/{{scope.row.number - scope.row.take_count}}</template>
        </el-table-column>
        <el-table-column label="活动时间" width="160">
          <template slot-scope="scope">
            {{scope.row.start_time}}~{{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('coupon/userCoupon')">
              <el-button type="text" size="default" @click="$router.push('couponRecords?code=' + scope.row.code)">查看领取记录</el-button>
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

  </div>
</template>

<script>

export default {
  name: 'deleteCoupons',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        type_code: '',
        used_code: ''
      },
      filter: {
        type_code: '',
        used_code: ''
      },
      dataList: [],
      types: [],  //类型
      use_types: [],
      statusDictionary: {
        [-1]: '已过期',
        [1]: '可领取',
        [2]: '不可领取'
      },
      formData: {},
      useAreaVisible: false,
      editNumberVisible: false,

      destoryCouponVisible: false
    };
  },
  mounted() {
    this.getList();
    this.getTypes();
    this.getUsed();
  },
  activated() {
    if(localStorage.getItem('shouldRefresh')) {
      this.getList();
      if(document && document.querySelector('#page')) {
        document.querySelector('#page').scrollTop = 0;
      }
      localStorage.removeItem('shouldRefresh');
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
        type_code: '',
        used_code: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        type_code: this.queryForm.type_code,
        used_code: this.queryForm.used_code
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        type_code: this.filter.type_code,
        used_code: this.filter.used_code
      };

      this.$get('/admin/coupon/deleteList', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    getTypes() {
      this.$get('/admin/coupon/type', null, res => {
        this.types = res.data;
      });
    },
    getUsed() {
      this.$get('/admin/coupon/used', null, res => {
        this.use_types = res.data;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    couponTypeContent(row) {
      if(row.t_type == 1) {
        return `满${row.with_amount}减${row.used_amount}`
      } else if(row.t_type == 2) {
        return `满${row.with_amount}减${row.used_amount}(可叠加)`
      } else if(row.t_type == 3) {
        return `无门槛减${row.used_amount}`
      } else if(row.t_type == 4) {
        return `打折券${row.with_discount * 1000 / 100}折`
      } else if(row.t_type == 5) {
        return row.with_condition === 1 ? `满${row.with_amount}抵扣${row.used_amount}` : `抵扣${row.used_amount}`;
      } else {
        return ''
      }
    },

  }
};
</script>

<style scoped>
  .coupon-used {
    display: inline-block;
    padding: .2em 10px;
    border-radius: .9em;
    font-size: 12px;
    line-height: 1.4;
    color: #fff;
    background-color: #618df5;
  }
</style>