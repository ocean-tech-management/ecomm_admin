<template>
  <div>
    <div class="category-ctrl">
      <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
        <el-form-item label="关键词" prop="keyword">
          <el-input v-model="queryForm.keyword" placeholder="请输入商品名称" @keyup.enter.native="queryInfo"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category_code">
          <el-select placeholder="不限" name="category_code" v-model="queryForm.category_code">
            <el-option label="不限" value></el-option>
            <el-option v-for="item in categories" :label="item.name" :value="item.code" :key="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryInfo">筛选</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="category-commodities">
      <el-form>
        <el-form-item label="选择">
          <div class="discount-commodity-select">
            <div class="commodity-select-wrapper commodity-spus">
              <div v-for="(item, index) in spu" :class="{ 'commodity-select-item': true, 'active': spuIndex == index }"
                :key="item.goods_sn" @click="selectSpu(index)">{{ item.title }}</div>
            </div>
            <div class="commodity-select-wrapper commodity-skus">
              <div v-for="(item, index)  in sku" :class="{ 'commodity-select-item': true, 'active': skuIndex == index }"
                :key="item.sku_sn" @click="selectSku(index)" @dblclick="confirmSku">{{ item.attrs }}</div>
            </div>
            <el-button type="primary" :disabled="sku.length == 0" @click="confirmSku">加入到待添加列表</el-button>
          </div>
        </el-form-item>
        <el-form-item label="" label-width="0">
          <el-table style="width: 100%" :data="formData.goods">
            <el-table-column label="名称" prop="title" />
            <el-table-column label="规格" prop="attrs" />
            <el-table-column label="销售价格" width="150" prop="sale_price" />
            <el-table-column label="最高成本价" width="150" prop="max_purchase_price" />
            <el-table-column label="活动价" width="150">
              <template slot-scope="scope">
                <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                  v-model="formData.goods[scope.$index].activity_price" type="number"></el-input>
              </template>
            </el-table-column>
            <!-- <el-table-column v-if="formData.activity_id == 1" label="起始销量" width="150">
                <template slot-scope="scope">
                  <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.goods[scope.$index].sale_number" type="number"></el-input>
                </template>
              </el-table-column> -->
            <el-table-column v-if="formData.limit_buy == 1" label="限购数量" width="150">
              <template slot-scope="scope">
                <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                  v-model="formData.goods[scope.$index].limit_buy_number"
                  @input="onKeyInputLimitBuy($event, scope.$index)" type="number"></el-input>
              </template>
            </el-table-column>
            <el-table-column v-if="formData.gift_type > -1" :label="giftTypeDict[formData.gift_type] || '赠送数量'"
              width="150">
              <template slot-scope="scope">
                <el-input style="width: 120px" auto-complete="off" placeholder="填一下"
                  v-model="formData.goods[scope.$index].gift_number" type="number"></el-input>
              </template>
            </el-table-column>
            <el-table-column v-if="formData.a_type == 2" label="最高可用等级" width="150">
              <template slot-scope="scope">
                <el-select placeholder="不限" name="searType" v-model="formData.goods[scope.$index].vip_level">
                  <el-option v-for="item in leaderData" :label="item.name" :value="item.level"
                    :key="item.level"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column v-if="formData.a_type == 2" label="成长值" width="150">
              <template slot-scope="scope">
                <el-input style="width: 120px" auto-complete="off" placeholder="大于0的正数"
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
                <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item v-if="formData.limit_type == 1" label="限制时间" label-width="100px">
          <el-date-picker v-model="formData.time" type="datetimerange" :picker-options="formPickerOptions"
            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss" :editable="false"></el-date-picker>
        </el-form-item>
      </el-form>
      <el-alert v-if="formData.limit_buy == 1" title="请注意: 商品限购为SPU级别限购, 即商品级别的限购" type="warning" show-icon
        :closable="false"></el-alert>
    </div>
  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: 'AddCommedities',
  data() {
    return {
      spu: [],
      sku: [],
      spuIndex: 0,
      skuIndex: 0,
      queryForm: {
        keyword: '',
        category_code: ''
      },
      categories: [],

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
    this.getCategories();
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
    getCategories() {
      if(!this.$auths.includes('category/list')) {
        return;
      }
      let params = {
        keyword: '',
        type: 2 // 1 父子 2父级
      };

      this.$get('/admin/category/list', params, res => {
        this.categories =  res.data;
      });
    },
    queryInfo(){
      if(this.queryForm.keyword === '' || this.queryForm.keyword.trim() === '') {
        return this.$message.warning('请输入有效的关键词');
      }
      let params = {
        keyword: this.queryForm.keyword,
        category_code: this.queryForm.category_code,
        searType: 2
      };

      this.$get('/admin/spu/list', params, res => {
        this.spu = res.data || [];
        if(this.spu.length == 0) return this.sku = [];
        this.getSku();
      });
    },
    getSku() {
      let params = {
        goods_sn: this.spu[this.spuIndex].goods_sn,
        searType: 2
      };

      this.$get('/admin/sku/list', params, res => {
        let sku = res.data;
        for(let i = 0; i < sku.length; i++) {
          let specs = JSON.parse(sku[i].specs);
          sku[i].attrs = Object.values(specs).join('、');
        }
        sku.unshift({
          attrs: '全部商品',
          isAll: true
        })
        this.sku = sku;
        this.skuIndex = 0;
      });
    },
    selectSpu(index) {
      this.spuIndex = index;
      this.getSku();
    },
    selectSku(index) {
      this.skuIndex = index;
    },

    deleteCommedity(index) {
      this.formData.goods.splice(index, 1);
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
    confirmSku() {
      if(!this.sku[this.skuIndex].isAll) {
        for(let i = 0; i < this.formData.goods.length; i++) {
          if(this.formData.goods[i].sku_sn == this.sku[this.skuIndex].sku_sn) {
            return;   //已被选中
          }
        }
        let item = {
          title: this.sku[this.skuIndex].title,
          goods_sn: this.sku[this.skuIndex].goods_sn,
          attrs: this.sku[this.skuIndex].attrs,
          sku_sn: this.sku[this.skuIndex].sku_sn,
          activity_price: this.sku[this.skuIndex].sale_price,
          sale_price: this.sku[this.skuIndex].sale_price,
          max_purchase_price: this.sku[this.skuIndex].max_purchase_price,
          sale_number: 0
        }
        if (this.formData.limit_buy == 1) item.limit_buy_number = 0; // 限购默认0
        if (this.formData.gift_type > -1) item.gift_number = item.sale_price ? Number(item.sale_price) : ''; // 默认同商品销售价格
        if(this.formData.a_type == 2) {
          item.growth_value = item.sale_price ? (parseFloat(item.sale_price) / 100).toFixed(2) : 0;
          item.vip_level = 0;
        } else {
          if(this.formData.allow_custom_growth == 1) {
            item.growth_value = 0;
            item.allow_custom_growth = true;
          }
        }
        this.formData.goods.push(item);
      } else {
        hasSelectedLoop: for(let i = 0; i < this.sku.length; i++) {
          if(this.sku[i].isAll) continue hasSelectedLoop;
          for(let j = 0; j < this.formData.goods.length; j++) {
            if(this.sku[i].sku_sn == this.formData.goods[j].sku_sn) {
              continue hasSelectedLoop;   //已被选中
            }
          }

          let item = {
            title: this.sku[i].title,
            goods_sn: this.sku[i].goods_sn,
            attrs: this.sku[i].attrs,
            sku_sn: this.sku[i].sku_sn,
            activity_price: this.sku[i].sale_price,
            sale_price: this.sku[i].sale_price,
            max_purchase_price: this.sku[i].max_purchase_price,
            sale_number: 0,
          }
          if (this.formData.limit_buy == 1) item.limit_buy_number = 0; // 限购默认0
          if (this.formData.gift_type > -1) item.gift_number = item.sale_price ? Number(item.sale_price) : ''; // 默认同商品销售价格
          if(this.formData.a_type == 2) {
            item.growth_value = item.sale_price ? (parseFloat(item.sale_price) / 100).toFixed(2) : 0;
            item.vip_level = 0;
          } else {
            if(this.formData.allow_custom_growth == 1) {
              item.growth_value = 0;
              item.allow_custom_growth = true;
            }
          }
          this.formData.goods.push(item);
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.discount-commodity-select {
  display: flex;
  align-items: center;
}

.commodity-select-wrapper {
  width: 250px;
  height: 300px;
  margin: 0 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}

.commodity-select-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}

.commodity-select-item:hover {
  background-color: #f2f3f3;
}

.commodity-select-item.active {
  color: #fff;
  background-color: #618df5;
}

.select-item-flex {
  flex: 1;
  width: 80px;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
}

.select-item-delete {
  padding: 0 10px;
  margin-right: -15px;
  font-size: 24px;
  font-weight: 500;
}

.select-item-delete:hover {
  color: #618df5;
}

// .category-ctrl {
//     display: flex;
//     padding: 0 10px;
//     margin-bottom: 30px;
// }
// .category-commodities {
//     padding: 10px;
// }
// .category-commmodity {
//     display: flex;
//     align-items: center;
//     margin-top: 5px;
//     padding: 5px 0;
// }
// .category-value {
//     font-size: 16px;
//     margin-bottom: 15px;
// }
// .category-commodity-name {
//     flex: 1;
//     width: 80px;
//     margin-right: 15px;
//     white-space: nowrap;
//     text-overflow: ellipsis;
//     overflow: hidden;
// }
</style>
