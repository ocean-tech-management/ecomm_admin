<template>
  
  <div>
    <el-form>
      <el-form-item label="品牌名" label-width="80px" prop="brand_name" >
        <el-input v-model="formData.brand_name" placeholder="请输入品牌名称"></el-input>
      </el-form-item>
    </el-form>
    <div class="category-ctrl">
      <div style="font-size: 1.2em;margin-top: 30px;margin-bottom: 10px;">分类筛选条件</div>
      <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
        <el-form-item label="关键词" label-width="80px" prop="keyword" @keyup.enter.native="queryInfo">
          <el-input v-model="queryForm.keyword" placeholder="请输入分类名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryInfo">筛选</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="category-commodities">
        <!-- <div class="category-value">中医类</div> -->
        <el-form>
          <el-form-item label="所属分类" label-width="80px">
            <div class="discount-commodity-select">
              <div class="commodity-select-wrapper commodity-categories">
                <div v-for="(item, index) in categories" :class="{'commodity-select-item': true, 'active': categoryIndex == index}" :key="item.code" @click="selectCategory(index)">{{item.name}}</div>
              </div>
              <div class="commodity-select-wrapper commodity-sub-categories">
                <div v-for="(item, index)  in subCategories" :class="{'commodity-select-item': true, 'active': subCategoryIndex == index}" :key="item.code" @click="selectSubCategory(index)">{{item.name}}</div>
              </div>
            </div>
          </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Addbrand',
  data() {
    return {
      categories: [],
      subCategories: [],
      categoryIndex: 0,
      subCategoryIndex: 0,
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
        if(!this.$auths.includes('category/list')) {
          return this.$message.warning('您缺少查看分类列表的权限，请联系管理员为您添加');
        }
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
          if(this.categories.length == 0) {
            this.subCategories = [];
            this.formData.category_code = '';
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
          this.formData.category_code = this.subCategories[0] ? this.subCategories[0].code : '';
        });
      },
      selectCategory(index) {
        this.categoryIndex = index;
        this.subCategoryIndex = 0;
        this.getSubCategories();
      },
      selectSubCategory(index) {
        this.subCategoryIndex = index;
        this.formData.category_code = this.subCategories[this.subCategoryIndex].code || '';
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
</style>