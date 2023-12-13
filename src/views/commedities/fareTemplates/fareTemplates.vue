<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="模板名称" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>


      <div class="table-ctrls">
        <div class="table-title">邮费模板列表</div>
        <div class="table-ctrl">
          <template v-if="$auths.includes('ship/templateCreate')">
            <el-button type="primary" @click="openAdd">新增</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" width="160" prop="code"></el-table-column>
        <el-table-column label="模板名称" prop="title" width="250">
          <template slot-scope="scope">
            <span v-if="scope.row.is_default == 1">[<span class="warning-color">默认</span>]</span> 
            {{scope.row.title}}
          </template>
        </el-table-column>
        <el-table-column label="发货地址" >
          <template slot-scope="scope">
            {{scope.row.ship_country}} {{scope.row.ship_province}} {{scope.row.ship_city}} {{scope.row.ship_area}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" prop="create_time"></el-table-column>
        <el-table-column label="操作" >
          <template slot-scope="scope">
            <template v-if="$auths.includes('ship/templateDefault')">
              <el-button v-if="scope.row.is_default != 1" type="text" size="small" @click="setDefault(scope.row)">设置默认模板</el-button>
            </template>
            <template v-if="$auths.includes('ship/templateUpdate')">
              <el-button type="text" size="small" @click="openEdit(scope.row)">修改</el-button>
            </template>
            <template v-if="$auths.includes('ship/templateDelete')">
              <el-button type="text" size="small" @click="deleteItem(scope.row)">删除</el-button>
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
    <template v-if="addVisible">
      <el-dialog title="新建邮费模板" width="1000px" :close-on-click-modal="false" :visible.sync="addVisible">
        <Add ref="add" :formData="formData" :cityData="cityData" :cityNames="cityNames"></Add>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addVisible = false">取 消</el-button>
          <el-button type="primary" @click="addItem">确 定</el-button>
        </div>
      </el-dialog>
    </template>
    
    <template v-if="editVisible">
      <el-dialog title="编辑邮费模板" width="1200px" :close-on-click-modal="false" :visible.sync="editVisible">
        <Edit ref="edit" :formData="formData" :cityData="cityData" :cityNames="cityNames"></Edit>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editVisible = false">取 消</el-button>
          <el-button type="primary" @click="editItem">确 定</el-button>
        </div>
      </el-dialog>
    </template>
  </div>
</template>

<script>
import { publishDate } from '@/config.js';
import Add from '@/partialviews/commedity/fareTemplate/Add';
import Edit from '@/partialviews/commedity/fareTemplate/Edit';

export default {
  name: 'fareTemplates',
  components: { Add, Edit },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],
      typeText: {
        [1]: '轮播图',
        [2]: '广告'
      },
      formData: {},

      cityData: [],
      cityNames: {},  //省市code和name键值对

      addVisible: false,
      editVisible: false
    };
  },
  mounted() {
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
      };
      this.getList();
    },


    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };
      this.$get('/admin/ship/template', queryVal, res => {
        let dataList = res.data.list || [];

        this.dataList = dataList;
        this.count = res.data.pageTotal;
      });
    },
    // 分页
    handleCurrentChange(value) {
      this.currentPage = value;
      this.getList();
    },

    getCityData(handler) {
      let params = {
        type: [1, 2, 3]  //1省2市3区，按需
      }
      this.$post('/admin/ship/city', params, (res) => {
        let cityData = res.data;
        let cityNames = {};
        for(let i = 0; i < cityData.length; i++) {
          cityNames[cityData[i].code] = cityData[i].name; //省级键值对
          for(let j = 0; j < cityData[i].city.length; j++) {
            cityNames[cityData[i].city[j].code] = `${cityData[i].name}${cityData[i].city[j].name}`; //市级键值对
            for(let k = 0; k < cityData[i].city[j].area.length; k++) {
              cityNames[cityData[i].city[j].area[k].code] = `${cityData[i].name}${cityData[i].city[j].name}${cityData[i].city[j].area[k].name}`;  //区级键值对
            }
          }
        }
        this.cityData = cityData;
        this.cityNames = cityNames;
        if(handler && typeof handler == 'function') handler();
      }, err => {
        console.log(err);
      });
    },

    

    openAdd() {
      this.formData = {
        title: '',
        unit: 1,  //1件数，2重量，3体积。当前默认件数
        is_default: 2,  //1默认，2非
        free_shipping: 2, //1包邮，2不包
        default: {
          default_number: '1',
          default_price: '0',
          create_number: '1',
          create_price: '0',
        },
        extends: [],
        notSaleArea: {
          ids: [],
          names: '',
          codes: []
        },
        provinceIndex: 0,
        cityIndex: 0,
        ship_province: '',
        ship_city: '',
        ship_area: ''
      };
      if(!this.cityData || this.cityData.length == 0) {
        this.getCityData(() => {
          this.addVisible = true;
        })
      } else {
        this.addVisible = true;  
      }
    },
    addItem() {
      let params = JSON.parse(JSON.stringify(this.formData));

      if(!params.title || params.title === '') {
        return this.$message.error('填写模板名称哦');
      }

      if(params.free_shipping == 2) {
        params.detail = [];
        let defaultItem = params.default;
        let defaultValue = Object.values(defaultItem);
        for(let i = 0; i < defaultValue.length; i++) {
          if(defaultValue[i] === '')  return this.$message.error('默认运费项每项都必填哦');
        }
        if(
          !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(defaultItem.default_price)) ||
          !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(defaultItem.create_price))
        ) {
          return this.$message.error('默认运费及默认增加运费的值需要为大于0的数哦');
        }
        if(
          !/^[0-9]\d*$/.test(defaultItem.default_number) ||
          !/^[0-9]\d*$/.test(defaultItem.create_number)
        ) {
          return this.$message.error('默认起始件数和默认增长件数要为大于等于0的整数哦');
        }
        defaultItem.type = 1; //默认运费
        params.detail.push(defaultItem);

        if(params.extends && params.extends.length > 0) {
          for(let i = 0; i < params.extends.length; i++) {
            if(
              !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(params.extends[i].default_price)) ||
              !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(params.extends[i].create_price))
            ) {
              return this.$message.error(`第${i + 1}个指定城市列表的运费及增加运费的值需要为大于0的数哦`);
            }
            if(
              !/^[0-9]\d*$/.test(params.extends[i].default_number) ||
              !/^[0-9]\d*$/.test(params.extends[i].create_number)
            ) {
              return this.$message.error(`第${i + 1}个指定城市列表的起始件数和默认增长件数要为大于等于0的整数哦`);
            }
          }
          params.detail.push(...params.extends);
        }
        delete params.default;
        delete params.extends;
        
        for(let i = 0; i < params.detail.length; i++) {
          params.detail[i].default_price = parseFloat(params.detail[i].default_price).toFixed(2);
          params.detail[i].create_price = parseFloat(params.detail[i].create_price).toFixed(2);
          params.detail[i].sort = i;
        }
        
      } else {
        delete params.default;
        delete params.extends;
      }
      
      let cityInfo = this.$refs.add.returnCityInfo();
      if(cityInfo.cityData && cityInfo.cityData.length > 0) {
        params.ship_province = cityInfo.cityData[params.provinceIndex].name;
        params.ship_city = cityInfo.cityData[params.provinceIndex].city[params.cityIndex].name;
      }

      params.not_sale_area = params.notSaleArea.codes ? params.notSaleArea.codes.toString() : '';
      delete params.notSaleArea;
     
      this.$post('/admin/ship/templateCreate', params, res => {
        this.reloadPage();
        this.$message.success('添加模板成功');
        this.addVisible = false;
      });
    },
    openEdit(row) {
      if(!this.$auths.includes('ship/templateInfo')) {
        return this.$message.warning('您没有查看详情的权限，无法正常编辑模板项，请联系管理员给您添加');
      }
      if(!this.cityData || this.cityData.length == 0) {
        this.getCityData(() => {
          this.tryGetData(row);
        })
      } else {
        this.tryGetData(row); 
      }
    },
    tryGetData(row) {
      this.$get('/admin/ship/templateInfo', {
        code: row.code
      }, res => {
        let data = res.data;
        let formData = {
          code: data.code,
          detail: data.detail,
          title: data.title,
          unit: data.unit,  //1件数，2重量，3体积。当前默认件数
          is_default: data.is_default,  //1默认，2非
          free_shipping: data.free_shipping, //1包邮，2不包
          notSaleArea: {
            ids: [],
            names: [],
            codes: data.not_sale_area ? data.not_sale_area.split(',') : []
          },
          ship_province: data.ship_province,
          ship_city: data.ship_city,
          ship_area: data.ship_area
        }
        formData.default = {};
        formData.extends = [];
        for(let i = 0; i < formData.detail.length; i++) {
          if(formData.detail[i].create_time) delete(formData.detail[i].create_time);
          if(formData.detail[i].type == 1) {
            formData.default = formData.detail[i];
          } else {
            formData.detail[i].city_code = formData.detail[i].city_code.split(',');
            formData.extends.push(formData.detail[i])
          }
        }

        formData.provinceIndex = 0;
        formData.cityIndex = 0;
        for(let i = 0; i < this.cityData.length; i++) {
          if(this.cityData[i].name == formData.ship_province) {
            formData.provinceIndex = i;
            for(let j = 0; j < this.cityData[i].city.length; j++) {
              this.cityData[i].city[j].name == formData.ship_city;
              formData.cityIndex = j;
              break;
            }
            break;
          }
        }

        for(let i = 0; i < formData.notSaleArea.codes.length; i++) {
          formData.notSaleArea.names.push(this.cityNames[formData.notSaleArea.codes[i]]);
        }
        formData.notSaleArea.names = formData.notSaleArea.names.toString();

        this.formData = formData;
        if(this.$refs.edit) {
          this.$refs.edit.buildAllSelectCityIds();
          this.$refs.edit.setSelectResult();
          this.$refs.edit.initAllSelectNames();
        }

        this.editVisible = true;
      });
    },
    editItem() {
      let params = JSON.parse(JSON.stringify(this.formData));

      if(!params.title || params.title === '') {
        return this.$message.error('填写模板名称哦');
      }

      if(params.free_shipping == 2) {
        params.detail = [];
        let defaultItem = params.default;
        let defaultValue = Object.values(defaultItem);
        for(let i = 0; i < defaultValue.length; i++) {
          if(defaultValue[i] === '')  return this.$message.error('默认运费项每项都必填哦');
        }
        if(
          !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(defaultItem.default_price)) ||
          !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(defaultItem.create_price))
        ) {
          return this.$message.error('默认运费及默认增加运费的值需要为大于0的数哦');
        }
        if(
          !/^[0-9]\d*$/.test(defaultItem.default_number) ||
          !/^[0-9]\d*$/.test(defaultItem.create_number)
        ) {
          return this.$message.error('默认起始件数和默认增长件数要为大于等于0的整数哦');
        }
        defaultItem.type = 1; //默认运费
        params.detail.push(defaultItem);

        if(params.extends && params.extends.length > 0) {
          for(let i = 0; i < params.extends.length; i++) {
            if(
              !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(params.extends[i].default_price)) ||
              !(/^(\d|[0-9]\d+)(\.\d+)?$/.test(params.extends[i].create_price))
            ) {
              return this.$message.error(`第${i + 1}个指定城市列表的运费及增加运费的值需要为大于0的数哦`);
            }
            if(
              !/^[0-9]\d*$/.test(params.extends[i].default_number) ||
              !/^[0-9]\d*$/.test(params.extends[i].create_number)
            ) {
              return this.$message.error(`第${i + 1}个指定城市列表的起始件数和默认增长件数要为大于等于0的整数哦`);
            }
          }
          params.detail.push(...params.extends);
        }
        delete params.default;
        delete params.extends;
        
        for(let i = 0; i < params.detail.length; i++) {
          params.detail[i].default_price = parseFloat(params.detail[i].default_price).toFixed(2);
          params.detail[i].create_price = parseFloat(params.detail[i].create_price).toFixed(2);
          params.detail[i].sort = i;
        }
        
      } else {
        delete params.default;
        delete params.extends;
      }
      
      let cityInfo = this.$refs.edit.returnCityInfo();
      if(cityInfo.cityData && cityInfo.cityData.length > 0) {
        params.ship_province = cityInfo.cityData[params.provinceIndex].name;
        params.ship_city = cityInfo.cityData[params.provinceIndex].city[params.cityIndex].name;
      }

      params.not_sale_area = params.notSaleArea.codes ? params.notSaleArea.codes.toString() : '';
      delete params.notSaleArea;
     
      this.$post('/admin/ship/templateUpdate', params, res => {
        this.reloadPage();
        this.$message.success('编辑模板成功');
        this.editVisible = false;
      });
    },

    setDefault(row) {
      this.$confirm(`即将把${row.title}设为默认邮费模板, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ship/templateDefault', {
          code: row.code
        }, res => {
          this.$message.success('操作成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
    
    deleteItem(row) {
      this.$confirm(`您将删除${row.title}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/ship/templateDelete', {
          code: row.code
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },
  }
};
</script>
