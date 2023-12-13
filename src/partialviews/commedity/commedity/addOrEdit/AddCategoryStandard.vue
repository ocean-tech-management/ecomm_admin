<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="规格名称" label-width="100px">
        <el-input auto-complete="off" placeholder="填一下新规格的名称呗" v-model="formData.attribute_name"></el-input>
      </el-form-item>
      <el-form-item label="规格标志" label-width="100px">
        <el-input auto-complete="off" placeholder="填一下新规格的标志呗" maxlength="10" v-model="formData.attr_sn"></el-input>
        <div class="form-tips">规格标志是唯一的，不能重复</div>
      </el-form-item>
      <el-form-item label="规格说明" label-width="100px">
        <el-input
          auto-complete="off"
          type="textarea"
          placeholder="请输入规格的简单说明哦"
          v-model="formData.desc"
        ></el-input>
      </el-form-item>
      <el-form-item label="规格属性" label-width="100px">
        <div class="standard-items">
          <div class="standard-inputs">
            <el-input v-for="(item, index) in formData.attributeValues" class="standard-input" auto-complete="off" placeholder="新属性名" v-model="item.attribute_value" :key="index"></el-input>
          </div>
          <div>
            <el-button type="primary" @click="addStandard">新增</el-button>
          </div>
        </div>
        <div style="font-size: 12px; color: #999;">规格属性值为空会被忽略</div>
      </el-form-item>
      <el-form-item label="归属分类" label-width="100px">
        <div class="form-content-static">{{formData.category_name}}</div>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  name: 'AddCategoryStandard',
  data() {
    return {
    };
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
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
  .standard-items {
    display: flex;
    flex-wrap: wrap;
  }
  .standard-inputs {
    width: 550px;

  }
  .standard-input {
    width: 250px;
    margin-right: 15px;
    margin-bottom: 15px;
  }

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