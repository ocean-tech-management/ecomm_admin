<template>
  <div>
    <el-table :data="users">
      <el-table-column label="序号" type="index" width="60" align="center">
      </el-table-column>
      <el-table-column label="用户昵称" width="130" prop="userName">
      </el-table-column>
      <el-table-column label="真实姓名" width="130" prop="realName">
      </el-table-column>
      <el-table-column label="手机号码" width="140" prop="userPhone"></el-table-column>
      <el-table-column label="备注" prop="remark"></el-table-column>
      
      <el-table-column label="操作" width="80">
        <template slot-scope="scope">
          <el-button class="error-color" type="text" size="small" @click="deleteUser(scope.$index)">剔除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {

    }
  },
  props: {
    users: Array
  },
  methods: {
    deleteUser(index) {
      this.users.splice(index, 1);
    },
  }
}
</script>