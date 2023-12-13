<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="套餐名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.name"
        ></el-input>
      </el-form-item>
      <el-form-item label="套餐简介">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请简单描述一下套餐信息"
          maxlength="20"
          v-model="formData.desc"
        ></el-input>
      </el-form-item>
      <el-form-item label="套餐价格">
        <el-input
          style="width: 250px;"
          type="number"
          auto-complete="off"
          placeholder="正数，最多两位小数"
          v-model="formData.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="市场价">
        <el-input
          style="width: 250px;"
          type="number"
          auto-complete="off"
          placeholder="正数，最多两位小数"
          v-model="formData.market_price"
        ></el-input>
      </el-form-item>
      <el-form-item label="有效时间">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="填一下有效时间" v-model="formData.expire_time_val"></el-input>
        <el-select style="width: 100px" placeholder="请选择有效期单位" name="expire_time_type" v-model="formData.expire_time_type">
          <el-option label="天" :value="1"></el-option>
          <el-option label="小时" :value="2"></el-option>
          <el-option label="分钟" :value="3"></el-option>
          <el-option label="秒" :value="4"></el-option>
        </el-select>
        <div class="form-tips">备注：有效时间的值要为1，2，3，4这种正整数</div>
      </el-form-item>

      <!-- <el-form-item label="活动图(可空)" label-width="100px">
        <div class="poster-box">
          <el-upload
            id="poster-uploader"
            class="thumbnail-uploader" 
            accept="image/png, image/jpeg"
            action="/admin/file/upload"
            ref="poster"
            :data="thumbData"
            :headers="token"
            :show-file-list="false"
            :before-upload="posterWatcher"
            :on-success="posterSuccess"
            :on-error="uploadError"
            auto-upload 
          >
            <el-input v-show="false" v-model="formData.poster" placeholder="缩略图"></el-input>
            <div v-if="formData.poster" class="thumbnail-box">
              <img :src="formData.poster" class="thumbnail" />
            </div>
            <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
          </el-upload>
          <div v-if="formData.poster" class="reset-poster" @click="resetposter">×</div>
        </div>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为 690px 的图片，不超过2M。如不设置活动图默认显示<span class="warning-color">标题</span></div>
      </el-form-item> -->
      
      
    </el-form>

  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'AddCombo',
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

    resetposter() {
      this.formData.poster = null;
    }
  }
};
</script>
<style lang="less" scoped>
.thumbnail-box {
  padding: 2px;
  border: 1px solid #eee;
  border-radius: 2px;
}
</style>

<style lang="less" scoped>
.poster-box {
  position: relative;
  width: 180px;
}
.thumbnail-box {
  padding: 2px;
  border: 1px solid #eee;
  border-radius: 2px;
}
</style>
