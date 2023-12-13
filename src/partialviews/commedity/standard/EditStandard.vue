<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="规格名称" label-width="100px">
        <el-input auto-complete="off" placeholder="填一下新规格的名称呗" v-model="formData.attribute_name"></el-input>
      </el-form-item>
      <el-form-item label="规格说明" label-width="100px">
        <div class="form-content-static">{{formData.desc}}</div>
      </el-form-item>
      <el-form-item label="归属分类" label-width="100px">
        <div class="form-content-static">{{formData.category_name}}</div>
      </el-form-item>

      <div class="category-ctrl">
        <div style="font-size: 1.2em;margin-top: 30px;margin-bottom: 10px;">分类筛选条件(<span class="success-color">如不摁筛选为保持原分类</span>)</div>
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
          <el-form-item label="关键词" label-width="100px" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入分类名" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">筛选</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="category-commodities">
          <el-form>
            <el-form-item label="所属分类" label-width="100px">
              <div class="discount-commodity-select">
                <div class="commodity-select-wrapper commodity-categories">
                  <div v-for="(item, index) in categories" :class="{'commodity-select-item': true, 'active': categoryIndex == index}" :key="item.code" @click="selectCategory(index)">{{item.name}}</div>
                </div>
                <div class="commodity-select-wrapper commodity-sub-categories">
                  <div v-for="(item, index)  in subCategories" :class="{'commodity-select-item': true, 'active': subCategoryIndex == index}" :key="item.code" @click="selectSubCategory(index)">{{item.name}}</div>
                </div>
              </div>
              
              <div style="font-size: 12px; color: #999;">要更改归属分类请点击上面筛选按钮，不摁筛选为保持原样</div>
            </el-form-item>
          </el-form>
      </div>

    </el-form>
  </div>
</template>

<script>
export default {
  name: 'EditStandard',
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
    this.initContent();
  },
  methods: {
    initContent() {
      this.categories = [];
      this.subCategories = [];
      this.categoryIndex = 0;
      this.subCategoryIndex = 0;
    },
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
      },
      addStandard() {
        this.formData.attributeValues.push({
          attribute_value: '新规格',
          remark: ''
        })
      }
  }
};
</script>

<style scoped>

  .discount-commodity-select {
    display: flex;
    align-items: center;
  }
  .commodity-select-wrapper {
    width: 200px;
    height: 300px;
    margin: 0 15px 0 0;
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