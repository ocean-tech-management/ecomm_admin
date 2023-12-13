<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="买家留言">
        <div class="form-content-static">
          {{formData.order_remark || '无留言'}}
        </div>
      </el-form-item>
      <el-form-item label="标记旗帜">
        <el-radio-group v-model="formData.order_sign">
          <el-radio :label="1">
            <i class="el-icon-s-flag red"></i>
          </el-radio>
          <el-radio :label="2">
            <i class="el-icon-s-flag yellow"></i>
          </el-radio>
          <el-radio :label="3">
            <i class="el-icon-s-flag green"></i>
          </el-radio>
          <el-radio :label="4">
            <i class="el-icon-s-flag blue"></i>
          </el-radio>
          <el-radio :label="5">
            <i class="el-icon-s-flag purple"></i>
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="标记备注">
        <el-input style="width: 400px" type="textarea" rows="3" auto-complete="off" placeholder="标记备注，用来提醒运营人员" v-model="formData.seller_remark"></el-input>
        <div class="form-tips">友情提示： 更新备注信息的同时建议更新标记旗帜哦</div>
      </el-form-item>


    </el-form>
  </div>
</template>

<script>
export default {
  name: 'Remark',
  data() {
    return {

    }
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
    
  }
};
</script>
