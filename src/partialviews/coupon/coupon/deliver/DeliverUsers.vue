<template>
  <div>
    <el-form label-width="150px">
      <div class="category-ctrl">
        <el-form :inline="true" :model="queryForm" label-width="150px" @submit.native.prevent ref="userSelect">
          <el-form-item label="用户名称或手机号码" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">筛选</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form-item label="领券人员筛选">
        <div class="user-area-select">
          <div class="user-area-wrapper">
            <div v-for="(item, index) in users" :class="{'user-area-item': true, 'active': userIndex == index}"
              :key="index" @click="selectUser(index)" @dblclick="confirmUser">
              <template>{{item.name}}</template>
              <template v-if="item.phone">({{item.phone}})</template>

            </div>
          </div>
          <el-button type="primary" :disabled="users.length == 0" @click="confirmUser">确认 ></el-button>
        </div>
      </el-form-item>
      <el-form-item label="已选择人员">
        <div class="users-has-select">
          <div v-for="(user, index) in selectUsers" class="user-has-select" :key="index">
            <div class="user-has-select-name">{{user.name}}</div>
            <div v-if="user.phone" class="user-has-select-phone">({{user.phone}})</div>
            <div class="user-has-select-close" @click="deleteSelect(index)">×</div>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'DeliverUsers',
    data() {
      return {
        queryForm: {
          keyword: ''
        },
        filter: {
          keyword: ''
        },
        users: [],
        userIndex: 0,
        selectUsers: []
      }
    },
    mounted() {

    },
    methods: {
      resetSelectUsers(selectUsers = []) {
        this.selectUsers = JSON.parse(JSON.stringify(selectUsers));      
      },
      queryInfo() {
        this.filter = {
          keyword: this.queryForm.keyword
        };
        this.getUsers();
      },
      getUsers() {
        if(!this.filter.keyword || this.filter.keyword.trim() === '') return this.$message.warning('请输入关键词，不要留空');
        let params = {
          keyword: this.filter.keyword,
          needAllLevel: 1, //查全部用户
          page: 1,
          pageNumber: 20
        };
        this.$get('/admin/user/list', params, res => {
          this.users = res.data.list || [];
          this.userIndex = 0;
        });
      },
      selectUser(index) {
        this.userIndex = index;
      },
      confirmUser() {
        let selectUsers = this.selectUsers;
        if(selectUsers.length >= 100) return this.$message.warning('最多选择100人派券，如人数较多请分批派');
        let hasSelect = false;
        for(let i = 0; i < selectUsers.length; i++) {
          if(selectUsers[i].uid == this.users[this.userIndex].uid) {
            hasSelect = true;
            break;
          }
        }
        if(!hasSelect) this.selectUsers.push({
          uid: this.users[this.userIndex].uid,
          name: this.users[this.userIndex].name,
          phone: this.users[this.userIndex].phone,
          avatarUrl: this.users[this.userIndex].avatarUrl,
          count: 1
        });
      },
      deleteSelect(index) {
        this.selectUsers.splice(index, 1);
      },
      confirmResult() {
        return JSON.parse(JSON.stringify(this.selectUsers));
      }
    }
  }

</script>
<style lang="less" scoped>
.user-area-select {
  display: flex;
  align-items: center;
}
.user-area-wrapper {
  width: 350px;
  height: 300px;
  margin: 0 15px 0 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}

.user-area-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}
.user-area-item:hover {
  background-color: #f2f3f3;
}
.user-area-item.active {
  color: #fff;
  background-color: #618df5;
}


.users-has-select {
  display: flex;
  flex-wrap: wrap;
}
.user-has-select {
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 2px 10px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 5px;
  line-height: 1.4;
  background-color: #f2f3f3;
  user-select: none;
}
.user-has-select-name {
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
}
.user-has-select-phone {
  
}
.user-has-select-close {
  margin-left: 5px;
  padding: 2px 10px;
  font-size: 24px;
  font-weight: bolder;
  cursor: pointer;
  &:hover {
    background-color: #ccc;
  }
}
</style>
