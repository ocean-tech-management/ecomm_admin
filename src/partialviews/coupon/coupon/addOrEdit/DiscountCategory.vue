<template>
  <div>
    <div class="category-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="categorySelect" class="demo-form-inline">
          <el-form-item label="分类名称" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入分类名称" @keyup.enter.native="queryInfo"></el-input>
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
            <div class="discount-category-select">
              <div class="category-select-wrapper category-spus">
                <div v-for="(item, index) in categories" :class="{'category-select-item': true, 'active': categoryIndex == index}" :key="item.code" @click="selectCategory(index)" @dblclick="confirmCategory">{{item.name}}</div>
              </div>
              <el-button type="primary" :disabled="categories.length == 0" @click="confirmCategory">确认 ></el-button>
              <div class="category-select-wrapper category-result">
                <div v-for="(item, index) in formData" class="category-select-item" :key="item.code">
                  <div class="select-item-flex">{{item.name}}</div>
                  <div class="select-item-delete" @click="deleteCategory(index)">×</div>
                </div>
              </div>
            </div>
            
          </el-form-item>
          <el-form-item label="" label-width="40px">
            <div class="form-tips" style="margin: 0 15px">选择类目，点击确认添加至右侧优惠类目列表哦</div>
          </el-form-item>
        </el-form>

    </div>
  </div>
</template>

<script>
export default {
  name: 'discountCategory',
  data() {
    return {
      categoryIndex: 0,
      queryForm: {
        keyword: ''
      },
      categories: []
    };
  },
  props: {
    formData: Array
  },
  mounted() {

  },
  methods: {
      queryInfo() {
        let params = {
          keyword: this.queryForm.keyword,
          type: 3 
        };

        this.$get('/admin/category/list', params, res => {
          this.categories =  res.data;
        });
      },
      selectCategory(index) {
        this.categoryIndex = index;
      },
      confirmCategory() {
        for(let i = 0; i < this.formData.length; i++) {
          if(this.formData[i].code == this.categories[this.categoryIndex].code) {
            return;   //已被选中
          }
        }
        this.formData.push(this.categories[this.categoryIndex]);
      },
      deleteCategory(index) {
        this.formData.splice(index, 1);
      }
  }
};
</script>

<style lang="less" scoped>
.discount-category-select {
  display: flex;
  align-items: center;
}
.category-select-wrapper {
  width: 200px;
  height: 300px;
  margin: 0 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}
.category-select-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}
.category-select-item:hover {
  background-color: #f2f3f3;
}
.category-select-item.active {
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