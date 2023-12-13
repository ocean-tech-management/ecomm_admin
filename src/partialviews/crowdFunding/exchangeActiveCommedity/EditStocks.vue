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
          <el-table-column label="规格" width="200" prop="attr">
          </el-table-column>
          <el-table-column label="当前库存" width="120" prop="stock">
          </el-table-column>
          
          <template v-if="$auths.includes('goods/updateStock')">
            <el-table-column label="调整库存" width="100">
              <template slot-scope="scope">
                <el-input style="width: 80px" auto-complete="off" placeholder="填一下" v-model="dataList[scope.$index].stock_number" type="number"></el-input>
              </template>
            </el-table-column>
          </template>
        </el-table>
        
        <template v-if="$auths.includes('exchange/updateStock')">
          <div class="form-tips">
            调整库存值为
            <span class="warning-color">正数</span>
            时为
            <span class="success-color">增加库存</span>
            ，为 <span class="warning-color">负数</span>
            时则为
            <span class="error-color">减少库存</span>
            。
            减少库存大于当前库存值时会减少到0</div>
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
        type: this.formData.type
      };
      this.$get('/admin/exchange/goodsSkuInfo', params, res => {
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
          goods_sn: this.dataList[i].goods_sn,
          sku_sn: this.dataList[i].sku_sn,
          stock_number: this.dataList[i].stock_number
        })
      }
      return result;
    }
  }
};
</script>
