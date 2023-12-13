<template>
  <div>
    <div class="category-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
          <el-form-item label="商品名称" prop="keyword">
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
        <!-- <div class="category-value">中医类</div> -->
        <el-form>
          <el-form-item label="选择" label-width="40px">
            <div class="discount-commodity-select">
              <div class="commodity-select-wrapper commodity-spus">
                <div v-for="(item, index) in spu" :class="{'commodity-select-item': true, 'active': spuIndex == index}" :key="item.goods_sn" @click="selectSpu(index)">{{item.title}}</div>
              </div>
              <div class="commodity-select-wrapper commodity-skus">
                <div v-for="(item, index)  in sku" :class="{'commodity-select-item': true, 'active': skuIndex == index}" :key="item.sku_sn" @click="selectSku(index)" @dblclick="confirmSku">{{item.is_all === 1 ? '全部商品': item.attrs}}</div>
              </div>
              <el-button type="primary" :disabled="sku.length == 0" @click="confirmSku">确认 ></el-button>
              <div class="commodity-select-wrapper commodity-result">
                <div v-for="(item, index) in formData" class="commodity-select-item" :title="item.title + ' (' + item.attrs + ')'" :key="item.code">
                  <div class="select-item-flex" >{{item.title}} {{item.attrs ? (' (' + item.attrs + ')') : ''}}</div>
                  <div class="select-item-delete" @click="deleteCommedity(index)">×</div>
                </div>
              </div>
            </div>
            
          </el-form-item>
          <el-form-item label="" label-width="40px">
            <div class="form-tips" style="margin: 0 15px">选择商品项，点击确认添加至右侧优惠商品列表哦</div>
          </el-form-item>
        </el-form>



    </div>
  </div>
</template>

<script>
export default {
  name: 'discountCommodity',
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
      categories: []
    };
  },
  props: {
    formData: Array
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
        this.formData.splice(index, 1);
      },
      confirmSku() {
        
        if(!this.sku[this.skuIndex].isAll) {
          for(let i = 0; i < this.formData.length; i++) {
            if(this.formData[i].sku_sn == this.sku[this.skuIndex].sku_sn) {
              return;   //已被选中
            }
          }
          this.formData.push(this.sku[this.skuIndex]);
        } else {
          hasSelectedLoop: for(let i = 0; i < this.sku.length; i++) {
            if(this.sku[i].isAll) continue hasSelectedLoop;
            for(let j = 0; j < this.formData.length; j++) {
              if(this.sku[i].sku_sn == this.formData[j].sku_sn) {
                continue hasSelectedLoop;   //已被选中
              }
            }
            
            this.formData.push(this.sku[i]);
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
  width: 200px;
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