<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="标签名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.name"
        ></el-input>
      </el-form-item>

      <el-form-item label="标签图标">
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
          <el-input v-show="false" v-model="formData.icon" placeholder="缩略图"></el-input>
          <img v-if="formData.icon" :src="formData.icon" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传高度为60px的图标，不超过2M</div>
      </el-form-item>
      <el-form-item label="排序">
        <el-input style="width: 450px" auto-complete="off" type="number" placeholder="填一下排序呗，必须是正整数哦" v-model="formData.sort"></el-input>
      </el-form-item>
      
    </el-form>

  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'AddTag',
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
    
    thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.thumb.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.thumb.clearFiles();
        this.$message.error('上传标签图标大小不能超过 2MB');
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
              this.formData.icon = url;
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
      this.formData.icon = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>
