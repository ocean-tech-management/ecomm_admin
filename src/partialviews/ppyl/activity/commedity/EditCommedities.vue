<template>
  <div>
    
    <el-form :model="formData" label-width="100px">
      <el-form-item label="" label-width="0">
        <el-table style="width: 100%" :data="formData.goods">
          <el-table-column label="名称" prop="title">
          </el-table-column>
          <el-table-column label="规格" prop="attrs">
          </el-table-column>
          <el-table-column label="销售价格" width="150" prop="sale_price">
          </el-table-column>
          <el-table-column label="活动价" width="150">
            <template slot-scope="scope">
              <el-input style="width: 120px" auto-complete="off" placeholder="填一下" v-model="formData.goods[scope.$index].activity_price" type="number" @change="updateRewardVal(scope.$index)"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="红包补偿预估" width="150" prop="rewardVal">
            <template slot-scope="scope">
              <div v-if="scope.row.rewardVal == '——'" class="error-color">活动价有误</div>
              <div v-else>
                <span class="success-color">{{scope.row.rewardVal || 0}}</span> / 人
              </div>
            </template>
          </el-table-column>

          
          <el-table-column label="操作" width="80">
            <template slot-scope="scope">
              <!-- <template v-if="$auths.includes('ppyl/goodsSkuDelete')"> -->
                <el-button type="text" size="small" @click="deleteCommedity(scope.$index)">删除</el-button>
              <!-- </template> -->
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-if="formData.limit_type == 1" label="限制时间">
        <el-date-picker
          v-model="formData.time"
          type="datetimerange"
          :picker-options="formPickerOptions"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm:ss"
          value-format="yyyy-MM-dd HH:mm:ss"
          :editable="false"
        ></el-date-picker>
        <div class="form-tips">当橱窗商品参与了有时间限制的活动，以活动的开始结束时间为准</div>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: 'EditCommedities',
  data() {
    return {
      leaderData: [],

      ...formNTimePickerConfig
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    if(!this.leaderData || this.leaderData.length == 0) {
      this.getVdc();
    }
  },
  methods: {
    updateRewardVals() {
      for(let i = 0; i < this.formData.goods.length; i++) {
        this.updateRewardVal(i);
      }
    },
    getVdc() {
      let leaderData = [{
        level: 0,
        name: '注册用户'
      }];
      this.$get('/admin/vdc/list', null, res => {
        for(let i = res.data.length - 1; i >= 0; i--) {
          leaderData.push(res.data[i]);
        }
        this.leaderData = leaderData;
      });
    },
    deleteCommedity(index) {
      this.$confirm('是否删除该sku，该操作不可恢复，请确认', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          area_code: this.formData.area_code,
          goods_sn: this.formData.goods[index].goods_sn,
          sku_sn: this.formData.goods[index].sku_sn
        }
        this.$post('/admin/ppyl/goodsSkuDelete', params, res => {
          this.formData.goods.splice(index, 1);
          this.$message.success('删除成功')
        });
      }).catch(() => {});
      
    },
    updateRewardVal(index) {
      console.log(this.formData.goods[index]);
      let rewardVal = '——';
      if(/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.formData.goods[index].activity_price)) {
        //必须符合规则
        // reward_scale为百分比，需要×0.01
        rewardVal = parseFloat(this.formData.goods[index].activity_price) * parseFloat(this.formData.goods[index].reward_scale) * 0.01;
        rewardVal = rewardVal.toFixed(2);
      }
      this.formData.goods[index].rewardVal = rewardVal;
    }
  }
};
</script>
