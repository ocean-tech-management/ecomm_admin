<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="专场名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.title"
        ></el-input>
      </el-form-item>
      <el-form-item label="专场简介">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请简单描述一下专场"
          v-model="formData.desc"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="展示位置">
        <el-select placeholder="专场展示在哪里" name="show_position" v-model="formData.show_position">
          <el-option label="首页" :value="1"></el-option>
          <el-option label="全部专场列表" :value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="附加条件">
        <el-select placeholder="是否有特殊要求" name="attach_type" v-model="formData.attach_type">
          <el-option label="无条件要求" :value="-1"></el-option>
          <el-option label="需要真实身份证信息" :value="1"></el-option>
          <el-option label="需要真实身份证信息及图片" :value="2"></el-option>
        </el-select>
      </el-form-item> -->
      
      <el-form-item label="排序">
        <el-input style="width: 250px" auto-complete="off" type="number" placeholder="填一下新广告位的排序呗，必须是正整数哦" v-model="formData.sort"></el-input>
      </el-form-item>
      <el-form-item label="展示图">
        <el-upload
          id="thumbnail-uploader"
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
          <img v-if="formData.poster" :src="formData.poster" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传尺寸为750px*450px的图片，不超过2M</div>
      </el-form-item>
      
      <el-form-item v-if="formData.limit_type == 1" label="有效时间">
      <el-date-picker
        v-model="formData.time"
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

    </el-form>

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'EditBrandSpace',
  data() {
    return {
      token: {
        token: localStorage.getItem('token')
      },
      thumbData: null,

      ...formNTimePickerConfig,
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
  }
};
</script>
