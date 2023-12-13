<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="活动名称" label-width="100px">
        <el-input style="width: 250px;" auto-complete="off" placeholder="请输入" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="活动简介" label-width="100px">
        <el-input style="width: 250px;" auto-complete="off" placeholder="请简单描述一下活动" v-model="formData.desc"></el-input>
      </el-form-item>

      <el-form-item label="活动图(可空)" label-width="100px">
        <div class="bg-box">
          <el-upload id="bg-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
            action="/admin/file/upload" ref="bg" :data="thumbData" :headers="token" :show-file-list="false"
            :before-upload="bgWatcher" :on-success="bgSuccess" :on-error="uploadError" auto-upload>
            <el-input v-show="false" v-model="formData.background_image" placeholder="缩略图"></el-input>
            <div v-if="formData.background_image" class="thumbnail-box">
              <img :src="formData.background_image" class="thumbnail" />
            </div>
            <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
          </el-upload>
          <div v-if="formData.background_image" class="reset-bg" @click="resetBg">×</div>
        </div>
        <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为 690px
          的图片，不超过2M。如不设置活动图默认显示<span class="warning-color">标题</span></div>
      </el-form-item>

      <el-form-item label="展示位置" label-width="100px">
        <el-select placeholder="活动展示在哪里" name="show_position" v-model="formData.show_position">
          <el-option label="首页" :value="1"></el-option>
          <el-option label="全部活动列表" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="展示样式" label-width="100px">
        <el-select placeholder="样式怎么样" name="goods_show_form" v-model="formData.goods_show_form">
          <el-option label="普通样式" :value="1"></el-option>
          <el-option label="特殊样式" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="formData.goods_show_form == 2" label="背景色" label-width="100px">
        <input class="color-picker" type="color" v-model="formData.background_color" />
        <div class="form-tips">请使用chrome浏览器确保背景色插件正确使用。取值格式：#ffffff</div>
      </el-form-item>

      <el-form-item label="活动海报" label-width="100px">
        <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
          action="/admin/file/upload" ref="poster" :data="thumbData" :headers="token" :show-file-list="false"
          :before-upload="posterWatcher" :on-success="posterSuccess" :on-error="uploadError" auto-upload>
          <el-input v-show="false" v-model="formData.poster" placeholder="缩略图"></el-input>
          <div v-if="formData.poster" class="thumbnail-box">
            <img :src="formData.poster" class="thumbnail" />
          </div>
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为 750px
          的图片，不超过2M。<br />（如不想显示海报，请上传一张 750*1 的透明像素图片）</div>
      </el-form-item>
      <el-form-item label="素材(可空)" label-width="100px">
        <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
          action="/admin/file/upload" ref="icon" :data="thumbData" :headers="token" :show-file-list="false"
          :before-upload="iconWatcher" :on-success="iconSuccess" :on-error="uploadError" auto-upload>
          <el-input v-show="false" v-model="formData.icon" placeholder="缩略图"></el-input>
          <div v-if="formData.icon" class="thumbnail-box">
            <img :src="formData.icon" class="thumbnail" />
          </div>
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为 750px 的图片，不超过2M。<br /></div>
      </el-form-item>
      <el-form-item label="是否限购" label-width="100px">
        <el-radio-group v-model="formData.limit_buy">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="2">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="赠送礼物类型" label-width="100px">
        <el-select v-model="formData.gift_type" placeholder="赠送礼物类型">
          <el-option label="不赠送" :value="-1"></el-option>
          <el-option label="赠送集品豆" :value="1"></el-option>
          <el-option label="赠送健康豆" :value="2"></el-option>
          <el-option label="赠送集品券" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="formData.allow_pay_type_name && formData.allow_pay_type_name != 'null' && formData.allow_pay_type_name != 'undefined'"
        label="允许支付类型" label-width="100px">
        {{ formData.allow_pay_type_name }}
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'EditActive',
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
    bgWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.bg.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.bg.clearFiles();
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
              this.$refs.bg.clearFiles();
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
    bgSuccess(res, file) {
      this.formData.background_image = res.data;
      this.$refs.bg.clearFiles();
      this.$forceUpdate();
    },
    // 活动素材上传监听
    iconWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.icon.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.icon.clearFiles();
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
              this.formData.icon = url;
              this.$refs.icon.clearFiles();
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
    iconSuccess(res, file) {
      this.formData.icon = res.data;
      this.$refs.icon.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },

    resetBg() {
      this.formData.background_image = null;
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
.bg-box {
  position: relative;
  width: 180px;
}

.thumbnail-box {
  padding: 2px;
  border: 1px solid #eee;
  border-radius: 2px;
}

.reset-bg {
  position: absolute;
  left: calc(100% + 4px);
  top: 2px;
  padding: 0 10px;
  margin-right: -15px;
  font-size: 24px;
  line-height: 1.4;
  font-weight: 500;
  color: #fff;
  background-color: #618df5a0;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: #618df5;
  }
}
</style>
