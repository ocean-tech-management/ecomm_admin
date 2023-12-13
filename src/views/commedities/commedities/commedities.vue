<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入商品名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="category_code">
            <el-select placeholder="不限" name="category_code" v-model="queryForm.category_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in categories" :label="item.name" :value="item.code" :key="item.code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-show="$auths.includes('supplier/list')" label="归属供货商" prop="supplier_code">
            <el-select placeholder="输入供货商名字进行筛选" name="supplier_code" filterable remote :loading="supplierLoading" v-model="queryForm.supplier_code" :remote-method="updateSupplierFilter">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in suppliers" :label="item.name" :value="item.supplier_code" :key="item.supplier_code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="searType">
            <el-select placeholder="不限" name="searType" v-model="queryForm.searType">
              <el-option label="不限" :value="1"></el-option>
              <el-option label="上架中" :value="2"></el-option>
              <el-option label="下架" :value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
            <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
              <el-option label="10" :value="10"></el-option>
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
        <div class="table-title">商品列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('goods/create')">
            <el-button type="primary" @click="$router.push('/addCommedity')">上传商品</el-button>
          </template>
          <template v-if="$auths.includes('goods/status')">
            <el-button :type="selection.length > 0 ? 'primary' : 'info'" @click="toggleItemSelection(2)">批量上架</el-button>
            <el-button :type="selection.length > 0 ? 'primary' : 'info'" @click="toggleItemSelection(1)">批量下架</el-button>
          </template>
          <template v-if="$auths.includes('excel/spuList')">
            <el-button type="primary" @click="exportExcel">导出</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList" @expand-change="tableExpand" @selection-change="updateSelection">
        <el-table-column v-if="$auths.includes('goods/info')" class="sku-vdc-expand" type="expand">
          <template slot-scope="scope">
            <div v-loading="scope.row.skuLoading">
              <div v-if="scope.row.sku && scope.row.sku.length > 0">
                <el-table :data="scope.row.sku" border>
                  <el-table-column label="规格" prop="attr" width="250"></el-table-column>
                  <el-table-column label="商品编码" prop="sku_sn" width="130"></el-table-column>
                  <el-table-column label="成本价" prop="cost_price" width="130"></el-table-column>
                  <el-table-column label="售价" prop="sale_price" width="130"></el-table-column>
                  <el-table-column v-for="(item, index) in scope.row.sku[0].purchase_prices" :label="item.name + '进货价'" width="130" :key="index">
                    <template slot-scope="vdcScope">
                      {{vdcScope.row.purchaseObject[item.level].purchase_price || ''}}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-else style="text-align: center">未查询到相关数据</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="40">
        </el-table-column>
        <el-table-column label="商品名称" prop="title" width="170"></el-table-column>
        <el-table-column label="商品码" width="130" prop="goods_code"></el-table-column>
        <el-table-column label="总订单量" prop="sell_order_number" width="100" align="center"></el-table-column>
        <el-table-column label="总销售金额" prop="sell_price" width="120" align="center"></el-table-column>
        <el-table-column label="总销售量" width="90" prop="sell_number" align="center"></el-table-column>
        <el-table-column label="活动" width="100" align="center">
          <template slot-scope="scope">
            {{scope.row.activitys}}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="180">
          <template slot-scope="scope">
            {{scope.row.p_category_name}} > {{scope.row.category_name}}
          </template>
        </el-table-column>
        <el-table-column label="显示状态" width="120" prop="status">
          <template slot-scope="scope">
            {{showStatusTexts[scope.row.show_status]}}
          </template>
        </el-table-column>
        <el-table-column label="锁定" width="50" prop="priceMaintainStatus" align="center">
          <template slot-scope="scope">
            <span :class="{'warning-color': scope.row.priceMaintainStatus != 1}">{{scope.row.priceMaintainStatus == 1 ? '是' : '否'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70" prop="status">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="create_time"></el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
         <template slot-scope="scope">
           <template v-if="$auths.includes('goods/status')">
            <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '下架' : '上架'}}</el-button>
           </template>
           <template v-if="$auths.includes('goods/update')">
            <el-button type="text" size="default" @click="$router.push('/editCommedity?goods_sn=' + scope.row.goods_sn)">编辑</el-button>
           </template>
           <template v-if="$auths.includes('goods/priceMaintain')">
            <el-button :class="{'warning-color': scope.row.priceMaintainStatus == 1}" type="text" size="default" @click="tryToggleLock(scope.row)">
              {{scope.row.priceMaintainStatus == 1 ? '解锁' : '锁定'}}
            </el-button>
           </template>
           <template v-if="$auths.includes('goods/saleInfo')">
            <el-button type="text" size="default" @click="showEditStocks(scope.row)">销量/库存</el-button>
           </template>
           <template v-if="$auths.includes('goods/copy')">
            <el-button type="text" size="default" @click="copyItem(scope.row)">复制商品</el-button>
           </template>
          
          <!-- 该操作无需权限验证。 -->
          <el-button type="text" size="default" @click="copyAppPath(scope.row)">复制商品地址</el-button>

           <template v-if="$auths.includes('goods/delete')">
            <el-button class="error-color" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
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

    
    <el-dialog title="查看销量/更新商品库存" width="1200px" :close-on-click-modal="false" :visible.sync="editStocksVisible">
      <EditStocks ref="editStock" :formData="formData"></EditStocks>
      <div slot="footer" class="dialog-footer">
        <template v-if="$auths.includes('goods/updateStock')">
          <el-button @click="editStocksVisible = false">取 消</el-button>
          <el-button type="primary" @click="tryEditStocks">修改库存</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="editStocksVisible = false">确 定</el-button>
        </template>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import EditStocks from '@/partialviews/commedity/commedity/EditStocks';

import XLSX from "xlsx";
import moment from "moment";

export default {
  name: 'commedities',
  components: {
    EditStocks
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        category_code: '',
        supplier_code: '',
        searType: 1,
        exportPageNum: 1,
        exportNum: 1000
      },
      filter: {
        keyword: '',
        category_code: '',
        supplier_code: '',
        searType: 1,
        exportPageNum: 1,
        exportNum: 1000
      },
      categories: [],
      statusTexts: {
        [1]: '上架',
        [2]: '已下架',
        [-1]: '已被删除'
      },
      showStatusTexts: {
        [1]: '全部显示',
        [2]: '仅商品列表显示',
        [3]: '仅活动模块显示',
        [4]: '商品列表隐藏'
      },
      dataList: [],
      vdc: [],  //会员分润信息
      selection: [],

      formData: {},

      suppliers: [],
      supplierLoading: false,

      editStocksVisible: false
    };
  },
  mounted() {
    if(localStorage.getItem('shouldRefresh')) localStorage.removeItem('shouldRefresh');
    this.getList();
    this.getCategories();
  },
  activated() {
    if(localStorage.getItem('shouldRefresh')) {
      this.getList();
      if(document && document.querySelector('#page')) {
        document.querySelector('#page').scrollTop = 0;
      }
      localStorage.removeItem('shouldRefresh');
    }
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.$forceUpdate();
      console.log(this.queryForm);
      this.filter = {
        keyword: '',
        category_code: '',
        supplier_code: '',
        searType: 1,
        exportPageNum: 1,
        exportNum: 1000
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        category_code: this.queryForm.category_code,
        supplier_code: this.queryForm.supplier_code,
        searType: this.queryForm.searType,
        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        category_code: this.filter.category_code,
        supplier_code: this.filter.supplier_code,
        searType: this.filter.searType,
        commedity_type: 1 //正常商品
      };

      this.$get('/admin/spu/list', queryVal, res => {
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].activity && dataList[i].activity.length > 0) {
            let activitys = [];
            for(let j = 0; j < dataList[i].activity.length; j++) {
              activitys.push(dataList[i].activity[j].title);
            }
            dataList[i].activitys = activitys.join('、');
          } else {
            dataList[i].activitys = '——';
          }
          dataList[i].skuLoading = false;
          dataList[i].sku = [];
          dataList[i].hasLoadSkus = false;
        }
        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    
    getSuppliers(keyword = '') {
      if(!this.$auths.includes('supplier/list')) return;
      let params = {
        page: 1,
        keyword: keyword
      }
      
      this.supplierLoading = true;
      this.$sget('/admin/supplier/list', params, res => {
        let data = res.data.list || [];
        this.suppliers = data;
        this.supplierLoading = false;
      });
    },
    updateSupplierFilter(keyword) {
      this.getSuppliers(keyword)
    },

    getCategories() {
      if(!this.$auths.includes('category/list')) {
        return;
      }
      let params = {
        keyword: '',
        type: 2 // 1 父子 2父级
      };

      this.$get('/admin/category/list', params, res => {
        this.categories =  res.data;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },
    updateSelection(e){
      this.selection = e;
    },

    tableExpand(row) {
      if(row.hasLoadSkus) return;
      let sn = row.goods_sn;
      for(let i = 0; i < this.dataList.length; i++) {
        if(sn == this.dataList[i].goods_sn) {
          if(!this.dataList[i].hasLoadSkus) {
            this.tryLoadSkus(i);
          }
          break;
        }
      }
    },
    async tryLoadSkus(index) {
      if(!this.vdc || this.vdc.length == 0) await this.getVDC();
      let sn = this.dataList[index].goods_sn;
      let params = {
        goods_sn: sn
      }
      this.dataList[index].skuLoading = true;
      this.$sget('/admin/goods/info', params, res => {
        let data = res.data || {};
        let sku = data.sku;
        
        for(let i = 0; i < sku.length; i++) {
          let attrs = Object.values(JSON.parse(sku[i].specs) || {});
          sku[i].attr = attrs.join('、');
          let purchase_prices = [],   //vdc栏目
              purchaseObject = {};  //vdc数据键值对，用来做列表显示
          for(let j = 0; j < this.vdc.length; j++) {
            purchase_prices.push({
              level: this.vdc[j].level,
              name: this.vdc[j].name,
              purchase_price: data.sku[i].vdc[j].purchase_price
            })
            purchaseObject[this.vdc[j].level] = {
              level: this.vdc[j].level,
              name: this.vdc[j].name,
              purchase_price: data.sku[i].vdc[j].purchase_price
            }
          }
          sku[i].purchase_prices = purchase_prices;
          sku[i].purchaseObject = purchaseObject;
        }
        this.dataList[index].sku = sku;
        console.log(this.dataList[index]);
        
        this.dataList[index].skuLoading = false;
        this.dataList[index].hasLoadSkus = true;
      }, err => {
        console.log(err);
        this.dataList[index].skuLoading = false;
      })
    },
    
    getVDC() {
      const promise = new Promise((reslove, reject) => {
        let params = {
          keyword: ''
        }
        this.$get('/admin/vdc/list', params, res => {
          let data = res.data;
          this.vdc = data;
          reslove();
        }, err => {
          reslove();
        });
      })
      return promise;
      
    },


    toggleItemSelection(status = 1) {
      let ctrlName = status == 1 ? '下架' : '上架';
      if(this.selection.length == 0) {
        this.$message.error('至少要选中一项商品哦');
        return;
      }
      let params = {
        goods_sn: [],
        status: status
      }
      for(let i = 0; i < this.selection.length; i++) {
        params.goods_sn.push(this.selection[i].goods_sn);
        if(this.selection[i].status !== status) {
          return this.$message.error(`请选择当前状态都是${ctrlName}状态的商品，当前选中的商品有状态不对的项`);
        }
      }
      
      let confirmMessage = status === 1 ? '是否确定下架所有已选商品' : '是否确定上架所有已选商品';
      this.$confirm(confirmMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goods/status', params, res => {
          this.$message.success(`批量${status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
      
    },
    toggleItem(row) {
      let tips = `您将上架商品 ${row.title} ，如果商品为已超时下架的定时商品，上架操作会更改商品上架类型为立即上架，商品状态将全局同步，是否继续？`;
      if(row.status == 1) tips = `您将下架商品 ${row.title} ，如果商品为正在上架中的定时商品，下架操作会更改商品下架时间，商品状态将全局同步，是否继续？`
      this.$confirm(tips, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goods/status', {
          goods_sn: row.goods_sn,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '下架' : '上架'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    tryToggleLock(row) {
      let confirmTexts =  '您将进行锁定spu操作，锁定spu后将不允许后台管理人员随意调整已有sku的信息，且允许用户购买';
      if(row.priceMaintainStatus == 1) confirmTexts = '您将进行解锁spu操作，解锁spu后将允许后台管理人员对sku的价格进行调整，在重新锁定sku前将会限制用户购买';
      this.$confirm((`${confirmTexts}，是否继续?`), '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        let params = {
          goods_sn: row.goods_sn,
          status: row.priceMaintainStatus
        }
        this.$post('/admin/goods/priceMaintain', params, res => {
          this.$message.success('操作成功');
          this.reloadPage();
        });

      }).catch(err => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$get('/admin/goods/delete', {
          goods_sn: row.goods_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
    copyItem(row) {
      this.$confirm(`您将复制${row.title}这个商品, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/goods/copy', {
          goods_sn: row.goods_sn
        }, res => {
          this.$message.success('复制成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    copyAppPath(row) {
      let url = `pages/product-detail/product-detail?sn=${row.goods_sn}`;
      // let url = `pages/index/index?redirect=${encodeURIComponent(appPath)}`;
      this.$copyText(url).then(e => {
        this.$message.success('复制成功，可使用该地址作为直播商品地址栏填写内容');
      }, function (e) {
        this.$message.warning('复制失败，请刷新页面重试');
      })
    },

    showEditStocks(row) {
      this.formData = {
        goods_sn: row.goods_sn
      }
      if(this.$refs.editStock) this.$refs.editStock.getSaleInfos(row.goods_sn);
      this.editStocksVisible = true;
    },
    tryEditStocks() {
      let goods = this.$refs.editStock.returnStockResult();
      for(let i = 0; i < goods.length; i++) {
        if(!(/^-?\d+$/.test(goods[i].stock_number))) {
          return this.$message.error(`第${i + 1}个sku调整的库存值要为0，1，2，3，4这种正整数哦，如不增减库存请填0，请检查下哈`)
        }
      }
      for(let i = goods.length - 1; i >= 0; i--) {
        if(goods[i].stock_number == 0) goods.splice(i, 1);
      }
      if(goods.length == 0) return this.editStocksVisible = false;
      this.$post('/admin/goods/updateStock', {
        goods: goods
      }, res => {
        this.$message.success('更新成功'); 
        this.editStocksVisible = false;
        this.reloadPage();
      });
      
    },
  
    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        category_code: this.filter.category_code,
        supplier_code: this.filter.supplier_code,
        searType: this.filter.searType,
      
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum   //实际用参数名和变量名是不一致的哈
      }

      this.$get('/admin/excel/spuList', params, res => {
        let data = res.data.list || [];
        if (data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if (data.length > 100000) {
          return this.$message.warning('数据超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }

        for(let i = 0; i < data.length; i++) {
          if(data[i].activity && data[i].activity.length > 0) {
            let activitys = [];
            for(let j = 0; j < data[i].activity.length; j++) {
              activitys.push(data[i].activity[j].title);
            }
            data[i].activitys = activitys.join('、');
          } else {
            data[i].activitys = '';
          }
        }
        

        let excelData = [];
        excelData.push([
          '产品编码', 
          '商品名称',
          '商品码(可自己填写)', 
          '总订单量',  
          '总销售金额', 
          '总销售量', 
          '活动', 
          '分类', 
          '创建时间', 
          '显示状态', 
          '状态'
        ]);
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          excelData.push([
            item.goods_sn || '', 
            item.title || '', 
            item.goods_code || '', 
            item.sell_order_number || '0',
            item.sell_price || '0.00',
            item.sell_number || '0',
            item.activitys || '', 
            `${item.p_category_name}>${item.category_name}`,
            item.create_time || '',
            this.showStatusTexts[item.show_status] || '',
            this.statusTexts[item.status] || ''
          ]);
        }

        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 120},
          {wpx: 320},
          {wpx: 120},
          {wpx: 80},
          {wpx: 80},
          {wpx: 80},
          {wpx: 120},
          {wpx: 160},
          {wpx: 140},
          {wpx: 120},
          {wpx: 80}
        ]
        const wb = XLSX.utils.book_new();
        let range = XLSX.utils.decode_range(ws['!ref']);
        for (let i = range.s.r + 1; i <= range.e.r; i++) {
          let row3 = XLSX.utils.encode_cell({
            r: i,
            c: 3
          });
          ws[row3].t = 'n';
          let row4 = XLSX.utils.encode_cell({
            r: i,
            c: 4
          });
          ws[row4].t = 'n';
          let row5 = XLSX.utils.encode_cell({
            r: i,
            c: 5
          });
          ws[row5].t = 'n';

        }
        ws['!ref'] = XLSX.utils.encode_range(range);

        XLSX.utils.book_append_sheet(wb, ws, "商品列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `商品列表${time}.xlsx`);
      });
    },
  }
};
</script>
