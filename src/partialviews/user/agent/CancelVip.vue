<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="用户姓名">
        <div class="form-content-static">{{formData.name}}</div>
      </el-form-item>

    </el-form>
    <div style="margin-top: 60px;">
      <div v-if="!formData.link_superior_user" class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="100px">
          <el-form-item label="筛选昵称" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="筛选手机" prop="phone">
            <el-input v-model="queryForm.phone" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form :model="formData" label-width="100px">
        <el-form-item v-if="!formData.link_superior_user" label="团队接管人" prop="link_user">
          <el-select class="standard-select" placeholder="不指定任何接管人" v-model="formData.link_user" @change="$forceUpdate()">
            <el-option label="不指定任何接管人" :value="null"></el-option>
            <el-option v-for="user in dataList" :label="user.name" :value="user.uid" :key="user.uid"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定接管人的选择器里进行精确指定</div>
          <div class="form-tips">指定的接管人仅接管该用户的下级团队,不跟当前用户产生绑定关系</div>
        </el-form-item>
        <el-form-item v-if="formData.link_superior_user" label="团队接管人" prop="link_user">
          <div class="form-tips">该用户存在上级，取消用户身份后，其下级成员皆由其上级接管</div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "CancelVip",
  data() {
    return {
      queryForm: {
        keyword: '',
        phone: ''
      },
      filter: {
        keyword: '',
        phone: ''
      },
      dataList: [],
    };
  },
  props: {
    formData: Object,
    leaderData: Array
  },
  mounted() {},
  methods: {
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        phone: this.queryForm.phone
      };
      this.formData.link_uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        page: 1,
        keyword: this.filter.keyword,
        phone: this.filter.phone
      };

      this.$get('/admin/user/list', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].uid == this.formData.uid) {
            // 剔除他自己本身
            dataList.splice(i, 1);
            break;
          }
        }
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        phone: ''
      };
      this.formData.link_uid = null;
      this.getUsers();
    },
  }
};
</script>