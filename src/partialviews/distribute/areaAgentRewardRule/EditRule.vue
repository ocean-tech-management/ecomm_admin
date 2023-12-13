<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="区代名称">
        <el-input style="width: 300px" auto-complete="off" placeholder="区代名称,如市代、省代等" v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="区代等级">
        <div class="form-content-static">{{formData.level}}</div>
      </el-form-item>
      <!-- 门槛价格暂时不用上，但是要传 -->
      <el-form-item v-if="false" label="区代门槛价格">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="成为区代的最低消费要求" v-model="formData.become_condition"></el-input>
        <span>元</span>
      </el-form-item>
      <!-- 直推团队业绩代理人 -->
      <!-- <el-form-item label="直推团队代理人条件">
        <div v-for="(item, index) in formData.recommend_level" class="leader-condition" :key="index">
          <el-select class="standard-select" placeholder v-model="formData.recommend_level[index]">
            <el-option v-for="leader in leaderData" :label="leader.name" :value="leader.level" :key="leader.level"></el-option>
          </el-select>
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.recommend_number[index]" :disabled="!formData.recommend_level[index] || formData.recommend_level[index] == ''"></el-input>
          <span>人</span>
          <el-button style="margin-left: 10px;" type="warning" @click="deleteRecommendLevel(index)" plain>-删除要求</el-button>
        </div>
        <el-button v-if="formData.recommend_level.length < leaderData.length" type="primary" @click="addRecommendLevel" plain>+新增要求</el-button>
        <span class="form-tips">请注意不要选到重复的</span>
      </el-form-item> -->
      <!-- 要求直推人数 -->
      <!-- <el-form-item label="直推商城区代条件">
        <div class="leader-condition">
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.recommend_member_number"></el-input>
          <span>人</span>
        </div>
      </el-form-item> -->

      <el-form-item label="升级销售额要求">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="销售额，大于0的整数" v-model="formData.sales_price"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item>
      <!-- 这套规则不需要要求培养多少团队 -->
      <!-- <el-form-item label="团队培养条件">
        <div v-for="(item, index) in formData.train_level" class="leader-condition" :key="index">
          <el-select class="standard-select" placeholder v-model="formData.train_level[index]">
            <el-option v-for="leader in leaderData" :label="leader.name" :value="leader.level" :key="leader.level"></el-option>
          </el-select>
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.train_number[index]" :disabled="!formData.train_level[index] || formData.train_level[index] == ''"></el-input>
          <span>人</span>
          <el-button style="margin-left: 10px;" type="warning" @click="deleteTrainLevel(index)" plain>-删除条件</el-button>
        </div>
        <div class="form-tips">晋级要求旗下培养多少个某级别区代</div>
        <el-button v-if="formData.train_level.length < leaderData.length" type="primary" @click="addTrainLevel" plain>+新增条件</el-button>
        <span class="form-tips">请注意不要选到重复的</span>
      </el-form-item> -->
      <!-- <el-form-item label="推团队长">
        <div v-for="(item, index) in formData.leader_conditions" class="leader-condition" :key="index">
          <el-select class="standard-select" placeholder v-model="formData.leader_conditions[index].user_lv">
            <el-option label="一级" :value="1"></el-option>
            <el-option label="二级" :value="2"></el-option>
          </el-select>
          <el-input style="width: 200px" auto-complete="off" placeholder="要求人数" v-model="formData.leader_conditions[index].user_num"></el-input>
          <span>人</span>
          <el-button style="margin-left: 10px;" v-if="index != 0" type="warning" @click="deleteCondition(index)" plain>-删除要求</el-button>
        </div>
        <el-button v-if="formData.leader_conditions.length < 2" type="primary" @click="addCondition" plain>+新增要求</el-button>
      </el-form-item> -->

      

      <!-- <el-form-item label="降级门槛">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="降级销售额，大于0的整数" v-model="formData.demotion_sales_price"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item> -->
      <!-- <el-form-item label="降级策略">
        <el-radio-group v-model="formData.demotion_type">
          <el-radio :label="1">按本弹窗降级门槛判断</el-radio>
          <el-radio :label="2">按用户升级时的降级门槛判断</el-radio>
        </el-radio-group>
      </el-form-item> -->

      <el-form-item label="分润层级">
        <!-- 不让改分润层级 -->
        <el-select class="standard-select" placeholder v-model="formData.vdc_type" disabled>
          <el-option label="一级抽成" :value="1"></el-option>
          <!-- 先把二级抽成隐藏 -->
          <!-- <el-option label="二级抽成" :value="2"></el-option> -->
        </el-select>
      </el-form-item>
      <el-form-item label="直推奖励比例">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="直推奖励比例" v-model="formData.vdcOneVal">
          <template slot="append">%</template>
        </el-input>
        <div class="form-tips">备注：0~100之间，最多保留一位小数哦</div>
      </el-form-item>
      <!-- <el-form-item v-if="formData.vdc_type == 2" label="间推奖励比例">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="间推奖励比例" v-model="formData.vdcTwoVal">
          <template slot="append">%</template>
        </el-input>
        <div class="form-tips">备注：0~100之间，最多保留一位小数哦</div>
      </el-form-item> -->
      <el-form-item label="抽成类型">
        <!-- <el-select class="standard-select" placeholder v-model="formData.vdc_genre">
          <el-option label="价差抽成" :value="1"></el-option>
          <el-option label="销售额抽成" :value="2"></el-option>
        </el-select> -->
        <div class="form-content-static">{{formData.vdc_genre == 2 ? '销售额抽成' : '价差抽成'}}</div>
      </el-form-item>


    </el-form>
  </div>
</template>

<script>
export default {
  name: "EditAreaAgentRewardRule",
  data() {
    return {

      leaderData: []
    };
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

<style scoped>
  .leader-condition {
    margin-bottom: 10px;
  }
</style>