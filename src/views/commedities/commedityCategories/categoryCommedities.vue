<template>
  <div class="subpage-content">
    <div class="default-container">

      <div class="table-ctrls">
        <div class="table-title">产前调理</div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" prop="id"></el-table-column>
        <el-table-column label="商品名称" width="150" prop="name"></el-table-column>
        <el-table-column label="创建时间" prop="create_time"></el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="toggleShelve(scope.row)">上架</el-button>
            <el-button type="text" size="small" @click="editItem(scope.row)">修改</el-button>
            <el-button type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
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
  name: 'categoryCommedities',
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [
        {
          id: 1,
          name: '产前调理',
          parent: null,
          level: 1,
          create_time: '2019-02-01 15:12',
          status: 1
        },
        {
          id: 2,
          name: '产前普拉提',
          parent: '产前调理',
          level: 2,
          create_time: '2019-02-01 15:12',
          status: 1
        }
      ],
      relationVisible: false
    };
  },
  mounted() {},
  methods: {
    reloadPage() {
      // this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.currentPage = 1;
      // this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      // this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/user/list', queryVal, res => {
        let dataList = res.data.list || [];
        if (this.categoryIds.length > 0) {
          for (let i = 0; i < dataList.length; i++) {
            if (dataList[i].assort && dataList[i].assort.length > 0) {
              let assorts = dataList[i].assort;
              let assortTxts = [];
              for (let j = 0; j < assorts.length; j++) {
                let categoryIndex = this.categoryIds.indexOf(assorts[j]);
                if (categoryIndex >= 0) {
                  assortTxts.push(this.categoryData[categoryIndex].name);
                }
              }
              dataList[i].assortTxts = assortTxts.map(x => x).join(',');
            }
          }
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    openRelation() {
      this.relationVisible = true;
    },
    toggleShelve() {},
    deleteItem() {},
    editItem(){}
  }
};
</script>
