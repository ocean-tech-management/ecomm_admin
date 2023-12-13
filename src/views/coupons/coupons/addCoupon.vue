<template>
  <el-form :model="formData">
    <div class="subpage-content">
      <div class="default-container">
        <el-form-item label="是否开启" label-width="300px">
          <el-radio-group v-model="formData.valid_status">
            <el-radio :label="1">开启</el-radio>
            <el-radio :label="2">不开启</el-radio>
          </el-radio-group>
          <div class="form-tips">关闭后,用户无法领取, 但是已经被领取的可以继续使用</div>
        </el-form-item>
        <el-form-item label="优惠名称" label-width="300px">
          <el-input auto-complete="off" placeholder="指定商品满减" v-model="formData.name"></el-input>
        </el-form-item>
        <el-form-item label="简介" label-width="300px">
          <el-input
            auto-complete="off"
            type="textarea"
            placeholder="简单描述一下优惠券的规则介绍哦"
            v-model="formData.desc"
          ></el-input>
        </el-form-item>
        <el-form-item label="使用时间限制" label-width="300px">
          <el-radio-group v-model="formData.valid_type">
            <div class="form-with-ctrl">
              <div class="form-with-ctrl-ctrl">
                <el-radio :label="2">获得后</el-radio>
              </div>
              <el-input
                class="form-with-ctrl-content"
                auto-complete="off"
                placeholder="请填入" 
                type="number"
                v-model="formData.valid_days"
                :disabled="formData.valid_type != 2"
              ></el-input>
              <div class="form-with-ctrl-ctrl">天内有效</div>
            </div>
            <div class="form-with-ctrl">
              <div class="form-with-ctrl-ctrl">
                <el-radio :label="1">日期</el-radio>
              </div>
              <el-date-picker
                class="form-with-ctrl-content"
                v-model="formData.valid_timespan"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :editable="false" 
                :disabled="formData.valid_type != 1"
              ></el-date-picker>
              <div class="form-with-ctrl-ctrl">内有效</div>
            </div>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="谁可领" label-width="300px">
          <el-select placeholder name="take_user_type" v-model="formData.take_user_type">
            <el-option v-for="item in user_types" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否隐藏" label-width="300px">
          <el-checkbox :true-label="2" :false-label="1" v-model="formData.show_status">隐藏</el-checkbox>
        </el-form-item>
        <el-form-item label="优惠类型" label-width="300px">
          <el-select placeholder name="used" v-model="formData.used">
            <el-option v-for="item in use_types" :label="item.u_name" :value="item.u_type" :key="item.u_type"></el-option>
          </el-select>
        </el-form-item>

        <!-- 优惠类目 -->
        <el-form-item v-if="formData.used == 20" label="优惠类目" label-width="300px">
          <el-button type="primary" @click="showDiscountCategories">选择适用类目</el-button>
        </el-form-item>
        <el-form-item v-if="formData.used == 20" label="优惠类目项" label-width="300px">
          <div class="results">
            <div v-if="discountCategories.length == 0" class="form-tips">暂未选择优惠类目</div>
            <div v-for="(item, index) in discountCategories" class="result" :key="item.code">
              <div class="result-title">{{item.name}}</div>
              <div class="result-close" @click="deleteDiscountCategory(index)">×</div>
            </div>
          </div>
        </el-form-item>

        <!-- 优惠商品 -->
        <el-form-item v-if="formData.used == 30" label="优惠商品" label-width="300px">
          <el-button type="primary" @click="showDiscountCommedities">选择适用商品</el-button>
        </el-form-item>
        <el-form-item v-if="formData.used == 30" label="优惠商品项" label-width="300px">
          <div class="results">
            <div v-if="discountCommodities.length == 0" class="form-tips">暂未选择优惠商品项</div>
            <div v-for="(item, index) in discountCommodities" class="result" :title="item.title + ' (' + item.attrs + ')'" :key="item.sku_sn">
              <div class="result-title">{{item.title}} {{item.attrs ? (' (' + item.attrs + ')') : ''}}</div>
              <div class="result-close" @click="deleteDiscountCommodities(index)">×</div>
            </div>
          </div>
        </el-form-item>
        




        <el-form-item label="类型" label-width="300px">
          <el-radio-group v-model="formData.type">
            <el-radio v-for="item in types" :label="item.t_type"  :key="item.t_type">{{item.t_name}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 满减 -->
        <el-form-item v-if="formData.type == 1 || formData.type == 2" label="金额" label-width="300px">
          <div class="full-discount-coupon">
            <label class="full-discount-label">
              <div class="full-discount-label-tip">满</div>
              <el-input
                class="full-discount-input"
                auto-complete="off"
                placeholder="多少"
                v-model="formData.with_amount"
              ></el-input>
            </label>
            <label class="full-discount-label">
              <div class="full-discount-label-tip">减</div>
              <el-input
                class="full-discount-input"
                auto-complete="off"
                placeholder="多少"
                v-model="formData.used_amount"
              ></el-input>
            </label>
          </div>

        </el-form-item>

        <!-- 打折 -->
        <el-form-item
          v-if="formData.type == 4"
          label="折扣力度"
          label-width="300px"
        >
          <el-input
            style="width: 150px;"
            type="number"
            auto-complete="off"
            placeholder="请填写折扣哦"
            v-model="formData.with_discount"
          ></el-input>
          <div class="form-tips">0.01-1.00范围内，两位小数</div>
        </el-form-item>
        <!-- 折扣上限 -->
        <el-form-item v-if="formData.type == 4" label="最高可抵" label-width="300px">
          <el-input style="width: 150px;" auto-complete="off" placeholder="请填入" type="number" v-model="formData.used_amount"></el-input> 元
          <div class="form-tips">该折扣最高可以抵扣多少费用</div>
        </el-form-item>

        <!-- 抵扣 -->
        <el-form-item
          v-if="formData.type == 3 || formData.type == 5"
          label="代金金额"
          label-width="300px"
        >
          <el-input
            style="width: 150px;"
            type="number"
            auto-complete="off"
            placeholder="记得填写金额哦"
            v-model="formData.used_amount"
          ></el-input> 元
        </el-form-item>

        <!-- 当前仅在抵扣券使用，后续考虑满额打折 -->
        <el-form-item v-if="formData.type == 5" label="使用条件 - 订单金额" label-width="300px">
          <el-input style="width: 150px;" auto-complete="off" placeholder="请填入" type="number" v-model="formData.with_amount"></el-input> 元
          <div class="form-tips">消费满多少金额才可以使用该优惠券 (设置为 0 则不限制消费金额)</div>
        </el-form-item>

        <!-- <el-form-item label="特价商品可用" label-width="300px">
          <el-checkbox @change="updateWithSpecial">可用</el-checkbox>
        </el-form-item> -->

        
        <el-form-item label="用户可领取时间" label-width="300px">
          <el-date-picker
            v-model="formData.timespan"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            :editable="false"
          ></el-date-picker>
        </el-form-item>


        <el-form-item label="发行量" label-width="300px">
          <el-input
            style="width: 250px;"
            type="number"
            auto-complete="off"
            placeholder="记得填写这个发行量哦"
            v-model="formData.number"
          ></el-input>
          <div class="form-with-ctrl" style="width: 250px;">
              <div class="form-with-ctrl-ctrl">
                单人限领张数
              </div>
              <el-input 
                class="form-with-ctrl-content"
                auto-complete="off"
                placeholder="请填入" 
                type="number"
                v-model="formData.take_limit"
              ></el-input>
            </div>
            <div class="form-tips">每人限领数量（正整数）</div>
        </el-form-item>

 


        <el-form-item label="" label-width="300px">
          <el-button type="primary" @click="addItem">确认创建</el-button>
        </el-form-item>
      </div>
    </div>

    <el-dialog title="添加优惠类目" width="900px" :close-on-click-modal="false" :visible.sync="discountCategoriesVisbible">
      <DiscountCategory :formData="discountCategories"></DiscountCategory>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="discountCategoriesVisbible = false">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加优惠商品" width="900px" :close-on-click-modal="false" :visible.sync="discountCommoditiesVisbible">
      <DiscountCommodity :formData="discountCommodities"></DiscountCommodity>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="discountCommoditiesVisbible = false">确 定</el-button>
      </div>
    </el-dialog>


  </el-form>
</template>

<script>
import moment from 'moment';

import DiscountCommodity from '@/partialviews/coupon/coupon/addOrEdit/DiscountCommodity';
import DiscountCategory from '@/partialviews/coupon/coupon/addOrEdit/DiscountCategory';

export default {
  name: 'addCoupons',
  components: {
    DiscountCommodity,
    DiscountCategory
  },
  data() {
    return {
      formData: {
        name: '',
        valid_status: 1,
        with_amount: 0.00,
        with_discount: 1,
        used_amount: 0.00,
        with_special: false,    //最后需要处理，true为1， false为2
        show_status: 1, //1显示 2隐藏
        with_condition: 1,
        type: '',
        used: '',
        take_user_type: '',
        valid_type: 2,
        valid_days: '',
        valid_timespan: [moment().format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],//提交的时候要拆出来 valid_start_time 和 valid_end_time
        timespan: [],//提交的时候要拆出来 start_time 和 end_time
        number: 2000,
        take_limit: 1,
        desc: ''
      },
      types: [],
      use_types: [],
      user_types: [],
      token: {
        token: localStorage.getItem('token') || ''
      },
      discountCategories: [],
      discountCategoriesVisbible: false,
      discountCommodities: [],
      discountCommoditiesVisbible: false,
    };
  },
  mounted() {
    this.getTypes();
    this.getUsed();
    this.getUserType();
  },
  methods: {
    getTypes() {
      this.$get('/admin/coupon/type', null, res => {
        this.types = res.data;
        this.formData.type = res.data[0].t_type;
      });
    },
    getUsed() {
      this.$get('/admin/coupon/used', null, res => {
        this.use_types = res.data;
        this.formData.used = res.data[0].u_type;
      });
    },
    getUserType() {
      this.$get('/admin/coupon/userType', null, res => {
        this.user_types = res.data;
        this.formData.take_user_type = res.data[0].u_type;
      });
    },
    updateWithSpecial(val) {
      this.formData.with_special = val;
    },
    addItem() {
      // 处理数据
      let params = JSON.parse(JSON.stringify(this.formData));
      params.with_special = params.with_special ? 1: 2;
      // 删掉无用的时间值
      if(params.valid_type == 2) {
        delete(params.valid_timespan);
      } else {
        params.valid_start_time = parseInt(moment(params.valid_timespan[0]).valueOf() / 1000);
        params.valid_end_time = parseInt(moment(params.valid_timespan[1]).valueOf() / 1000);
        delete(params.valid_days);
        delete(params.valid_timespan);  //删掉无用的时间数组
      }
      
      if(params.timespan && params.timespan.length > 0) {
        params.start_time = parseInt(moment(params.timespan[0]).valueOf() / 1000);
        params.end_time = parseInt(moment(params.timespan[1]).valueOf() / 1000);
        delete params.timespan;
      }

      
      if(params.used == 20) {
        // 优惠类目
        let categories = [];
        for(let i = 0; i < this.discountCategories.length; i++) {
          categories.push(this.discountCategories[i].code);
        }
        params.with_category = categories.toString();
      } else if(params.used == 30) {
        // 优惠商品
        let commodities = [];
        for(let i = 0; i < this.discountCommodities.length; i++) {
          commodities.push(this.discountCommodities[i].sku_sn);
        }
        params.with_goods_sn = commodities.toString();
      }


      if(params.type == 3 || params.type == 4) {
        params.with_amount = '0.00';
      }
      if(parseFloat(params.with_amount) == 0) {
        params.with_condition = 2; //with_amount为0，为没有使用限制
      } else {
        params.with_condition = 1;
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息哦');
        }
      }
      if(params.valid_type == 2) {
        if(!/^[1-9]\d*$/.test(params.valid_days)) {
          return this.$message.error('获得后的有效时间限制要为正整数哦');
        }
      }
      if(!params.start_time || !params.end_time) {
        return this.$message.error('要设置用户可领取时间哦');
      }
      if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.with_amount)) {
        return this.$message.error('门槛价格要为正数哦');
      }
      if(!(/^(\d|[0-9]\d+)(\.\d+)?$/.test(params.used_amount)) || parseFloat(params.used_amount) <= 0) {
        return this.$message.error('代金金额得是大于等于0的数字');
      }
      if(!/^[1-9]\d*$/.test(params.number)) {
        return this.$message.error('发行量要为正整数哦');
      }
      if(!/^-?[1-9]\d*$/.test(params.take_limit) || params.take_limit < -1 ) {
        return this.$message.error('限领量要为大于等于-1的整数哦');
      }
      if(params.type == 4) {
        if(parseFloat(params.with_discount) < 0.01 || parseFloat(params.with_discount) > 1) return this.$message.error('折扣要在0.01到1之间哦');
      }
    

      // 处理成两位小数
      params.with_amount = parseFloat(params.with_amount).toFixed(2);
      params.used_amount = parseFloat(params.used_amount).toFixed(2);
      params.with_discount = parseFloat(params.with_discount).toFixed(2);

      this.$post('/admin/coupon/create', params, res => {
        this.$message.success('添加优惠券成功，正在返回列表');
        setTimeout(() => {
          localStorage.setItem('shouldRefresh', 'on');
          this.$router.replace('coupons');
        }, 1500)
      });
      
    },
    // 优惠分类弹窗
    showDiscountCategories() {
      if(!this.$auths.includes('category/list')) {
        return this.$message.warning('您缺少查看分类列表的权限，无法正常添加优惠分类，请联系管理员为您添加'); 
      }
      this.discountCategoriesVisbible = true;
    },
    // 优惠商品弹窗
    showDiscountCommedities() {
      if(!this.$auths.includes('spu/list')) {
        return this.$message.warning('您缺少查看商品列表的权限，无法正常添加优惠商品，请联系管理员为您添加'); 
      }
      this.discountCommoditiesVisbible = true;
    },

    deleteDiscountCategory(index) {
      this.discountCategories.splice(index, 1);
    },
    deleteDiscountCommodities(index) {
      this.discountCommodities.splice(index, 1);
    }
  }
};
</script>

<style lang="less" scoped>
.full-discount-coupon {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.full-discount-label {
  display: flex;
  align-items: center;
  margin: 0 15px 0 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.full-discount-label-tip {
  margin: 0 0 0 15px;
  color: #999;
}
.full-discount-input {
  width: 120px;
}


.results {
  display: flex;
  flex-wrap: wrap;
}
.result {
  display: flex;
  align-items: center;
  max-width: 100%;
  margin-right: 15px;
  margin-bottom: 5px;
  padding: 2px 10px;
  border-radius: 5px;
  box-sizing: border-box;
  white-space: nowrap;
  background-color: #f2f3f3;
}
.result-title {
  flex: 1;
  width: 80rpx;
  text-overflow: ellipsis;
  overflow: hidden;
}
.result-close {
  padding: 0 5px;
  margin-left: 5px;
  font-size: 20px;
  cursor: pointer;
}
.result-close:hover {
  color: #618df5;
}
</style>
<style>
.full-discount-input .el-input__inner {
  border: none;
}
</style>