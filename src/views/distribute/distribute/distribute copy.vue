<template>
  <el-form :model="formData">
    <div class="subpage-content">
      <div class="default-container">
        <div class="table-ctrls">
          <div class="table-title">分润设置</div>
          <div class="table-ctrl">
            <div 
              v-for="(item, index) in rules"
              :class="{'table-ctrl-static-tab': true, 'table-ctrl-tab-active': formData.level === item.level}"
              @click="updateDistributeType(index)" 
              :key="item.level"
            >{{item.name}}</div>
          </div>
        </div>
        <div class="rule-page">
          <el-form-item label="分润层级" label-width="300px">
            <el-select placeholder name="vdc_type" v-model="formData.vdc_type">
              <el-option label="一级" :value="1"></el-option>
              <el-option label="二级" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="一级分润佣金比例" label-width="300px">
            <el-input 
              type="number"
              class="rate-input"
              auto-complete="off"
              placeholder="请填写"
              v-model="formData.vdc_one"
            ></el-input>
            <div class="form-tips">备注：一级分润奖励的佣金从利润中抽取，0~1之间，最多保留两位小数哦</div>
          </el-form-item>
          <el-form-item label="二级分润佣金比例" label-width="300px">
            <el-input
              type="number"
              class="rate-input"
              auto-complete="off"
              placeholder="请填写"
              :disabled="formData.vdc_type !== 2"
              v-model="formData.vdc_two"
            ></el-input>
            <div class="form-tips">备注：二级分润奖励的佣金从利润中抽取，0~1之间，最多保留两位小数哦</div>
          </el-form-item>
          <!-- <el-form-item label="团队分红" label-width="300px">
            <el-input auto-complete="off" placeholder="填一下" v-model="formData.dividend"></el-input>
          </el-form-item>
          <el-form-item label="团队分红方式" label-width="300px">
            <el-select placeholder name="dividend_type" v-model="formData.dividend_type">
              <el-option label="7天一结" :value="1"></el-option>
              <el-option label="一月一结" :value="2"></el-option>
              <el-option label="一季一结" :value="3"></el-option>
              <el-option label="满3万一结" :value="4"></el-option>
              <el-option label="满10万一结" :value="5"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label label-width="300px">
            <el-button type="primary" @click="updateDistribute">确定</el-button>
          </el-form-item>
        </div>
      </div>
    </div>
  </el-form>
</template>

<script>
import { publishDate } from "@/config.js";

export default {
  name: "distribute",
  data() {
    return {
      rules: [],
      formData: {},
      token: {
        token: localStorage.getItem("token") || ""
      }
    };
  },
  mounted() {
    this.getDistributeRules( res => {
      this.formData = res.data[0];
    });
  },
  methods: {
    getDistributeRules(handler) {
      this.$get("/admin/divide/list", null, res => {
        let data = res.data;
        this.rules = data;
        if(handler && typeof handler == 'function') handler(res);
      });
    },
    updateDistributeType(index) {
      this.formData = this.rules[index];
    },
    updateDistribute() {
      let params = JSON.parse(JSON.stringify(this.formData));
      delete(params.create_time);
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
          return this.$message.error('请填写完所有信息哦');
        }
      }
      if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.vdc_one) || !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.vdc_two)) {
        return this.$message.error('分润比例都要为正数哦');
      }

      // 处理成两位小数
      params.vdc_one = parseFloat(params.vdc_one).toFixed(2);
      params.vdc_two = parseFloat(params.vdc_two).toFixed(2);
      this.$post('/admin/divide/update', params, res => {
        this.$message.success('修改成功');
        this.getDistributeRules();
      });

    }
  }
};
</script>

<style lang="less" scoped>
.table-ctrl-static-tab {
  display: inline-block;
  margin-left: 15px;
  padding: 5px 25px;
  border: 1px solid #618df5;
  border-radius: 5px;
  color: #618df5;
  cursor: pointer;
  user-select: none;
}
.table-ctrl-tab-active {
  color: #fff;
  background-color: #618df5;
}
</style>