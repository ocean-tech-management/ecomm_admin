<template>
  <div>
    <el-form :model="formData" label-width="120px">
      <el-form-item label="专区名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.name"
        ></el-input>
      </el-form-item>
      <el-form-item label="展示图">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="background_image"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="imageWatcher"
          :on-success="imageSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.background_image" placeholder="缩略图"></el-input>
          <img v-if="formData.background_image" :src="formData.background_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div>请上传宽度为710px的图片，不超过2M</div>
      </el-form-item>
      

      <el-form-item label="活动时间" prop="time">
        <el-date-picker
          name="time"
          v-model="formData.time"
          type="datetimerange"
          :picker-options="formPickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="false"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="排序">
        <el-input style="width: 450px" auto-complete="off" type="number" placeholder="填一下排序呗，必须是正整数哦" v-model="formData.sort"></el-input>
      </el-form-item>

      
      <el-form-item label="每人可参加次数">
        <el-select placeholder="请选择周期" name="join_limit_type" v-model="formData.join_limit_type">
          <el-option label="活动期间" :value="1"></el-option>
          <el-option label="本日" :value="2"></el-option>
          <el-option label="本周" :value="3"></el-option>
          <el-option label="本月" :value="4"></el-option>
        </el-select>
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="正整数" v-model="formData.join_number">
          <template slot="append">次</template>
        </el-input>
      </el-form-item>

      <el-form-item label="每人可中奖次数">
        <el-select placeholder="请选择周期" name="win_limit_type" v-model="formData.win_limit_type">
          <el-option label="活动期间" :value="1"></el-option>
          <el-option label="本日" :value="2"></el-option>
          <el-option label="本周" :value="3"></el-option>
          <el-option label="本月" :value="4"></el-option>
        </el-select>
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="正整数" v-model="formData.win_number">
          <template slot="append">次</template>
        </el-input>
      </el-form-item>

      <el-form-item label="单次发货数量">
        <el-input style="width: 450px" auto-complete="off" type="number" placeholder="单次发货数量，正整数" v-model="formData.shipping_unit"></el-input>
        <div class="form-tips">每次发货时，用户发货的数量需要为单次发货数量的正整数倍</div>
      </el-form-item>

      <el-form-item label="单次回购增量">
        <el-input style="width: 450px" auto-complete="off" type="number" placeholder="单次回购增量，正整数" v-model="formData.repurchase_increment"></el-input>
        <div class="form-tips">每发货N倍单次回购数量，用户获得N倍单次发货增量（eg：发2可回购3，发4即可回购6）</div>
      </el-form-item>

      <el-form-item label="红包奖励比例">
        <el-input style="width: 200px" auto-complete="off" type="number" placeholder="最小两位小数" v-model="formData.reward_scale" @change="updateAllRate">
          <template slot="append">%</template>
        </el-input>
        <div v-if="formData.reward_scale && formData.reward_scale !== '' && rewardAllRate" class="form-tips">
          当前需派出红包 {{rewardAllRate}}%
        </div>
      </el-form-item>
      
      <el-form-item label="是否高亮">
        <el-checkbox v-model="formData.highlight_status" :true-label="1" :false-label="2">高亮</el-checkbox>
      </el-form-item>
      

    </el-form>

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'EditPpylActivityArea',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      rewardAllRate: 0,

      ...formNTimePickerConfig
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    updateAllRate() {
      let rewardAllRate = 0;
      if(/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.reward_scale)) {
        //必须符合规则
        rewardAllRate = parseFloat(this.formData.reward_scale) * parseFloat(this.formData.group_number);
        rewardAllRate = rewardAllRate.toFixed(2);
      }
      this.rewardAllRate = rewardAllRate;
    },
    
    imageWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.background_image.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.background_image.clearFiles();
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
              this.formData.background_image = url;
              this.$refs.background_image.clearFiles();
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
    imageSuccess(res, file) {
      this.formData.background_image = res.data;
      this.$refs.background_image.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>
