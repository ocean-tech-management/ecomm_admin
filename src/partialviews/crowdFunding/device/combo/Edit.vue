<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="套餐名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.combo_title"
        ></el-input>
      </el-form-item>
      
      <el-form-item label="套餐时间">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          type="number"
          v-model="formData.continue_time"
        ></el-input> 秒
      </el-form-item>
      
      <el-form-item label="分润比例">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="分润比例" v-model="formData.userDivideScaleVal">
          <template slot="append">%</template>
        </el-input>
        <div class="form-tips">备注：0~100之间，最多保留两位小数哦</div>
      </el-form-item>
      <el-form-item label="单次消费现金费用">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          type="number"
          v-model="formData.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="单次消费健康豆费用">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          type="number"
          v-model="formData.healthy_price"
        ></el-input>
      </el-form-item>

      <el-form-item label="套餐介绍">
        <el-upload
          id="desc-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="desc"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="descWatcher"
          :on-success="descSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.desc" placeholder="缩略图"></el-input>
          <img v-if="formData.desc" :src="formData.desc" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传宽度为750px的图，不超过2M</div>
      </el-form-item>
      
      <el-form-item label="操作介绍">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="oper_image"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="thumbWatcher"
          :on-success="thumbnailSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.oper_image" placeholder="缩略图"></el-input>
          <img v-if="formData.oper_image" :src="formData.oper_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传宽度为750px的图，不超过2M</div>
      </el-form-item>

      
    </el-form>

  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'AddDevice',
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
    
    descWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.desc.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.desc.clearFiles();
        this.$message.error('上传套餐图标大小不能超过 2MB');
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
              this.formData.desc = url;
              this.$refs.desc.clearFiles();
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
    descSuccess(res, file) {
      this.formData.desc = res.data;
      this.$refs.desc.clearFiles();
      this.$forceUpdate();
    },

    thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.oper_image.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.oper_image.clearFiles();
        this.$message.error('上传套餐图标大小不能超过 2MB');
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
              this.formData.oper_image = url;
              this.$refs.oper_image.clearFiles();
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
      this.formData.oper_image = res.data;
      this.$refs.oper_image.clearFiles();
      this.$forceUpdate();
    },
    
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>
