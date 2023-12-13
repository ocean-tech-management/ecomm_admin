<template>
  <div>

    <el-form :model="formData" label-width="100px">
      <el-form-item label="" label-width="0">
        <el-table style="width: 100%" :data="formData.goods">
          <el-table-column label="名称" prop="title">
          </el-table-column>
          <el-table-column label="规格" prop="attrs">
          </el-table-column>
          <el-table-column label="销售价格" width="150" prop="sale_price">
          </el-table-column>
          <el-table-column label="最高成本价" width="150" prop="max_purchase_price">
          </el-table-column>


          <el-table-column label="活动价" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                v-model="formData.goods[scope.$index].activity_price" type="number"></el-input>
            </template>
          </el-table-column>
          <el-table-column v-if="formData.gift_type > -1" :label="giftTypeDict[formData.gift_type] || '赠送数量'" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                v-model="formData.goods[scope.$index].gift_number" type="number"></el-input>
            </template>
          </el-table-column>
          <!-- <el-table-column label="起始销量" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.goods[scope.$index].sale_number" type="number"></el-input>
            </template>
          </el-table-column> -->


          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <!-- <template v-if="$auths.includes('crowdFunding/goodsSkuRemove')"> -->
              <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              <!-- </template> -->
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
      leaderData: [],
      // 赠送数量字典
      giftTypeDict: {
        [-1]: '不赠送',
        [1]: '赠送集品豆',
        [2]: '赠送健康豆',
        [3]: '赠送集品券'
      },
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
          activity_code: this.formData.activity_code,
          round_number: this.formData.round_number,
          period_number: this.formData.period_number,
          goods_sn: this.formData.goods_sn,
          sku_sn: this.formData.goods[index].sku_sn
        }
        this.$post('/admin/crowdFunding/periodGoodsSkuDelete', params, res => {
          this.formData.goods.splice(index, 1);
          this.$message.success('删除成功')
        });
      }).catch(() => {});

    },
  }
};
</script>
