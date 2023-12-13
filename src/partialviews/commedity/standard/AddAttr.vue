<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="属性名称" label-width="100px">
        <el-input auto-complete="off" placeholder="填一下新属性的名称呗" v-model="formData.attribute_value"></el-input>
      </el-form-item>


    </el-form>
  </div>
</template>

<script>
export default {
  name: 'AddAttr',
  data() {
    return {

    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
    
  }
};
</script>
