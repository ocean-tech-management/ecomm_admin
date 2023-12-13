<template>
  <div>
    <el-form :model="formData" label-width="110px">
      <el-form-item label="用户名">
        <el-input style="width: 280px;" disabled v-model="formData.user_name"></el-input>
      </el-form-item>
      <el-form-item label="手机号码">
        <el-input style="width: 280px;" disabled v-model="formData.user_phone"></el-input>
      </el-form-item>
      <el-form-item label="编码">
        <el-input style="width: 280px;" disabled v-model="formData.limit_sn"></el-input>
      </el-form-item>
      <el-form-item label="限制类型" prop="type">
        <el-select v-model="formData.type" placeholder="" name="type" style="width: 280px;">
          <el-option v-for="(item, key) in typeTexts" :key="key" :label="item" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="限制操作类型" prop="limit_type">
        <el-select v-model="formData.limit_type" placeholder="" name="limit_type" style="width: 280px;">
          <el-option v-for="(item, key) in limitTypeTexts" :key="key" :label="item" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="限制钱包类型" prop="balance_type">
        <el-select @change="judgeBalancetType" v-model="formData.balance_type" placeholder="" name="balance_type"
          style="width: 280px;">
          <el-option v-for="(item, key) in balanceTypeTexts" :key="key" :label="item" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="判断账户类型" prop="judge_balance_type">
        <el-select @change="judgeBalancetType" v-model="formData.judge_balance_type" placeholder=""
          name="judge_balance_type" style="width: 280px;">
          <el-option v-for="(item, key) in judgeBalanceTypeTexts" :key="key" :label="item" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="判断方式" prop="judge_method">
        <el-select v-model="formData.judge_method" placeholder="" name="judge_method" style="width: 280px;">
          <el-option v-for="(item, key) in judgeMethodTexts" :key="key" :label="item" :value="key"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="限制额度">
        <el-input style="width: 280px;" auto-complete="off" placeholder="" type="number"
          v-model="formData.limit_price"></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input style="width: 280px" auto-complete="off" placeholder="请填写" v-model="formData.remark"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'edit',
  data() {
    return {
      typeTexts: {
        [1]: '全额禁止操作',
        [2]: '超出额度部分可操作',
        [3]: '累计额度内可操作'
      },
      limitTypeTexts: {
        [1]: '提现',
        [2]: '转赠',
        [3]: '转换',
        [4]: '提现+转赠'
      },
      balanceTypeTexts: {
        // [1]: '商城钱包',
        // [2]: '广宣奖钱包',
        // [3]: '团队钱包',
        // [4]: '区代钱包',
        // [5]: '股东奖钱包',
        [6]: '集品券钱包',
        // [7]: '集品豆钱包',
        // [8]: '健康豆钱包',
        // [9]: '礼品券钱包',
        [10]: '团长端总余额钱包',
        // [88]: '全部余额',
      },
      judgeBalanceTypeTexts: {
        // [1]: '商城钱包',
        // [2]: '广宣奖钱包',
        // [3]: '团队钱包',
        // [4]: '区代钱包',
        // [5]: '股东奖钱包',
        [6]: '集品券钱包',
        // [7]: '集品豆钱包',
        // [8]: '健康豆钱包',
        // [9]: '礼品券钱包',
        [10]: '团长端总余额钱包',
        [11]:'参与福利冻结额度',
        [12]:'集品券可用余额 + 参与福利冻结额度'
        // [88]: '全部余额',
      },
      judgeMethodTexts:{
        [1]:"同时成立",
        [2]:"部分成立"
      }
    };
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
    judgeBalancetType(val){
      this.formData.judge_balance_type=val;
      this.$forceUpdate()
    }
  }
};
</script>
