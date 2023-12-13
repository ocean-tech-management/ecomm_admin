<template>
  <div>
    <el-form :model="formData" label-width="70px">
      <el-form-item label="姓名">
        {{ formData.nickname }}
      </el-form-item>
      <el-form-item label="应用名称">
        {{ formData.access_name }}
      </el-form-item>
      <el-form-item label="证明图片">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader"
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="photo"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="photoWatcher"
          :on-success="photoSuccess"
          :on-error="uploadError"
          auto-upload
        >
          <el-input v-show="false" v-model="formData.image_url" placeholder="缩略图"></el-input>
          <div v-if="formData.image_url" class="thumbnail-box">
            <img :src="formData.image_url" class="thumbnail" />
          </div>
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
          style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
        >请上传不超过2M的图片。<br/></div>
      </el-form-item>
      <el-form-item label="清除说明">
        <el-input v-model="formData.desc" style="width: 400px" type="textarea" rows="3" auto-complete="off" placeholder="请填写清除说明"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'AuthorizationData',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,
    }
  },
  props: {
    formData: Object,
  },
  methods: {
    // 图片上传监听
    photoWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.photo.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.photo.clearFiles();
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
              this.formData.image_url = url;
              this.$refs.photo.clearFiles();
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
    // 活动素材上传成功
    photoSuccess(res, file) {
      this.formData.image_url = res.data;
      this.$refs.photo.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
}
</script>
<style lang="less" scoped>
</style>
