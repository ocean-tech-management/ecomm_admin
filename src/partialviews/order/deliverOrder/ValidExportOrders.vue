<template>
  <div>
    <div class="data-total-info">
      <span>导出总商品数：<span class="warning-color">{{exportSummary.goodsTotal || 0}}</span></span>
      <span style="margin-left: 50px;">导出总订单数：<span class="warning-color">{{exportSummary.orderTotal || 0}}</span></span>
    </div>
    <el-table style="width: 100%; margin-bottom: 20px;" height="500" :data="dataList">
      <el-table-column label="商品名" width="180">
        <template slot-scope="scope">
          {{scope.row.info.title}}
        </template>
      </el-table-column>
      <el-table-column label="总订单数" width="80">
        <template slot-scope="scope">
          {{scope.row.original.sell_order_number}}
        </template>
      </el-table-column>
      <el-table-column label="导出总订单数" width="120">
        <template slot-scope="scope">
          {{scope.row.info.order_number}}
        </template>
      </el-table-column>
      <el-table-column label="sku订单数" width="100">
        <template slot-scope="scope">
          {{scope.row.original.sku_sell_order_number}}
        </template>
      </el-table-column>
      <el-table-column label="总销售数" width="100">
        <template slot-scope="scope">
          {{scope.row.original.sell_number}}
        </template>
      </el-table-column>
      <el-table-column label="导出总销售数" width="120">
        <template slot-scope="scope">
          {{scope.row.info.number}}
        </template>
      </el-table-column>
      <el-table-column label="导出总订单详情">
        <template slot-scope="scope">
          <div v-for="item in scope.row.sku" :key="item.sku_sn">
            {{item.attr}} ×{{item.order_number}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="导出总销售详情">
        <template slot-scope="scope">
          <div v-for="item in scope.row.sku" :key="item.sku_sn">
            {{item.attr}} ×{{item.number}}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="exportSummary.goods && exportSummary.goods.length > 0" class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 200]"
        :page-size="pageCount"
        layout="total, sizes, prev, pager, next"
        :total="exportSummary.goods.length"
        :pager-count="7"
        :page-count="count"
      ></el-pagination>
    </div>

    <div class="form-content-static" style="margin-top: 10px;">
      sku订单细分到每个订单（全部单独拆单），总订单数为实际订单数量（用户下的每单无论拆单与否都算1）<br/>
      如果sku订单数和总订单数不一致，请查证是否有合单或者拆部分商品、部分数量的订单存在<br/>
      多商品订单会独立统计该订单下的不同商品信息，有多商品订单的存在，面板顶部的总导出订单可能会比列表所有商品的总导出订单数之和小<br/>
      多商品订单如有同一个spu下的不同sku同时存在，会导致该商品的总导出订单数量比sku订单数少<br/>
      详细信息请看 <a href="/static/docs/导出订单数据详解.docx" target="blank">导出订单数据详解</a>
    </div>

  </div>
</template>
<script>
export default {
  name: 'validExportOrders',
  data() {
    return {
      currentPage: 1,
      count: 1,
      pageCount: 20,

      dataList: [],
      selection: []
    }
  },
  props: {
    exportSummary: Object
  },
  mounted() {
    this.resetTabel();
  },
  methods: {
    resetTabel() {
      this.exportSummary.goods.slice(0);
      this.currentPage = 1;
      this.getCurrentPage();
    },
    handleCurrentChange(value) {
      this.selection = [];
      this.currentPage = value;
      this.getCurrentPage();
    },
    handleSizeChange(value) {
      this.selection = [];
      this.pageCount = value;
      this.currentPage = 1;
      this.getCurrentPage();
    },
    getCurrentPage() {
      let exportSummary = this.exportSummary.goods.slice(0);
      let count = Math.ceil(exportSummary.length / this.pageCount);
      if(count < this.currentPage) this.currentPage = count;
      this.dataList = exportSummary.splice((this.currentPage - 1) * this.pageCount, this.pageCount);
      for(let i = 0; i < this.dataList.length; i++) {
        this.dataList[i].index = i;
        for(let j = 0; j < this.dataList[i].sku.length; j++) {
          this.dataList[i].sku[j].attr = Object.values(JSON.parse(this.dataList[i].sku[j].goodsInfo.specs)).join('、');
          this.dataList[i].sku[j].title = this.dataList[i].sku[j].goodsInfo.title;
        }
      }
      this.count = count;
      this.$forceUpdate();
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
        this.exportSummary.goods.splice(realIndex, 1);
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
      this.$confirm('确定对选中的各个订单进行发货操作吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
      this.$post('/admin/ship/ship', params, res => {
        let data = res.data;
        if(data.fail.count > 0) {
          this.$message.warning(`批量发货结果：成功 ${data.success.count || 0} 个，失败 ${data.fail.count} 个。其中订单${data.fail.order.join('、')}操作失败，请重试`);
        } else {
          this.$message.success('批量发货成功');
        }
        let failList = data.fail.order;
        let waitDeletes = selectOrders.sort(this.sortNumber);
        for(let i = waitDeletes.length - 1; i >= 0; i--) {
          if(!failList.includes(this.dataList[waitDeletes[i]].order_sn)) {
            this.exportSummary.goods.splice((this.currentPage - 1) * this.pageCount + waitDeletes[i], 1);  //要将页码数加回去给它
          }
        }
        this.getCurrentPage();
      });
      }).catch(err => {
        console.log(err);
      });
    },
    sortNumber(a,b) {
      return a - b
    }

  }
}
</script>
<style lang="less" scoped>
  .data-total-info {
    font-size: 28px;
  }
  .table-bottom-ctrls {
    margin-top: 20px;
  }
</style>