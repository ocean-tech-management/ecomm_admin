<template>
  <div class="subpage-content">
    <div class="default-container">
      
      <div class="table-ctrls">
        <div class="table-title">
          <span>福利期次开放时间段列表 </span>
          <span class="success-color">{{itemData.activity_title || ''}}(第{{itemData.round_number}}轮 第{{itemData.period_number}}期)</span>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('crowdFunding/durationUpdate')">
            <el-button type="primary" @click="showAdd">新增开放时间段</el-button>
          </template>
          
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
        <el-table-column label="开放时间段" width="170">
          <template slot-scope="scope">
            {{scope.row.start_time}} ~ {{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="销售百分比" width="90" prop="targetScaleVal" align="center"></el-table-column> 
        <el-table-column label="总销售百分比" width="110" prop="targetSumScaleVal" align="center"></el-table-column>     
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>        
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="itemData.result_status == 4">
              <template v-if="$auths.includes('crowdFunding/durationUpdate')">
                  <el-button type="text" size="small" @click="showEdit(scope.row)">编辑</el-button>
              </template>
              <template v-if="$auths.includes('crowdFunding/durationDelete')">
                <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
              </template>
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

    <el-dialog title="新增福利期次开放时间段" width="750px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItems">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="编辑福利期次开放时间段" width="750px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Add from '@/partialviews/crowdFunding/crowdFunding/AddDurations';
import Edit from '@/partialviews/crowdFunding/crowdFunding/EditDuration';
import moment from 'moment';

export default {
  name: 'crowdFundingCommedities',
  components: {
    Add,
    Edit
  },
  data() {
    return {
      code: null,
      rNum: null,
      pNum: null,

      currentPage: 1,
      count: 1,

      categories: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      positionText: {
        [1]: '首页',
        [2]: '全部品牌列表中'
      },


      dataList: [],
      itemData: {},

      formData: {},
      addVisible: false,
      editVisible: false,

      sortVisible: false,   //排序

      coverData: {},
      coverVisible: false
    };
  },
  mounted() {
    this.code = this.$route.query.code;
    this.rNum = this.$route.query.rNum;
    this.pNum = this.$route.query.pNum;
    if(!this.code || !this.rNum || !this.pNum) {
      this.$message.error('福利期次不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/crowdFundings');
      }, 2000)
    }
    this.getList();
    this.getData();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();

      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;

      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum,
        page: this.currentPage
      };

      this.$get('/admin/crowdFunding/durationList', queryVal, res => {
        let dataList = res.data.list || []
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].targetScaleVal = parseInt(parseFloat(dataList[i].target_scale || 0) * 100);
          dataList[i].targetSumScaleVal = parseInt(parseFloat(dataList[i].target_sum_scale || 0) * 100);
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    getData() {
      if(!this.$auths.includes('crowdFunding/periodInfo')) {
        return; 
      }
      let params = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum
      };

      this.$get('/admin/crowdFunding/periodInfo', params, res => {
        let data = res.data;
        this.itemData = data;
      });
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {

      let formData = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number: this.pNum,
        times: [
          []
        ],
        targetScales: [
          0
        ]
      }
      this.formData = formData;
      this.addVisible = true;
    },
    addItems() {
      let params = {
        time_duration: []
      };

      if(this.formData.times.length == 0) {
        return this.$message.error('请选择、添加开放时间段');
      }
      
      for(let i = 0; i < this.formData.times.length; i++) {
        if(this.formData.times[i].length != 2) {
          return this.$message.error(`请选择、添加第${i + 1}项开放时间段`);
        }
        
        if(
          !/^(0|[1-9][0-9]*)$/.test(this.formData.targetScales[i]) || 
          parseFloat(this.formData.targetScales[i]) > 100
        ) {
          return this.$message.error(`第${i + 1}项开放时间段销售百分比要为小于等于100的正整数哦，请检查下哈`);
        }

        params.time_duration.push({
          activity_code: this.formData.activity_code,
          round_number: this.formData.round_number,
          period_number: this.formData.period_number,
          start_time: this.formData.times[i][0],
          end_time: this.formData.times[i][1],
          target_scale: (this.formData.targetScales[i] / 100).toFixed(2)
        })
      }
      
      this.$post('/admin/crowdFunding/durationUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      let formData = {
        duration_code: row.duration_code,
        activity_code: row.activity_code,
        round_number: row.round_number,
        period_number: row.period_number,
        times: [
          [row.start_time, row.end_time]
        ],
        targetScales: [
          row.targetScaleVal
        ]
      }
      
      this.formData = formData;
      this.editVisible = true;
      
    },
    editItem() {
      let params = {
        time_duration: []
      };

      if(this.formData.times.length == 0) {
        return this.$message.error('请选择、添加开放时间段');
      }
      
      for(let i = 0; i < this.formData.times.length; i++) {
        if(this.formData.times[i].length != 2) {
          return this.$message.error(`请选择、添加第${i + 1}项开放时间段`);
        }
        if(
          !/^(0|[1-9][0-9]*)$/.test(this.formData.targetScales[i]) || 
          parseFloat(this.formData.targetScales[i]) > 100
        ) {
          return this.$message.error(`第${i + 1}项开放时间段销售百分比要为小于等于100的正整数哦，请检查下哈`);
        }
        params.time_duration.push({
          duration_code: this.formData.duration_code,
          activity_code: this.formData.activity_code,
          round_number: this.formData.round_number,
          period_number: this.formData.period_number,
          start_time: this.formData.times[i][0],
          end_time: this.formData.times[i][1],
          target_scale: (this.formData.targetScales[i] / 100).toFixed(2)
        })
      }
      
      this.$post('/admin/crowdFunding/durationUpdate', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });
    },

    toRelations(row) {
      this.$router.push(row.id);
    },
    deleteItem(row) {
      this.$confirm(`您将删除该时间段, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/crowdFunding/durationDelete', {
          duration_code: row.duration_code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    

  }
};
</script>
