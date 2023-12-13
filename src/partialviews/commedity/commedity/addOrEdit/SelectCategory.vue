<template>
  <div>
    <div class="category-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入分类名" @keyup.enter.native="queryInfo"></el-input>
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
              <div class="commodity-select-wrapper commodity-categories">
                <div v-for="(item, index) in categories" :class="{'commodity-select-item': true, 'active': categoryIndex == index}" :key="item.code" @click="selectCategory(index)">{{item.name}}</div>
                
              </div>
              <div class="commodity-select-wrapper commodity-sub-categories">
                <div v-for="(item, index)  in subCategories" :class="{'commodity-select-item': true, 'active': subCategoryIndex == index}" :key="item.code" @click="selectSubCategory(index)">{{item.name}}</div>
                
              </div>
              <div class="commodity-select-wrapper commodity-brands">
                <div v-for="(item, index)  in brands" :class="{'commodity-select-item': true, 'active': brandIndex == index}" :key="item.brand_code" @click="selectBrand(index)">{{item.brand_name}}</div>
                
              </div>
              <div class="commodity-select-title-box">
                <div class="commodity-select-title">大分类</div>
                <div class="commodity-select-title">小分类</div>
                <div class="commodity-select-title">品牌</div>
              </div>
            </div>
            
          </el-form-item>
          <el-form-item style="margin-top: 30px;" label="" label-width="40px">
            <div class="form-tips" style="margin: 0 15px">！注意确定分类时会重置产品规格与产品sku数据</div>
          </el-form-item>
        </el-form>



    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectCategory',
  data() {
    return {
      categories: [],
      subCategories: [],
      brands: [],
      categoryIndex: 0,
      subCategoryIndex: 0,
      brandIndex: 0,
      queryForm: {
        keyword: ''
      }
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getCategories();
  },
  methods: {
      queryInfo(){
        this.getCategories();
      },
      
      getCategories() {
        let params = {
          keyword: this.queryForm.keyword,
          searType: 1,
          type: 2 // 1 父子 2父级
        };

        this.$get('/admin/category/list', params, res => {
          this.categories =  res.data;
          this.categoryIndex = 0;
          this.subCategoryIndex = 0;
          this.brandIndex = 0;
          if(!this.categories[this.categoryIndex]) {
            this.subCategories = [];
            this.brands = [];
            return;
          }
          this.getSubCategories();
        });
      },
      getSubCategories() {
        let params = {
          p_code: this.categories[this.categoryIndex].code,
          keyword: '',
          type: 1 // 1 父子 2父级
        };

        this.$get('/admin/category/list', params, res => {
          this.subCategories = res.data;
          if(!this.subCategories[this.subCategoryIndex]) {
            this.brands = [];
            return;
          }
          this.getBrands();
        });
      },
      getBrands() {
        let params = {
          category_code: this.subCategories[this.subCategoryIndex].code,
          keyword: '',
          type: 1 // 1 父子 2父级
        };

        this.$get('/admin/brand/list', params, res => {
          this.brands = res.data;
        });
      },
      selectCategory(index) {
        this.categoryIndex = index;
        this.subCategoryIndex = 0;
        this.brandIndex = 0;
        this.getSubCategories();
      },
      selectSubCategory(index) {
        this.subCategoryIndex = index;
        this.brandIndex = 0;
        this.getBrands();
      },
      selectBrand(index) {
        this.brandIndex = index;
      }
  }
};
</script>

<style lang="less" scoped>
.discount-commodity-select {
  position: relative;
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
.commodity-select-title-box {
  position: absolute;
  top: 300px;
  left: 0;
  display: flex;
  align-items: center;
}
.commodity-select-title {
  width: 200px;
  margin: 0 15px;
  font-size: 12px;
  text-align: center;
  color: #999;
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