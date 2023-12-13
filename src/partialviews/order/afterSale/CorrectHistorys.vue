<template>
  <div>
    <el-form :model="formData" @submit.native.prevent label-width="100px">
      <el-form-item label="订单编号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="商品名称">
        <div class="form-content-static">{{formData.title}}</div>
      </el-form-item>
      <el-form-item label="退售后用户">
        <div class="form-content-static">{{formData.user_name}}</div>
      </el-form-item>
      
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in historys"
          :key="index"
          :timestamp="item.create_time">
            {{item.admin_name || '未知管理员'}} 进行了 <span class="warning-color">{{typeTexts[item.type]}}</span> 操作，
            调整金额为：<span :class="typeClass[item.type]">{{item.price || '0.00'}}</span> 元。
            操作原因： {{item.remark || ''}}
        </el-timeline-item>
      </el-timeline>
      
      
      <el-form-item v-if="historys.length == 0" label="调整记录">
        <div class="form-content-static">无调整金额记录</div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'CorrectHistorys',
  data() {
    return {
      historys: [],
      typeTexts: {
        [1]: '运费调整',
        [2]: '售后扣除供应商金额',
        [3]: '对账成本调整'
      },
      typeClass: {
        [1]: 'error-color',
        [2]: 'success-color',
        [3]: 'error-color',
      }
    }
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getHistorys();
  },
  methods: {
    getHistorys() {
      this.historys = [];
      let params = {
        order_sn: this.formData.order_sn,
        sku_sn: this.formData.sku_sn,
        type: this.formData.type
      }

      this.$get("/admin/afterSale/correctionList", params, (res) => {
        let dataList = res.data || [];
        for(let i = 0; i < dataList.length; i++) {
          let price = parseFloat(dataList[i].price);
          dataList[i].isAdd = price >= 0 ? 1 : 2;
        }
        this.historys = dataList;
      });
    }
  }
}
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
