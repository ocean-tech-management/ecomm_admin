<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入关键词" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">异常发放失败的套餐记录</div>
        <div class="table-ctrl">
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" type="index" width="70">
        </el-table-column>
        <el-table-column label="异常编号" prop="abnormal_sn" width="120"></el-table-column>
        <el-table-column label="关联订单编号" prop="order_sn" width="180">
        </el-table-column>
        <el-table-column label="商品总数" prop="order_goods_number" width="80" align="center">
        </el-table-column>
        <el-table-column label="有效数量" prop="record_number" width="80" align="center">
        </el-table-column>
        <el-table-column label="备注" prop="remark" width="200">
        </el-table-column>
        <el-table-column label="状态" width="80" prop="show_status">
          <template slot-scope="scope">
            <span :class="{'warning-color': scope.row.operate_status == 2}">
              {{operateStatusTexts[scope.row.operate_status]}}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作人" prop="admin_name" width="150"></el-table-column>
        <el-table-column label="操作时间" prop="operate_time" width="150"></el-table-column>
        <el-table-column label="创建时间" prop="create_time" width="150"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('handselStand/abnormalOperate')">
              <el-button v-if="scope.row.operate_status == 2" type="text" size="default" @click="tryOperate(scope.row)">操作</el-button>
            </template>
            <template v-if="$auths.includes('order/info')">
              <el-button type="text" size="default" @click="openOrderDetail(scope.row)">订单详情</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination @current-change="handleCurrentChange" :current-page="currentPage" :pager-count="7"
          layout="total, prev, pager, next" :page-count="count"></el-pagination>
      </div>
    </div>

    
    <el-dialog title="异常套餐记录操作" width="800px" :close-on-click-modal="false" :visible.sync="operateVisible">
      <Operate :formData="formData"></Operate>
      <div slot="footer" class="dialog-footer">
        <el-button @click="operateVisible = false">取 消</el-button>
        <el-button type="primary" @click="operateHandsel">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="关联订单详情" width="900px" :close-on-click-modal="false" :visible.sync="orderVisible">
      <OrderDetail :formData="formData"></OrderDetail>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="orderVisible = false">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>

  import Operate from '@/partialviews/order/abnormalHandsel/Operate';
  import OrderDetail from '@/partialviews/order/abnormalHandsel/OrderDetail';
  export default {
    name: 'abnormalHandsels',
    components: {
      Operate,
      OrderDetail
    },
    data() {
      return {
        currentPage: 1,
        count: 1,
        queryForm: {
          keyword: ''
        },
        filter: {
          keyword: ''
        },
        operateStatusTexts: {
          [1]: '已操作',
          [2]: '待操作'
        },
        dataList: [],
        formData: {},

        operateVisible: false,
        orderVisible: false

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
          keyword: ''
        };
        this.currentPage = 1;
        this.getList();
      },
      //查询
      queryInfo() {
        this.currentPage = 1;
        this.filter = {
          keyword: this.queryForm.keyword
        }
        this.getList();
      },

      //获取列表
      getList() {
        let queryVal = {
          page: this.currentPage,
          keyword: this.filter.keyword
        };

        this.$get('/admin/handselStand/abnormalList', queryVal, res => {
          let dataList = res.data.list || [];

          this.dataList = dataList;
          this.count = res.data.pageTotal;
        });
      },


      // 分页
      handleCurrentChange(value) {
        this.currentPage = value;
        this.getList();
      },

      tryOperate(row) {
        this.formData = {
          order_sn: row.order_sn,
          abnormal_sn: row.abnormal_sn,
          order_goods_number: row.order_goods_number,
          operate_number: '',
          remark: ''
        }
        this.operateVisible = true;
      },
      operateHandsel() {
        let params = JSON.parse(JSON.stringify(this.formData));
        let paramValues = Object.values(params);
        for(let i = 0; i < paramValues.length; i++) {
          if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] == '') {
            return this.$message.error('请填写完所有信息');
          }
        }
        if(!(/^(0|[1-9][0-9]*)$/.test(params.operate_number))) {
          return this.$message.error(`有效商品数要为0，1，2，3，4这种正整数，请检查`);
        }
        if(parseInt(params.operate_number) > parseInt(params.order_goods_number)) {
          return this.$message.error(`有效商品数要超过了订单商品数，请检查`);
        }
        if(params.remark.trim() === '') {
          return this.$message.error(`请填写有效备注`);
        }
        this.$post('/admin/handselStand/abnormalOperate', params, res => {
          this.$message.success('操作异常套餐记录成功');
          this.operateVisible = false;
          this.reloadPage();
        });

      },
      
      openOrderDetail(row) {
        let params = {
          order_sn: row.order_sn
        };

        this.$get('/admin/order/info', params, res => {
          this.formData = res.data;
          for(let i = 0; i < this.formData.goods.length; i++) {
            let attrs = JSON.parse(this.formData.goods[i].specs);
            this.formData.goods[i].attrs = Object.values(attrs).join(',');
          }
          this.orderVisible = true;
        });
      },
    }
  };

</script>
