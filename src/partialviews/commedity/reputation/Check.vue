<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="是否通过">
        <el-radio-group v-model="formData.check_status" name="check_status">
          <el-radio :label="1">通过</el-radio>
          <el-radio :label="2">不通过</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.check_status == 2" label="拒绝理由">
        <el-input style="max-width: 350px" auto-complete="off" placeholder="填一下拒绝的理由哦" v-model="formData.check_remark"></el-input>
      </el-form-item>
    
    </el-form>
  </div>
</template>

<script>

export default {
  name: 'CheckReputation',
  data() {
    return {
    };
  },
  props: {
    formData: Object
  },
  mounted() {

  },
  methods: {

  }
};
</script>