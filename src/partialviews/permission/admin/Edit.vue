<template>
  <div>
    <el-form ref="addForm" :model="formData" label-width="100px">
      <el-form-item label="账号" prop="account">
        <div class="form-content-static">{{formData.account}}</div>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input style="width: 450px" v-model="formData.name" placeholder="请输入管理员名称"></el-input>
      </el-form-item>
      <el-form-item label="用户类型">
        <el-select placeholder="请选择用户类型" name="type" v-model="formData.type">
          <el-option v-for="item in types" :label="item.name" :value="item.type" :key="item.type"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="formData.type == 3" label="归属供货商">
        <el-select placeholder="请选择" name="supplier_code" filterable remote :loading="supplierLoading" v-model="formData.supplier_code" :remote-method="updateSupplierFilter">
          <el-option v-for="item in suppliers" :label="item.name" :value="item.supplier_code" :key="item.supplier_code"></el-option>
        </el-select>
        <span style="margin-left: 10px; color: #999">可输入供货商名字关键字进行筛选</span>
      </el-form-item>
      <el-form-item label="归属用户组">
        <el-select placeholder="请选择用户组" name="type" v-model="formData.group_id">
          <el-option v-for="item in rules" :label="item.title" :value="item.id" :key="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input style="width: 450px" v-model="formData.email" placeholder="请输入管理员邮箱"></el-input>
        <div style="font-size: 12px; color: #999">该项可不填</div>
      </el-form-item>
      
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'EditAdmin',
  data() {
    return {
      rules: [],
      types: [{
        type: 1,
        name: '普通管理员'
      },{
        type: 2,
        name: '商户移动端管理员'
      },{
        type: 3,
        name: '供应商管理员'
      },],
      suppliers: [],
      supplierLoading: false
    };
  },
  props: {
    formData: Object,
  },
  mounted() {
    this.getRules();
    this.getSuppliers();
  },
  methods: {
    getRules() {
      let queryVal = {
        keyword: ''
      };

      this.$get('/admin/auth/groupList', queryVal, res => {
        this.rules = res.data;
      });
    },
    getSuppliers(keyword = '') {
      if(!this.$auths.includes('supplier/list')) return;
      let params = {
        page: 1,
        keyword: keyword
      }
      
      this.supplierLoading = true;
      this.$sget('/admin/supplier/list', params, res => {
        let data = res.data.list || [];
        this.suppliers = data;
        this.supplierLoading = false;
      });
    },
    updateSupplierFilter(keyword) {
      this.getSuppliers(keyword)
    },
  },
};
</script>
