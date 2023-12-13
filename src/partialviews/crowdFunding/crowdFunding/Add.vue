<template>
  <div>
    <el-form :model="formData" label-width="160px">
      <el-form-item label="专区名称">
        <el-input style="width: 250px;" auto-complete="off" placeholder="请输入" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="专区介绍">
        <el-input style="width: 250px;" auto-complete="off" placeholder="请输入" v-model="formData.desc"></el-input>
      </el-form-item>

      <el-form-item label="排序">
        <el-input style="width: 250px" auto-complete="off" type="number" placeholder="排序，必须是正整数"
          v-model="formData.sort"></el-input>
      </el-form-item>

      <el-form-item label="展示图">
        <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
          action="/admin/file/upload" ref="background_image" :data="thumbData" :headers="token" :show-file-list="false"
          :before-upload="imageWatcher" :on-success="imageSuccess" :on-error="uploadError" auto-upload>
          <el-input v-show="false" v-model="formData.background_image" placeholder="缩略图"></el-input>
          <img v-if="formData.background_image" :src="formData.background_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div>请上传尺寸为750px*640px的图片，不超过2M</div>
      </el-form-item>
      <el-form-item label="重开时间间隔">
        <el-input v-model="formData.reopen_time_interval" auto-complete="off" placeholder="大于0的正整数" maxlength="5"
          style="width: 250px;">
          <span slot="suffix" style="padding: 0 5px;">天</span>
        </el-input>
      </el-form-item>
      <el-form-item label="涨幅间隔期数">
        <el-input v-model="formData.rise_period_number" auto-complete="off" placeholder="大于0的正整数" maxlength="9"
          style="width: 250px;">
          <span slot="suffix" style="padding: 0 5px;">期</span>
        </el-input>
      </el-form-item>
      <el-form-item label="每期涨幅">
        <el-input v-model="formData.rise_scale" auto-complete="off" placeholder="大于25%的正整数" maxlength="9"
          style="width: 250px;">
          <span slot="suffix" style="padding: 0 5px;">%</span>
        </el-input>
      </el-form-item>
      <el-form-item label="赠送礼物类型">
        <el-select v-model="formData.gift_type" placeholder="赠送礼物类型" style="width: 250px;">
          <el-option label="不赠送" :value="-1"></el-option>
          <el-option label="赠送集品豆" :value="1"></el-option>
          <el-option label="赠送健康豆" :value="2"></el-option>
          <el-option label="赠送集品券" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户参与预售次数限制">
        <el-input v-model="formData.user_advance_limit" auto-complete="off" placeholder="大于等于0的整数" maxlength="9"
          style="width: 250px;">
          <span slot="suffix" style="padding: 0 5px;">次</span>
        </el-input>
      </el-form-item>
      <el-form-item label="预售自动新增期数限制">
        <el-input v-model="formData.auto_create_advance_limit" auto-complete="off" placeholder="大于等于0的整数" maxlength="9"
          style="width: 250px;">
          <span slot="suffix" style="padding: 0 5px;">期</span>
        </el-input>
      </el-form-item>
    </el-form>


  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'AddCrowdFunding',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {

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
