<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="关联用户" prop="uid">
        <el-select 
          name="uid"
          style="width: 300px" 
          placeholder="请输入关键词" 
          v-model="formData.uid"
          filterable 
          remote 
          :loading="userLoading" 
          :remote-method="updateUserKeyword"
          @change="updateLinkUser"
        >
          <el-option label="请输入关键词" value></el-option>
          <el-option v-for="user in users" :label="user.user_name + (user.user_phone ? ('(' + user.user_phone + ')') : '')" :value="user.uid" :key="user.uid">
            <img class="user-avatar" :src="user.avatarUrl"/>
            {{user.user_name + (user.user_phone ? ('(' + user.user_phone + ')') : '')}}
          </el-option>
        </el-select>
        <span style="margin-left: 15px;">共 {{users.length}} 个模糊选项</span>
        <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从选择器里进行精确指定</div>
      </el-form-item>
      <el-form-item label="用户标签">
        <el-input style="max-width: 350px" auto-complete="off" placeholder="填一下用户的相关标签呗" v-model="formData.user_tag"></el-input>
      </el-form-item>

      <el-form-item label="用户备注">
        <el-input
          style="max-width: 600px"
          auto-complete="off"
          type="textarea"
          placeholder="请输入口碑评价官的相关备注部分哦"
          v-model="formData.content"
        ></el-input>
      </el-form-item>
    
    </el-form>
  </div>
</template>

<script>

export default {
  name: 'AddReputator',
  data() {
    return {
      queryForm: {
        userKeyword: '',
        productKeyword: ''
      },
      filter: {
        userKeyword: '',
        productKeyword: ''
      },

      users: [],
      userLoading: false
    };
  },
  props: {
    formData: Object
  },
  mounted() {

  },
  methods: {
    //查询
    updateUserKeyword(keyword) {
      this.filter.userKeyword = keyword;
      this.formData.uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      this.userLoading = true;
      let params = {
        page: 1,
        keyword: this.filter.userKeyword
      };

      this.$get('/admin/member/list', params, res => {
        let users = res.data.list || [];
        this.users = users;
        this.userLoading = false;
      }, err => {
        this.userLoading = false;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        userKeyword: '',
        productKeyword: ''
      };
      this.formData.uid = null;
      this.getUsers();
    },

    updateProductKeyword(keyword) {
      this.filter.productKeyword = keyword;
      this.getProducts();
    },
    updateLinkUser(e) {
      let uid = e;
      for(let i = 0; i < this.users.length; i++) {
        if(uid == this.users[i].uid) {
          this.formData.user_name = this.users[i].user_name;
          this.formData.user_avatarUrl = this.users[i].avatarUrl;
        }
      }

    },

  }
};
</script>

<style lang="less" scoped>
  .user-avatar {
    width: 1.4em;
    height: 1.4em;
    vertical-align: middle;
  }

</style>