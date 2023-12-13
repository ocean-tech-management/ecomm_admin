<template>
  <div>
    <el-drawer title="提现审核" :visible.sync="drawerVisible" :before-close="changeDrawer" size="100%">
      <template #title>
        <el-row type="flex" justify="space-between">
          <el-col>
            <span class="text">提现审核</span>
            <span v-if="personNum > 0" style="margin-left: 50px;color: black;font-weight: 700;">导出总计：<span class="red">{{
              total }}</span> 条，你需要随机抽取
              <span class="red">{{ personNum }}</span> 个人查看后才能导出</span>
            <br />
            <el-col class="priceTotal">
              <div class="priceTotal-text">
                <span>(选中)申请提现金额总计：<span class="red">{{
                  total_price_total.toFixed(3)
                }}</span>元</span>
                <span>
                  &nbsp;(选中)手续费总计：<span class="red">{{
                    handing_fee_total.toFixed(3)
                  }}</span>元</span>
                <span>
                  &nbsp;(选中)提现金额总计：<span class="red">{{
                    price_total.toFixed(3)
                  }}</span>元</span>
                <span>
                  &nbsp;(选中)共：<span class="red">{{
                    exportModel == "1"
                    ? dataList.length
                    : multipleSelection.length
                  }}</span>条</span>
              </div>
            </el-col>
          </el-col>
          <el-col style="display: flex;align-items: center;justify-content: end;">
            <el-row style="float: right;">
              <el-select @change="paySystem" size="small" style="margin-right: 20px;" v-model="PayValue"
                placeholder="打款方式--对应导出模板">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-radio @input="radioInput" v-model="exportModel" label="1">全量导出</el-radio>
              <el-radio @input="radioInput" v-model="exportModel" label="2">筛选导出</el-radio>
            </el-row>
          </el-col>
        </el-row>
      </template>
      <div class="subpage-content subpage-content-ctrls">
        <div class="default-container">
          <el-table max-height="500" style="width: 100%" :data="tableData" @selection-change="handleSelectionChange"
            :row-key="getRowKeys" ref="multipleTable" tooltip-effect="dark">
            <el-table-column v-if="exportModel == '2'" :reserve-selection="true" :selectable="selected" type="selection"
              width="55">
            </el-table-column>
            <el-table-column label="提现编号" width="180" prop="order_sn"></el-table-column>
            <el-table-column label="用户昵称" prop="user_name">
              <template slot-scope="scope">
                <div class="form-content-static">
                  <span>{{ scope.row.user_name }}</span>
                  <span v-if="scope.row.related_user">
                    <el-tooltip class="item" effect="dark" content="该用户使用了其他账号的签约信息" placement="top">
                      <el-button style="font-size: 24px; vertical-align: middle" class="error-color" type="text"
                        icon="el-icon-warning" size="medium"></el-button>
                    </el-tooltip>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="真实用户名" prop="user_real_name" width="100"></el-table-column>
            <el-table-column label="申请提现金额" width="120" prop="total_price"></el-table-column>
            <el-table-column label="提现手续费" width="100" prop="handing_fee"></el-table-column>
            <el-table-column label="提现金额" width="120" prop="price"></el-table-column>
            <el-table-column label="提现类型" width="100" align="center">
              <template slot-scope="scope">
                {{ withdrawTypeTexts[scope.row.withdraw_type] }}
              </template>
            </el-table-column>
            <el-table-column label="乐小活签约" width="100" align="center">
              <template slot-scope="scope">
                <div v-if="scope.row.contract_exempt_letfree">免签约</div>
                <div v-else-if="scope.row.contract_letfree">已签约</div>
                <div v-else class="warning-color">未签约</div>
              </template>
            </el-table-column>
            <el-table-column label="提现时间" width="150" prop="create_time"></el-table-column>
            <el-table-column label="到账时间" width="150" prop="payment_time"></el-table-column>
            <el-table-column label="审核状态" width="80" prop="check_status"></el-table-column>
            <el-table-column label="备注" width="250" prop="remark"></el-table-column>
            <el-table-column label="到账状态" width="80">
              <template slot-scope="scope">
                <div v-if="scope.row.payment_status == -1" class="error-color">
                  {{ payStatusText[scope.row.payment_status] }}
                </div>
                <div v-else>{{ payStatusText[scope.row.payment_status] }}</div>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" wdith="150">
              <template slot-scope="scope">
                <template v-if="$auths.includes('finance/withdrawDetail')">
                  <el-button type="text" size="default" @click="openDetail(scope.row)">详情</el-button>
                  <!-- <el-button type="text" size="default" @click="deleteIine(scope.row)">删除</el-button> -->
                </template>
              </template>
            </el-table-column>

            <!-- 底部的提交 -->
          </el-table>
          <div class="block">
            <el-row class="exportBtn" style="width:100%">
              <el-col class="exportBtn-col">
                <el-checkbox @change="exportCheck" :disabled="personNum > 0" v-model="checked">我已审核通过, 且数据无误
                </el-checkbox>
                <el-button type="primary" @click="dialogShow"
                  style="z-index: 999;position: absolute;right: 20px;top: 5px;" :disabled="btnCodeCd">
                  确认导出
                  <span v-if="btnCodeCd">(确认无误后{{ long }}秒可提交)</span>
                </el-button>
              </el-col>
            </el-row>
            <el-pagination layout="total,sizes,prev,pager,next,jumper" :page-size="size" :current-page="page"
              @current-change="handleCurrentChange" @size-change="sizeChange" :page-sizes="pageSizes" :total="total">
            </el-pagination>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog title="确认审核无误" :visible.sync="dialogVisible" width="30%" :before-close="handleClose">
      <el-form ref="epxortForm" :rules="rules" label-width="100px" :model="keyFormData">
        <el-form-item prop="message" label="确认信息">
          <el-input v-model="keyFormData.message" placeholder="请输入-我已确认审核无误" />
        </el-form-item>
        <el-form-item prop="username" label="审核人">
          <el-input v-model="keyFormData.username" placeholder="请输入你的名字" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提现详情" width="1000px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <WithdrawDetail :formData="formData" :dataList="dataList"></WithdrawDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="messageLook(formData.id)">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 导出成功后把信息给用户 -->
    <el-dialog title="导出表格成功,信息如下" :visible.sync="messageDialogVisible" width="650px" :before-close="handleClose">
      <!--    <a style="outline: none; color: #409eff;" :href="messageForm.file" :title="messageForm.file">{{ messageForm.file }}</a>-->
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="文件地址">
          <el-input v-model="messageForm.file" style="width: 530px;">
            <el-button slot="append" @click="handleCopy">复制</el-button>
          </el-input>
          <!--          <el-link :underline="false" :href="messageForm.file" type="primary">{{ messageForm.file }}</el-link>-->
        </el-form-item>
        <el-form-item label="提示信息">
          <div style="width: 530px;">
            <div style="color: #F56C6C">
              文件已加密, 文件密码已通过短信下发给系统安全员;
            </div>
            <div style="color: #F56C6C">
              若无法收到短信可在 提现记录->查看近7天导出表格
              列表中找到具体文件通过 操作密码 重新获取密码
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import WithdrawDetail from "@/partialviews/finance/withdraw/WithdrawDetail";
/*
 *@Date: 2023-02-24 16:28:57
 *@Description: 模块描述
 */
export default {
  components: {
    WithdrawDetail
  },
  name: "",
  props: {
    drawerVisible: {
      type: Boolean,
      // 定义是否必须传
      required: true,
      // 定义默认值
      default: false
    },
    filter: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      dataList: [],
      //总计
      total_price_total: 0,
      handing_fee_total: 0,
      price_total: 0,
      //  当前页
      size: 20,
      page: 1,
      total: 0,
      tableData: [],
      pageSizes: [20, 40, 60, 80, 100, 500, 1000],
      messageDialogVisible: false,
      messageForm: {
        file_export_id: "",
        file: ""
      },
      //需要抽取的人
      personNum: 0,
      options: [
        {
          value: "1",
          label: "微信支付"
        },
        {
          value: "2",
          label: "汇聚支付"
        },
        {
          value: "3",
          label: "衫德支付"
        },
        {
          value: "4",
          label: "快商"
        },
        {
          value: "5",
          label: "中数科"
        },
        {
          value: "88",
          label: "线下打款"
        }
      ],
      PayValue: "衫德支付",
      //财务人员点开详情并确认计数器
      count: [],
      typeText: {
        [1]: "常规分润",
        [2]: "普通用户推荐首单返积分",
        [3]: "会员推荐首次分润",
        [4]: "会员订单分润"
      },
      payStatusText: {
        [1]: "已到账",
        [2]: "",
        [-1]: "失败"
      },
      withdrawTypeTexts: {
        [2]: "商城提现",
        [5]: "H5提现",
        [7]: "福利提现"
      },
      //审核人
      username: "",
      //提现详情模态框
      detailVisible: false,
      //
      remarkVisible: false,
      //提现复选框被选中的元素
      multipleSelection: [],
      getRowKeys(row) {
        return row.id;
      },
      // 按钮是否CD
      btnCodeCd: true,
      //复选框是否CD
      checkboxCodeCd: true,
      // CD长度
      long: 60,
      //审核复选框
      checked: false,
      //模板单选框   '1'表达式第一个模板
      radioModel: "1", //默认导出模板一
      //默认导出方式全量
      exportModel: "1",
      //导出最后确认模态框
      dialogVisible: false,
      //定时器id
      timer: null,
      //审核表单数据
      keyFormData: {
        message: "",
        username: ""
      },
      //详情
      formData: {},
      //导出衫德表格的序号
      index: 0,
      //导出的标识
      code_no: "",
      //表单验证
      rules: {
        message: [
          {
            required: true,
            message: "请输入-我已确认审核无误",
            trigger: "blur"
          },
          {
            pattern: /^我已确认审核无误$/,
            message: "只能输入我已确认审核无误",
            trigger: "blur"
          }
        ],
        username: [
          { required: true, message: "请输入你的名字", trigger: "blur" },
          { min: 1, max: 15, message: "长度在 1 到 15 个字符", trigger: "blur" }
        ]
      },
      //导出表格的名称
      title: ""
    };
  },
  created() {
    this.getList();
  },
  mounted() {},
  methods: {
    //重置数据
    resetData() {
      this.personNum = 0;
      this.PayValue = "衫德支付";
      this.count = [];
      this.multipleSelection = [];
      this.btnCodeCd = true;
      this.checkboxCodeCd = true;
      this.long = 60;
      this.checked = false;
      this.radioModel = "1";
      this.exportModel = "1";
      this.dialogVisible = false;
      this.timer = null;
      this.keyFormData = {
        message: "",
        username: ""
      };
      this.formData = {};
      this.index = 0;
      this.code_no = "";
      this.checkPerson();
    },
    // 分页
    handleCurrentChange(value) {
      this.page = value;
      this.getTableData();
    },
    exportCheck() {
      this.startCd(60);
    },
    //前端分页
    getTableData() {
      this.tableData = this.dataList.slice(
        (this.page - 1) * this.size,
        this.page * this.size
      );
      this.total = this.dataList.length;
    },
    sizeChange(val) {
      this.size = val;
      this.page = 1;
      this.getTableData();
    },
    //获取列表
    getList() {
      //获取时间戳判断是否2023-02-23 00:00:00之前的时间
      const date = new Date("2023-02-23 00:00:00").getTime();
      const flagDate = date > this.filter.start_time ? true : false;
      const time_type = flagDate ? 2 : 1;
      let params = {
        order_sn: this.filter.order_sn,
        keyword: this.filter.keyword,
        check_status: this.filter.check_status,
        // time_type,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time,
        // payment_status: 2
        exportNum:this.filter.exportNum,
        exportPageNum: this.filter.exportPageNum,
      };

      this.$get("/admin/excel/withdraw", params, res => {
        if (res.error_code != 0) {
          this.$emit("update:drawerVisible", !this.drawerVisible);
          return;
        } else {
          this.dataList = res.data.list || [];
          this.total = this.dataList.length;
          //拿到导出的唯一标识
          this.code_no = res.data.code_no;
          if (this.dataList.length == 0) {
            this.$emit("update:drawerVisible", !this.drawerVisible);
            return this.$message.warning("查无数据，请检查");
          }
          if (this.dataList.length > 100000) {
            this.$emit("update:drawerVisible", !this.drawerVisible);
            return this.$message.warning(
              "数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理"
            );
          }
          this.checkPerson();
          this.getTableData();
          if (this.exportModel == "1") {
            this.getAllPrice(this.dataList);
          }
        }
      });
    },
    radioInput(val) {
      if (val == "1") {
        this.getAllPrice(this.dataList);
      } else if (val == "2") {
        this.getAllPrice(this.multipleSelection);
      }
    },
    //计算总计
    getAllPrice(arr) {
      this.price_total = 0;
      this.total_price_total = 0;
      this.handing_fee_total = 0;
      arr.forEach(item => {
        for (const key in item) {
          if (key == "price") {
            this.price_total += Number(item[key]);
          } else if (key == "handing_fee") {
            this.handing_fee_total += Number(item[key]);
          } else if (key == "total_price") {
            this.total_price_total += Number(item[key]);
          }
        }
      });
    },
    paySystem(val) {
      this.PayValue = val;
    },
    //代检验的人数
    checkPerson() {
      if (this.personNum >= 0) {
        this.personNum = Math.ceil(this.total * 0.05) - this.count.length;
      }
    },
    //禁用复选框
    selected() {
      //代检验的人数
      if (this.personNum >= 0) {
        this.personNum = Math.ceil(this.total * 0.05) - this.count.length;
        if (this.count.length >= this.personNum) {
          return true;
        } else {
          return false;
        }
      }
    },
    //抽屉是否显示
    changeDrawer() {
      this.$confirm("确认退出？")
        .then(() => {
          this.$emit("update:drawerVisible", !this.drawerVisible);
          this.checkboxCodeCd = true;
          this.checked = false;
          this.btnCodeCd = true;
          this.timer && clearInterval(this.timer);
          this.long = 60;
          this.count = [];
        })
        .catch(() => {});
    },
    messageLook(id) {
      if (id) {
        if (!this.count.includes(id)) {
          this.count.push(id);
        } else {
          this.detailVisible = false;
          return this.$message.warning("这条数据已经审核，请审核其他数据");
        }
      } else {
        this.detailVisible = false;
        return this.$message.error("数据可能存在问题，请不要操作这条数据");
      }

      this.checkPerson();
      this.selected();
      this.detailVisible = false;
    },
    //表格复选框的选中事件
    handleSelectionChange(val) {
      this.multipleSelection = val;
      //拿到选中数据计算三个金额总计
      this.getAllPrice(this.multipleSelection);
    },
    //点击确认后让该行选中
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    // 开启计时
    startCd(time) {
      this.codeCd = true;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        this.long--;
        if (this.long <= 0) {
          this.long = time;
          this.btnCodeCd = false;
          clearInterval(this.timer);
        }
      }, 1000);
    },
    //显示模态框
    dialogShow() {
      this.dialogVisible = true;
    },
    //关闭模态框
    closeDialog() {
      this.dialogVisible = false;
      this.personNum = 0;
      this.resetForm();
      this.pageTotal = 0;
    },
    //重置表单
    resetForm() {
      this.$refs.epxortForm.resetFields();
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(() => {
          this.resetForm();
          done();
        })
        .catch(() => {});
    },
    //提交导出表
    async submit() {
      try {
        //表单验证
        await this.$refs.epxortForm.validate();
        if (this.PayValue) {
          this.exportExcel();
          this.closeDialog();
        } else {
          this.$message.error("请选择打款方式");
        }
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    openDetail(row) {
      let queryVal = {
        order_sn: row.order_sn || row.id
      };
      this.$get("/admin/finance/withdrawDetail", queryVal, res => {
        if (res.data) {
          this.formData = res.data;
          this.detailVisible = true;
        } else {
          return this.$message.warning(`该提现编号${res.msg}`);
        }
      });
    },
    //导出表格函数
    exportExcel() {
      this.username = this.keyFormData.username;
      //用于导出的表格数据
      let data =
        this.exportModel == "1"
          ? (data = this.dataList)
          : (data = this.multipleSelection);
      if (data.length == 0) {
        return this.$message.warning("查无数据，请重新勾选数据");
      }
      if (data.length > 100000) {
        return this.$message.warning(
          "数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理"
        );
      }
      //如果是筛选导出我们需要哎拿他们的id
      const ids = this.getIds(this.multipleSelection);
      let pay_channel = 0;
      this.options.forEach((item, index) => {
        for (const key in item) {
          if (item[key] == this.PayValue) {
            pay_channel = item.value;
          }
        }
      });
      let params = {
        code_no: this.code_no,
        template: pay_channel,
        ids: this.exportModel == "1" ? undefined : ids,
        admin_id: JSON.parse(localStorage.getItem("userInfo")).id || ""
      };
      this.$post("/admin/excel/withdrawExport", params, res => {
        if (res.error_code == "0") {
          this.$message.success("导出文件成功");
          this.download(res.data.url);
          this.messageForm.file_export_id = res.data.file_id;
          this.messageForm.file = res.data.url;
          this.messageDialogVisible = true;
          this.resetData();
        } else {
          return this.$message.error(`${res.msg}`);
        }
      });
      //每导出完一次后,重置
      this.index = 0;
      // });
    },
    // 获取导出的数据（筛选导出）
    getIds(arr) {
      const ids = [];
      arr.forEach(item => {
        for (const key in item) {
          if (key == "id") {
            ids.push(item[key]);
          }
        }
      });
      //转换为字符串穿给后端
      return ids.join(",");
    },
    //下载文件
    download(url, title = "", artist = "") {
      const eleLink = document.createElement("a"); // 新建A标签
      eleLink.href = url; // 下载的路径
      eleLink.download = `${title} - ${artist}`; // 设置下载的属性，可以为空
      eleLink.style.display = "none";
      document.body.appendChild(eleLink);
      eleLink.click(); // 触发点击事件
      document.body.removeChild(eleLink);
    },
    // 复制
    handleCopy() {
      this.$copyText(this.messageForm.file).then(
        e => {
          this.$message.success("复制成功");
        },
        function(e) {
          this.$message.warning("复制失败, 请手动复制");
          console.log(e);
        }
      );
    }
  }
};
</script>

<style lang="less" scoped>
.red {
  color: red;
}

.priceTotal {
  width: 100%;
  margin-top: 20px;
  color: black;
  display: flex;
  justify-content: space-between;
}

.priceTotal-radio {
  display: flex;
  justify-content: end;
  margin-right: 30px;
}

/deep/ .el-drawer__header {
  margin-bottom: 0px;
}

/deep/ .el-radio__label {
  font-weight: 700;
}

.text {
  font-weight: 700;
  color: black;
  font-size: 20px;
}

/deep/ .el-dialog__close {
  color: red;
  font-size: 30px;
  font-weight: 700;
  transition: 1s all;
}

/deep/ .el-dialog__close:hover {
  transform: rotate(360deg);
}

.exportBtn {
  padding: 15px;
  display: flex;
  justify-content: space-between;

  .el-checkbox {
    display: flex;
    align-items: center;
  }

  .exportBtn-col {
    display: flex;
    justify-content: space-between;

    /deep/ .el-checkbox__label {
      font-weight: 700;
    }
  }
}
</style>
