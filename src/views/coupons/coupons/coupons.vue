<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="类型" prop="used_code">
            <!-- 使用场景 -->
            <el-select placeholder="不限" name="used_code" v-model="queryForm.used_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in use_types" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优惠类型" prop="type_code">
            <!-- 使用类型 -->
            <el-select placeholder="不限" name="type_code" v-model="queryForm.type_code">
              <el-option label="不限" value></el-option>
              <el-option v-for="item in types" :label="item.t_name" :value="item.t_type" :key="item.t_type"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="valid_status">
            <el-select placeholder="不限" name="valid_status" v-model="queryForm.valid_status">
              <el-option label="不限" value></el-option>
              <el-option label="可领取" :value="1"></el-option>
              <el-option label="不可领取" :value="2"></el-option>
              <el-option label="已结束" :value="-1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">优惠券列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('coupon/deliverHistory')">
            <el-button type="primary" @click="$router.push('deliverHistory')">派/补券记录</el-button>
          </template>
          <template v-if="$auths.includes('coupon/deleteList')">
            <el-button type="primary" @click="$router.push('destoryCoupons')">已销毁卡券</el-button>
          </template>
          <template v-if="$auths.includes('coupon/deliver')">
            <el-button @click="$router.push('deliverCoupon')">派券</el-button>
          </template>
          <template v-if="$auths.includes('coupon/create')">
            <el-button type="primary" @click="$router.push('addCoupon')">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="170" prop="code"></el-table-column>
        <el-table-column label="优惠名称" prop="name" width="250"></el-table-column>
        <el-table-column label="优惠方式" width="150">
          <template slot-scope="scope">
            <div class="coupon-used">
              {{scope.row.u_name || ''}}
            </div>
            <div>{{couponTypeContent(scope.row)}}  </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template slot-scope="scope">{{scope.row.t_name || ''}}</template>
        </el-table-column>
        <el-table-column label="谁可领" width="100">
          <template slot-scope="scope">{{scope.row.us_name || ''}}</template>
        </el-table-column>
        <el-table-column label="发行量" width="70" prop="number"></el-table-column>
        <el-table-column label="已使用/已发出/剩余数量" width="100">
          <template slot-scope="scope">{{scope.row.used_count}}/{{scope.row.take_count}}/{{scope.row.number - scope.row.take_count}}</template>
        </el-table-column>
        <el-table-column label="活动时间" width="160">
          <template slot-scope="scope">
            {{scope.row.start_time}}~{{scope.row.end_time}}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <div :class="{'warning-color': scope.row.valid_status == 2, 'error-color': scope.row.valid_status == -1}">{{statusDictionary[scope.row.valid_status]}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('coupon/operation')">
              <el-button 
                v-if="scope.row.valid_status == 1"
                type="text"
                size="default"
                @click="toggleStatus(scope.row)"
              >停用</el-button>
              <el-button
                v-if="scope.row.valid_status == 2"
                type="text"
                size="default"
                @click="toggleStatus(scope.row)"
              >启用</el-button>
            </template>
            <template v-if="$auths.includes('coupon/update')">
              <el-button
                type="text"
                size="default"
                @click="$router.push({path: 'editCoupon', query: {code: scope.row.code}})"
              >编辑</el-button>
            </template>
            <template v-if="$auths.includes('coupon/number')">
              <el-button
                type="text"
                size="default"
                @click="showEditNumber(scope.row)"
              >调整数量</el-button>
            </template>
            <template v-if="$auths.includes('coupon/userCoupon')">
              <el-button type="text" size="default" @click="$router.push('couponRecords?code=' + scope.row.code)">查看领取记录</el-button>
            </template>
            <template v-if="$auths.includes('coupon/operation')">
              <el-button type="text" size="default" @click="showDestory(scope.row)">销毁</el-button>
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

    <el-dialog title="调整卡券数量" width="1200px" :close-on-click-modal="false" :visible.sync="editNumberVisible">
      <EditNumber ref="editNumber" :formData="formData"></EditNumber>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editNumberVisible = false">取 消</el-button>
        <el-button type="primary" @click="tryEditNumber">修改卡券数量</el-button>
      </div>
    </el-dialog>

    <el-dialog title="销毁优惠券" width="1000px" :close-on-click-modal="false" :visible.sync="destoryCouponVisible">
      <DestoryCoupon ref="destoryCoupon" :formData="formData"></DestoryCoupon>
      <div slot="footer" class="dialog-footer">
        <el-button @click="destoryCouponVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDestory">确认销毁</el-button>
      </div>
    </el-dialog>

    <el-dialog title="操作结果" width="800px" :close-on-click-modal="false" :show-close="false" :visible.sync="errorResultVisible">
      <div>
        <template v-if="errorResult.length > 0">
          <div style="font-size: 28px">
            存在 <span class="warning-color">操作失败</span> 情况
          </div>
          <div style="margin-top: 20px">
            本次操作共有{{errorResult.length || 0}}位用户出现了问题，具体可点击下方的 “下载错误汇总” 按钮下载、查看相关信息。或可点击列表中“查看领取记录”查看结果
          </div>
          <div style="margin-top: 10px">
            <el-button type="text" size="small" @click="exportErrorData">下载错误汇总</el-button>
          </div>
        </template>
        <template v-else>
          <div style="font-size: 28px">
            <span class="success-color">操作成功</span>
          </div>
        </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmResult">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from 'moment';  

import EditNumber from '@/partialviews/coupon/coupon/EditNumber';
import DestoryCoupon from '@/partialviews/coupon/coupon/DestoryCoupon';

export default {
  name: 'coupons',
  components: {
    EditNumber,
    DestoryCoupon
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        type_code: '',
        used_code: '',
        valid_status: ''
      },
      filter: {
        type_code: '',
        used_code: '',
        valid_status: ''
      },
      dataList: [],
      types: [],  //类型
      use_types: [],
      statusDictionary: {
        [-1]: '已过期',
        [1]: '可领取',
        [2]: '不可领取'
      },
      formData: {},
      useAreaVisible: false,
      editNumberVisible: false,

      destoryCouponVisible: false,
      
      errorResultVisible: false,  //派券结果
      errorResult: {},
      couponName: {},
    };
  },
  mounted() {
    if(localStorage.getItem('shouldRefresh')) localStorage.removeItem('shouldRefresh');
    this.getList();
    this.getTypes();
    this.getUsed();
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
        type_code: '',
        used_code: '',
        valid_status: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        type_code: this.queryForm.type_code,
        used_code: this.queryForm.used_code,
        valid_status: this.queryForm.valid_status
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        type_code: this.filter.type_code,
        used_code: this.filter.used_code,
        valid_status: this.filter.valid_status
      };

      this.$get('/admin/coupon/list', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    getTypes() {
      this.$get('/admin/coupon/type', null, res => {
        this.types = res.data;
      });
    },
    getUsed() {
      this.$get('/admin/coupon/used', null, res => {
        this.use_types = res.data;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
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


    openUseArea() {
      this.formData = {};
      this.useAreaVisible = true;
    },
    updateUseArea() {
      this.useAreaVisible = false;
      this.$message({
        message: '编辑指定商品成功',
        type: 'success'
      });
    },

    toggleStatus(row) {
      let ctrlType = row.valid_status == 1 ? '停用' : '启用';
      let params = {
        code: row.code,
        valid_status: row.valid_status
      }
      this.$post('/admin/coupon/operation', params, res => {
        this.$message.success(`${ctrlType}成功`);
        this.reloadPage();
      });
      
    },
    
    showEditNumber(row) {
      this.formData = {
        code: row.code,
        number: 0,
        current: row.number - row.take_count
      }
      this.editNumberVisible = true
    },
    tryEditNumber() {
      let params = {
        code: this.formData.code,
        number: this.formData.number
      }
      if(!(/^-?\d+$/.test(params.number))) {
        return this.$message.error(`值要为0，1，2，3，4这种正整数哦，如不增减库存请填0，请检查下哈`)
      } else if (this.formData.current <= 0 && params.number < 0) {
        return this.$message.error(`库存为0，无法减少库存，请检查`)
      }
      if(params.number == 0) return this.editNumberVisible = false; //如果不更改直接就关闭窗口好了

      this.$post('/admin/coupon/number', params, res => {
        this.$message.success('更新成功'); 
        this.editNumberVisible = false;
        this.reloadPage();
      });
      
    },


    showDestory(row) {
      this.formData = {
        code: row.code,
        deleteUserCoupon: false,
        compensateCoupon: false,
        selectCoupon: '',
        selectCouponNumber: 1
      }
      this.destoryCouponVisible = true;
    },
    confirmDestory() {
      let params = {
        code: this.formData.code,
        status: -1
      }
      if(this.formData.deleteUserCoupon) {
        params.deleteUserCoupon = this.formData.deleteUserCoupon;
        if(this.formData.compensateCoupon) {
          params.compensateCoupon = this.formData.compensateCoupon;
          if(!this.formData.selectCoupon || this.formData.selectCoupon === '') {
            return this.$message.error('请选择要补发的优惠券');
          }
          if(!/^[1-9]\d*$/.test(this.formData.selectCouponNumber)) {
            return this.$message.error('补发优惠券要为正整数哦');
          }
          params.couponCardList = {
            [this.formData.selectCoupon]: this.formData.selectCouponNumber
          }
          params.compensateCouponCode = this.formData.selectCoupon;
        }
      }
      this.$confirm('你确定销毁该优惠券？', '警告', {
        $confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      .then(() => {
        this.$post('/admin/coupon/operation', params, res => {
          if(res.data.compensateRes && res.data.compensateRes.fail && !res.data.compensateRes.fail.length) {
            this.destoryCouponVisible = false;
            let couponName = {};
            for(let i = 0; i < res.data.compensateRes.couponInfo.length; i++) {
              couponName[res.data.compensateRes.couponInfo[i].code] = res.data.compensateRes.couponInfo[i].name;
            }
            this.couponName = couponName;
            this.tryConcatData(res.data.compensateRes.fail); //拼装数据
          } else {
            this.destoryCouponVisible = false;
            this.$message.success(`销毁成功`);
            this.reloadPage();
          }
        });
      })
      .catch(() => {});
    },
    
    confirmResult() {
      this.errorResultVisible = false;
      this.reloadPage();
    },

    tryConcatData(data) {
      let errorData = [], userArray = [];
      let keys = Object.keys(data);
      let vals = Object.values(data);
      for(let i = 0; i < vals.length; i++) {  //优惠券错误数组
        let couponErrInfos = vals[i];
        for(let j = 0; j < couponErrInfos.length; j++) {
          let couponErr = couponErrInfos[j];
          if(userArray.includes(couponErr.userInfo.uid)) {
            let index = userArray.indexOf(couponErr.userInfo.uid);
            errorData[index].errs[keys[i]] = {
              ...this.calcErrInfo(couponErr.res)
            };
          } else {
            let item = {
              uid: couponErr.userInfo.uid,
              name: couponErr.userInfo.name,
              phone: couponErr.userInfo.phone,
              errs: {}
            }
            item.errs[keys[i]] = {
              ...this.calcErrInfo(couponErr.res)
            };
            errorData.push(item);
            userArray.push(couponErr.userInfo.uid);
          }
        }
      }
      this.errorResult = errorData;
      this.errorResultVisible = true;
    },
    /**
     * @param data <Object> 不是Array {1: '请求出错'}
     * @returns 处理完的一个json数组，key是错误信息， value是这个错误信息总共出现多少次
     */
    calcErrInfo(data) { 
      let result = {}, vals = Object.values(data);
      for(let i = 0; i < vals.length; i++) {
        if(!result[vals[i]]) {
          // 还没有这个错误信息
          result[vals[i]] = 1;
        } else {
          result[vals[i]] += 1;
        }
      }
      return result;
    },

    exportErrorData() {
      let data = this.errorResult;
      if(data.length == 0) {
        return this.$message.warning('查无数据，请检查');
      }
      if(data.length > 100000) {
        return this.$message.warning('订单数超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
      }
      let excelData = [];
      excelData.push([
        '姓名',
        '手机号码',
        '错误详情'
      ]);
      for(let i = 0; i < data.length; i++) {
        // 汇总错误信息
        let result = data[i];
        let errorCoupon = Object.keys(result.errs);
        let errorInfos = Object.values(result.errs);
        let errorArr = [];
        for(let j = 0; j < errorInfos.length; j++) {
          // 统计每张券的错误信息
          let errorKey = Object.keys(errorInfos[j]);
          let errorInfoArr = [];
          for(let k = 0; k < errorKey.length; k++) {
            // 汇总每张券的每个错误信息
            let info = `${errorKey[k]} ×${errorInfos[j][errorKey[k]]}`;
            errorInfoArr.push(info);
          }
          errorArr.push(`${this.couponName[errorCoupon[j]]}(${errorInfoArr.join('、')})`);  //券名+原因
        }
        result.errorInfo = `${errorArr.join('；')}`;

        // 拼装excel数据
        excelData.push([
          result.name || '',
          result.phone || '',
          result.errorInfo || '不详',
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
      XLSX.utils.book_append_sheet(wb, ws, "派券失败信息列表");

      let time = moment().format('YYYYMMDDHHmm');
      /* generate file and send to client */
      XLSX.writeFile(wb, `派券失败信息列表${time}.xlsx`);
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