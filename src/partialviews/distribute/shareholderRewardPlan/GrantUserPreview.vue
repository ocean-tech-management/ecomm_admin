<template>
  <div>

    <el-table style="width: 100%" :data="dataList">
      <el-table-column label="序号" type="index" width="80">
      </el-table-column>
      <el-table-column label="姓名" width="140" prop="name">
      </el-table-column>
      <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
      <el-table-column label="操作">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

export default {
  name: 'GrantUserPreview',
  props: {
    dataList: Array
  },
  data() {
    return {}
  },
  mounted() {
  },
  methods: {


  }
};
</script>
