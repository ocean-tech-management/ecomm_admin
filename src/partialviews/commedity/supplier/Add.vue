<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="名字" label-width="100px">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="请输入供应商名字" v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="联系人" label-width="100px">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="请输入联系人姓名，不填请留空" v-model="formData.concat_user"></el-input>
      </el-form-item>
      <el-form-item label="手机号码" label-width="100px">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="请输入联系人号码，不填请留空" maxlength="11" v-model="formData.concat_phone"></el-input>
      </el-form-item>
      <el-form-item label="地址" label-width="100px">
        <el-input style="max-width: 450px" auto-complete="off" placeholder="请输入供应商地址" v-model="formData.address"></el-input>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  name: "AddSupplier",
  data() {
    return {};
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {}
};
</script>