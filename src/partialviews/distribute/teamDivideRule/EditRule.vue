<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="会员称号">
        
        <el-input style="width: 300px" auto-complete="off" placeholder="会员称号,如合伙人、团队长等" v-model="formData.name"></el-input>
        <!-- <div class="form-item-content">{{formData.name}}</div> -->
      </el-form-item>
      <el-form-item label="会员等级">
        <div class="form-content-static">{{formData.level}}</div>
      </el-form-item>
      <!-- 没有会员折扣 -->
      <el-form-item v-if="false" label="会员折扣">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="会员购物折扣，0到1之间哦" v-model="formData.discount"></el-input>
        <div class="form-tips">备注：0~1之间，最多保留两位小数哦</div>
      </el-form-item>
      <!-- 门槛价格暂时不用上，但是要传 -->
      <el-form-item v-if="false" label="会员门槛价格">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="成为会员的最低消费要求" v-model="formData.become_condition"></el-input>
        <span>元</span>
      </el-form-item>
      <!-- 直推团队业绩代理人 -->
      <el-form-item label="直推团队代理人条件">
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
      </el-form-item>
      <!-- 要求直推人数 -->
      <el-form-item label="直推商城会员条件">
        <div class="leader-condition">
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.recommend_member_number"></el-input>
          <span>人</span>
        </div>
      </el-form-item>

      <el-form-item label="升级销售额要求">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="销售额，大于0的整数" v-model="formData.sales_price"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item>
      <el-form-item label="升级小区业绩要求">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="小区业绩，大于0的整数" v-model="formData.village_performance"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item>

      <el-form-item label="保底提现额度">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="保底提现额度，大于0的整数" v-model="formData.floors_withdraw_amount"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item>
      <el-form-item label="提现达标额度">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="提现达标额度，大于0的整数" v-model="formData.withdraw_condition_amount"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item>
      <el-form-item label="达标提现金额">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="达标提现金额，大于0的整数" v-model="formData.withdraw_amount"></el-input>
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
        <div class="form-tips">晋级要求旗下培养多少个某级别会员</div>
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

      

      <el-form-item label="降级门槛">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="降级销售额，大于0的整数" v-model="formData.demotion_sales_price"></el-input>
        <div class="form-tips">最多两位小数哦</div>
      </el-form-item>
      <el-form-item label="降级策略">
        <el-radio-group v-model="formData.demotion_type">
          <el-radio :label="1">按本弹窗降级门槛判断</el-radio>
          <el-radio :label="2">按用户升级时的降级门槛判断</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="分润层级">
        <!-- 不让改分润层级 -->
        <el-select class="standard-select" placeholder v-model="formData.vdc_type" disabled>
          <el-option label="一级抽成" :value="1"></el-option>
          <el-option label="二级抽成" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="直推奖励比例">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="直推奖励比例" v-model="formData.vdcOneVal">
          <template slot="append">%</template>
        </el-input>
        <div class="form-tips">备注：0~100之间，最多保留一位小数哦</div>
      </el-form-item>
      <el-form-item v-if="formData.vdc_type == 2" label="间推奖励比例">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="间推奖励比例" v-model="formData.vdcTwoVal">
          <template slot="append">%</template>
        </el-input>
        <div class="form-tips">备注：0~100之间，最多保留一位小数哦</div>
      </el-form-item>
      <el-form-item label="抽成类型">
        <!-- 合伙人（level1）是销售额抽成 -->
        <!-- <el-select class="standard-select" placeholder v-model="formData.vdc_genre">
          <el-option label="价差抽成" :value="1"></el-option>
          <el-option label="销售额抽成" :value="2"></el-option>
        </el-select> -->
        <div class="form-content-static">{{formData.vdc_genre == 2 ? '销售额抽成' : '价差抽成'}}</div>
      </el-form-item>
<!--       
      <el-form-item v-show="formData.level > 1" label="礼包入口图">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="thumb"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="thumbWatcher"
          :on-success="thumbnailSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.background" placeholder="缩略图"></el-input>
          <img v-if="formData.background" :src="formData.background" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为340px*180px的图片，不超过2M</div>
      </el-form-item>


      <el-form-item v-show="formData.level > 1" label="大礼包背景">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="poster"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="posterWatcher"
          :on-success="posterSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.poster" placeholder="缩略图"></el-input>
          <img v-if="formData.poster" :src="formData.poster" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为750px*900px的图片，不超过2M</div>
      </el-form-item> -->

      <el-form-item label="奖励门槛金额">
        <el-input style="width: 300px" type="number" auto-complete="off" placeholder="奖励门槛金额，大于等于0的整数" v-model="formData.get_reward_condition_price"></el-input>
        <div class="form-tips">最多两位小数</div>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: "EditLeaderRule",
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      leaderData: []
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getLeaders();
  },
  methods: {
    
    // deleteCondition(index) {
    //   this.formData.leader_conditions.splice(index, 1)
    // },
    // addCondition(){
    //   this.formData.leader_conditions.push({
    //     user_lv: '',
    //     user_num: ''
    //   })
    // },
    getLeaders() {
      if(this.formData.min_level) return; //最低等级直推不需要直推本规则内的会员
      let params = {
        // member_level: this.formData.level
      };

      this.$get('/admin/teamVdc/list', params, res => {
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].level) dataList[i].level = dataList[i].level.toString();
        }
        this.leaderData = dataList;
      });
    },
    deleteRecommendLevel(index) {
      this.formData.recommend_level.splice(index, 1)
      this.formData.recommend_number.splice(index, 1);
    },
    addRecommendLevel(){
      this.formData.recommend_level.push('');
      this.formData.recommend_number.push(0);
    },
    deleteTrainLevel(index) {
      // 移除团队要求
      this.formData.train_level.splice(index, 1);
      this.formData.train_number.splice(index, 1);
    },
    addTrainLevel(){
      // 新增团队要求
      this.formData.train_level.push('');
      this.formData.train_number.push(0);
    },

    
    thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.thumb.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.thumb.clearFiles();
        this.$message.error('上传展示图大小不能超过 2MB');
        return false;
      }
      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.background = url;
              this.$refs.thumb.clearFiles();
              this.$forceUpdate();
              reject();
            },
            err => {
              setTimeout(() => {
                resolve();
              }, 10);
            }
          );
        });
      });
    },
    thumbnailSuccess(res, file) {
      this.formData.background = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
    },

    
    posterWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.poster.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.poster.clearFiles();
        this.$message.error('上传展示图大小不能超过 2MB');
        return false;
      }
      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.thumbData = {
            md5: md5
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.poster = url;
              this.$refs.poster.clearFiles();
              this.$forceUpdate();
              reject();
            },
            err => {
              setTimeout(() => {
                resolve();
              }, 10);
            }
          );
        });
      });
    },
    posterSuccess(res, file) {
      this.formData.poster = res.data;
      this.$refs.poster.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>

<style scoped>
  .leader-condition {
    margin-bottom: 10px;
  }
</style>