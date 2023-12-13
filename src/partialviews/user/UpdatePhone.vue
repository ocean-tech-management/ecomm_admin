<template>
  <div>
    <el-form :model="formData" @submit.native.prevent label-width="100px">
      <el-form-item label="用户名">
        <div class="form-content-static">{{formData.name}}</div>
      </el-form-item>
      <el-form-item label="当前号码">
        <div class="form-content-static">{{formData.original_phone}}</div>
      </el-form-item>
      <el-form-item label="新号码">
        <el-input style="width: 200px" maxlength="11" auto-complete="off" placeholder="填一下" v-model="formData.phone"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
    }
  },
  props: {
    formData: Object
  }
}
</script>