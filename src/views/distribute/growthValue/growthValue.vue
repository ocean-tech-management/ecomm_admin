<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="创建时间" prop="createDate">
            <el-date-picker
              name="createDate"
              v-model="createDate"
              type="datetimerange"
              :picker-options="pickerOptions"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-dd HH:mm:ss"
              :clearable="false" 
              :editable="false"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
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
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="table-ctrls">
        <div class="table-title">成长值记录列表</div>
        <div class="table-ctrl">
          <el-button type="primary" @click="tryExportData">导出</el-button>
          <template v-if="$auths.includes('growthValue/reduce')">
            <el-button type="warning" @click="showReduceGrowthValue">减扣成长值</el-button>
          </template>
          <template v-if="$auths.includes('growthValue/grant')">
            <el-button type="primary" @click="showRewardGrowthValue">奖励成长值</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="100" prop="user_name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="user_phone"></el-table-column>
        <el-table-column label="成长值" width="120" prop="growth_value" align="center">
          <template slot-scope="scope">
            <div>
              <div v-if="scope.row.surplus_growth_value == scope.row.growth_value">
                {{scope.row.growth_value}}
              </div>
              <div v-if="scope.row.surplus_growth_value && scope.row.surplus_growth_value != scope.row.growth_value">
                <span class="error-color">{{scope.row.surplus_growth_value}}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="100" align="center">
          <template slot-scope="scope">
            {{typeTexts[scope.row.type]}}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            {{statusTexts[scope.row.arrival_status]}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button v-if="scope.row.order_sn" type="text" size="small" @click="showDetail(scope.row)">详情</el-button>
            
            <el-tooltip v-if="(scope.row.type == 3 || scope.row.type == 4) && scope.row.remark && scope.row.remark !== ''" :content="scope.row.remark" placement="top">
              <el-button type="text" size="small">查看备注</el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :pager-count="7"
          layout="total, prev, pager, next"
          :page-count="count"
        ></el-pagination>
      </div>
    </div>
    <el-dialog title="奖励成长值" width="900px" :close-on-click-modal="false" :visible.sync="rewardGrowthValueVisible">
      <Reward :formData="formData"></Reward>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rewardGrowthValueVisible = false">取 消</el-button>
        <el-button type="primary" @click="confrimReward">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="减扣成长值" width="900px" :close-on-click-modal="false" :visible.sync="reduceGrowthValueVisible">
      <Reduce :formData="formData"></Reduce>
      <div slot="footer" class="dialog-footer">
        <el-button @click="reduceGrowthValueVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmReduce">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="成长值记录详情" width="500px" :visible.sync="detailVisible">
      <Detail :formData="formData"></Detail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from 'moment';

import Reduce from '@/partialviews/distribute/growthValue/Reduce';
import Reward from '@/partialviews/distribute/growthValue/Reward';
import Detail from '@/partialviews/distribute/growthValue/Detail';

import {nTimePickerConfig} from '@/config';

export default {
  name: 'growthValue',
  components: {
    Reduce,
    Reward,
    Detail
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        
        start_time: '',
        end_time: '',

        exportPageNum: 1,
        exportNum: 1000,
      },
      dataList: [],
      leaderData: [],

      typeTexts: {
        [1]: '购物',
        [2]: '分享下单',
        [3]: '系统修改',
        [4]: '系统赠送'
      },

      statusTexts: {
        [1]: '到账',
        [2]: '冻结中',
        [3]: '退款取消奖励',
        [-1]: '整单被删除'
      },

      formData: {},
      detailVisible: false,
      rewardGrowthValueVisible: false,
      reduceGrowthValueVisible: false,

      createDate: [],
      ...nTimePickerConfig,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: '',
        exportPageNum: 1,
        exportNum: 1000,
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      };
      if(this.createDate && this.createDate.length == 2) {
        this.filter.start_time = this.createDate[0];
        this.filter.end_time = this.createDate[1];
      }
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        start_time: this.filter.start_time,
        end_time: this.filter.end_time
      };
      console.log(this.filter)

      this.$get('/admin/growthValue/list', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          if(parseFloat(dataList[i].growth_value) < 0) {
            dataList[i].surplus_growth_value = dataList[i].growth_value;
          }
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showDetail(row) {
      this.formData = row;
      this.detailVisible = true;
    },
    showRewardGrowthValue() {
      
      if(!this.$auths.includes('growthValue/user')) {
        this.$message.warning('您缺少查看营销模板中的查看用户权限，无法执行发放成长值功能，请联系管理员为您添加');
        return;
      }
      this.formData = {
        name: '',
        uid: '',
        phone: '',
        growth_value: 0,
        remark: ''
      }
      this.rewardGrowthValueVisible = true;
      
    },
    confrimReward() {
      // 指定发放成长值
      let params = {
        uid: this.formData.uid,
        phone: this.formData.phone,
        growth_value: this.formData.growth_value,
        remark: this.formData.remark,
      }
      if(!params.uid || params.uid === '') {
        return this.$message.error(`请选择要发放成长值的用户哦`)
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.growth_value)) ||
        parseFloat(params.growth_value) <= 0
      ) {
        return this.$message.error(`成长值要为大于零的数哦，请检查下哈`)
      }
      this.$post('/admin/growthValue/grant', params, res => {
        this.$message.success('发放成长值成功');
        this.rewardGrowthValueVisible = false;
        this.reloadPage();
      });
    },

    showReduceGrowthValue() {
      
      if(!this.$auths.includes('growthValue/user')) {
        this.$message.warning('您缺少查看营销模板中的查看用户权限，无法执行发放成长值功能，请联系管理员为您添加');
        return;
      }
      this.formData = {
        name: '',
        uid: '',
        phone: '',
        growth_value: 0,
        remark: ''
      }
      this.reduceGrowthValueVisible = true;
      
    },
    confirmReduce() {
      // 指定升级
      let params = {
        uid: this.formData.uid,
        phone: this.formData.phone,
        growth_value: this.formData.growth_value,
        remark: this.formData.remark.trim()
      }
      if(!params.uid || params.uid === '') {
        return this.$message.error(`请选择要扣减成长值的用户哦`)
      }
      if(!params.remark || params.remark === '') {
        return this.$message.error(`减扣用户成长值需要填写备注哦`)
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.growth_value)) ||
        parseFloat(params.growth_value) <= 0
      ) {
        return this.$message.error(`成长值要为大于零的数哦，请检查下哈`)
      }
      this.$post('/admin/growthValue/reduce', params, res => {
        this.$message.success('扣减成长值成功');
        this.reduceGrowthValueVisible = false;
        this.reloadPage();
      });
    },
    tryExportData() {
      let params = {
        keyword: this.filter.keyword,

        start_time: this.filter.start_time,
        end_time: this.filter.end_time,

        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈

      }

      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }

      this.$get('/admin/growthValue/list', params, res => {
        let data = res.data.list || [];
        
        if (data.length == 0) {
          return this.$message.warning("查无数据，请检查");
        }
        if (data.length > 100000) {
          return this.$message.warning(
            "数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理"
          );
        }

        for(let i = 0; i < data.length; i++) {
          if(parseFloat(data[i].growth_value) < 0) {
            data[i].surplus_growth_value = data[i].growth_value;
          }
        };
        this.exportData(data);
      });
    },

    exportData(data) {
      let excelData = [];
      excelData.push([
        "订单号",
        "订单金额",
        "类型",
        "用户手机号码",
        "用户昵称",
        "原始成长值",
        "剩余可用成长值",
        "备注",
        "到账状态",
        "创建时间"
      ]);

      
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let row = [
          item.order_sn || '',
          item.order_real_pay_price || '0.00',
          this.typeTexts[item.type],
          item.user_name || '',
          item.user_phone || '',
          item.growth_value || '0.00',
          item.surplus_growth_value || '0.00',
          item.remark || '',
          this.statusTexts[item.status],
          item.create_time || '',
        ]
        
        excelData.push(row);
      }


      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws["!cols"] = [
        { wpx: 140 },
        { wpx: 80 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 120 },
        { wpx: 240 },
        { wpx: 120 },
        { wpx: 180 }
      ];

      const wb = XLSX.utils.book_new();
      let range = XLSX.utils.decode_range(ws["!ref"]);
      for (let i = range.s.r + 1; i <= range.e.r; i++) {
        let c1 = XLSX.utils.encode_cell({ r: i, c: 1 });
        ws[c1].t = "n";
      }
      ws["!ref"] = XLSX.utils.encode_range(range);

      
      XLSX.utils.book_append_sheet(wb, ws, "用户成长值列表");

      let time = moment().format("YYYYMMDDHHmm");
      /* generate file and send to client */
      XLSX.writeFile(wb, `用户成长值列表${time}.xlsx`);
    }


  }
};
</script>
