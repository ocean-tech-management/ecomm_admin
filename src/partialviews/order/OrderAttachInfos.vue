<template>
  <div>
    <el-form label-width="100px" :model="formData">
      <el-form-item label="订单号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="真实姓名">
        <div class="form-content-static">{{formData.real_name}}</div>
      </el-form-item>
      <el-form-item label="身份证号码">
        <div class="form-content-static">{{formData.id_card}}</div>
      </el-form-item>
      <el-form-item v-if="formData.id_card_front" label="身份证正面">
        <div class="form-content-static">
          <img class="id-card-img" :src="formData.id_card_front"/>
        </div>
      </el-form-item>
      <el-form-item v-if="formData.id_card_back" label="身份证反面">
        <div class="form-content-static">
          <img class="id-card-img" :src="formData.id_card_back"/>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "OrderAttachInfos",
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
<style lang="less" scoped>
  .id-card-img {
    width: 375px;
  }
</style>