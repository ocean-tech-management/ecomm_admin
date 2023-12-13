<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
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
        <div class="table-title">团队股东列表</div>
        <div class="table-ctrl">
          <el-button type="primary" @click="exportExcel">导出数据</el-button>
          <template v-if="$auths.includes('teamShareholder/assign')">
            <el-button type="primary" @click="showVipAssignPopup(1)">指定团队股东</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="80">
        </el-table-column>
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width="100" prop="name">
        </el-table-column>
        <el-table-column label="手机号码" width="120" prop="phone"></el-table-column>
        <el-table-column label="身份" width="140">
          <template slot-scope="scope">
            {{leaderTexts[scope.row.team_shareholder_level] || '——'}}
          </template>
        </el-table-column>

        <el-table-column label="指定时间" prop="team_shareholder_upgrade_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('teamShareholder/assign')">
              <el-button class="error-color" type="text" size="small" @click="cancelLevel(scope.row)">取消身份</el-button>
            </template>
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
    <el-dialog title="指定团队股东" width="800px" :close-on-click-modal="false" :visible.sync="vipAssignVisible">
      <Assign :formData="formData" :leaderData="leaderData"></Assign>
      <div slot="footer" class="dialog-footer">
        <el-button @click="vipAssignVisible = false">取 消</el-button>
        <el-button type="primary" @click="vipAssign">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from "moment";
import Assign from '@/partialviews/user/teamShareholder/Assign';

export default {
  name: 'teamShareholders',
  components: {
    Assign
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
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      dataList: [],

      formData: {},
      leaderData: [],
      leaderTexts: {},

      vipAssignVisible: false
    };
  },
  mounted() {
    this.getVdc();
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
        exportNum: this.queryForm.exportNum,
      };
      this.getList();
    },

    //获取用户
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/teamShareholder/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    getVdc() {
      this.$get('/admin/teamShareholderVdc/list', null, res => {

        let leaderData = [];
        for(let i = res.data.length - 1; i >= 0; i--) {
          leaderData.push(res.data[i]);
        }
        this.leaderData = leaderData;
        
        let leaderTexts = {};
        for(let i = 0; i < leaderData.length; i++) {
          leaderTexts[leaderData[i].level] = leaderData[i].name;
        }
        this.leaderTexts = leaderTexts;
      });
    },

    
    showVipAssignPopup(type, row = {}) {
      this.formData = {
        name: row.user_name || null,
        uid: row.uid || '',
        team_shareholder_level: row.team_shareholder_level || 4,
        is_team_shareholder: 1,
        type: type
      }
      this.vipAssignVisible = true;
    },
    vipAssign() {
      // 指定升级
      let params = {
        uid: this.formData.uid,
        team_shareholder_level: this.formData.team_shareholder_level,
        is_team_shareholder: this.formData.is_team_shareholder
      }
      this.$confirm(`是否确定${params.is_team_shareholder == 1 ? '指定用户团队股东身份' : '取消用户团队股东身份'}操作`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
        this.$post('/admin/teamShareholder/assign', params, res => {
          this.$message.success(`${params.is_team_shareholder == 1 ? '指定' : '取消'}团队股东成功`);
          this.vipAssignVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
    cancelLevel(row) {
      // 指定升级
      let params = {
        uid: row.uid,
        is_team_shareholder: 2
      }
      this.$confirm('是否取消该用户的团队股东身份', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        
        this.$post('/admin/teamShareholder/assign', params, res => {
          this.$message.success('取消团队股东身份成功');
          this.cancelVipVisible = false;
          this.reloadPage();
        });
      }).catch(() => {});
    },

    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }
      
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }
      
      this.$get('/admin/teamShareholder/list', params, res => {
        let data = res.data.list || [];
        
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }


        let excelData = [];
        excelData.push([
          '姓名', 
          '手机号码', 
          '身份', 
          '指定时间', 
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.name, 
            item.phone, 
            this.leaderTexts[item.team_shareholder_level] || '——', 
            item.team_shareholder_upgrade_time
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 120},
          {wpx: 120},
          {wpx: 140}
        ]
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "团队股东列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `团队股东列表${time}.xlsx`);
      });
    },



  }
};
</script>
