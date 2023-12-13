<template>
  <div>
    <el-upload ref="import" id="excel-uploader" class="excel-uploader" :data="thumbData" :headers="token"
      :show-file-list="false" :on-exceed="exceedLimit" :on-change="onChangeUpload" :on-error="onErrorUpload"
      :auto-upload="false" drag
      accept=".xls,.xlsx,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      action="/admin/file/importExcel" style="width: 550px">
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
      <el-form label-width="125px">
        <el-form-item label="是否计入业绩">
          <el-select v-model="performanceType" placeholder="是" name="grant_type" style="width: 249px;"
            @change="onPerformanceTypeChange">
            <el-option label="是" :value="1"></el-option>
            <el-option label="否" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="充值赠送东西类型">
          <el-select v-model="giftType" placeholder="请选择充值赠送东西类型" name="gift_type" style="width: 249px;">
            <el-option v-for="(item, key) in giftTypeText" :label="item" :value="key" :key="key"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="giftType == 2">
          <el-form-item label="赠送健康豆渠道">
            <el-select v-model="healthyChannelType" placeholder="请选择赠送健康豆渠道" name="healthy_channel_type"
              style="width: 249px;">
              <el-option v-for="(item, key) in healthyChannelTypeText" :label="item" :value="key" :key="key"></el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
    </div>
    <div v-show="showPerformanceTips" class="tips">
      <div>
        不计入业绩表示本次充值不给上级和团队增加充值业绩,
        不增加用户的累计充值额度;
      </div>
      <div>
        此功能仅针对特殊情况下返回用户集品券但不做业绩统计的场景下使用,
        <strong style="color: #F56C6C;">请谨慎选择!</strong>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  name: "ImportUsers",
  data() {
    return {
      token: {
        token: localStorage.getItem("token")
      },
      performanceType: 1, // 是否计入业绩
      giftType: '', // 充值赠送东西类型
      giftTypeText: {
        [-1]: '不赠送',
        [1]: '集品豆',
        [2]: '健康豆'
      },
      healthyChannelType: '',
      healthyChannelTypeText: {
        [1]: '商城',
        [2]: '福利',
        [3]: '消费型股东',
      },


      importUsers: [], // 上传返回的有效数据导入
      fileName: "", // 选择的文件名
      thumbData: {
        type: 11 //导入要充值集品券的人员
      },
      fileList: [],


      showPerformanceTips: false
    };
  },
  methods: {
    clearFiles() {
      this.fileName = "";
      this.performanceType = 1;
      this.giftType = '';
      this.healthyChannelType = '';
      this.showPerformanceTips = false;
      this.$refs.import && this.$refs.import.clearFiles();
    },
    // 切换是否计入业绩
    onPerformanceTypeChange(val) {
      // 选择否
      this.showPerformanceTips = val === 2
    },
    // 确定导入
    confirmSelectCorrect() {
      return new Promise(resolve => {
        if (this.fileList.length === 0)
          return this.$message.error("请上传.xls或.xlsx文件哦");
        if (!this.giftType) return this.$message.error("请选择充值赠送东西类型哦");
        if (this.giftType == 2 && !this.healthyChannelType) return this.$message.error("请选择赠送健康豆渠道哦");
        const file = this.fileList[0];
        const tipsHtml = this.performanceType == 2 ?
          `<p>确定对文件 ${file.name} 进行导入操作？</p><strong style="display: block;color: #F56C6C;">充值操作不可逆, 无法撤回，且对导入金额不计入业绩！</strong>` :
          `<p>确定对文件 ${file.name} 进行导入操作？</p><strong style="display: block;color: #F56C6C;">充值操作不可逆, 无法撤回。</strong>`
        this.$confirm(tipsHtml, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
          dangerouslyUseHTMLString: true
        })
          .then(() => {
            if(this.$refs.import && this.$refs.import.uploadFiles.length > 0 && this.$refs.import.uploadFiles[0].response) {
              this.onChangeUpload(this.$refs.import.uploadFiles[0], this.$refs.import.uploadFiles)
            } else {
              this.$refs.import.submit();
              this.$loading({
                text: "导入中"
              });
            }
          })
          .catch(() => {
            this.$loading && this.$loading().close && this.$loading().close();
          });
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
      this.$confirm(`导入成功，您将对导入的${this.importUsers.length}条记录进行充值操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const params = {
          allUser: this.importUsers,
          performance_type: this.performanceType,
          gift_type: Number(this.giftType),
        }
        if (this.giftType == 2) params['healthy_channel_type'] = Number(this.healthyChannelType);
        this.$post('/admin/finance/rechargeCrowdBalance', params, res => {
          this.$message.success('充值成功');
          this.$emit("success");
        }, () => {

        });
      }).catch(() => {
        this.$emit("success");
      });
    },
  }
};
</script>
<style lang="less" scoped>
.excel-uploader /deep/ .el-upload-dragger {
  width: 600px;
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
