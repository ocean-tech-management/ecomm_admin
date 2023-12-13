<template>
  <div>
    <el-form label-width="100px" :model="formData">
      <el-form-item label="订单号">
        <div class="form-content-static">{{formData.order_sn}}</div>
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input style="width: 300px" auto-complete="off" placeholder="请输入" v-model="formData.real_name"></el-input>
      </el-form-item>
      <el-form-item label="身份证号码">
        <el-input style="width: 300px" auto-complete="off" placeholder="请输入" v-model="formData.id_card"></el-input>
      </el-form-item>
      <el-form-item v-if="formData.id_card_front" label="身份证正面">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="front"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="frontWatcher"
          :on-success="frontSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.id_card_front" placeholder="缩略图"></el-input>
          <img v-if="formData.id_card_front" :src="formData.id_card_front" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传身份证正面图片，不超过2M</div>
      </el-form-item>
      <el-form-item v-if="formData.id_card_back" label="身份证反面">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="back"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="backWatcher"
          :on-success="backSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.id_card_back" placeholder="缩略图"></el-input>
          <img v-if="formData.id_card_back" :src="formData.id_card_back" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传身份证正面图片，不超过2M</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "EditAttachInfos",
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
    frontWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.front.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.front.clearFiles();
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
              this.formData.id_card_front = url;
              this.$refs.front.clearFiles();
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
    frontSuccess(res, file) {
      this.formData.id_card_front = res.data;
      this.$refs.front.clearFiles();
      this.$forceUpdate();
    },

    backWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.back.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.back.clearFiles();
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
              this.formData.id_card_back = url;
              this.$refs.back.clearFiles();
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
    backSuccess(res, file) {
      this.formData.id_card_back = res.data;
      this.$refs.back.clearFiles();
      this.$forceUpdate();
    },

    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>
<style lang="less" scoped>
  .id-card-img {
    width: 375px;
  }
</style>