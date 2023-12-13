<template>
  <div>
    <el-table 
      ref="validTable"
      style="width: 100%; margin-bottom: 20px;" 
      height="500" 
      empty-text="已经没有相关数据了，您可以点击右上角关闭该弹窗"
      :data="dataList" 
      :row-class-name="tableBg"
      @selection-change="updateSelection"
    >
      <el-table-column type="selection" width="60" align="center">
      </el-table-column>
      <el-table-column label="序号" width="60" prop="index">
      </el-table-column>
      <el-table-column label="订单号" width="180" prop="order_sn">
      </el-table-column>
      <el-table-column label="发货信息" prop="shipping_address"></el-table-column>
      <el-table-column label="收货人" width="100" prop="shipping_name"></el-table-column>
      <el-table-column label="联系方式" width="120" prop="shipping_phone"></el-table-column>
      <el-table-column label="用户备注" width="120" prop="order_remark"></el-table-column>
      <el-table-column label="物流公司" width="100" prop="shipping_company"></el-table-column>
      <el-table-column label="物流单号" width="140" prop="shipping_code"></el-table-column>
      <el-table-column label="操作" width="100">
        <template slot-scope="scope">
          <el-button v-if="!errorList.includes(scope.row.order_sn)" class="warning-color" type="text" size="default" @click="deleteItem(scope)">删除</el-button>
          <div v-else>请在excel表里进行操作后重新导入正确数据</div>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="validDatas && validDatas.length > 0" class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[200, 500, 1000]"
        :page-size="pageCount"
        layout="total, sizes, prev, pager, next"
        :total="validDatas.length"
        :pager-count="7"
        :page-count="count"
      ></el-pagination>
    </div>

    <div class="tips-color">
      如出现<span class="error-color">红色行</span>，请注意检查excel数据，因为标红的订单状态异常，被风控系统拦截，不可发货。<br/>
      如您是供应商，请检查订单里商品是否属于您。
    </div>
    <div class="table-bottom-ctrls">
      <el-button type="primary" :disabled="selection.length == 0" @click="quicklyDelivery">批量发货</el-button>
      <span v-if="selection.length > 0" style="margin-left: 10px; font-size: 12px; color: #999;">已选中<span class="success-color"> {{selection.length || 0}} </span>条记录</span>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ValidOrder',
  data() {
    return {
      currentPage: 1,
      count: 1,
      pageCount: 200,

      dataList: [],
      selection: [],
      errorList: []
    }
  },
  props: {
    validDatas: Array
  },
  methods: {
    resetTabel() {
      this.currentPage = 1;
      this.getCurrentPage();
    },
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getCurrentPage();
    },
    handleSizeChange(value) {
      this.pageCount = value;
      this.currentPage = 1;
      this.getCurrentPage();
    },
    getCurrentPage() {
      let validDatas = this.validDatas.slice(0);
      this.selection = [];
      let count = Math.ceil(validDatas.length / this.pageCount);
      if(count < this.currentPage) this.currentPage = count;
      this.dataList = validDatas.splice((this.currentPage - 1) * this.pageCount, this.pageCount);
      for(let i = 0; i < this.dataList.length; i++) {
        this.dataList[i].index = i;
      }
      this.count = count;
      this.errorList = [];
      this.$refs.validTable.toggleAllSelection();
    },
    
    updateSelection(e){
      this.selection = e;
    },
    deleteItem(scope) {
      let row = scope.row;
      this.$confirm(`您将删除订单${row.order_sn}, 删除后该记录将不再在列表出现，是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let realIndex = (this.currentPage - 1) * this.pageCount + scope.$index;
        this.validDatas.splice(realIndex, 1);
        this.getCurrentPage()
      }).catch(() => {});
    },
    quicklyDelivery() {
      // 一键发货
      let params = {
        order_ship: []
      };
      let selectOrders = [];
      for(let i = 0; i < this.selection.length; i++) {
        let item = this.selection[i];
        params.order_ship.push({
          order_sn: item.order_sn,
          company: item.shipping_company,
          company_code: item.shipping_company_code,
          shipping_code: item.shipping_code
        })
        selectOrders.push(item.index);
      }

      for(let i = 0; i < params.order_ship.length; i++) {
        if(params.order_ship[i].shipping_code == undefined ||
          params.order_ship[i].shipping_code == null ||
          params.order_ship[i].shipping_code === "") {
            return this.$message.error(`第${selectOrders[i] + 1}个订单的物流单号还没填写哦，请修改完重试`);
          }
        if(!/^[a-zA-Z0-9]*$/.test(params.order_ship[i].shipping_code)) {
          return this.$message.error(`第${selectOrders[i] + 1}个订单的物流编号格式有误哦，必须是大小写字母或数字，请修改完重试`);
        }
      }
      // 一键对选中项进行发货操作前的询问
      this.$post('/admin/ship/ship', params, res => {
        let data = res.data;
        if(data.error && (data.error.count > 0 || data.error.order.length > 0)) {
          this.$message.error(`批量发货失败，选中项中的订单${data.error.order.join('、')}的状态异常，请检查并校正`);
          return this.errorList = data.error.order.slice(0);
        } else if(data.fail.count > 0) {
          this.$message.warning(`批量发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
        } else {
          this.$message.success('批量发货成功');
        }
        let failList = data.fail.order;
        let waitDeletes = selectOrders.length > 1 ? selectOrders.sort(this.sortNumber) : selectOrders;
        for(let i = waitDeletes.length - 1; i >= 0; i--) {
          if(!failList.includes(this.dataList[waitDeletes[i]].order_sn)) {
            this.validDatas.splice((this.currentPage - 1) * this.pageCount + waitDeletes[i], 1);  //要将页码数加回去给它
          }
        }
        this.getCurrentPage();
      }, err => {
        console.log(err);
      });
    },
    sortNumber(a,b) {
      return a - b
    },
    tableBg({row}) {
      if(this.errorList.includes(row.order_sn)) {
        return 'error-row'
      } else {
        return ''
      }
    }

  }
}
</script>
<style lang="less">
  .table-bottom-ctrls {
    margin-top: 20px;
  }
  .tips-color {
    margin-top: 10px;
    color: #999;
  }
  .el-table .error-row {
    background-color: #ffe7ea;
  }
</style>