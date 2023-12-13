<template>
  <div>
    <el-form :model="formData" label-width="160px">
      <el-form-item label="是否补偿被销券的用户">
        <el-radio-group name="compensate" v-model="formData.compensateCoupon">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.compensateCoupon">
        <el-form-item label="补发优惠券">
          <el-select placeholder="请输入优惠券名进行筛选" name="selectCoupon" filterable remote :loading="couponsLoading" v-model="formData.selectCoupon" :remote-method="updateCouponFilter">
            <el-option v-for="item in coupons" :label="item.name" :value="item.code" :key="item.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="补发优惠券数">
          <div class="form-content-static">{{formData.selectCouponNumber}}</div>
          <!-- <el-input style="width: 200px" auto-complete="off" placeholder="填一下" v-model="formData.selectCouponNumber" type="number"></el-input> -->
        </el-form-item>
      </template>
      <!-- <div v-if="formData.compensateCoupon">
        <div class="table-ctrls">
          <div class="table-title">补偿券包内优惠券组合</div>
          <div class="table-ctrl">
            <el-button type="primary" @click="showSelectCoupons">点击选择优惠券</el-button>
          </div>
        </div>
        <el-table style="width: 100%" :data="formData.couponcardlist">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="优惠名称" prop="name" width="250"></el-table-column>
          <el-table-column label="优惠方式" width="120">
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
          <el-table-column label="限领" width="80">
            <template slot-scope="scope">{{scope.row.take_limit || ''}}</template>
          </el-table-column>
          <el-table-column label="数量" prop="total_balance">
            <template slot-scope="scope">
              <el-input style="width: 150px" auto-complete="off" placeholder="填一下" v-model="formData.couponcardlist[scope.$index].count" type="number"></el-input>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <el-button class="error-color" type="text" size="small" @click="deleteCoupon(scope.$index)">剔除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div> -->

    </el-form>
    
    <!-- <el-dialog title="选择优惠券" width="800px" :append-to-body="true" :close-on-click-modal="false" :visible.sync="couponsVisible">
      <DeliverCoupons ref="deliverCoupons"></DeliverCoupons>
      <div slot="footer" class="dialog-footer">
        <el-button @click="couponsVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCoupons">确 定</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
// import DeliverCoupons from '@/partialviews/coupon/DeliverCoupons';
export default {
  name: "DestoryUserCoupon",
  components: {
    // DeliverCoupons
  },
  data() {
    return {
      couponsVisible: false,

      // 选用了另一种方案
      couponsLoading: false,
      coupons: false
    };
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
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

    updateCouponFilter(keyword) {
      this.getCoupons(keyword)
    },
    getCoupons(keyword = '') {
      let queryVal = {
        keyword: keyword,
        valid_status: 1,
        page: 1
      };
      this.couponsLoading = true;
      this.$get('/admin/coupon/list', queryVal, res => {
        this.couponsLoading = false;
        this.coupons = res.data.list || [];
      }, err => {
        this.couponsLoading = false;
      });
    },



    // showSelectCoupons() {
    //   if(this.$refs.deliverCoupons) this.$refs.deliverCoupons.resetSelectCoupons(this.formData.couponcardlist);
    //   this.couponsVisible = true;
    // },
    // confirmCoupons() {
    //   this.formData.couponcardlist = this.$refs.deliverCoupons.confirmResult();
    //   console.log(this.formData.couponcardlist);
    //   this.couponsVisible = false;
    // },
    // deleteCoupon(index) {
    //   this.$confirm('确认从券包中剔除该优惠券？', '警告', {
    //     $confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   })
    //   .then(() => {
    //     this.formData.couponcardlist.splice(index, 1);
    //   })
    //   .catch(() => {});
    // },
  }
};
</script>

<style scoped>
  .leader-condition {
    margin-bottom: 10px;
  }
</style>