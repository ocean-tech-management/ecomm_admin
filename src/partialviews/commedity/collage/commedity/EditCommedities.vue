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
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.goods[scope.$index].activity_price" type="number"></el-input>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <template v-if="$auths.includes('pt/goodsSkuDelete')">
                <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="限制时间">
        <el-date-picker
          v-model="formData.time"
          type="datetimerange"
          :picker-options="formPickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="false"
        ></el-date-picker>
      </el-form-item>
      
      
    </el-form>

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: 'EditCommedities',
  data() {
    return {

      ...formNTimePickerConfig
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    
    deleteCommedity(index) {
      this.$confirm('是否删除该sku，该操作不可恢复，请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          activity_code: this.formData.activity_code,
          goods_sn: this.formData.goods[index].goods_sn,
          sku_sn: this.formData.goods[index].sku_sn,
        }
        this.$post('/admin/pt/goodsSkuDelete', params, res => {
          this.formData.goods.splice(index, 1);
          this.$message.success('删除成功');
        });
      }).catch(() => {});
      
    },
  }
};
</script>
