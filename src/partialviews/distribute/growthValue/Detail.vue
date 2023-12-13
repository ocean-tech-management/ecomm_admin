<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="用户">
        <div class="form-content-static">{{formData.user_name}}</div>
      </el-form-item>
      <el-form-item label="手机号码" >
        <div class="form-content-static">
          {{formData.user_phone}}
        </div>
      </el-form-item>
      <el-form-item label="成长值变动" >
        <div class="form-content-static">
          <span>{{formData.growth_value}}</span>
          <span v-if="formData.surplus_growth_value != formData.growth_value">
            (实际<span class="error-color">{{formData.surplus_growth_value}}</span>)
          </span>
        </div>
      </el-form-item>
      <el-form-item label="来源" >
        <div class="form-content-static">{{typeTexts[formData.type]}}</div>
      </el-form-item>
      <el-form-item label="当前状态" >
        <div class="form-content-static">{{statusTexts[formData.arrival_status]}}</div>
      </el-form-item>
      <template v-if="formData.order_sn">
        <el-form-item label="关联订单号" >
          <div class="form-content-static">{{formData.order_sn}}</div>
        </el-form-item>
        <el-form-item label="下单人" >
          <div class="form-content-static">{{formData.order_user_name}}</div>
        </el-form-item>
        <el-form-item label="下单人手机号" >
          <div class="form-content-static">{{formData.order_user_phone}}</div>
        </el-form-item>
        <el-form-item label="订单实付" >
          <div class="form-content-static">{{formData.order_real_pay_price}}</div>
        </el-form-item>
      </template>
      
      <el-form-item label="创建时间" >
        <div class="form-content-static">{{formData.create_time}}</div>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  name: "GrowthValue",
  data() {
    return {
      typeTexts: {
        [1]: '购物',
        [2]: '分享下单',
        [3]: '系统修改'
      },
      statusTexts: {
        [1]: '到账',
        [2]: '冻结中',
        [3]: '退款取消奖励',
        [-1]: '整单被删除'
      }
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {}
};
</script>