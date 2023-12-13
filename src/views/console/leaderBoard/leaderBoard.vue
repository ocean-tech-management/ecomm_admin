<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="排行依据" prop="sortField">
            <el-select placeholder="按销售量排序" name="sortField" v-model="queryForm.sortField">
              <el-option label="按销售量排序" :value="1"></el-option>
              <el-option label="按销售额排序" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排行方式" prop="sortType">
            <el-select placeholder="不限" name="sortType" v-model="queryForm.sortType">
              <el-option label="由高到低" :value="1"></el-option>
              <el-option label="由低到高" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="统计时间" prop="times">
            <el-date-picker
              v-model="times"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              :clearable="false"
              align="right"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">销售排行</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="商品名称" prop="title" width="350"></el-table-column>
        <el-table-column label="商品码" width="130" prop="goods_sn"></el-table-column>
        <el-table-column label="总销售金额" width="120" prop="sale_price" align="center"></el-table-column>
        <el-table-column label="总销售量" width="90" prop="sale_number" align="center"></el-table-column>
        <el-table-column label="操作">
         <template slot-scope="scope">
            <!-- 该操作无需权限验证。 -->
            <el-button type="text" size="default" @click="copyAppPath(scope.row)">复制商品地址</el-button>
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
import moment from 'moment';
import {nTimePickerConfig} from '@/config';

export default {
  name: 'leaderBoard',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        sortField: 1,
        sortType: 1
      },
      filter: {
        keyword: '',
        sortField: 1,
        sortType: 1,
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      categories: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      showStatusTexts: {
        [1]: '全部显示',
        [2]: '仅商品列表显示',
        [3]: '仅活动模块显示',
        [4]: '商品列表隐藏'
      },
      dataList: [],
      selection: [],

      times: [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
      

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
        sortField: 1,
        sortType: 1,
        start_time: moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      this.times = [moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];

      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        sortField: this.queryForm.sortField,
        sortType: this.queryForm.sortType
      }
      
      if(this.times && this.times.length == 2) {
        this.filter.start_time = this.times[0];
        this.filter.end_time = this.times[1];
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        sortField: this.filter.sortField,
        sortType: this.filter.sortType,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };

      this.$get('/admin/summary/goods', queryVal, res => {
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
    copyAppPath(row) {
      this.$copyText(`/pages/product-detail/product-detail?sn=${row.goods_sn}`).then(e => {
        this.$message.success('复制成功，可使用该地址作为直播商品地址栏填写内容');
      }, function (e) {
        this.$message.warning('复制失败，请刷新页面重试');
        console.log(e)
      })
    }
  }
};
</script>
