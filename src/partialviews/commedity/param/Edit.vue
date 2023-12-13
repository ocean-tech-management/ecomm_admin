<template>
  <div>
    <el-form class="param" @submit.native.prevent>
      <el-form-item label="模板名称" label-width="100px">
        <el-input auto-complete="off" placeholder="填一下新模板名称" v-model="formData.title"></el-input>
      </el-form-item>
      <div class="group-content">
        <div v-for="(item, index) in formData.content" class="group" :key="index">
          <el-form-item label="组件标题" label-width="100px">
            <el-input style="width: 450px" auto-complete="off" placeholder="填一下新组件标题" v-model="formData.content[index].title"></el-input>
            <el-button v-if="formData.content.length > 1" type="danger" @click="deleteItem(index)">删除组件</el-button>
          </el-form-item>
          <div v-for="(subgroup, subgroupIndex) in item.subgroups" class="subgroup" :key="subgroupIndex">
            <el-input style="width: 200px" auto-complete="off" placeholder="填一下参数名" v-model="formData.content[index].subgroups[subgroupIndex].name"></el-input>
            <el-input style="width: 300px" auto-complete="off" placeholder="填一下参数值" v-model="formData.content[index].subgroups[subgroupIndex].info"></el-input>
            <el-button v-if="item.subgroups.length > 1" type="warning" @click="deleteSubgroup(index, subgroupIndex)">删除</el-button>
            <el-button v-if="subgroupIndex == item.subgroups.length - 1" type="primary" @click="addSubgroup(index)">增加新参数</el-button>
          </div>
        </div>
      </div>
      <el-form-item label label-width="100px">
        <el-button type="primary" @click="addItem">新增组件</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default ({
  name: 'EditParam',
  data() {
    return {}
  },
  props: {
    formData: Object
  },
  methods: {
    addItem() {
      this.formData.content.push({
        title: '',
        subgroups: [{
          name: '',
          info: ''
        }]
      })
    },
    deleteItem(index) {
      this.formData.content.splice(index, 1);
    },
    deleteSubgroup(index, subgroupIndex) {
      this.formData.content[index].subgroups.splice(subgroupIndex, 1);
    },
    addSubgroup(index) {
      this.formData.content[index].subgroups.push({
        name: '',
        info: ''
      })
    },
  }
})
</script>
<style lang="less" scoped>
.group-content {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f2f3f3;
}
.group {
  &:not(:last-child) {
    padding-bottom: 10px;
    margin-bottom: 15px;
    border-bottom: 1px solid #ccc;
  }
}
.subgroup {
  padding-left: 100px;
  margin-bottom: 5px;
}

</style>
