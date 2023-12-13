<template>
  <el-dialog :title="title" width="550px" :close-on-click-modal="false" :visible.sync="privateVisible" @close="close">
    <div v-if="$slots.title" slot="title" class="el-dialog__title">
      <slot name="title"></slot>
    </div>
    <div class="radio-group">
      <el-radio-group v-model="radio">
        <el-radio-button label="1">单用户导入</el-radio-button>
        <el-radio-button label="2">多用户导入</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="radio === '1'" :key="1" class="user-card">
      <el-form label-width="100px" :inline="true" @submit.native.prevent>
        <el-form-item label="筛选">
          <el-input v-model="keyword" placeholder="请输入手机号码或昵称" style="width: 220px;"
            @keyup.enter.native="getUsers"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getUsers">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <div>
          <el-form-item label="指定用户">
            <el-select v-model="uid" class="standard-select" placeholder="请选择" style="width: 220px;"
              @change="onChangeUser">
              <el-option label="请选择" value></el-option>
              <el-option v-for="user in dataList" :label="user.name + (user.phone ? ('(' + user.phone + ')') : '')"
                :value="user.uid" :key="user.uid"></el-option>
            </el-select>
            <span style="margin-left: 15px;">共 {{ dataList.length }} 个模糊选项</span>

          </el-form-item>

        </div>
      </el-form>
      <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定上级的选择器里进行精确指定</div>
      <slot name="user"></slot>
    </div>
    <div v-if="radio === '2'" :key="2" class="import-card">
      <div>
        <el-upload ref="import" id="excel-uploader" class="excel-uploader" :data="thumbData" :headers="token"
          :show-file-list="false" :on-exceed="exceedLimit" :on-change="onChangeUpload" :on-error="onErrorUpload"
          :auto-upload="false" drag
          accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          action="/admin/file/importExcel">
          <template v-if="fileName">
            <i class="el-icon-document"></i>
            <div class="el-upload__text ellipsis-2">
              <em>{{ fileName }}</em>
            </div>
          </template>
          <template v-else>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">点击上传</div>
          </template>
        </el-upload>
      </div>
      <slot name="upload"></slot>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '用户导入'
    },
    validUser: Function,
    validImport: Function,
  },
  data() {
    return {
      privateVisible: false,
      radio: '1',

      // 单用户导入
      keyword: '',
      uid: '',
      userInfo: {},
      dataList: [],

      // 多用户导入
      token: {
        token: localStorage.getItem("token")
      },
      importUsers: [], // 上传返回的有效数据导入
      fileName: "", // 选择的文件名
      thumbData: {
        type: 11 //导入要充值健康豆
      },
      fileList: [],
    }
  },
  watch: {
    visible(value,next) {
      if (value) {
        this.keyword = ''
        this.dataList = []
        this.clearFiles();
      }
      this.privateVisible = value
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
    },
    //重置查询条件
    resetQuery() {
      this.keyword = ''
      this.getUsers();
    },
    //获取列表
    getUsers() {
      if(!this.keyword){
         return this.$message.warning("请输入关键词哦！")
      }
      this.$get('/admin/user/list', { keyword: this.keyword,needAllLevel:1 }, res => {
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].uid == this.uid) {
            // 剔除他自己本身
            dataList.splice(i, 1);
            break;
          }
        }
        this.dataList = dataList;
        console.log(this.dataList,132)
      });
    },
    onChangeUser(value) {
      this.userInfo = this.dataList.find(v => v.uid === value) || {}
      console.log(this.userInfo);
      this.$forceUpdate()
    },
    /**
     * 确认
     */
    async confirm() {
      const query = {}
      if (this.validUser && this.radio === '1') {
        if (!this.uid) return this.$message.warning('请筛选获取指定用户')
        await this.validUser()
        query.user_phone = this.userInfo.phone
        // query.user_phone = this.userInfo.user_phone
        this.$emit('success', {
          type: this.radio,
          query
        })
      }
      if (this.validImport && this.radio === '2') {
        await this.validImport()
        if (this.fileList.length === 0) return this.$message.error("请上传.xls或.xlsx文件哦");
        const file = this.fileList[0];
        const tipsHtml = `<p>确定对文件 ${file.name} 进行导入操作？</p>`;
        this.$confirm(tipsHtml, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true
        })
          .then(() => {
            if (this.importUsers.length > 0) {
              // 存在已上传文件
              this.$emit('success', {
                type: this.radio,
                query: this.importUsers
              })
            } else {
              this.$refs.import.submit();
              this.$loading({
                text: "导入中"
              });
            }
          })
          .catch(() => {
            console.log('warn');
          });
      }
    },
    /**
     * 重置导入
     */
    clearFiles() {
      this.fileName = "";
      this.fileList = [];
      this.importUsers = [];
      this.$refs.import && this.$refs.import.clearFiles();
    },
    onChangeUpload(file, fileList) {
      if (fileList.length > 1) {
        // 去除旧上传的file
        this.$refs.import.handleRemove(fileList[0]);
        this.$loading && this.$loading().close && this.$loading().close();
      }
      if (file.response) {
        // 上传成功
        this.$loading && this.$loading().close && this.$loading().close();
        if (file.response.error_code !== 0) {
          this.clearFiles()
          return this.$message.error(file.response.msg);
        }
        let importUsers = file.response.data || [];
        if(importUsers.length <= 0) {
          this.$message.error('无有效数据导入');
          this.clearFiles();
          return;
        }
        this.importUsers = importUsers;
        this.$emit('success', {
          type: this.radio,
          query: importUsers
        })
      } else if (file && file.raw) {
        // 选择文件
        if (
          file.type != "application/vnd.ms-excel" &&
          file.type !=
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
          !file.name.endsWith(".xlsx") &&
          !file.name.endsWith(".xls")
        ) {
          this.clearFiles();
          this.$message.error("只能上传标准的.xls或.xlsx文件哦");
          return false;
        }
        this.importUsers = [];
        this.fileList = [file];
        this.fileName = file.name;
      }
    },
    onErrorUpload(err) {
      this.$loading && this.$loading().close && this.$loading.close();
      return this.$message.error(
        typeof err === "string"
          ? err
          : "您未能正确上传excel文件，请选择符合 模板要求 的标准excel文件上传或检查您的网络哦。 请留意会员等级文案是否正确无误"
      );
    },
    exceedLimit() {
      this.clearFiles();
      this.$message.error("一批最多只能选择上传1个文件哦");
    },
  }
}
</script>
<style lang="less" scoped>
.radio-group {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
  ;
}

.form-tips {
  padding-bottom: 10px;
  letter-spacing: 1px;
}

.user-card {}

.excel-uploader /deep/ .el-upload-dragger {
  width: 510px;
}

.el-icon-document {
  font-size: 67px;
  color: #c0c4cc;
  margin: 40px 0 16px;
  line-height: 50px;
}

.ellipsis-2 {
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  word-break: break-all;
  /* autoprefixer: ignore next */
  -webkit-box-orient: vertical;
}

.tips {
  margin-top: 20px;
  letter-spacing: 2px;
  color: #909399;

  &>div:first-child {
    padding-bottom: 5px;
  }
}
</style>
