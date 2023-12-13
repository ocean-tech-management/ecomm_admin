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
        <el-table style="width: 100%" :data="formData.goods">
          <el-table-column label="名称" prop="title"></el-table-column>
          <el-table-column label="规格" prop="attrs"></el-table-column>
          <el-table-column label="销售价格" width="150" prop="sale_price"></el-table-column>
          <el-table-column label="最高成本价" width="150" prop="max_purchase_price"></el-table-column>
          <el-table-column label="活动价" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                v-model="formData.goods[scope.$index].activity_price" type="number"></el-input>
            </template>
          </el-table-column>
          <el-table-column v-if="formData.limit_buy == 1" label="限购数量" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                v-model="formData.goods[scope.$index].limit_buy_number" type="number"
                @input="onKeyInputLimitBuy($event, scope.$index)"></el-input>
            </template>
          </el-table-column>
          <el-table-column v-if="formData.gift_type > -1" :label="giftTypeDict[formData.gift_type] || '赠送数量'" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                v-model="formData.goods[scope.$index].gift_number" type="number"></el-input>
            </template>
          </el-table-column>
          <!-- <el-table-column v-if="formData.activity_id == 1" label="起始销量" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.goods[scope.$index].sale_number" type="number"></el-input>
            </template>
          </el-table-column> -->
          <!-- <el-table-column v-if="formData.a_type == 2" label="最高可用等级" width="150">
            <template slot-scope="scope">
              <el-select placeholder="不限" name="searType" v-model="formData.goods[scope.$index].vip_level">
                <el-option v-for="item in leaderData" :label="item.name" :value="item.level" :key="item.level"></el-option>
              </el-select>
            </template>
          </el-table-column> -->
          <el-table-column v-if="formData.a_type == 2" label="成长值" width="160">
            <template slot-scope="scope">
              <el-input style="width: 130px" auto-complete="off" placeholder="大于0的正数"
                v-model="formData.goods[scope.$index].growth_value" type="number"></el-input>
            </template>
          </el-table-column>

          <template v-if="formData.allow_custom_growth == 1">
            <el-table-column label="自定义成长值" width="160">
              <template slot-scope="scope">
                <el-input style="width: 130px" auto-complete="off" placeholder="大于0的正数"
                  v-model="formData.goods[scope.$index].growth_value" type="number"
                  :disabled="!formData.goods[scope.$index].allow_custom_growth"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="赠送成长值" width="100" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  <el-switch v-model="formData.goods[scope.$index].allow_custom_growth" active-color="#13ce66"
                    inactive-color="#ccc"></el-switch>
                </div>
              </template>
            </el-table-column>
          </template>

          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <template v-if="$auths.includes('activity/goodsSkuDelete')">
                <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-if="formData.limit_type == 1" label="限制时间">
        <el-date-picker v-model="formData.time" type="datetimerange" :picker-options="formPickerOptions"
          range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss" :editable="false"></el-date-picker>
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
      leaderData: [],
      // 赠送数量字典
      giftTypeDict: {
        [-1]: '不赠送',
        [1]: '赠送集品豆',
        [2]: '赠送健康豆',
        [3]: '赠送集品券'
      },
      ...formNTimePickerConfig
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    if(!this.leaderData || this.leaderData.length == 0) {
      this.getVdc();
    }
  },
  methods: {
    getVdc() {
      let leaderData = [{
        level: 0,
        name: '注册用户'
      }];
      this.$get('/admin/vdc/list', null, res => {
        for(let i = res.data.length - 1; i >= 0; i--) {
          leaderData.push(res.data[i]);
        }
        this.leaderData = leaderData;
      });
    },
    deleteCommedity(index) {
      this.$confirm('是否删除该sku，该操作不可恢复，请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          activity_id: this.formData.activity_id,
          goods_sn: this.formData.goods[index].goods_sn,
          sku_sn: this.formData.goods[index].sku_sn,
        }
        this.$post('/admin/activity/goodsSkuDelete', params, res => {
          this.formData.goods.splice(index, 1);
          this.$message.success('删除成功')
        });
      }).catch(() => {});
    },
    // 限购数量输入
    onKeyInputLimitBuy(value, index) {
      const skuGoods = this.formData.goods[index];
      this.formData.goods.forEach((e, i) => {
        // 过滤掉别的商品和当前的sku
        if (e.goods_sn == skuGoods.goods_sn && e.sku_sn != skuGoods.sku_sn) {
          const changeValue =  {
            ...e
          };
          changeValue.limit_buy_number = value;
          this.$set(this.formData.goods, i, changeValue);
        }
      })
    },
  }
};
</script>
