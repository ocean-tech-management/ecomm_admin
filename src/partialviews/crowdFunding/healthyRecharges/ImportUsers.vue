<template>
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
    <div style="margin-top: 20px;">
      <el-form>
        <el-form-item label="渠道">
          <el-select v-model="channelType" placeholder="请选择渠道" name="grant_type" style="width: 320px;">
            <el-option v-for="(item, key) in channelTypeTexts" :label="item" :value="key" :key="key"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  name: "ImportUsers",
  data() {
    return {
      token: {
        token: localStorage.getItem("token")
      },
      channelType: '', // 渠道
      channelTypeTexts: {
        [1]: '商城',
        [2]: '福利',
        [3]: '消费型股东'
      },
      importUsers: [], // 上传返回的有效数据导入
      fileName: "", // 选择的文件名
      thumbData: {
        type: 11 //导入要充值健康豆
      },
      fileList: [],

    };
  },
  methods: {
    clearFiles() {
      this.fileName = "";
      this.channelType = '';
      this.$refs.import && this.$refs.import.clearFiles();
    },
    // 确定导入
    confirmSelectCorrect() {
      if (!this.channelType) {
        throw new Error('请选择渠道');
      }
      return new Promise(resolve => {
        if (this.fileList.length === 0)
          return this.$message.error("请上传.xls或.xlsx文件哦");
        const file = this.fileList[0];
        const tipsHtml = `<p>确定对文件 ${file.name} 进行导入操作？</p><strong style="display: block;color: #F56C6C;">充值操作不可逆, 无法撤回。</strong>`;
        this.$confirm(tipsHtml, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true
        })
          .then(() => {
            this.$refs.import.submit();
            this.$loading({
              text: "导入中"
            });
          })
          .catch(() => {});
      });
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
          return this.$message.error(file.response.msg);
        }
        let importUsers = file.response.data || [];
        if(importUsers.length <= 0) {
          this.$message.error('无有效数据导入');
          this.clearFiles();
          return;
        }
        this.importUsers = importUsers;
        this.askRecharge();
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
        this.fileList = [file];
        this.fileName = file.name;
      }
    },
    onErrorUpload(err) {
      this.$loading && this.$loading().close && this.$loading().close();
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
    // 导入充值记录
    askRecharge() {
      this.$confirm(`导入成功，您将对导入的${this.importUsers.length}条记录进行健康豆充值操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/finance/rechargeHealthyBalance', {
          all_user: this.importUsers.map(e => {
            return {
              user_phone: e.userPhone,
              price: e.price,
              remark: e.remark,
            }
          }),
          channel_type: this.channelType,
        }, res => {
          this.$message.success('充值成功');
          this.$emit("success");
        });
      }).catch(() => {
        this.$emit("success");
      });
    },
  }
};
</script>
<style lang="less" scoped>
//.excel-uploader /deep/ .el-upload-dragger {
//  width: 600px;
//}
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
