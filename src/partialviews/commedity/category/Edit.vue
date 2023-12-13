<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="分类名称">
        <el-input auto-complete="off" placeholder="填一下分类的新名称呗" v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="分类副标">
        <el-input auto-complete="off" placeholder="填一下分类的新副标呗" v-model="formData.desc"></el-input>
        <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">
          建议4个字内
        </div>
      </el-form-item>
      <!-- <el-form-item label="上级分类" label-width="100px">
        <el-select placeholder="选N/A则为一级目录" name="parent" v-model="formData.parent">
          <el-option label="N/A"  value></el-option>
          <el-option label="产前调理" value="产前调理"></el-option>
          <el-option label="产后康复" value="产后康复"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="排序">
        <el-input type="number" auto-complete="off" placeholder="填一下排序" v-model="formData.sort"></el-input>
      </el-form-item>
      <el-form-item v-if="formData.p_code" label="展示图">
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
          <img v-if="formData.icon" :src="formData.icon" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为100px*100px的图片，不超过2M</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'EditSubjectCategory',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null
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
        this.$message.error('上传图片大小不能超过 2MB');
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