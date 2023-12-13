<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="计划名">
        <el-input style="width: 300px" auto-complete="off" placeholder="请填写" v-model="formData.plan_name"></el-input>
        <!-- <div class="form-item-content">{{formData.plan_name}}</div> -->
      </el-form-item>
      <el-form-item label="奖池总金额">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="奖池总金额，大于0的正整数" v-model="formData.total_reward_price"></el-input>
        <div class="form-tips">备注：需大于0，最多保留两位小数</div>
      </el-form-item>
      <el-form-item label="发放类型">
        <el-select placeholder="请选择" name="plan_type" v-model="formData.plan_type">
          <el-option label="按系统机制发放" :value="1"></el-option>
          <el-option label="指定用户发放" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input style="width: 600px" auto-complete="off" placeholder="请填写" v-model="formData.remark"></el-input>
        <!-- <div class="form-item-content">{{formData.remark}}</div> -->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "AddPropagandaPlan",
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