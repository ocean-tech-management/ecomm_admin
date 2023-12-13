<template>
  <div class="logistics-box">
    <div v-for="item in formData" class="logistics" style="margin-bottom: 30px;" :key="item.shipping_code">
      <div class="logistics-title" style="font-size: 18px;">
        {{item.company_name}} {{item.shipping_code}}
      </div>
      <el-timeline>
        <el-timeline-item
          v-for="(logistics, index) in item.logistics"
          :key="index"
          :timestamp="logistics.node_time">
          {{logistics.content}}
        </el-timeline-item>
      </el-timeline>
    </div>
    <div v-if="!formData || formData.length === 0">暂无物流数据</div>
  </div>
</template>

<script>
export default {
  name: "logisticsDetail",
  data() {
    return {
    };
  },
  props: {
    formData: Array
  },
  mounted() {
  },
  methods: {

  }
};
</script>
<style lang="less" scoped>
.el-timeline {
  margin-top: 10px;
  padding-left: 0;
}
.logistics {
  padding: 10px 20px;
  border: 1px solid #eee;
  background-color: #fafbfb;
}
</style>
