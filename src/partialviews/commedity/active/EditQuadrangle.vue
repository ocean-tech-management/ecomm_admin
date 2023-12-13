<template>
  <div>
    <el-form :model="formData">
      <el-form-item label="N宫格名称" label-width="100px">
        <el-input style="width: 250px;" auto-complete="off" placeholder="请输入" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="N宫格简介" label-width="100px">
        <el-input style="width: 250px;" auto-complete="off" placeholder="请简单描述一下N宫格的内容"
          v-model="formData.desc"></el-input>
      </el-form-item>
      <el-form-item label="操作类型" label-width="100px">
        <el-select placeholder="点击时做什么事情" name="type" v-model="formData.type">
          <el-option label="跳本活动商品列表" :value="1"></el-option>
          <el-option label="跳其他活动商品列表" :value="2"></el-option>
          <el-option label="仅做展示" :value="-1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.type == 2" label="选择关联活动">
        <el-select label="请选择关联的活动" name="activity" v-model="formData.activity">
          <el-option v-for="item in actives" :label="item.title" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="展示图" label-width="100px">
        <el-upload id="thumbnail-uploader" class="thumbnail-uploader" accept="image/png, image/jpeg"
          action="/admin/file/upload" ref="thumb" :data="thumbData" :headers="token" :show-file-list="false"
          :before-upload="thumbWatcher" :on-success="thumbnailSuccess" :on-error="uploadError" auto-upload>
          <el-input v-show="false" v-model="formData.background_image" placeholder="缩略图"></el-input>
          <img v-if="formData.background_image" :src="formData.background_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px">请上传尺寸为 120px*80px 的图片，不超过2M</div>
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

      actives: []
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.getActives();
  },
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
      this.formData.background_image = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
    },

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


    getActives() {
      if(!this.$auths.includes('activity/list')) {
        return;
      }
      let params = {
        keyword: '',
        show_position: [1, 2],   //1首页活动，2全部活动列表， 3N宫格
        searType: 1
      };

      this.$get('/admin/activity/list', params, res => {
        this.actives = res.data;
      });
    },
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
