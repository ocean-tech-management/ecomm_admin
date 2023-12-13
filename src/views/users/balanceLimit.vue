<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="限制类型" prop="type">
            <el-select v-model="queryForm.type" placeholder="全额禁止操作" name="type">
              <el-option label="全部" :value="''"></el-option>
              <el-option label="全额禁止操作" :value="1"></el-option>
              <el-option label="超出额度部分可操作" :value="2"></el-option>
              <el-option label="累计额度内可操作" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限制操作类型" prop="limit_type">
            <el-select v-model="queryForm.limit_type" placeholder="不限" name="limit_type">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="(item, key) in limitTypeTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker v-model="queryForm.createDate" type="datetimerange" :picker-options="pickerOptions"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss" :clearable="false" align="right"></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number"
              @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
            <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
              <el-option label="500" :value="500"></el-option>
              <el-option label="1000" :value="1000"></el-option>
              <el-option label="2000" :value="2000"></el-option>
              <el-option label="3000" :value="3000"></el-option>
              <el-option label="5000" :value="5000"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">
          用户余额限制列表
          <SloganTip type="danger"></SloganTip>
        </div>
        <div class="table-ctrl">
          <template></template>
          <el-button type="primary" @click="exportExcel">导出数据</el-button>
          <template v-if="$auths.includes('userBalanceLimit/create')">
            <el-button class="excel-uploader" type="primary" @click="onClickImport">导入用户余额限制</el-button>
            <a href="/static/docs/余额限制管理模板.xlsx" target="blank">
              <el-button type="primary" plain>下载余额限制管理模板</el-button>
            </a>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="编号" width="160" prop="limit_sn"></el-table-column>
        <el-table-column label="用户名" width="120" prop="user_name"></el-table-column>
        <el-table-column label="头像" width="80">
          <template slot-scope="{row}">
            <img class="thumb-img" :src="row.user_avatarUrl" />
          </template>
        </el-table-column>
        <el-table-column label="手机号码" width="140" prop="user_phone"></el-table-column>
        <el-table-column label="限制额度" width="120" prop="limit_price"></el-table-column>
        <el-table-column label="限制类型" width="150">
          <template slot-scope="{row}">
            {{ typeTexts[row.type] }}
          </template>
        </el-table-column>
        <el-table-column label="限制钱包类型" width="150">
          <template slot-scope="{row}">
            {{ balanceTypeTexts[row.balance_type] }}
          </template>
        </el-table-column>
        <el-table-column label="判断账户类型" width="150">
          <template slot-scope="{row}">
            {{ balanceTypeTexts[row.judge_balance_type] }}
          </template>
        </el-table-column>
        <el-table-column label="限制操作类型" width="120">
          <template slot-scope="{row}">
            {{ limitTypeTexts[row.limit_type] }}
          </template>
        </el-table-column>
        <el-table-column label="判断方式" width="120">
          <template slot-scope="{row}">
            {{ judgeMethodTexts[row.judge_method] }}
          </template>
        </el-table-column>
        <el-table-column label="备注" width="180" prop="remark"></el-table-column>
        <el-table-column label="创建时间" width="160" prop="create_time"></el-table-column>

        <el-table-column label="操作" min-width="120px" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" @click="editRow(row)">编辑</el-button>
            <el-button class="error-color" type="text" @click="deleteRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>
    <!-- <el-dialog title="导入用户余额限制" width="400px" :close-on-click-modal="false" :visible.sync="importVisible">
      <ImportUsers ref="import" @success="confirmImportSuccess"></ImportUsers>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmImport">确 定</el-button>
      </div>
    </el-dialog> -->
    <el-dialog title="编辑用户余额限制" width="450px" :close-on-click-modal="false" :visible.sync="editVisible">
      <div slot="title" class="el-dialog__title">
        编辑用户余额限制
        <SloganTip type="danger"></SloganTip>
      </div>
      <Edit ref="editRef" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </div>
    </el-dialog>
    <ImportUpload :visible.sync="importVisible" :validUser="validUser" :validImport="validImport"
      @success="onImportSeccess">
      <div slot="title">
        用户余额限制导入
        <SloganTip type="danger"></SloganTip>
      </div>
      <div slot="user">
        <el-form label-width="100px">
          <el-form-item label="限制额度">
            <el-input style="width: 218px;" auto-complete="off" placeholder="请输入限制额度" type="number"
              v-model="formData.limit_price"></el-input>
          </el-form-item>
          <el-form-item label="限制类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择限制类型" name="type" style="width: 218px;">
              <el-option v-for="(item, key) in importTexts.typeTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限制操作类型" prop="limit_type" label-width="100px">
            <el-select v-model="formData.limit_type" placeholder="请选择限制操作类型" name="limit_type" style="width: 218px;">
              <el-option v-for="(item, key) in importTexts.limitTypeTexts" :key="key" :label="item"
                :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限制钱包类型" prop="balance_type" label-width="100px">
            <el-select @change="judgeBalancetType" v-model="formData.balance_type" placeholder="请选择限制钱包类型"
              name="balance_type" style="width: 218px;">
              <el-option v-for="(item, key) in importTexts.balanceTypeTexts" :key="key" :label="item"
                :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="判断账户类型" prop="judge_balance_type" label-width="100px">
            <el-select @change="judgeBalancetType" v-model="formData.judge_balance_type" placeholder="请选择判断账户类型"
              name="judge_balance_type" style="width: 250px;">
              <el-option v-for="(item, key) in judgeBalanceTypeTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="判断方式" prop="judge_method" label-width="100px">
            <el-select v-model="formData.judge_method" placeholder="请选择判断账户类型" name="judge_method" style="width: 250px;">
              <el-option v-for="(item, key) in judgeMethodTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input style="width: 218px" auto-complete="off" placeholder="请填写备注" v-model="formData.remark"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="upload">
        <el-form style="margin-top: 15px;" label-width="100px">
          <el-form-item label="限制类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择限制类型" name="type" style="width: 288px;">
              <el-option v-for="(item, key) in importTexts.typeTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限制操作类型" prop="limit_type">
            <el-select v-model="formData.limit_type" placeholder="请选择限制操作类型" name="limit_type" style="width: 260px;">
              <el-option v-for="(item, key) in importTexts.limitTypeTexts" :key="key" :label="item"
                :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="限制钱包类型" prop="balance_type">
            <el-select @change="judgeBalancetType" v-model="formData.balance_type" placeholder="请选择限制钱包类型"
              name="balance_type" style="width: 260px;">
              <el-option v-for="(item, key) in importTexts.balanceTypeTexts" :key="key" :label="item"
                :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="判断账户类型" prop="judge_balance_type">
            <el-select @change="judgeBalancetType" v-model="formData.judge_balance_type" placeholder="请选择判断账户类型"
              name="judge_balance_type" style="width: 250px;">
              <el-option v-for="(item, key) in judgeBalanceTypeTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="判断方式" prop="judge_method">
            <el-select v-model="formData.judge_method" placeholder="请选择判断账户类型" name="judge_method" style="width: 250px;">
              <el-option v-for="(item, key) in judgeMethodTexts" :key="key" :label="item" :value="key"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </ImportUpload>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from "moment";
import {nTimePickerConfig} from '@/config';
import ImportUsers from "@/partialviews/user/balanceLimit/ImportUsers";
import Edit from "@/partialviews/user/balanceLimit/Edit";
import SloganTip from '@/components/SloganTip';
import { REG_POSITIVE } from '@/util/regExp';
import ImportUpload from '@/components/ImportUpload/index';
export default {
  name: 'balanceLimit',
  components: { ImportUsers, Edit, ImportUpload, SloganTip },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        type: '',
        limit_type: '',
        createDate: ['',''],

        exportPageNum: 1,
        exportNum: 1000,
      },
      dataList: [],
      typeTexts: {
        [""]:"全部",
        [1]: '全额禁止操作',
        [2]: '超出额度部分可操作',
        [3]: '累计额度内可操作'
      },
      limitTypeTexts: {
        [1]: '提现',
        [2]: '转赠',
        [3]: '转换',
        [4]: '提现+转赠'
      },
      balanceTypeTexts: {
        [1]: '商城钱包',
        [2]: '广宣奖钱包',
        [3]: '团队钱包',
        [4]: '区代钱包',
        [5]: '股东奖钱包',
        [6]: '集品券钱包',
        [7]: '集品豆钱包',
        [8]: '健康豆钱包',
        [9]: '礼品券钱包',
        [10]: '团长端总余额钱包',
        [11]:'参与福利冻结额度',
        [12]:'集品券可用余额 + 参与福利冻结额度',
        [88]: '全部余额',
      },
      judgeBalanceTypeTexts:{
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
          [11]:'参与福利冻结额度',
          [12]:'集品券可用余额 + 参与福利冻结额度'
          // [88]: '全部余额',
      },
      ...nTimePickerConfig,

      importVisible: false,
      importTexts: {
        typeTexts: {
          [1]: '全额禁止操作',
          [2]: '超出额度部分可操作',
          [3]: '累计额度内可操作'
        },
        limitTypeTexts: {
          [1]: '提现',
          [2]: '转赠',
          [3]: '转换',
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
      },
      editVisible: false,
      formData: {},
      judge_balance_typeTexts:{
        // [1]:'',
        // [1]:'',
        // [1]:'',
        // [1]:'',
      },
      judgeMethodTexts:{
        [1]:'同时成立',
        [2]:'部分成立'
      }
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    judgeBalancetType(val){
      this.formData.judge_balance_type=val;
      this.$forceUpdate()
    },
    //重置查询条件
    resetQuery() {
      this.queryForm = {
        keyword: '',
        type: '1',
        limit_type: '',
        createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00'), moment().format('YYYY-MM-DD 23:59:59')],

        exportPageNum: 1,
        exportNum: 1000,
      };

      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      if(!this.queryForm.createDate || this.queryForm.createDate.length != 2) {
        return this.$message.error('请选择有效创建时间');
      }
      this.getList();
    },
    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.queryForm.keyword,
        type: this.queryForm.type,
        limit_type: this.queryForm.limit_type,
        start_time: this.queryForm.createDate[0],
        end_time: this.queryForm.createDate[1]
      };


      this.$get('/admin/userBalanceLimit/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    /**
     * 编辑用户限制
     * @param {*} row
     */
    editRow(row = {}) {
      this.formData = {
        user_name: row.user_name,
        user_phone: row.user_phone,
        limit_sn: row.limit_sn,
        type: row.type + '',
        balance_type: row.balance_type + '',
        judge_balance_type:row.judge_balance_type+"",
        judge_method:row.judge_method+"",
        limit_price: row.limit_price,
        limit_type: row.limit_type + '',
        remark: row.remark,
        uid:row.uid
      }
      this.editVisible = true
    },
    /**
     * 保存用户限制编辑
     */
    confirmEdit() {
      for(const i in this.formData) {
        if (!this.formData[i] || this.formData[i] === null || this.formData[i] === undefined) {
          return this.$message.warning('请填写完所有内容哦')
        }
      }
      if (!REG_POSITIVE.test(this.formData.limit_price)) return this.$message.warning('限制额度应为非负数字，请重新输入')
      const params = {
        limit_sn: this.formData.limit_sn,
        type: this.formData.type,
        balance_type: this.formData.balance_type,
        limit_type: this.formData.limit_type,
        limit_price: this.formData.limit_price,
        remark: this.formData.remark,
        judge_balance_type:this.formData.judge_balance_type,
        judge_method:this.formData.judge_method,
        uid:this.formData.uid
      }
      this.$post('/admin/userBalanceLimit/update', params, res => {
          this.$message.success('编辑成功')
          this.editVisible = false
          this.getList()
        });
    },
    /**
     * 删除用户限制
     * @param {*} row
     */
    deleteRow(row = {}) {
      this.$confirm('是否删除该用户的限制，请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          limit_sn: row.limit_sn,
        }
        this.$post('/admin/userBalanceLimit/delete', params, res => {
          this.$message.success('删除成功')
          this.getList()
        });
      }).catch(() => {});
    },
    // 打开导入弹窗
    onClickImport() {

      // this.$refs.import && this.$refs.import.clearFiles();
      this.importVisible = true;
      this.formData = {
        limit_price: '',
        type: '',
        limit_type: '',
        balance_type: '',

      }
    },
    /**
     * 验证用户
     */
    validUser() {
      return new Promise((resolve) => {
        if (!this.formData.limit_price) return this.$message.warning('请输入限制额度')
        if (!REG_POSITIVE.test(this.formData.limit_price)) return this.$message.warning('限制额度应为非负数字，请重新输入')
        if (!this.formData.type) return this.$message.warning('请选择限制类型')
        if (!this.formData.limit_type) return this.$message.warning('请选择限制操作类型')
        if (!this.formData.balance_type) return this.$message.warning('请选择限制钱包类型')
        if (!this.formData.remark) return this.$message.warning('请输入备注')
        resolve()
      })
    },
    /**
     * 验证导入
     */
    validImport() {
      return new Promise((resolve) => {
        if (!this.formData.type) return this.$message.warning('请选择限制类型')
        if (!this.formData.limit_type) return this.$message.warning('请选择限制操作类型')
        if (!this.formData.balance_type) return this.$message.warning('请选择限制钱包类型')
        resolve()
      })
    },
    /**
     * 导入
     */

    onImportSeccess({ type, query }) {
      const params = {}
      // 单用户
      if (type === '1') {
        params.type = this.formData.type
        params.limit_type = this.formData.limit_type
        params.balance_type = this.formData.balance_type
        params.all_user = [{ user_phone: query.user_phone, price: this.formData.limit_price, remark: this.formData.remark }]
      } else {
        params.type = this.formData.type
        params.limit_type = this.formData.limit_type
        params.balance_type = this.formData.balance_type
        params.all_user = query.map(v => {
          return {
            price: v.price,
            remark: v.remark,
            user_phone: v.userPhone || v.user_phone
          }
        })
      }
      params.judge_balance_type=this.formData.judge_balance_type,
      params.judge_method=this.formData.judge_method,
      params.uid=this.formData.uid
      this.$post('/admin/userBalanceLimit/create', params, res => {
        this.$message.success('导入成功');
        this.importVisible = false
        this.getList();
      });
    },
    // 确认导入
    async confirmImport() {
      if (this.$refs.import) {
        try {
          await this.$refs.import.confirmSelectCorrect();
          this.importVisible = false;
          this.currentPage = 1;
          this.getList();
        } catch (err) {
          this.$message.error(err.message);
        }
      } else {
        this.$message.error("导入错误，请稍后重试");
      }
    },
    // 导入成功
    confirmImportSuccess() {
      this.createDate = [
        moment()
          .subtract(30, "days")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment().format("YYYY-MM-DD 23:59:59")
      ];
      this.filter = {
        start_time: this.createDate[0],
        end_time: this.createDate[1]
      };
      this.importVisible = false;
      this.getList();
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.queryForm.keyword,
        type: this.queryForm.type,
        limit_type: this.queryForm.limit_type,

        page: this.queryForm.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.queryForm.exportNum,   //实际用参数名和变量名是不一致的哈
      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }


      if(!this.queryForm.createDate || this.queryForm.createDate.length === 0) {
        return this.$message.error('请选择开始时间和结束时间，并按查询后再重新点击导出按钮。建议时间跨度不要过大');
      }
      params.start_time = this.queryForm.createDate[0]
      params.end_time = this.queryForm.createDate[1]
      this.$get('/admin/userBalanceLimit/list', params, res => {
        let data = res.data.list || [];

        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }


        let excelData = [];
        excelData.push([
          '编号',
          '用户名',
          '手机号码',
          '限制额度',
          '限制类型',
          '限制操作类型',
          '限制钱包类型',
          '创建时间',
          '备注'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.limit_sn,
            item.user_name,
            item.user_phone,
            item.limit_price || 0,
            this.typeTexts[item.type],
            this.limitTypeTexts[item.limit_type],
            this.balanceTypeTexts[item.balance_type],
            item.create_time,
            item.remark
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
          {wpx: 80},
          {wpx: 100},
          {wpx: 100},
          {wpx: 100},
          {wpx: 140},
          {wpx: 200}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for(let i = range.s.r + 1; i <= range.e.r; i++) {
          let col2 = XLSX.utils.encode_cell({r: i , c: 2});
          ws[col2].t = 'n';
        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "余额限制管理列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `余额限制管理列表${time}.xlsx`);
      });
    },

  }
};
</script>
<style lang="less" scoped>
.excel-uploader {
  display: inline-block;
  margin: 0 15px;
}
</style>

