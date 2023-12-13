<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="指定用户" prop="oper_uid">
        <div class="form-content-static">{{formData.user_name}}（{{formData.user_phone}}）</div>
      </el-form-item>

      <el-form-item label="操作方式">
        <div class="form-content-static">{{operTypeTexts[formData.oper_type]}}</div>
      </el-form-item>
      
      <el-form-item label="操作人" prop="admin_name">
        <div class="form-content-static">{{formData.admin_name}}</div>
      </el-form-item>
      <el-form-item label="操作凭据" label-width="100px">
        <img :src="formData.proof" style="width: 400px" />
      </el-form-item>
      <el-form-item label="操作原因">
        <div class="form-content-static">{{formData.remark}}</div>
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
      
      operTypeTexts: {
        [1]: '重置登录密码为手机号码后四位',
        [2]: '初始化支付密码'
      },
    };
  },
  props: {
    formData: Object
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
        keyword: this.filter.keyword
      };

      this.$get('/admin/member/list', queryVal, res => {
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
      if(result.oper_type == 1) delete result.pwd;
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
