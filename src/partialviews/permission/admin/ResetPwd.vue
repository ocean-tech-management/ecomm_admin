<template>
  <div>
    <el-form ref="addForm" :model="formData" label-width="100px">
      <el-form-item label="账号" prop="account">
        <div class="form-content-static">{{formData.account}}</div>
      </el-form-item>
      
      <el-form-item label="密码" prop="pwd">
        <el-input
          style="width: 450px"
          v-model="formData.pwd"
          type="password"
          maxlength="18"
          placeholder="请输入6~18位密码哦"
        ></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="rePwd">
        <el-input
          style="width: 450px"
          v-model="formData.rePwd"
          type="password"
          maxlength="18"
          placeholder="请再次输入6~18位密码哦"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ResetAdminPwd',
  data() {
    return {
      rules: [],
    };
  },
  props: {
    formData: Object,
  },
  mounted() {
  },
  methods: {
  },
};
</script>
