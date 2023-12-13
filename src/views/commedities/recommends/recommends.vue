<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入文章标题" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="type">
            <el-select placeholder="不限" name="type" v-model="queryForm.type">
              <el-option label="不限" value></el-option>
              
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="searType">
            <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
              <el-option label="不限" :value="1"></el-option>
              <el-option label="在线" :value="2"></el-option>
              <el-option label="下线" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">超值推荐列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('goods/create')">
            <el-button type="primary" @click="$router.push('/addRecommend')">上传文章</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="goods_sn" width="80">
        </el-table-column>
        <el-table-column label="文章名称" prop="title" width="250"></el-table-column>
        <el-table-column label="关联人" prop="author" width="120" align="center"></el-table-column>
        <el-table-column label="分类" width="180">
          <template slot-scope="scope">
            {{scope.row.p_category_name}} > {{scope.row.category_name}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="状态" width="70" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
         <template slot-scope="scope">
           <template v-if="$auths.includes('goods/status')">
            <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
           </template>
           <template v-if="$auths.includes('goods/update')">
            <el-button type="text" size="default" @click="$router.push('/editCommedity?goods_sn=' + scope.row.goods_sn)">编辑</el-button>
           </template>
          
           <template v-if="$auths.includes('goods/delete')">
            <el-button class="error-color" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
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
  name: 'recommends',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        type: '',
        searType: 1
      },
      filter: {
        keyword: '',
        type: '',
        searType: 1
      },
      categories: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      dataList: [],
      selection: []
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
        type: '',
        searType: 1
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        type: this.queryForm.type,
        searType: this.queryForm.searType
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        type: this.filter.type,
        searType: this.filter.searType,
        commedity_type: 1 //正常文章
      };

      this.$get('/admin/spu/list', queryVal, res => {
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
      this.$confirm(`您将${row.status == 1 ? '下架' : '上架'}${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goods/status', {
          goods_sn: row.goods_sn,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goods/delete', {
          goods_sn: row.goods_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
