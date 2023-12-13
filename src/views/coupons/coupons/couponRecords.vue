<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入商品名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="valid_status">
            <el-select placeholder="不限" name="valid_status" v-model="queryForm.valid_status">
              <el-option label="不限" value></el-option>
              <el-option label="正常" :value="1"></el-option>
              <el-option label="不可用" :value="2"></el-option>
              <el-option label="已被使用" :value="3"></el-option>
              <el-option label="订单占用,暂不可用	" :value="4"></el-option>
              <el-option label="已过期" :value="-1"></el-option>
              <el-option label="已被销毁" :value="-2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="queryForm.valid_status == -2" label="是否补偿" prop="is_compensate">
            <el-select placeholder="不限" name="is_compensate" v-model="queryForm.is_compensate">
              <el-option label="不限" value></el-option>
              <el-option label="已补偿" :value="1"></el-option>
              <el-option label="未补偿" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-ctrls">
        <div class="table-title">优惠券领取记录列表 <span class="success-color">{{couponData.name || ''}}</span></div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('coupon/destroyUserCoupon')">
            <el-button type="warning" :disabled="selection.length == 0" @click="tryBatchDestory">批量销毁</el-button>
          </template>
          <template v-if="$auths.includes('coupon/compensate')">
            <el-button type="primary" :disabled="selection.length == 0" @click="tryCompensate">批量补偿</el-button>
          </template>
          <template v-if="$auths.includes('coupon/compensate')">
            <el-button type="primary" @click="tryQuicklyCompensate">一键补偿</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList" @selection-change="updateSelection">
        <el-table-column type="selection" width="40">
        </el-table-column>
        <el-table-column label="券号" width="170" prop="uc_code"></el-table-column>
        <el-table-column label="领取者" prop="user_name" width="150"></el-table-column>
        <el-table-column label="手机号码" prop="phone" width="120"></el-table-column>
        <el-table-column label="领取类型" prop="receive_type" width="100">
          <template slot-scope="scope">
            {{receiveTypeTexts[scope.row.receive_type]}}
          </template>
        </el-table-column>
        <el-table-column label="领取时间" prop="create_time" width="160">
        </el-table-column>
        <el-table-column label="使用时间" prop="use_time" width="160">
        </el-table-column>
        <el-table-column label="有效期" width="160">
          <template slot-scope="scope">
            {{scope.row.valid_start_time}}~{{scope.row.valid_end_time}}
          </template>
        </el-table-column>
        <el-table-column label="销毁时间" prop="delete_time" width="160">
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <div :class="{'warning-color': scope.row.valid_status == 2 || scope.row.valid_status == 4, 'error-color': scope.row.valid_status == -1 || (scope.row.valid_status == -2 && !scope.row.compensate_code)}">
              {{validStatusTexts[scope.row.valid_status]}}
              <span v-if="scope.row.valid_status == -2 && scope.row.compensate_code" class="success-color">已补偿</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('coupon/destroyUserCoupon')">
              <el-button v-if="scope.row.valid_status == 1" class="error-color" type="text" size="small" @click="showDestory(scope.row)">销毁</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 25, 50]"
          :page-size="pageCount"
          :pager-count="7"
          layout="sizes, prev, pager, next"
          :page-count="count"
        ></el-pagination>
      </div>
    </div>
    
    <el-dialog title="销毁已领优惠券" width="1000px" :close-on-click-modal="false" :visible.sync="destoryCouponVisible">
      <DestoryUserCoupon ref="destoryCoupon" :formData="formData"></DestoryUserCoupon>
      <div slot="footer" class="dialog-footer">
        <el-button @click="destoryCouponVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDestory">确认销毁</el-button>
      </div>
    </el-dialog>

    <el-dialog title="补偿优惠券" width="1000px" :close-on-click-modal="false" :visible.sync="compensateVisible">
      <Compensate ref="destoryCoupon" :formData="formData"></Compensate>
      <div slot="footer" class="dialog-footer">
        <el-button @click="compensateVisible = false">取 消</el-button>
        <el-button v-if="formData.type == 1" type="primary" @click="comfirmCompensate">确认补偿</el-button>
        <el-button v-else-if="formData.type == 2" type="primary" @click="comfirmQuicklyCompensate">确认补偿</el-button>
      </div>
    </el-dialog>

    <el-dialog title="操作结果" width="800px" :close-on-click-modal="false" :show-close="false" :visible.sync="errorResultVisible">
      <div>
        <template v-if="errorResult.length > 0">
          <div style="font-size: 28px">
            存在 <span class="warning-color">操作失败</span> 情况
          </div>
          <div style="margin-top: 20px">
            本次操作共有{{errorResult.length || 0}}位用户出现了问题，具体可点击下方的 “下载错误汇总” 按钮下载、查看相关信息
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

import Compensate from '@/partialviews/coupon/coupon/Compensate';
import DestoryUserCoupon from '@/partialviews/coupon/coupon/DestoryUserCoupon';
export default {
  name: 'couponRecords',
  components: {
    Compensate,
    DestoryUserCoupon
  },
  data() {
    return {
      code: '',

      currentPage: 1,
      pageCount: 10,
      count: 1,
      queryForm: {
        keyword: '',
        valid_status: '',
        is_compensate: '' //只有被销毁才需要这个参
      },
      filter: {
        keyword: '',
        valid_status: '',
        is_compensate: ''
      },
      dataList: [],
      types: [],  //类型
      use_types: [],

      validStatusTexts: {
        [1]: '正常，未使用',
        [2]: '不可用',
        [3]: '已被使用',
        [4]: '订单占用，暂不可用',
        [-1]: '已过期',
        [-2]: '已被销毁'
      },
      receiveTypeTexts: {
        [1]: '领取',
        [2]: '系统派券'
      },

      formData: {},
      couponData: {},

      selection: [],


      compensateVisible: false,
      destoryCouponVisible: false,
      
      errorResultVisible: false,  //派券结果
      errorResult: {},
      couponName: {},
    };
  },
  mounted() {
    
    this.code = this.$route.query.code;
    if(!this.code) {
      this.$message.error('优惠券不存在或已失效，正在返回');
      setTimeout(() => {
        this.$router.back();
      }, 2000)
      return;
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
      this.filter = {
        keyword: '',
        valid_status: '',
        is_compensate: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,
        valid_status: this.queryForm.valid_status,
        is_compensate: this.queryForm.is_compensate
      };
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        pageNumber: this.pageCount,
        keyword: this.filter.keyword,
        valid_status: this.filter.valid_status,
        is_compensate: this.filter.is_compensate,
        coupon_code: this.code
      };

      this.$get('/admin/coupon/userCoupon', queryVal, res => {
        this.dataList = res.data.list || [];
        this.count = res.data.pageTotal;
      });
    },
    
    getData() {
      if(!this.$auths.includes('coupon/info')) {
        return; 
      }
      let params = {
        code: this.code
      }
      this.$get('/admin/coupon/info', params, res => {
        let couponData = res.data;

        this.couponData = couponData;
        
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
    handleSizeChange(value) {
      this.pageCount = value;
      this.currentPage = 1;
      this.getList();
    },
    
    updateSelection(e){
      this.selection = e;
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

    
    showDestory(row) {
      this.formData = {
        uc_code: [row.uc_code],
        compensateCoupon: false,
        selectCoupon: '',
        selectCouponNumber: 1
      }
      this.destoryCouponVisible = true;
        
    },

    tryBatchDestory() {
      if(this.selection.length == 0) {
        return this.$message.error('请选择至少一条记录进行销毁操作');
      }
      for(let i = 0; i < this.selection.length; i++) {
        if(this.selection[i].valid_status != 1) {
          return this.$message.error('存在非正常状态的记录');
        }
      }
      this.formData = {
        uc_code: [],
        compensateCoupon: false,
        selectCoupon: '',
        selectCouponNumber: 1
      }
      for(let i = 0; i < this.selection.length; i++) {
        this.formData.uc_code.push(this.selection[i].uc_code);
      }
      this.destoryCouponVisible = true;
    },

    confirmDestory() {
      let params = {
        uc_code: this.formData.uc_code
      }
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
      this.$confirm('你确定销毁该被领取的用户优惠券？', '警告', {
        $confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      .then(() => {
        this.$post('/admin/coupon/destroyUserCoupon', params, res => {
          if(res.data.fail && !res.data.fail.length) {
            this.destoryCouponVisible = false;
            let couponName = {};
            for(let i = 0; i < res.data.couponInfo.length; i++) {
              couponName[res.data.couponInfo[i].code] = res.data.couponInfo[i].name;
            }
            this.couponName = couponName;
            this.tryConcatData(res.data.fail); //拼装数据
          } else {
            this.destoryCouponVisible = false;
            this.$message.success(`销毁用户优惠券成功`);
            this.reloadPage();
          }
        });
      })
      .catch(() => {});
    },

    tryCompensate() {
      if(this.selection.length == 0) {
        return this.$message.error('请选择至少一条记录进行补偿操作');
      }
      for(let i = 0; i < this.selection.length; i++) {
        if(this.selection[i].valid_status != -2 || this.selection[i].compensate_code) {
          return this.$message.error('存在不符合规则的记录。 只允许对 已销毁且未被补偿 的记录进行补偿操作； 建议筛选条件为 已被销毁 及 未补偿');
        }
      }
      this.formData = {
        type: 1,  //1批量 2直接一键全补偿
        code: this.code,
        selection: this.selection.slice(0),
        selectCoupon: '',
        selectCouponNumber: 1
      }
      this.compensateVisible = true;
    },
    comfirmCompensate() {
      let params = {
        code: this.formData.code,
        uc_code: []
      }
      if(this.formData.selection.length == 0) return this.$message.error('无有效待补偿记录，请检查');
      if(!this.formData.selectCoupon || this.formData.selectCoupon === '') {
        return this.$message.error('请选择要补发的优惠券');
      }
      if(!/^[1-9]\d*$/.test(this.formData.selectCouponNumber)) {
        return this.$message.error('补发优惠券要为正整数哦');
      }

      for(let i = 0; i < this.formData.selection.length; i++) {
        params.uc_code.push(this.formData.selection[i].uc_code);
      }

      params.couponCardList = {
        [this.formData.selectCoupon]: this.formData.selectCouponNumber
      }
      params.compensateCouponCode = this.formData.selectCoupon;
      
      
      
      this.$confirm('确定对这批记录进行补偿操作？', '警告', {
        $confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        this.$post('/admin/coupon/compensate', params, res => {
          if(res.data.fail && !res.data.fail.length) {
            this.compensateVisible = false;
            let couponName = {};
            for(let i = 0; i < res.data.couponInfo.length; i++) {
              couponName[res.data.couponInfo[i].code] = res.data.couponInfo[i].name;
            }
            this.couponName = couponName;
            this.tryConcatData(res.data.fail); //拼装数据
          } else {
            this.compensateVisible = false;
            this.$message.success(`补偿优惠券成功`);
            this.reloadPage();
          }
        });
      })
      .catch(() => {});
    },

    tryQuicklyCompensate() {
      this.formData = {
        type: 2,  //1批量 2直接一键全补偿
        code: this.code,
        selectCoupon: '',
        selectCouponNumber: 1
      }
      this.compensateVisible = true;
    },
    comfirmQuicklyCompensate() {
      
      let params = {
        code: this.formData.code
      }
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
      
      this.$confirm('确定对未补偿券的所有记录进行补偿操作？', '警告', {
        $confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      .then(() => {
        this.$post('/admin/coupon/compensate', params, res => {
          if(res.data.fail && !res.data.fail.length) {
            this.compensateVisible = false;
            let couponName = {};
            for(let i = 0; i < res.data.couponInfo.length; i++) {
              couponName[res.data.couponInfo[i].code] = res.data.couponInfo[i].name;
            }
            this.couponName = couponName;
            this.tryConcatData(res.data.fail); //拼装数据
          } else {
            this.compensateVisible = false;
            this.$message.success(`一键补偿优惠券成功`);
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
      XLSX.utils.book_append_sheet(wb, ws, "补发失败信息列表");

      let time = moment().format('YYYYMMDDHHmm');
      /* generate file and send to client */
      XLSX.writeFile(wb, `补发失败信息列表${time}.xlsx`);
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