<template>
  <div>
    <el-form style="margin-top: 20px;" :model="formData" label-width="150px">
      
      <el-form-item label="拒绝理由">
        <el-input style="width: 500px" auto-complete="off" placeholder="请输入" v-model="formData.refuse_reason"></el-input>
      </el-form-item>
      <el-form-item label="请上传凭证">
        <el-upload
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="upload"
          :data="uploadData"
          :headers="token"
          :show-file-list="false"
          :before-upload="uploadWatcher"
          :on-success="uploadnailSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-button type="primary">上传凭证</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="">
        <div v-if="formData.images && formData.images.length > 0" class="after-sale-imgs">
          <div v-for="(img, index) in formData.images" class="after-sale-img-box" :key="index">
            <div class="after-sale-img-delete" title="点击删除图片" @click="deleteImg(index)">×</div>
            <img class="after-sale-img" :src="img"/>
          </div>
        </div>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'RejectDelivery',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      uploadData: null
    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {  
    
    uploadWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.upload.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.upload.clearFiles();
        this.$message.error('上传头像图片大小不能超过 2MB');
        return false;
      }
      return new Promise((resolve, reject) => {
        uploadCtrl.getFileMD5(file, md5 => {
          this.uploadData = {
            md5: md5
          };
          uploadCtrl.validMD5(
            md5,
            url => {
              this.formData.images.push(url);
              this.$refs.upload.clearFiles();
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
    uploadnailSuccess(res, file) {
      this.formData.images.push(res.data);
      this.$refs.upload.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
    deleteImg(index) {
      this.formData.images.splice(index, 1);
      this.$forceUpdate();
    },

  }
};
</script>


<style lang="less" scoped>
  .after-scale-event {
    margin-bottom: 10px;
  }

  .after-sale-imgs {
    display: flex;
    flex-wrap: wrap;
  }
  .after-sale-img-box {
    position: relative;
    width: 150px;
    height: 220px;
    margin-right: 15px;
    margin-bottom: 10px;
    background-color: #f2f3f3;
    overflow: hidden;
  }
  .after-sale-img-delete {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 16px;
    color: #fff;
    background-color: #f00;
    user-select: none;
    cursor: pointer;
  }
  .after-sale-img {
    width: 150px;
  }
</style>