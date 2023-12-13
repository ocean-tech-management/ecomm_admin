<template>
  <div>
    <el-form :model="formData" label-width="80px">
      <el-form-item label="指定用户">
        <div class="form-content-static">{{formData.name}}</div>
      </el-form-item>
      <el-form-item label="指定等级" prop="level">
        <el-select class="standard-select" placeholder v-model="formData.level" @change="$forceUpdate()">
          <el-option v-for="leader in leaderData" :label="leader.name" :value="leader.level" :key="leader.level"></el-option>
        </el-select>
      </el-form-item>
      
    </el-form>

  </div>
</template>

<script>
export default {
  name: "AssignTeamDivide",
  data() {
    return {
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],

      leaderData: []
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getTeamVdc();
  },
  methods: {
    getTeamVdc() {
      this.$get('/admin/teamVdc/list', null, res => {
        let leaderData = res.data || [];

        this.leaderData = leaderData;
      });
    }
  }
};
</script>