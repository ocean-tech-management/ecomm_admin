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
          <div class="form-content-static">{{formData.us_name}}</div>
        </el-form-item>
        <el-form-item label="是否隐藏" label-width="300px">
          <el-checkbox :true-label="2" :false-label="1" v-model="formData.show_status">隐藏</el-checkbox>
        </el-form-item>
        <el-form-item label="优惠类型" label-width="300px">
          <div class="form-content-static">{{formData.u_name}}</div>
        </el-form-item>

        <!-- 优惠类目 -->
        <el-form-item v-if="formData.used == 20" label="优惠类目项" label-width="300px">
          <div class="results">
            <div v-if="formData.category.length == 0" class="form-tips">暂未选择优惠类目</div>
            <div v-for="item in formData.category" class="result" :key="item.code">
              <div class="result-title">{{item.name}}</div>
            </div>
          </div>
        </el-form-item>

        <!-- 优惠商品 -->
        <el-form-item v-if="formData.used == 30" label="优惠商品项" label-width="300px">
          <div class="results">
            <div v-if="formData.goods.length == 0" class="form-tips">暂未选择优惠类目</div>
            <div v-for="item in formData.goods" class="result" :title="item.title + ' (' + item.attrs + ')'" :key="item.sku_sn">
              <div class="result-title">{{item.title}} {{item.attrs ? (' (' + item.attrs + ')') : ''}}</div>
            </div>
          </div>
        </el-form-item>
        




        <el-form-item label="类型" label-width="300px">
          <div class="form-content-static">{{formData.t_name}}</div>
        </el-form-item>

        <el-form-item label="优惠内容" label-width="300px">
          <div class="form-content-static">{{couponTypeContent(formData)}}</div>
        </el-form-item>

         <!-- 折扣上限 -->
        <el-form-item v-if="formData.type == 4" label="最高可抵" label-width="300px">
          <div class="form-content-static">{{formData.used_amount}}</div>
        </el-form-item>


        <!-- <el-form-item label="特价商品可用" label-width="300px">
          {{formData.with_special == 1 ? '可用' : '不可用'}}
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
          <div class="form-content-static">{{formData.number}}张</div>
        </el-form-item>

        <el-form-item label="每人限领" label-width="300px">
          <el-input 
            style="width: 250px;"
            auto-complete="off"
            placeholder="请填入" 
            type="number"
            v-model="formData.take_limit"
          ></el-input>
          <div class="form-tips">每人限领数量（正整数）</div>
        </el-form-item>

 


        <el-form-item label="" label-width="300px">
          <el-button type="primary" @click="editItem">确认编辑</el-button>
        </el-form-item>
      </div>
    </div>



  </el-form>
</template>

<script>
import moment from 'moment';
import { publishDate } from '@/config.js';

export default {
  name: 'editCoupons',
  data() {
    return {
      formData: {

      },
      types: [],
      use_types: [],
      token: {
        token: localStorage.getItem('token') || ''
      },
      discountCategories: [],
      discountCommodities: [],

    };
  },
  mounted() {
    if(!this.$route.query.code) {
      this.$message.error('所选择优惠券有问题，将返回列表');
      return this.$router.replace('coupons');
    }
    if(!this.$auths.includes('coupon/info')) {
      this.$message.error('用户缺少查看详情的权限，请联系管理员开通');
      return this.$router.replace('coupons');
    }
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        code: this.$route.query.code
      }
      this.$get('/admin/coupon/info', params, res => {
        let formData = res.data;
        for(let i = 0; i < formData.goods.length; i++) {
          let specs = JSON.parse(formData.goods[i].specs);
          formData.goods[i].attrs = Object.values(specs).join('、');
        }
        if(formData.valid_type == 1) {
          formData.valid_timespan = [
            moment(formData.valid_start_time).format('YYYY-MM-DD HH:mm:ss'), 
            moment(formData.valid_end_time).format('YYYY-MM-DD HH:mm:ss')
          ]
        }
        formData.timespan = [
          moment(formData.start_time).format('YYYY-MM-DD HH:mm:ss'), 
          moment(formData.end_time).format('YYYY-MM-DD HH:mm:ss')
        ];
        this.formData = formData;
        
      });
    },
    
    couponTypeContent(item) {
      if(item.t_type == 1) {
        return `满${item.with_amount}减${item.used_amount}`
      } else if(item.t_type == 2) {
        return `满${item.with_amount}减${item.used_amount}(可叠加)`
      } else if(item.t_type == 3) {
        return `无门槛减${item.used_amount}`
      } else if(item.t_type == 4) {
        return `打折券${item.with_discount * 1000 / 100}折`
      } else if(item.t_type == 5) {
        return item.with_condition === 1 ? `满${item.with_amount}抵扣${item.used_amount}` : `抵扣${item.used_amount}`;
      } else {
        return ''
      }
    },

    editItem() {
      // 处理数据
      let params = {
        code: this.formData.code,
        name: this.formData.name,
        desc: this.formData.desc,
        valid_type: this.formData.valid_type,
        valid_timespan: this.formData.valid_timespan,
        valid_days: this.formData.valid_days,
        timespan: this.formData.timespan,
        take_limit: this.formData.take_limit
      }

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
      
      if(!/^-?[1-9]\d*$/.test(params.take_limit) || params.take_limit < -1 ) {
        return this.$message.error('限领量要为大于等于-1的整数哦');
      }
      this.$confirm(
        `修改优惠券将可能影响用户已领取未使用的券, 是否继续?`,
        "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      .then(() => {
        this.$post('/admin/coupon/update', params, res => {
          this.$message.success('编辑优惠券成功，正在返回列表');
          setTimeout(() => {
            localStorage.setItem('shouldRefresh', 'on');
            this.$router.replace('coupons');
          }, 1500)
        });
      })
      .catch(() => {});
      
    },
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