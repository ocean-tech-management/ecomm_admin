<template>
  <div>
    <div>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="指定用户">
          <div class="form-content-static">{{formData.user_name}}</div>
        </el-form-item>
        <el-form-item label="额外提现额度">
          <el-input style="width: 250px" auto-complete="off" placeholder="请填写" type="number" v-model="formData.price"></el-input>
        </el-form-item>
        <el-form-item label="生效类型">
          <el-select placeholder="请选择" name="valid_type" v-model="formData.valid_type">
            <el-option label="永久生效" :value="1"></el-option>
            <el-option label="有限期生效" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.valid_type == 2" label="有效期" prop="createDate">
          <el-date-picker
            v-model="createDate"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            :clearable="false"
            align="right"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="备注">
          <el-input style="width: 450px" auto-complete="off" placeholder="请填写" v-model="formData.remark"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import {nTimePickerConfig} from '@/config';
export default {
  name: "EditUserExtraWithdrawLimit",
  data() {
    return {

      userIndex: '',
      createDate: [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
      ...nTimePickerConfig,
    };
  },
  props: {
    formData: Object
  },
  mounted() {
    this.resetData(this.formData)
  },
  methods: {
    resetData(data) {
      if(data.valid_type == 2) {
        this.createDate = [moment(data.valid_start_time).format('YYYY-MM-DD HH:mm:ss'), moment(data.valid_end_time).format('YYYY-MM-DD HH:mm:ss')];
      } else {
        this.createDate = [moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')];
      }
      
    },

    confirmInfos() {
      let data = {
        ...this.formData,
        valid_start_time: '',
        valid_end_time: ''
      }
      if(this.createDate) {
        data.valid_start_time = this.createDate[0];
        data.valid_end_time = this.createDate[1];
      }
      return data;
    }


  }
};
</script>