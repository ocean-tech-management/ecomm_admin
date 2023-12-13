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
     

      <!-- <el-form-item label="分润层级">
        <el-select class="standard-select" placeholder v-model="formData.vdc_type" disabled>
          <el-option label="一级抽成" :value="1"></el-option>
          <el-option label="二级抽成" :value="2"></el-option>
        </el-select>
      </el-form-item> -->
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
        <div class="form-content-static">{{formData.vdc_genre == 2 ? '销售额抽成' : '价差抽成'}}</div>
      </el-form-item>


    </el-form>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: "EditExpRule",
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