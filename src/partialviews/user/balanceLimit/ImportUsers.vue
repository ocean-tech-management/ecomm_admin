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
        <el-form-item label="限制类型" prop="type">
          <el-select v-model="state.type" placeholder="" name="type" style="width: 288px;">
            <el-option v-for="(item, key) in typeTexts" :key="key" :label="item" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="限制操作类型" prop="limit_type">
          <el-select v-model="state.limit_type" placeholder="" name="limit_type" style="width: 260px;">
            <el-option v-for="(item, key) in limitTypeTexts" :key="key" :label="item" :value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="限制钱包类型" prop="balance_type">
          <el-select v-model="state.balance_type" placeholder="" name="balance_type" style="width: 260px;">
            <el-option v-for="(item, key) in balanceTypeTexts" :key="key" :label="item" :value="key"></el-option>
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
      state: {
        type: '1', // 默认-全额禁止操作
        limit_type: '1', // 默认-提现
        balance_type: '6' // 默认-集品券钱包
      },
      typeTexts: {
        [1]: '全额禁止操作',
        [2]: '超出额度部分可操作',
        [3]: '累计额度内可操作'
      },
      limitTypeTexts: {
        [1]: '提现',
        [2]: '转赠',
        // [3]: '转化',
        [4]: '提现+转赠'
      },
      balanceTypeTexts: {
        // [1]: '商城钱包',
        // [2]: '广宣奖钱包',
        // [3]: '团队钱包',
        // [4]: '区代钱包',
        // [5]: '股东奖钱包',
        [6]: '集品券钱包',
        // [7]: '集品豆钱包',
        // [8]: '健康豆钱包',
        // [9]: '礼品券钱包',
        [10]: '团长端总余额钱包',
        // [88]: '全部余额',
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
      this.state = {
        type: '1', // 默认-全额禁止操作
        limit_type: '1', // 默认-提现
        balance_type: '6' // 默认-集品券钱包
      }
      console.log('clear2');
      this.importUsers = [];
      this.$refs.import && this.$refs.import.clearFiles();
    },
    // 确定导入
    confirmSelectCorrect() {
      if (!this.state.type)
        throw new Error('请选择限制类型');
      if (!this.state.limit_type)
        throw new Error('请选择限制操作类型');
      if (!this.state.balance_type)
        throw new Error('请选择限制钱包类型');
      return new Promise(resolve => {
        if (this.fileList.length === 0)
          return this.$message.error("请上传.xls或.xlsx文件哦");
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
              // 没有更改上传文件
              this.askRecharge();
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
      });
    },
    onChangeUpload(file, fileList) {
      if (fileList.length > 1) {
        // 去除旧上传的file
        this.$refs.import.handleRemove(fileList[0]);
        this.importUsers = []
        this.$loading && this.$loading().close && this.$loading().close();
      }
      if (file.response) {
        // 上传成功
        this.$loading && this.$loading().close && this.$loading().close();
        if (file.response.error_code !== 0) {
          this.clearFiles();
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
    // 导入充值记录
    askRecharge() {
      this.$confirm(`导入成功，您将对导入的${this.importUsers.length}条记录进行用户余额限制操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/userBalanceLimit/create', {
          all_user: this.importUsers.map(e => {
            return {
              user_phone: e.userPhone,
              price: e.price,
              remark: e.remark,
            }
          }),
          type: Number(this.state.type),
          limit_type: Number(this.state.limit_type),
          balance_type: this.state.balance_type,
        }, res => {
          this.$message.success('导入成功');
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
