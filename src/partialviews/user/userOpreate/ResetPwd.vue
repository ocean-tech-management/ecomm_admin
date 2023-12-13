<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="80px">
          <el-form-item label="筛选" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form-item label="指定用户" prop="oper_uid">
        <el-select class="standard-select" placeholder="请选择" v-model="formData.oper_uid" @change="$forceUpdate()">
          <el-option v-for="user in dataList" :label="user.name + (user.phone ? ('(' + user.phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
        </el-select>
        <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
        <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定用户的选择器里进行精确指定</div>
      </el-form-item>

      <el-form-item label="操作方式">
        <el-radio-group v-model="formData.oper_type" @change="updateOperType">
          <el-radio :label="1">重置登录密码为手机号码后四位</el-radio>
          <el-radio :label="2">初始化支付密码</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- <el-form-item v-if="formData.oper_type != 1" label="输入密码" prop="pwd">
        <el-input
          style="width: 350px"
          v-model="formData.pwd"
          type="password"
          :maxlength="operTypePwdLen[formData.pwd]"
          :placeholder="'请输入' + operTypePwdLen[formData.oper_type] + '位密码哦'"
        ></el-input>
      </el-form-item> -->

      <el-form-item label="操作凭据" label-width="100px">
        <el-upload
          id="thumbnail-uploader"
          class="thumbnail-uploader"
          accept="image/png, image/jpeg, image/gif"
          action="/admin/file/upload"
          ref="proof"
          :data="thumbData"
          :headers="token"
          :show-file-list="false"
          :before-upload="thumbWatcher"
          :on-success="thumbnailSuccess"
          :on-error="uploadError"
          auto-upload 
        >
          <el-input v-show="false" v-model="formData.proof" placeholder="缩略图"></el-input>
          <img v-if="formData.proof" :src="formData.proof" class="thumbnail" />
          <i v-else class="el-icon-plus thumbnail-uploader-icon"></i>
          
        </el-upload>
      </el-form-item>
      <el-form-item label="操作原因">
        <el-input
          style="max-width: 550px"
          auto-complete="off"
          type="textarea"
          placeholder="请输入本次操作的原因/备注哦"
          v-model="formData.remark"
        ></el-input>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
import uploadCtrl from '@/util/uploadCtrl';
export default {
  name: 'ResetUserPwd',
  data() {
    return {
      thumbData: {},
      token: {
        token: localStorage.getItem('token') || ''
      },

      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],

      formData: {
        oper_uid: '',
        pwd: '',
        proof: '',
        remark: '',
        oper_type: 1
      },
      operTypePwdLen: {
        [1]: 4,
        [2]: 6
      }
    };
  },
  mounted() {
  },
  methods: {
    reInit() {
      this.formData = {
        oper_uid: '',
        pwd: '',
        proof: '',
        remark: '',
        oper_type: 1
      }
      this.$refs.proof.clearFiles();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword,
        needAllLevel: 1, //查全部用户
      };

      this.$get('/admin/user/list', queryVal, res => {
        let dataList = res.data;
        this.dataList = dataList;
        if(this.dataList.length > 0) this.formData.oper_uid = dataList[0].uid;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.getUsers();
    },

    updateOperType() {
      this.formData.pwd = '';
    },

    
    thumbWatcher(file) {
      if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif') {
        this.$refs.proof.clearFiles();
        this.$message.error('只能上传jpg/png/gif图片哦');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isLt2M) {
        this.$refs.proof.clearFiles();
        this.$message.error('上传封面图片大小不能超过 2MB');
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
              this.formData.proof = url;
              this.$refs.proof.clearFiles();
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
      this.formData.proof = res.data;
      this.$refs.proof.clearFiles();
      this.$forceUpdate();
    },
    uploadError(err) {
      this.$message.error('您未能正确上传图片，请选择大小不超过 2M 的jpg或者png图片上传或检查您的网络哦');
    },

    confirmResult() {
      let result = JSON.parse(JSON.stringify(this.formData));
      delete result.pwd;  //暂时先不让改
      let paramValues = Object.values(result);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          this.$message.error('请填写/勾选完所有信息');
          return false;
        }
      }
      return result;
    }

  },
};
</script>
