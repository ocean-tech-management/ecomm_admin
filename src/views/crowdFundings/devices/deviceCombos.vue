<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <!-- <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入设备套餐名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form> -->
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">
          设备套餐列表
          <span class="success-color">{{device.device_name || ''}}</span>
        </div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('device/comboUpdate')">
            <el-button type="primary" @click="showAdd">新增设备套餐</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="id" width="70">
        </el-table-column>
        <el-table-column label="设备套餐名" prop="combo_title" width="230"></el-table-column>

        <el-table-column label="套餐时间(秒)" prop="continue_time" width="130">
        </el-table-column>
        <el-table-column label="现金/次" prop="price" width="130">
        </el-table-column>
        <el-table-column label="健康豆/次" prop="healthy_price" width="130">
        </el-table-column>
        <!-- <el-table-column label="状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column> -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template v-if="$auths.includes('device/comboUpdate')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('device/comboDelete')">
              <el-button class="error-color" type="text" size="default" @click="deleteItem(scope.row)">删除</el-button>
            </template>  
          </template>
        </el-table-column>
      </el-table>
      <div v-show="dataList && dataList.length > 0" class="pagination">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :pager-count="7"
          layout="total, prev, pager, next"
          :page-count="count"
        ></el-pagination>
      </div>
    </div>

    <el-dialog title="新增设备套餐" width="750px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑设备套餐" width="750px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Add from '@/partialviews/crowdFunding/device/combo/Add';
import Edit from '@/partialviews/crowdFunding/device/combo/Edit';

export default {
  name: 'deviceCombos',
  components: {
    Add,
    Edit
  },
  data() {
    return {
      device: {
        device_name: ''
      },

      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
      },
      filter: {
        keyword: '',
      },
      categories: [],
      subCategories: [],
      statusTexts: {
        [1]: '启用中',
        [2]: '禁用中',
        [-1]: '已被删除'
      },
      dataList: [],
      formData: {},
      addVisible: false,
      editVisible: false,
    };
  },
  mounted() {
    this.sn = this.$route.query.sn;
    if(!this.sn) {
      this.$message.error('设备不存在或已失效，正在返回');
      setTimeout(() => {
        window.location.replace('/#/devices');
      }, 2000)
      return;
    }
    if(this.$route.query.name) this.device.device_name = this.$route.query.name;
    this.getList();
  },
  methods: {
    reloadPage() {
      this.getList();
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        device_sn: this.sn,
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/device/comboList', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },

    updateParentCategory(val) {
      if(!val || val === '') {
        this.subCategories = [];
        this.queryForm.category_code = '';
      } else {
        this.getSubCategories(val);
      }
    },

    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    showAdd() {
      this.formData = {
        device_sn: this.sn,
        combo_title: '',
        desc: '',
        oper_image: '',
        continue_time: '',
        userDivideScaleVal: '',  //user_divide_scale
        price: '',
        healthy_price: ''
      };
      if(this.$refs.add && this.$refs.add.$refs.oper_image) this.$refs.add.$refs.oper_image.clearFiles();
      this.addVisible = true;
    },
    addItem() {
      let params = {
        ...this.formData
      }
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      
      if(!(/^\d+$/.test(params.continue_time))) {
        return this.$message.error(`套餐时间要为0，1，2，3，4这种正整数，请检查下哈`)
      }
      if(
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.userDivideScaleVal) || 
        parseFloat(params.userDivideScaleVal) >= 100
      ) {
        return this.$message.error('分润比例要为小于100的正数');
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.price)) ||
        parseFloat(params.price) <= 0
      ) {
        return this.$message.error(`单次消费现金费用要为大于零的数哦，请检查下哈`)
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.healthy_price)) ||
        parseFloat(params.healthy_price) <= 0
      ) {
        return this.$message.error(`单次消费健康豆费用要为大于零的数哦，请检查下哈`)
      }
      params.user_divide_scale = parseFloat(Math.floor(parseFloat(params.userDivideScaleVal) * 100) / 10000).toFixed(4);

      // 请求格式调整
      params = {
        device_sn: params.device_sn,
        combo: [{
          ...params
        }]
      }

      this.$post('/admin/device/comboUpdate', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      if(!this.$auths.includes('device/comboInfo')) {
        return this.$message.warning('您缺少查看套餐详情的权限，无法正常修改套餐，请联系管理员为您添加'); 
      }
      let params = {
        combo_sn: row.combo_sn
      }
      this.$get('/admin/device/comboInfo', params, res => {
        let data = res.data;
        this.formData = {
          device_sn: data.device_sn,
          combo_sn: data.combo_sn,
          combo_title: data.combo_title,
          desc: data.desc,
          oper_image: data.oper_image,
          continue_time: data.continue_time,
          userDivideScaleVal: '',  //user_divide_scale
          price: data.price,
          healthy_price: data.healthy_price,
        };
        this.formData.userDivideScaleVal = data.user_divide_scale && parseFloat(data.user_divide_scale) != 0 ? (parseInt(parseFloat(data.user_divide_scale) * 10000) / 100) : 0;

        if(this.$refs.edit && this.$refs.edit.$refs.oper_image) this.$refs.edit.$refs.oper_image.clearFiles();
        this.editVisible = true;

      });

    },

    editItem() {
      let params = {
        ...this.formData
      }
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传图片哦');
        }
      }
      
      if(!(/^-?\d+$/.test(params.continue_time))) {
        return this.$message.error(`套餐时间要为0，1，2，3，4这种正整数，请检查下哈`)
      }
      if(
        !/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.userDivideScaleVal) || 
        parseFloat(params.userDivideScaleVal) >= 100
      ) {
        return this.$message.error('分润比例要为小于100的正数');
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.price)) ||
        parseFloat(params.price) <= 0
      ) {
        return this.$message.error(`单次消费现金费用要为大于零的数哦，请检查下哈`)
      }
      if(
        !(/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.healthy_price)) ||
        parseFloat(params.healthy_price) <= 0
      ) {
        return this.$message.error(`单次消费健康豆费用要为大于零的数哦，请检查下哈`)
      }
      params.user_divide_scale = parseFloat(Math.floor(parseFloat(params.userDivideScaleVal) * 100) / 10000).toFixed(4);
      
      // 请求格式调整
      params = {
        device_sn: params.device_sn,
        combo: [{
          ...params
        }]
      }

      this.$post('/admin/device/comboUpdate', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });

    },



    deleteItem(row) {
      this.$confirm(`您将删除 ${row.combo_title} 这个设备套餐, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/device/comboDelete', {
          combo_sn: row.combo_sn,
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    }
  }
};
</script>
