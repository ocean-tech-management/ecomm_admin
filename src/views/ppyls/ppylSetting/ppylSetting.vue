<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="table-ctrls">
        <div class="table-title">拼拼活动设置</div>
        
      </div>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="排队超时时间">
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="填一下排队超时时间呗" v-model="formData.wait_expire_time_val"></el-input>
          <el-select style="width: 150px" placeholder="请选择时间类型" name="expire_time_type" v-model="formData.wait_expire_time_type">
            <el-option label="天" :value="1"></el-option>
            <el-option label="小时" :value="2"></el-option>
            <el-option label="分钟" :value="3"></el-option>
            <el-option label="秒" :value="4"></el-option>
          </el-select>
          <div class="form-tips">备注：排队超时时间的值要为1，2，3，4这种正整数哦</div>
        </el-form-item>
        <el-form-item label="奖金冻结时间">
          <el-input style="width: 200px" type="number" auto-complete="off" placeholder="填一下奖金冻结时间呗" v-model="formData.frozen_reward_time_val"></el-input>
          <el-select style="width: 150px" placeholder="请选择时间类型" name="expire_time_type" v-model="formData.frozen_reward_time_type">
            <el-option label="天" :value="1"></el-option>
            <el-option label="小时" :value="2"></el-option>
            <el-option label="分钟" :value="3"></el-option>
            <el-option label="秒" :value="4"></el-option>
          </el-select>
          <div class="form-tips">备注：奖金冻结时间的值要为1，2，3，4这种正整数哦</div>
        </el-form-item>
        <el-form-item v-if="$auths.includes('ppylConfig/update')" label="" label-width="300px">
          <el-button type="primary" @click="tryUpdate">修改</el-button>
        </el-form-item>
      </el-form>
      

    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      formData: {
        wait_expire_time: '',
        frozen_reward_time: '',

        wait_expire_time_val: '',
        wait_expire_time_type: '',

        frozen_reward_time_val: '',
        frozen_reward_time_type: ''
      }
    }
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      this.$get('/admin/ppylConfig/info', null, res => {
        let data = res.data;
        let formData = {
          wait_expire_time: data.wait_expire_time || 0,
          frozen_reward_time: data.frozen_reward_time || 0
        }

        if(parseInt(formData.wait_expire_time) % 86400 === 0) {
          // 正小时数
          formData.wait_expire_time_val = parseInt(formData.wait_expire_time) / 86400;
          formData.wait_expire_time_type = 1;  //1天，2小时，3分钟，4秒
        } else if(parseInt(formData.wait_expire_time) % 3600 === 0) {
          // 正小时数
          formData.wait_expire_time_val = parseInt(formData.wait_expire_time) / 3600;
          formData.wait_expire_time_type = 2;  //1小时，2分钟，3秒
        } else if(parseInt(formData.wait_expire_time) % 60 === 0) {
          // 正分钟
          formData.wait_expire_time_val = parseInt(formData.wait_expire_time) / 60;
          formData.wait_expire_time_type = 3;  //1小时，2分钟，3秒
        } else {
          formData.wait_expire_time_val = parseInt(formData.wait_expire_time);
          formData.wait_expire_time_type = 4;  //1小时，2分钟，3秒
        }
        if(parseInt(formData.frozen_reward_time) % 86400 === 0) {
          // 正小时数
          formData.frozen_reward_time_val = parseInt(formData.frozen_reward_time) / 86400;
          formData.frozen_reward_time_type = 1;  //1天，1小时，2分钟，3秒
        } else if(parseInt(formData.frozen_reward_time) % 3600 === 0) {
          // 正小时数
          formData.frozen_reward_time_val = parseInt(formData.frozen_reward_time) / 3600;
          formData.frozen_reward_time_type = 2;  //1小时，2分钟，3秒
        } else if(parseInt(formData.frozen_reward_time) % 60 === 0) {
          // 正分钟
          formData.frozen_reward_time_val = parseInt(formData.frozen_reward_time) / 60;
          formData.frozen_reward_time_type = 3;  //1小时，2分钟，3秒
        } else {
          formData.frozen_reward_time_val = parseInt(formData.frozen_reward_time);
          formData.frozen_reward_time_type = 4;  //1小时，2分钟，3秒
        }

        this.formData = formData;

      })
    },
    tryUpdate() {
      if(!this.formData.wait_expire_time || this.formData.wait_expire_time === '') {
        return this.$message.error('请填写排队超时时间、选择正确排队超时时间类型');
      }
      if(!this.formData.frozen_reward_time || this.formData.frozen_reward_time === '') {
        return this.$message.error('请填写奖金冻结时间、选择正确奖金冻结时间类型');
      }
      
      if(
        !(/^[1-9]\d*$/.test(this.formData.wait_expire_time_val)) ||
        !(/^[1-9]\d*$/.test(this.formData.frozen_reward_time_val))
        ) {
        return this.$message.error(`排队超时时间、奖金冻结时间都要为1，2，3，4这种正整数`);
      }
      let params = {
        wait_expire_time: 0,
        frozen_reward_time: 0
      }
      
      if(this.formData.wait_expire_time_type === 1) {
        params.wait_expire_time = parseInt(this.formData.wait_expire_time_val) * 86400;
      } else if(this.formData.wait_expire_time_type === 2) {
        params.wait_expire_time = parseInt(this.formData.wait_expire_time_val) * 3600;
      } else if(this.formData.wait_expire_time_type === 3) {
        params.wait_expire_time = parseInt(this.formData.wait_expire_time_val) * 60;
      } else {
        params.wait_expire_time = parseInt(this.formData.wait_expire_time_val);
      }

      if(this.formData.frozen_reward_time_type === 1) {
        params.frozen_reward_time = parseInt(this.formData.frozen_reward_time_val) * 86400;
      } else if(this.formData.frozen_reward_time_type === 2) {
        params.frozen_reward_time = parseInt(this.formData.frozen_reward_time_val) * 3600;
      } else if(this.formData.frozen_reward_time_type === 3) {
        params.frozen_reward_time = parseInt(this.formData.frozen_reward_time_val) * 60;
      } else {
        params.frozen_reward_time = parseInt(this.formData.frozen_reward_time_val);
      }


      if(
        params.wait_expire_time < 60 ||
        params.frozen_reward_time < 60
      ) {
        return this.$message.error('排队超时时间、奖金冻结时间至少设置1分钟以上')
      }
      
      this.$post('/admin/ppylConfig/update', params, res => {
        this.getData();
        this.$message.success('更新拼拼设置成功');
      })
    }
  }
}
</script>