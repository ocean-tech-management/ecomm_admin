<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="卡券批次">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="请输入卡券名字" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="时效性">
        <el-radio-group v-model="formData.limit_type">
          <el-radio :label="1">有时效</el-radio>
          <el-radio :label="-1">无时效</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.limit_type == 1" label="有效时间">
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
      <el-form-item label="批次说明">
        <el-input
          style="max-width: 350px"
          auto-complete="off"
          type="textarea"
          placeholder="请输入卡券批次的简单说明哦"
          v-model="formData.remark"
        ></el-input>
      </el-form-item>
      <el-form-item label="限领">
        <el-input 
          style="max-width: 250px"
          auto-complete="off"
          placeholder="请填入" 
          type="number"
          v-model="formData.take_limit"
        ></el-input>
        <div class="form-tips">每人限领数量（正整数）</div>
      </el-form-item>

    </el-form>
    <div class="category-ctrl">
      <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect">
        <el-form-item label="关键词" prop="keyword" label-width="100px">
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
        <el-form-item label="选择" label-width="85px">
          <div class="discount-commodity-select">
            <div class="commodity-select-wrapper commodity-spus">
              <div v-for="(item, index) in spu" :class="{'commodity-select-item': true, 'active': spuIndex == index}" :key="item.goods_sn" @click="selectSpu(index)">{{item.title}}</div>
            </div>
            <div class="commodity-select-wrapper commodity-skus">
              <div v-for="(item, index)  in sku" :class="{'commodity-select-item': true, 'active': skuIndex == index}" :key="item.sku_sn" @click="selectSku(index)" @dblclick="confirmSku">{{item.attrs}}</div>
            </div>
            <el-button type="primary" :disabled="sku.length == 0" @click="confirmSku">加入到待添加列表</el-button>
          </div>
          
        </el-form-item>
        <el-form-item label="" label-width="0">
          <el-table style="width: 100%" :data="formData.goods">
            <el-table-column label="名称" prop="title">
            </el-table-column>
            <el-table-column label="规格" width="200" prop="attrs">
            </el-table-column>
            <el-table-column label="可用库存" width="150" prop="stock">
            </el-table-column>
            <el-table-column label="数量" width="150">
              <template slot-scope="scope">
                <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.goods[scope.$index].number" type="number"></el-input>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: "AddGiftCardBatch",
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

      ...formNTimePickerConfig,

    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getCategories();
  },
  methods: {
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
        this.spu =  res.data;
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
          stock: this.sku[this.skuIndex].stock,
          number: 0
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
            stock: this.sku[i].stock,
            number: 0
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

.category-ctrl {
  margin-top: 40px;
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
</style>