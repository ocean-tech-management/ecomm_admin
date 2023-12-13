<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="商品名称">
        <div class="form-content-static">
          {{formData.title}}
        </div>
      </el-form-item>
      <el-form-item label="原展示图">
        <div class="form-content-static">
          <img v-if="formData.originImage" :src="formData.originImage" class="thumbnail" />
        </div>
      </el-form-item>
      <el-form-item label="展示图">
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
          <el-input v-show="false" v-model="formData.image" placeholder="缩略图"></el-input>
          <img v-if="formData.image" :src="formData.image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div v-if="formData.template == 1" style="
            color: #999;
            font-size: 14px;
            line-height: 1.4;
            margin-top: 10px;
          ">
          请上传尺寸为690px*390px的图片，不超过 2M
        </div>
        <div v-else style="
            color: #999;
            font-size: 14px;
            line-height: 1.4;
            margin-top: 10px;
          ">
          请上传尺寸为260px*260px的图片，不超过 2M
        </div>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
  import uploadCtrl from "@/util/uploadCtrl";
  export default {
    name: 'EditCommeditiesCover',
    data() {
      return {
        token: {
          token: localStorage.getItem("token"),
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
        if (file.type != "image/png" && file.type != "image/jpeg") {
          this.$refs.thumb.clearFiles();
          this.$message.error("只能上传jpg或者png图片哦");
          return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isLt2M) {
          this.$refs.thumb.clearFiles();
          this.$message.error("上传展示图大小不能超过 2MB");
          return false;
        }
        return new Promise((resolve, reject) => {
          uploadCtrl.getFileMD5(file, (md5) => {
            this.thumbData = {
              md5: md5,
            };
            uploadCtrl.validMD5(
              md5,
              (url) => {
                this.formData.image = url;
                this.$refs.thumb.clearFiles();
                this.$forceUpdate();
                reject();
              },
              (err) => {
                setTimeout(() => {
                  resolve();
                }, 10);
              }
            );
          });
        });
      },
      thumbnailSuccess(res, file) {
        this.formData.image = res.data;
        this.$refs.thumb.clearFiles();
        this.$forceUpdate();
      },
      uploadError(err) {
        this.$message.error("网络异常，请检查网络状况就好了");
      },
    }
  };

</script>
