<template>
  <div>
    
    <el-form :model="formData" label-width="100px">
      <el-form-item label="" label-width="0">
        <el-table style="width: 100%" :data="formData.goods">
          <el-table-column label="名称" prop="title">
          </el-table-column>
          <el-table-column label="规格" width="140" prop="attrs">
          </el-table-column>
          <el-table-column label="总库存" width="100" prop="stock_number">
          </el-table-column>
          <el-table-column label="销售价格" width="100" prop="sale_price">
          </el-table-column>

          <el-table-column label="赠送健康豆" width="140">
            <template slot-scope="scope">
              <el-input style="width: 130px" auto-complete="off" placeholder="大于0的正数" v-model="formData.goods[scope.$index].exchange_value" type="number"></el-input>
            </template>
          </el-table-column>
          <!-- <el-table-column label="专区库存" width="80" prop="stock">
          </el-table-column> -->
      
          <!-- <el-table-column label="自动免物流发货" width="120" align="center">
            <template slot-scope="scope">
              <el-checkbox v-model="formData.goods[scope.$index].auto_ship" :true-label="1" :false-label="2"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="自动收货" width="120" align="center">
            <template slot-scope="scope"> 
              <el-checkbox v-model="formData.goods[scope.$index].auto_complete" :true-label="1" :false-label="2"></el-checkbox>
            </template>
          </el-table-column> -->

          
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              
              <template v-if="$auths.includes('activity/goodsSkuDelete')">
                <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      
      
    </el-form>

  </div>
</template>

<script>
export default {
  name: 'EditCommedities',
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
    deleteCommedity(index) {
      this.$confirm('是否删除该sku，该操作不可恢复，请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          type: this.formData.goods[index].type,
          goods_sn: this.formData.goods[index].goods_sn,
          sku_sn: this.formData.goods[index].sku_sn,
        }
        this.$post('/admin/exchange/goodsSkuDelete', params, res => {
          this.formData.goods.splice(index, 1);
          this.$message.success('删除成功')
        });
      }).catch(() => {});
      
    },
  }
};
</script>
