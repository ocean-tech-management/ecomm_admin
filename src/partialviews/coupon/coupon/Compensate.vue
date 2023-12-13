<template>
  <div>
    <el-form :model="formData" label-width="160px">
      <template>
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
    </el-form>



    <div v-if="formData.type == 1" style="margin-top: 15px">
      <div class="table-ctrls">
        <div class="table-title">选中的待补偿记录</div>
      </div>

      <el-table :data="formData.selection" max-height="600px">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column label="券号" width="170" prop="uc_code"></el-table-column>
        <el-table-column label="头像" width="80">
          <template slot-scope="scope">
            <img class="thumb-img" :src="scope.row.user_avatarUrl"/>
          </template>
        </el-table-column>
        <el-table-column label="姓名" prop="user_name">
        </el-table-column>
        <el-table-column label="手机号码" prop="phone">
        </el-table-column>

        
        <el-table-column label="操作" width="80">
          <template slot-scope="scope">
            <el-button class="error-color" type="text" size="small" @click="deleteItem(scope.$index)">剔除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>
<script>
export default {
  name: 'Compensate',
  data() {
    return {
      
      // 选用了另一种方案
      couponsLoading: false,
      coupons: false
    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
    
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
    deleteItem(index) {
      this.formData.selection.splice(index, 1);
    }
  }
}
</script>