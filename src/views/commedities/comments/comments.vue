<template>
  <div class="subpage-content">
    <div class="default-container">
      
      <div class="table-ctrls">
        <div class="table-title">评论列表</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <!-- <el-table-column label="序号" width="60" prop="id"></el-table-column> -->
        <el-table-column label="商品名称" width="240" prop="subject_name"></el-table-column>
        <el-table-column label="评论人" width="120" prop="user_name"></el-table-column>
        <el-table-column label="评论内容" prop="comment"></el-table-column>
        <el-table-column label="评论时间" width="150" prop="comment_time"></el-table-column>
        <el-table-column label="状态" width="150">
          <template slot-scope="scope">
            <div :class="{'warning-color': scope.row.status == 2, 'success-color': scope.row.status == 1}">{{statusTexts[scope.row.status]}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
         <template slot-scope="scope">
            <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="small" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '不通过审核' : '通过审核'}}</el-button>
           
            <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
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
  name: 'subjects',
  data() {
    return {
      currentPage: 1,
      count: 1,
      categories: [],
      statusTexts: {
        [1]: '已通过审核',
        [2]: '未通过审核',
        [-1]: '已被删除'
      },
      dataList: [],
      selection: []
    };
  },
  mounted() {
    // this.getList();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage
      };

      this.$get('/admin/subject/comment', queryVal, res => {
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
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '不通过' : '通过'}${row.user_name}的这条评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/subject/commentUpdate', {
          comment_id: row.id,
          type: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '不通过' : '通过'}审核成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.user_name}的这条评论, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/subject/commentUpdate', {
          comment_id: row.id,
          type: 3
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
