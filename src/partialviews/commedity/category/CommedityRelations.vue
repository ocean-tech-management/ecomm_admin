<template>
  <div>
      <el-table ref="relationsTable" style="width: 100%" :data="dataList">
        <el-table-column label="商品名称" prop="title"></el-table-column>
        <el-table-column label="商品码" width="150" prop="goods_sn"></el-table-column>
        <el-table-column label="分类" width="150" prop="category_name"></el-table-column>
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>
        <el-table-column label="状态" width="100" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
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
</template>

<script>

export default {
  name: 'commedityRelations',
  data() {
    return {
      dataList: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      currentPage: 1,
      count: 1
    };
  },
  props: {
    categoryCode: String
  },
  mounted() {
    this.getList();
  },
  methods: {
    reloadData() {
      this.currentPage = 1;
      this.count = 1;
      this.dataList = [];
      setTimeout(() => {
        this.getList();
      }, 20)
    },
    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: '',
        category_code: this.categoryCode,
        searType: 1
      };

      this.$get('/admin/spu/list', queryVal, res => {
        let data = res.data.list || [];

        this.dataList = data;
        this.count = res.data.pageTotal;
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
