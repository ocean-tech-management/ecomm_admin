<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="规则名">
        <el-input style="width: 300px" auto-complete="off" placeholder="请填写" v-model="formData.name"></el-input>
        <!-- <div class="form-item-content">{{formData.name}}</div> -->
      </el-form-item>
      <el-form-item label="规则等级">
        <div class="form-content-static">{{formData.level}}</div>
      </el-form-item>
      <el-form-item label="奖池比例">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="奖池比例，0到1之间哦" v-model="formData.scale"></el-input>
        <div class="form-tips">备注：需小于等于1，最多保留三位小数</div>
      </el-form-item>
      <el-form-item label="奖励上限">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="用户奖励上限比例" v-model="formData.upper_limit_scale"></el-input>
        <span>倍</span>
        <div class="form-tips">备注：需大于等于1，最多保留两位小数</div>
      </el-form-item>
      
      <el-form-item label="需自购套餐数">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="满足该规则的最低自购套餐数量" v-model="formData.combo_number"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "EditPropagandaRule",
  data() {
    return {

      leaderData: []
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

<style scoped>
  .leader-condition {
    margin-bottom: 10px;
  }
</style>