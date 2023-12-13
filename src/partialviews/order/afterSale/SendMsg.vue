<template>
  <div>
    <el-form style="margin-top: 20px;" label-width="150px">
      
      <el-form-item label="留言内容">
        <el-input style="width: 500px" type="textarea" auto-complete="off" placeholder="请输入" v-model="message"></el-input>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'SendMessage',
  data() {
    return {
      message: ''
    }
  },
  props: {
  },
  mounted() {
  },
  methods: {  
    init() {
      this.message = '';
    },
    confirmResult() {
      return {
        message: this.message
      }
    }
  }
};
</script>


<style lang="less" scoped>
  .after-scale-event {
    margin-bottom: 10px;
  }

</style>