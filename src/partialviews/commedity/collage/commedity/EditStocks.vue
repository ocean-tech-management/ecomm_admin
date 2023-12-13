<template>
  <div>
    
    <el-form :model="formData" label-width="100px">
      <el-form-item v-if="formData.a_type == 2" label="最高可用等级">
        <el-select placeholder="不限" name="searType" v-model="formData.vip_level">
          <el-option v-for="item in leaderData" :label="item.name" :value="item.level" :key="item.level"></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="起始销量">
        <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.sale_number" type="number"></el-input>
      </el-form-item> -->
      <el-form-item label="" label-width="0">
        <el-table style="width: 100%" :data="dataList">
          <el-table-column label="名称" prop="title">
          </el-table-column>
          <el-table-column label="规格" width="100" prop="attr">
          </el-table-column>
          <el-table-column label="拼团中的商品数" width="120" prop="pt_processing_number">
          </el-table-column>
          <el-table-column label="待支付商品数" width="110" prop="pt_wait_pay_number">
          </el-table-column>
          <el-table-column label="拼团中的团数" width="110" prop="processing_group_number">
          </el-table-column>
          <el-table-column label="已成团团数" width="100" prop="success_group_number">
          </el-table-column>
          <el-table-column label="剩余可开团数" width="110" prop="start_number">
          </el-table-column>
          <el-table-column label="团品库存" width="80" prop="stock">
          </el-table-column>
          <el-table-column label="商品库存" width="80">
            <template slot-scope="scope">
              {{scope.row.sku ? scope.row.sku.stock : '——'}}
            </template>
          </el-table-column>
          
          <template v-if="$auths.includes('goods/updateStock')">
            <el-table-column label="调整库存" width="150">
              <template slot-scope="scope">
                <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="dataList[scope.$index].stock_number" type="number"></el-input>
              </template>
            </el-table-column>
          </template>
        </el-table>
        
        <template v-if="$auths.includes('goods/updateStock')">
          <div class="form-tips">
            调整库存值为
            <span class="warning-color">正数</span>
            时为
            <span class="success-color">增加库存</span>
            ，为 <span class="warning-color">负数</span>
            时则为
            <span class="error-color">减少库存</span>
            。减少库存大于当前库存值时会减少到0。调整商品库存要为活动成团要求人数的整数倍，且总库存不能超过商品剩余总库存</div>
        </template>
      </el-form-item>
      
      
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'EditStocks',
  data() {
    return {
      dataList: []
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getSaleInfos();
  },
  methods: {
    getSaleInfos(goods_sn) {
      let params = {
        goods_sn: goods_sn || this.formData.goods_sn,
        activity_code: this.formData.activity_code
      };
      this.$get('/admin/pt/saleInfo', params, res => {
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          let specs = JSON.parse(dataList[i].specs);
          dataList[i].attr = Object.values(specs).join(' ');
          dataList[i].stock_number = 0;
        }
        this.dataList = dataList;
      });
    },
    returnStockResult() {
      let result = [];
      for(let i = 0; i < this.dataList.length; i++) {
        result.push({
          activity_code: this.formData.activity_code,
          goods_sn: this.dataList[i].goods_sn,
          sku_sn: this.dataList[i].sku_sn,
          stock_number: this.dataList[i].stock_number,
          origin_stock: this.dataList[i].sku.stock,
          current_activity_stock: this.dataList[i].stock
        })
      }
      return result;
    }
  }
};
</script>
