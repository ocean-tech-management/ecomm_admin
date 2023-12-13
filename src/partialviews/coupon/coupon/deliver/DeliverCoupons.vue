<template>
  <div>
    <el-form label-width="100px">
      <div class="category-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="couponSelect">
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
          <el-form-item>
            <el-button type="primary" @click="queryInfo">筛选</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form-item label="优惠券筛选">
        <div class="coupon-area-select">
          <div class="coupon-area-wrapper">
            <div v-for="(item, index) in coupons" :class="{'coupon-area-item': true, 'active': couponIndex == index}"
              :key="index" @click="selectCoupon(index)" @dblclick="confirmCoupon">
              <template>{{item.name}}</template>
              <template>({{couponTypeContent(item)}}-{{item.t_name}}-{{item.us_name}})</template>

            </div>
          </div>
          <el-button type="primary" :disabled="coupons.length == 0" @click="confirmCoupon">确认 ></el-button>
        </div>
      </el-form-item>
      <el-form-item label="已选择优惠券">
        <div class="coupons-has-select">
          <div v-for="(coupon, index) in selectCoupons" class="coupon-has-select" :key="index">
            <div class="coupon-has-select-name">{{coupon.name}}</div>
            <div class="coupon-has-select-close" @click="deleteSelect(index)">×</div>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'DeliverCoupons',
    data() {
      return {
        queryForm: {
          type_code: '',
          used_code: ''
        },
        filter: {
          type_code: '',
          used_code: ''
        },
        types: [],  //类型
        use_types: [],
        coupons: [],
        couponIndex: 0,
        selectCoupons: []
      }
    },
    mounted() {
      this.getTypes();
      this.getUsed();
    },
    methods: {
      resetSelectCoupons(selectCoupons = []) {
        this.selectCoupons = JSON.parse(JSON.stringify(selectCoupons));      
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
      

      queryInfo() {
        this.filter = {
          keyword: this.queryForm.keyword
        };
        this.getCoupons();
      },
      getCoupons() {
        
        let queryVal = {
          type_code: this.filter.type_code,
          used_code: this.filter.used_code,
          valid_status: 1
        };

        this.$get('/admin/coupon/list', queryVal, res => {
          this.coupons = res.data || [];
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

      selectCoupon(index) {
        this.couponIndex = index;
      },
      confirmCoupon() {
        let selectCoupons = this.selectCoupons;
        let hasSelect = false;
        for(let i = 0; i < selectCoupons.length; i++) {
          if(selectCoupons[i].code == this.coupons[this.couponIndex].code) {
            hasSelect = true;
            break;
          }
        }
        if(!hasSelect) this.selectCoupons.push({
          code: this.coupons[this.couponIndex].code,
          name: this.coupons[this.couponIndex].name,
          t_type: this.coupons[this.couponIndex].t_type,
          u_name: this.coupons[this.couponIndex].u_name,
          t_name: this.coupons[this.couponIndex].t_name,
          us_name: this.coupons[this.couponIndex].us_name,
          with_amount: this.coupons[this.couponIndex].with_amount,
          used_amount: this.coupons[this.couponIndex].used_amount,
          with_discount: this.coupons[this.couponIndex].with_discount,
          take_limit: this.coupons[this.couponIndex].take_limit,
          count: 1
        });
      },
      deleteSelect(index) {
        this.selectCoupons.splice(index, 1);
      },
      confirmResult() {
        return JSON.parse(JSON.stringify(this.selectCoupons));
      }
    }
  }

</script>
<style lang="less" scoped>
.coupon-area-select {
  display: flex;
  align-items: center;
}
.coupon-area-wrapper {
  width: 350px;
  height: 300px;
  margin: 0 15px 0 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}

.coupon-area-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  coupon-select: none;
  cursor: pointer;
}
.coupon-area-item:hover {
  background-color: #f2f3f3;
}
.coupon-area-item.active {
  color: #fff;
  background-color: #618df5;
}


.coupons-has-select {
  display: flex;
  flex-wrap: wrap;
}
.coupon-has-select {
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 2px 10px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 5px;
  line-height: 1.4;
  background-color: #f2f3f3;
  coupon-select: none;
}
.coupon-has-select-name {
  max-width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
}
.coupon-has-select-phone {
  
}
.coupon-has-select-close {
  margin-left: 5px;
  padding: 2px 10px;
  font-size: 24px;
  font-weight: bolder;
  cursor: pointer;
  &:hover {
    background-color: #ccc;
  }
}
</style>
