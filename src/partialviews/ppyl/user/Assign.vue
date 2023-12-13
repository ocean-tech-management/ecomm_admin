<template>
  <div>
    <el-form :model="formData" label-width="80px">
      <el-form-item label="指定用户">
        <div class="form-content-static">{{formData.name}}</div>
      </el-form-item>
      <el-form-item label="调整时间">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="填一下调整时间" v-model="formData.time_val"></el-input>
        <el-select style="width: 100px" placeholder="请选择调整时间单位" name="time_type" v-model="formData.time_type">
          <el-option label="天" :value="1"></el-option>
          <el-option label="小时" :value="2"></el-option>
          <el-option label="分钟" :value="3"></el-option>
          <el-option label="秒" :value="4"></el-option>
        </el-select>
        <div class="form-tips">备注：有效时间的值要为1，2，3，4这种正整数</div>
        <div class="form-tips">
          调整库存值为
          <span class="warning-color">正数</span>
          时为
          <span class="success-color">拉长有效期</span>
          ，为 <span class="warning-color">负数</span>
          时则为
          <span class="error-color">缩短有效期</span>
          。
          缩短有效期低于当前有效期时会使用户cvip会员身份失效</div>
      </el-form-item>
      
    </el-form>

  </div>
</template>

<script>
export default {
  name: "Assign",
  data() {
    return {
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],
    };
  },
  props: {
    formData: Object,
    leaderData: Array
  },
  mounted() {},
  methods: {
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.formData.link_uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/member/list', queryVal, res => {
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].uid == this.formData.uid) {
            // 剔除他自己本身
            dataList.splice(i, 1);
            break;
          }
        }
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.formData.link_uid = null;
      this.getUsers();
    },
  }
};
</script>