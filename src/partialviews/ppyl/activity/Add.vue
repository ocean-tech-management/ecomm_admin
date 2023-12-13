<template>
  <div>
    <el-form :model="formData" label-width="120px">
      <el-form-item label="拼团名称">
        <el-input style="width: 450px" auto-complete="off" placeholder="填一下名称呗" v-model="formData.activity_title"></el-input>
      </el-form-item>
      <el-form-item label="拼团简介">
        <el-input style="width: 450px" auto-complete="off" placeholder="填一下简介呗" v-model="formData.activity_desc"></el-input>
      </el-form-item>
      <!-- 目前传1就可以了，留给以后拓展 -->
      <!-- <el-form-item label="展示位置">
        <el-select placeholder="拼团活动展示在哪里" name="show_position" v-model="formData.show_position">
          <el-option label="首页" :value="1"></el-option>
          <el-option label="全部活动列表" :value="2"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="风格样式">
        <el-select placeholder="选择风格" name="style_type" v-model="formData.style_type">
          <el-option label="轮播风格" :value="1"></el-option>
          <el-option label="列表风格" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="拼团封面">
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
          <el-input v-show="false" v-model="formData.activity_cover" placeholder="拼团封面"></el-input>
          <img v-if="formData.activity_cover" :src="formData.activity_cover" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传宽度为750px的图片，不超过2M</div>
      </el-form-item>
      
      <el-form-item label="拼团背景图">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="bg"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="bgWatcher"
          :on-success="bgSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.background_image" placeholder="拼团背景图"></el-input>
          <img v-if="formData.background_image" :src="formData.background_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传宽度为710px的图片，不超过2M</div>
      </el-form-item>
      <el-form-item label="拼团类型">
        <el-select placeholder="请选择拼团类型" name="type" v-model="formData.type">
          <el-option label="普通拼团" :value="1"></el-option>
          <!-- <el-option label="团长免单" :value="2"></el-option> -->
          <!-- <el-option label="团长大礼包拼团" :value="3"></el-option> -->
        </el-select>
      </el-form-item>
      <el-form-item label="开团要求">
        <!-- <el-select placeholder="请选择开团要求" name="start_user_type" v-model="formData.start_user_type">
          <el-option v-for="item in userTypes" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
        </el-select> -->
        <div class="form-content-static">{{userTypeTexts[formData.start_user_type]}}</div>
      </el-form-item>
      <el-form-item label="参团要求">
        <el-select placeholder="请选择参团要求" name="join_user_type" v-model="formData.join_user_type">
          <el-option v-for="item in userTypes" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="活动时间" prop="validDate">
        <el-date-picker
          name="validDate"
          v-model="formData.validDate"
          type="datetimerange"
          :picker-options="formPickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="false"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="拼团有效时间">
        <el-input style="width: 200px" type="number" auto-complete="off" placeholder="填一下有效时间呗" v-model="formData.expire_time_val"></el-input>
        <el-select style="width: 150px" placeholder="请选择拼团类型" name="expire_time_type" v-model="formData.expire_time_type">
          <el-option label="小时" :value="1"></el-option>
          <el-option label="分钟" :value="2"></el-option>
          <el-option label="秒" :value="3"></el-option>
        </el-select>
        <div class="form-tips">备注：有效时间的值要为1，2，3，4这种正整数哦</div>
      </el-form-item>
      <el-form-item label="成团人数要求">
        <el-input style="width: 450px" type="number" auto-complete="off" placeholder="填一下成团人数要求呗" v-model="formData.group_number"></el-input>
      </el-form-item>
      <el-form-item label="分享标题">
        <el-input style="width: 450px" auto-complete="off" placeholder="填一下名称呗" v-model="formData.share_title"></el-input>
      </el-form-item>
      <el-form-item label="分享描述">
        <el-input style="width: 450px" auto-complete="off" placeholder="填一下名称呗" v-model="formData.share_desc"></el-input>
      </el-form-item>
      <el-form-item label="分享图片">
        <el-upload
          class="thumbnail-uploader" 
          accept="image/png, image/jpeg"
          action="/admin/file/upload"
          ref="shareCover"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="shareCoverWatcher"
          :on-success="shareCovernailSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.share_cover" placeholder="分享图片"></el-input>
          <img v-if="formData.share_cover" :src="formData.share_cover" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传宽度为750px的图片，不超过2M</div>
      </el-form-item>
      <el-form-item label="排序">
        <el-input style="width: 450px" auto-complete="off" type="number" placeholder="填一下排序呗，必须是正整数哦" v-model="formData.sort"></el-input>
      </el-form-item>
      
    </el-form>

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
import uploadCtrl from '@/util/uploadCtrl';

export default {
  name: 'AddPpyl',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      userTypeTexts: {},

      ...formNTimePickerConfig
    };
  },
  props: {
    formData: Object,
    userTypes: Array
  },
  mounted() {
    this.createUserTypeTexts(); //锁死，后续可能考虑解锁。解锁了就不需要这方法
  },
  methods: {
    createUserTypeTexts() {
      let userTypeTexts = {};
      for(let i = 0; i < this.userTypes.length; i++) {
        userTypeTexts[this.userTypes[i].u_type] = this.userTypes[i].u_name
      }
      this.userTypeTexts = userTypeTexts;
    },
    thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.thumb.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.thumb.clearFiles();
        this.$message.error('上传头像图片大小不能超过 2MB');
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
              this.formData.activity_cover = url;
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
      this.formData.activity_cover = res.data;
      this.$refs.thumb.clearFiles();
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
        this.$message.error('上传背景图片大小不能超过 2MB');
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

    shareCoverWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg') {
        this.$refs.shareCover.clearFiles();
        this.$message.error('只能上传jpg或者png图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.shareCover.clearFiles();
        this.$message.error('上传头像图片大小不能超过 2MB');
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
              this.formData.share_cover = url;
              this.$refs.shareCover.clearFiles();
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
    shareCovernailSuccess(res, file) {
      this.formData.share_cover = res.data;
      this.$refs.shareCover.clearFiles();
      this.$forceUpdate();
    },

    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },

  }
};
</script>


<style lang="less" scoped>
.discount-commodity-select {
  display: flex;
  align-items: center;
}
.commodity-select-wrapper {
  width: 200px;
  height: 250px;
  margin: 0 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}
.commodity-select-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}
.commodity-select-item:hover {
  background-color: #f2f3f3;
}
.commodity-select-item.active {
  color: #fff;
  background-color: #618df5;
}
.select-item-flex {
  flex: 1;
  width: 80px;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
}
.select-item-delete {
  padding: 0 10px;
  margin-right: -15px;
  font-size: 24px;
  font-weight: 500;
}
.select-item-delete:hover {
  color: #618df5;
}
</style>