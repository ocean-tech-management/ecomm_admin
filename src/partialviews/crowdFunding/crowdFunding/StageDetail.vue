<template>
  <div>
    <el-form :model="formData" label-width="285px">
      <el-form-item label="期次名称">
        <div class="form-content-static">{{ formData.title }}</div>
      </el-form-item>
      <el-form-item label="期次简介">
        <div class="form-content-static">{{ formData.desc }}</div>
      </el-form-item>
      <el-form-item v-if="formData.limit_type == 1" label="有效时间段">
        <div class="form-content-static">{{ formData.time[0] }} ~ {{ formData.time[1] }}</div>
      </el-form-item>

      <el-form-item label="排序">
        <div class="form-content-static">{{ formData.sort }}</div>
      </el-form-item>


      <el-form-item label="轮数">
        <div class="form-content-static">{{ formData.round_number }}</div>
      </el-form-item>
      <el-form-item label="期数">
        <div class="form-content-static">{{ formData.period_number }}</div>
      </el-form-item>
      <el-form-item label="销售额">
        <div class="form-content-static">{{ formData.sales_price }}</div>
      </el-form-item>

      <el-form-item label="每人参与次数上限">
        <div class="form-content-static">{{ formData.join_limit_number }}</div>
      </el-form-item>
      <el-form-item label="每人认购额度上限">
        <div class="form-content-static">{{ formData.join_limit_amount }}</div>
      </el-form-item>
      <el-form-item label="每人认购额度上限【展示用】">
        <div class="form-content-static">{{ formData.join_limit_amount_show }}</div>
      </el-form-item>
      <el-form-item label="本期成功后返集品券比例">
        <div class="form-content-static">{{ formData.reward_scale }}%</div>
      </el-form-item>
      <el-form-item label="本期失败后返本金比例">
        <div class="form-content-static">{{ formData.fail_return_scale }}%</div>
      </el-form-item>
      <el-form-item label="提前购比例">
        <div class="form-content-static">{{ formData.advance_buy_scale }}%</div>
      </el-form-item>
      <el-form-item label="本期熔断返本金比例【方案一】">
        <div class="form-content-static">{{ formData.fuse_return_scale }}%</div>
      </el-form-item>
      <el-form-item label="本期熔断返集品豆比例【方案一】">
        <div class="form-content-static">{{ formData.fail_reward_scale }}%</div>
      </el-form-item>
      <el-form-item label="本期熔断返本金比例【方案二】">
        <div class="form-content-static">{{ formData.fuse_second_return_scale }}%</div>
      </el-form-item>
      <el-form-item label="本期熔断分期返总本金上浮倍数【方案二】">
        <div class="form-content-static">{{ formData.fuse_second_rising_scale }}</div>
      </el-form-item>
      <el-form-item label="每期返回订单总额比例【方案二】">
        <div class="form-content-static">{{ formData.fuse_second_once_return_scale }}%</div>
      </el-form-item>
      <el-form-item v-if="formData.advance_buy_scale >= 100" label="预售发放奖励时间">
        <div class="form-content-static">{{ formData.advance_buy_reward_send_time }}天</div>
      </el-form-item>

      <el-form-item label="展示图">
        <img style="width: 200px;" :src="formData.background_image" />
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'CrowdFundingStageDetail',
  data() {
    return {

    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {

  }
};
</script>
