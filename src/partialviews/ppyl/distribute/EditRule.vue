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
      <!-- <el-form-item label="直推条件">
        <div v-for="(item, index) in formData.recommend_level" class="leader-condition" :key="index">
          <el-select class="standard-select" placeholder v-model="formData.recommend_level[index]">
            <el-option v-for="leader in leaderData" :label="leader.name" :value="leader.level" :key="leader.level"></el-option>
          </el-select>
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.recommend_number[index]" :disabled="!formData.recommend_level[index] || formData.recommend_level[index] == ''"></el-input>
          <span>人</span>
          <el-button style="margin-left: 10px;" v-if="index != 0" type="warning" @click="deleteRecommendLevel(index)" plain>-删除要求</el-button>
        </div>
        <el-button v-if="formData.recommend_level.length < leaderData.length" type="primary" @click="addRecommendLevel" plain>+新增要求</el-button>
        <span class="form-tips">请注意不要选到重复的</span>
      </el-form-item> -->
      <el-form-item label="拼拼直推条件">
        <div class="leader-condition">
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.recommend_ppyl_number"></el-input>
          <span>人</span>
        </div>
      </el-form-item>

      <el-form-item label="团队培养条件">
        <div v-for="(item, index) in formData.train_level" class="leader-condition" :key="index">
          <!-- <el-select class="standard-select" placeholder v-model="formData.train_level[index]">
            <el-option v-for="leader in leaderData" :label="leader.name" :value="leader.level" :key="leader.level"></el-option>
          </el-select> -->
          <!-- <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.train_number[index]" :disabled="!formData.train_level[index] || formData.train_level[index] == ''"></el-input> -->
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="要求人数" v-model="formData.train_number[index]"></el-input>
          <span>人</span>
          <!-- <el-button style="margin-left: 10px;" v-if="index != 0" type="warning" @click="deleteTrainLevel(index)" plain>-删除条件</el-button> -->
        </div>
        <div class="form-tips">晋级要求旗下培养多少个会员</div>
        <!-- <el-button v-if="formData.train_level.length < leaderData.length" type="primary" @click="addTrainLevel" plain>+新增条件</el-button>
        <span class="form-tips">请注意不要选到重复的</span> -->
      </el-form-item>

      <el-form-item label="奖励层级">
        <el-select class="standard-select" placeholder v-model="formData.vdc_type">
          <el-option label="一层奖励" :value="1"></el-option>
          <el-option label="两层奖励" :value="2"></el-option>
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
        <!-- <el-select class="standard-select" placeholder v-model="formData.vdc_genre">
          <el-option label="下级的红包总额" :value="2"></el-option>
        </el-select> -->
        <div class="form-content-static">下级的红包总额</div>
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
    getLeaders() {
      let params = {
        member_level: this.formData.level
      };

      this.$get('/admin/vdc/list', params, res => {
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