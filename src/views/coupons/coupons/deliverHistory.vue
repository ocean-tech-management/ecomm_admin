<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入姓名或手机号" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="用户手机号码" prop="userPhone">
            <el-input v-model="queryForm.userPhone" placeholder="请输入精准手机号码或置空" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <!-- 使用场景 -->
            <el-select placeholder="不限" name="type" v-model="queryForm.type">
              <el-option label="不限" value></el-option>
              <el-option label="派券" :value="1"></el-option>
              <el-option label="补发" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">派/补券记录</div>
        <div class="table-ctrl">

        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="操作者" prop="admin_name" width="120"></el-table-column>
        <el-table-column label="券包内容" prop="content" width="250"></el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template slot-scope="scope">{{typeTexts[scope.row.type]}}</template>
        </el-table-column>
        <el-table-column label="结果" width="250">
          <template slot-scope="scope">
            <template v-if="scope.row.failList.length > 0">
              失败信息<span class="error-color"> {{scope.row.failList.length}} </span>条
            </template>
            <template v-if="scope.row.failList.length > 0 && scope.row.successList.length > 0">，</template>
            <template v-if="scope.row.successList.length > 0">
              成功信息<span class="success-color"> {{scope.row.successList.length}} </span>条
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作日期" width="160" prop="create_time"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="default" @click="showDetail(scope.row)">查看派券信息</el-button>
            <el-button v-if="scope.row.failList.length > 0" type="text" size="default" @click="exportErrorData(scope.row)">导出失败信息</el-button>
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
    
    <el-dialog title="补/派券记录详情" width="1000px" :close-on-click-modal="false" :visible.sync="detailVisible">
      <DeliverHistoryDetail ref="deliverHistoryDetail" :historyItem="historyItem"></DeliverHistoryDetail>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">确 认</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from 'moment';
import DeliverHistoryDetail from '@/partialviews/coupon/coupon/deliver/DeliverHistoryDetail';
export default {
  name: 'deliverHistory',
  components: {
    DeliverHistoryDetail
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        userPhone: '',
        type: ''
      },
      filter: {
        keyword: '',
        userPhone: '',
        type: ''
      },
      dataList: [],
      typeTexts: {
        [1]: '派券',
        [2]: '补发'
      },
      formData: {},
      couponName: {}, //临时存储的优惠券码名键值对

      historyItem: {},
      detailVisible: false

    };
  },
  mounted() {
    this.getList();
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
      this.filter = {
        keyword: '',
        userPhone: '',
        type: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        userPhone: this.queryForm.userPhone,
        type: this.queryForm.type
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword,
        userPhone: this.filter.userPhone,
        type: this.filter.type
      };

      this.$get('/admin/coupon/deliverHistory', queryVal, res => {
        this.couponNames = {}; //重置优惠券码名键值对
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].coupon = JSON.parse(dataList[i].coupon) || {};
          dataList[i].coupon_info = JSON.parse(dataList[i].coupon_info) || [];
          dataList[i].result = JSON.parse(dataList[i].result) || {};
          dataList[i].user = JSON.parse(dataList[i].user) || {};
          
          // 重新构建优惠券码名键值对
          for(let j = 0; j < dataList[i].coupon_info.length; j++) {
            let couponNames = Object.keys(this.couponName);
             if(!couponNames.includes(dataList[i].coupon_info[j].code)) {
               this.couponName[dataList[i].coupon_info[j].code] = dataList[i].coupon_info[j].name;
             }
          }

          // 构建错误/成功信息记录
          dataList[i].failList = [];
          if(dataList[i].result.fail && !dataList[i].result.fail.length) {
            dataList[i].failList = this.tryConcatData(dataList[i].result.fail, 1);
          }
          dataList[i].successList = [];
          if(dataList[i].result.success && !dataList[i].result.success.length) {
            dataList[i].successList = this.tryConcatData(dataList[i].result.success, 2);
          }

          // 构建派券内容
          dataList[i].content = this.calcContent(dataList[i].coupon, this.couponName) || '';

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
      this.historyItem = row;
      this.detailVisible = true;
    },

    couponTypeContent(row) {
      if(row.t_type == 1) {
        return `满${row.with_amount}减${row.used_amount}`
      } else if(row.t_type == 2) {
        return `满${row.with_amount}减${row.used_amount}(可叠加)`
      } else if(row.t_type == 3) {
        return `无门槛减${row.used_amount}`
      } else if(row.t_type == 4) {
        return `打折券${row.with_discount * 1000 / 100}折`
      } else if(row.t_type == 5) {
        return row.with_condition === 1 ? `满${row.with_amount}抵扣${row.used_amount}` : `抵扣${row.used_amount}`;
      } else {
        return ''
      }
    },

    /**
     * @param data <Object> 待处理的数据，键值对。 键为券码，值为信息
     * @param type 1是需要总结信息，2是不需要总结信息
     */
    tryConcatData(data, type = 1) {
      let result = [], userArray = [];
      let keys = Object.keys(data);
      let vals = Object.values(data);
      for(let i = 0; i < vals.length; i++) {  //优惠券错误数组
        let currentDataInfos = vals[i];
        for(let j = 0; j < currentDataInfos.length; j++) {
          let currentData = currentDataInfos[j];
          if(userArray.includes(currentData.userInfo.uid)) {
            let index = userArray.indexOf(currentData.userInfo.uid);
            result[index].infos[keys[i]] = {
              ...this.calcInfo(currentData.res)
            };
          } else {
            let item = {
              uid: currentData.userInfo.uid,
              name: currentData.userInfo.name,
              phone: currentData.userInfo.phone,
              infos: {}
            }
            item.infos[keys[i]] = {
              ...this.calcInfo(currentData.res)
            };
            result.push(item);
            userArray.push(currentData.userInfo.uid);
          }
        }
      }

      if(type == 1) {
        // 总结信息
        for(let i = 0; i < result.length; i++) {
          result[i].summary = this.calcInfos(result[i].infos, this.couponName);
        }
      } else {
        // 总结成功信息
        for(let i = 0; i < result.length; i++) {
          result[i].summary = this.calcCountInfos(result[i].infos, this.couponName);
        }
      }

      return result;
    },
    /**
     * @param data <Object> 不是Array {1: '请求出错'}
     * @returns 处理完的一个json数组，key是信息， value是这个信息总共出现多少次
     */
    calcInfo(data) { 
      let result = {}, vals = Object.values(data);
      for(let i = 0; i < vals.length; i++) {
        if(!result[vals[i]]) {
          // 还没有这个信息
          result[vals[i]] = 1;
        } else {
          result[vals[i]] += 1;
        }
      }
      return result;
    },
    /**
     * @param infos <Object> 已经初步处理过的一个数组
     * @param couponName <Object> 券名
     * @returns 处理完的一个string，显示出错券的信息
     */
    calcInfos(infos, couponName) {
      let coupons = Object.keys(infos);
      let dataInfos = Object.values(infos);
      let arr = [];
      for(let j = 0; j < dataInfos.length; j++) {
        // 统计每张券的错误信息
        let keys = Object.keys(dataInfos[j]);
        let infoArr = [];
        for(let k = 0; k < keys.length; k++) {
          // 汇总每张券的每个错误信息
          let info = `${keys[k]} ×${dataInfos[j][keys[k]]}`;
          infoArr.push(info);
        }
        arr.push(`${couponName[coupons[j]]}(${infoArr.join('、')})`);  //券名+原因
      }
      let result = `${arr.join('；')}`;
      return result;
    },

    /**
     * @param infos <Object> 已经初步处理过的一个数组
     * @param couponName <Object> 券名
     * @returns 处理完的一个string，显示成功的信息
     */
    calcCountInfos(infos, couponName) {
      let coupons = Object.keys(infos);
      let dataInfos = Object.values(infos);
      let arr = [];
      for(let j = 0; j < dataInfos.length; j++) {
        // 统计每张券的错误信息
        let keys = Object.keys(dataInfos[j]);
        let infoArr = [];

        arr.push(`${couponName[coupons[j]]} ×${keys.length || 0}`);  //券名+原因
      }
      let result = `${arr.join('；')}`;
      return result;
    },
    
    /**
     * @param data <Object> 码数键值对
     * @returns 处理完的一个string字符串
     */
    calcContent(data, couponName) { 
      // 构建派/补券内容
      let coupons = Object.keys(data);
      let counts = Object.values(data);
      let itemArrs = [];
      for(let i = 0; i < coupons.length; i++) {
        itemArrs.push(`【${[couponName[coupons[i]]]}】 ×${counts[i]}`);
      }
      let result = itemArrs.join('、');
      return result;
    },

    
    exportErrorData(row) {
      let data = row.failList;
      if(data.length == 0) {
        return this.$message.warning('无数据，请检查');
      }
      let excelData = [];
      excelData.push([
        '姓名',
        '手机号码',
        '错误详情'
      ]);

      for(let i = 0; i < data.length; i++) {
        // 拼装excel数据
        excelData.push([
          data[i].name || '',
          data[i].phone || '',
          data[i].summary || '不详',
        ]);
      }
    
      
      // 导出excel
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [
        {wpx: 140},
        {wpx: 140},
        {wpx: 600}
      ]

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "历史补派券失败信息列表");

      let time = moment().format('YYYYMMDDHHmm');
      /* generate file and send to client */
      XLSX.writeFile(wb, `历史补派券失败信息列表${time}.xlsx`);
    },



  }
};
</script>

<style scoped>
  .coupon-used {
    display: inline-block;
    padding: .2em 10px;
    border-radius: .9em;
    font-size: 12px;
    line-height: 1.4;
    color: #fff;
    background-color: #618df5;
  }
</style>