<template>
  <div>
    <el-form label-width="100px">
      <el-form :inline="true" :model="queryForm" ref="queryForm" label-width="100px" @submit.native.prevent>
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="queryForm.keyword" placeholder="请输入参数模板名称" @keyup.enter.native="queryInfo"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryInfo">查询</el-button>
          <el-button @click="resetQuery('queryForm')">重置</el-button>
        </el-form-item>
      </el-form>
      <el-form-item label="选择模板">
        <el-select placeholder="请填写上面筛选条件查询" name="selectIndex" v-model="selectIndex">
          <el-option v-for="(item, index) in dataList" :label="item.title" :value="index" :key="index"></el-option>
        </el-select>
        <div class="form-tips">请填写上面筛选条件，点击查询按钮查得数据后进行选择哦</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SelectParam',
  data() {
    return {
      queryForm: {
        keyword: '',
        searType: 1
      },
      filter: {
        keyword: '',
        searType: 1
      },

      dataList: [],
      selectIndex: null
    };
  },
  mounted() {
  },
  methods: {
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        searType: 1
      };
      this.getList();
    },
    //查询
    queryInfo() {
      this.filter = {
        keyword: this.queryForm.keyword,
        searType: this.queryForm.searType
      }
      this.getList();
    },
    getList() {
      let queryVal = {
        page: 1,
        keyword: this.filter.keyword,
        searType: this.filter.searType
      };

      this.$get('/admin/goodsParams/list', queryVal, res => {
        let dataList = res.data.list || [];
        this.dataList = dataList;
        if(dataList.length > 0) {
          this.selectIndex = 0;
        } else {
          this.selectIndex = null;
        }
      });
    },
    returnSelectResult() {
      if(this.dataList[this.selectIndex]) {
        return this.dataList[this.selectIndex];
      } else {
        return false
      }
    }
  }
};
</script>