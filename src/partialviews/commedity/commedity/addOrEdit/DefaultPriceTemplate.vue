<template>
  
  <div>
    <el-form :inline="true" :model="formData" label-width="120px">
      <el-form-item label="默认库存" prop="stock" >
        <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.stock" type="number"></el-input>
      </el-form-item>
      <el-form-item label="销售价格" prop="sale_price" >
        <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.sale_price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="市场价" prop="market_price" >
        <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.market_price" type="number"></el-input>
      </el-form-item>
      <el-form-item label="成本价" prop="cost_price" >
        <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.cost_price" type="number"></el-input>
      </el-form-item>
      <div v-if="vdc && vdc.length > 0 && formData.purchase_prices.length > 0">
        <div v-for="(vdcItem, vdcIndex) in vdc" :key="vdcIndex">
          <el-form-item :label=" vdcItem.name + '进货价'">
            <el-input style="width: 120px" type="number" auto-complete="off" :placeholder=" vdcItem.name + '进货价'" v-model="formData.purchase_prices[vdcIndex].purchase_price"></el-input>
          </el-form-item>
          <el-form-item :label=" vdcItem.name + '一级分润'">
            <el-input style="width: 120px" auto-complete="off" :placeholder=" vdcItem.name + '一级分润'" v-model="formData.purchase_prices[vdcIndex].vdc_one"></el-input>
          </el-form-item>
          <el-form-item :label=" vdcItem.name + '二级分润'">
            <el-input style="width: 120px" auto-complete="off" :placeholder=" vdcItem.name + '二级分润'" v-model="formData.purchase_prices[vdcIndex].vdc_two"></el-input>
          </el-form-item>
        </div>
        <div class="form-tips">备注：一级分润、二级分润的值在0~1之间，最多保留三位小数哦</div>
      </div>
    </el-form>
    
  </div>
</template>

<script>
export default {
  name: 'DefaultPriceTemplate',
  data() {
    return {
      formData: {
        stock: 0,
        sale_price: 0,
        market_price: 0,
        cost_price: 0,
        purchase_prices: []
      }
    };
  },
  props: {
    vdc: Array
  },
  mounted() {
    console.log(this.vdc);
    for(let i = 0; i < this.vdc.length; i++) {
      let item = {
        level: this.vdc[i].level,
        name: this.vdc[i].name,
        purchase_price: 0,
        vdc_one: this.vdc[i].vdc_one,
        vdc_two: this.vdc[i].vdc_two,
        close_divide: this.vdc[i].close_divide
      }
      this.formData.purchase_prices.push(item);
    }
    
  },
  methods: {
    getDefaultPriceTemplate() {
      if(!(/^[1-9]\d*$/.test(this.formData.stock))) {
        this.$message.error(`模板库存要为1，2，3，4这种正整数哦，请检查下哈`);
        return false;
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.sale_price)) ||
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.market_price)) ||
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.cost_price)) ||
        parseFloat(this.formData.sale_price) <= 0 ||
        parseFloat(this.formData.market_price) <= 0 ||
        parseFloat(this.formData.cost_price) <= 0
      ) {
        this.$message.error(`各个模板价格要为大于零的数哦，请检查下哈`);
        return false;
      }
      // 检验sku的售价合法性
      for(let i = 0; i < this.formData.purchase_prices.length; i++) {
        if(
          !(/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(this.formData.purchase_prices[i].purchase_price)) ||
          parseFloat(this.formData.purchase_prices[i].purchase_price) <= 0
        ) {
          this.$message.error(`${this.formData.purchase_prices[i].name}的进货价格要为大于零的数哦，请检查下哈`);
          return false;
        }
        if(i != 0) {
          if(
            parseFloat(this.formData.purchase_prices[i].purchase_price) < parseFloat(this.formData.purchase_prices[i - 1].purchase_price)
          ) {
            this.$message.error(`${this.formData.purchase_prices[i].name}价格有问题，按规则价格应随会员等级降低而提高，请检查下哈`)
            return false;
          }
        }
      }
      return JSON.parse(JSON.stringify(this.formData));
    }
  }
};
</script>