<template>
  <div>
    <el-form :model="formData" label-width="150px">
      <el-form-item label="设备号">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.device_sn"
        ></el-input>
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.device_name"
        ></el-input>
      </el-form-item>
      <el-form-item label="设备编码(自定义)">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.device_show_sn"
        ></el-input>
      </el-form-item>
      <el-form-item label="智能开关imei">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.power_imei"
        ></el-input>
      </el-form-item>
      <el-form-item label="智能开关号码">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.power_number"
        ></el-input>
      </el-form-item>
      <el-form-item label="设备所在地">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.address"
        ></el-input>
      </el-form-item>
      <el-form-item label="设备联系人">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          v-model="formData.concact_name"
        ></el-input>
      </el-form-item>
      <el-form-item label="联系人电话">
        <el-input
          style="width: 250px;"
          auto-complete="off"
          placeholder="请输入"
          maxlength="11"
          v-model="formData.concact_phone"
        ></el-input>
      </el-form-item>

      <el-form-item label="设备介绍">
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
          <el-input v-show="false" v-model="formData.device_image" placeholder="缩略图"></el-input>
          <img v-if="formData.device_image" :src="formData.device_image" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
        </el-upload>
        <div
              style="color: #999; font-size:14px; line-height: 1.4; margin-top: 10px"
            >请上传宽度为750px的图，不超过2M</div>
      </el-form-item>
      <el-form-item label="排序">
        <el-input style="width: 450px" auto-complete="off" type="number" placeholder="填一下排序呗，必须是正整数哦" v-model="formData.sort"></el-input>
      </el-form-item>

      <div style="margin-top: 60px;">
        <div class="page-ctrl">
          <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="150px">
            <el-form-item label="筛选" prop="keyword">
              <el-input v-model="queryForm.keyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryInfo">查询</el-button>
              <el-button @click="resetQuery('queryForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-form :model="formData" label-width="150px">
          <el-form-item label="关联用户" prop="uid">
            <el-select class="standard-select" placeholder="请选择" v-model="formData.uid" @change="$forceUpdate()">
              <el-option label="请选择" value></el-option>
              <el-option v-for="user in dataList" :label="user.name + (user.phone ? ('(' + user.phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
            </el-select>
            <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
            <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定上级的选择器里进行精确指定</div>
          </el-form-item>
        </el-form>
      </div>
      
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

      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],
    };
  },
  props: {
    formData: Object
  },
  mounted() {},
  methods: {
    
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.formData.uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/device/deviceUser', queryVal, res => {
        let dataList = res.data;
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.formData.uid = null;
      this.getUsers();
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
        this.$message.error('上传设备图标大小不能超过 2MB');
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
              this.formData.device_image = url;
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
      this.formData.device_image = res.data;
      this.$refs.thumb.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },
  }
};
</script>
