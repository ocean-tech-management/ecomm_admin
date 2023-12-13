<template>
  <div class="subpage-content">
    <div class="default-container">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入设备名称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>

          <el-form-item label="导出页码" prop="exportPageNum" title="仅针对导出订单">
            <el-input v-model="queryForm.exportPageNum" placeholder="请填入导出页码" type="number" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item label="导出数量" prop="exportNum" title="仅针对导出订单">
            <el-select placeholder="500" name="exportNum" v-model="queryForm.exportNum">
              <el-option label="500" :value="500"></el-option>
              <el-option label="1000" :value="1000"></el-option>
              <el-option label="2000" :value="2000"></el-option>
              <el-option label="3000" :value="3000"></el-option>
              <el-option label="5000" :value="5000"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="table-ctrls">
        <div class="table-title">设备列表</div>
        <div class="table-ctrl">
          <el-button type="primary" @click="exportExcel">导出数据</el-button>
          <template v-if="$auths.includes('device/create')">
            <el-button type="primary" @click="showAdd">新增设备</el-button>
          </template>
        </div>
      </div>
      <el-table style="width: 100%" :data="dataList">
        <el-table-column label="序号" prop="id" width="70">
        </el-table-column>
        <el-table-column label="设备编码" width="100" prop="device_sn">
        </el-table-column>
        <el-table-column label="设备名" prop="device_name" width="130"></el-table-column>
        <el-table-column label="设备关联人" prop="concact_name" width="130">
        </el-table-column>
        <el-table-column label="关联人手机号码" prop="concact_phone" width="140">
        </el-table-column>
        <el-table-column label="设备地址" prop="address" width="180">
        </el-table-column>
        <el-table-column label="设备状态" width="100" prop="device_status" align="center">
          <template slot-scope="scope">
            {{deviceStatusTexts[scope.row.device_status]}}
          </template>
        </el-table-column>
        <el-table-column label="运作状态" width="120" prop="power_status" align="center">
          <template slot-scope="scope">
            {{powerStatusTexts[scope.row.power_status]}}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" prop="status" align="center">
          <template slot-scope="scope">
            {{statusTexts[scope.row.status]}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- <template v-if="$auths.includes('device/power')"> -->
              <el-button :class="{'warning-color': scope.row.power_status == 1}" type="text" size="default" @click="tryPower(scope.row)">
                {{scope.row.power_status == 1 ? '停机' : '开机'}}
              </el-button>
            <!-- </template> -->
            <template v-if="$auths.includes('device/QrCode')">
              <el-button type="text" size="default" @click="getQrcode(scope.row)">查看二维码</el-button>
            </template>
            <template v-if="$auths.includes('device/comboList')">
              <el-button type="text" size="default" @click="goToCombos(scope.row)">查看套餐</el-button>
            </template>
            <template v-if="$auths.includes('device/status')">
              <el-button :class="{'warning-color': scope.row.status == 1, 'success-color': scope.row.status == 2}" type="text" size="default" @click="toggleItem(scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</el-button>
            </template>
            <template v-if="$auths.includes('device/deviceStatus')">
              <el-button :class="{'warning-color': scope.row.device_status == 1, 'success-color': scope.row.device_status == 2}" type="text" size="default" @click="toggleItemDeviceStatus(scope.row)">{{scope.row.device_status == 1 ? '设为维护' : '取消维护'}}</el-button>
            </template>
            <template v-if="$auths.includes('device/update')">
              <el-button type="text" size="default" @click="showEdit(scope.row)">编辑</el-button>
            </template>
            <template v-if="$auths.includes('device/delete')">
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

    <el-dialog title="新增设备" width="750px" :close-on-click-modal="false" :visible.sync="addVisible">
      <Add ref="add" :formData="formData"></Add>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="addItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑设备" width="750px" :close-on-click-modal="false" :visible.sync="editVisible">
      <Edit ref="edit" :formData="formData"></Edit>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button type="primary" @click="editItem">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="设备二维码" width="500px" :close-on-click-modal="false" :visible.sync="qrcodeVisible">
      <div style="text-align: center">
        <img style="width: 300px" :src="qrcode.img"/>
        <div style="margin-top: 20px; color: #999">{{qrcode.device_name}}</div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="qrcodeVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import XLSX from 'xlsx';
import moment from "moment";

import AddressParse from '@/plugins/address-parse/parse';

import Add from '@/partialviews/crowdFunding/device/Add';
import Edit from '@/partialviews/crowdFunding/device/Edit';

export default {
  name: 'devices',
  components: {
    Add,
    Edit
  },
  data() {
    return {
      currentPage: 1,
      count: 1,
      queryForm: {
        keyword: '',
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      filter: {
        keyword: '',
        
        exportPageNum: 1,
        exportNum: 1000,
      },
      categories: [],
      subCategories: [],
      statusTexts: {
        [1]: '启用中',
        [2]: '禁用中',
        [-1]: '已被删除'
      },
      deviceStatusTexts: {
        [1]: '正常',
        [2]: '维护中',
      },
      powerStatusTexts: {
        [1]: '运作中',
        [2]: '待机中/未通电',

      },
      dataList: [],
      formData: {},
      addVisible: false,
      editVisible: false,

      qrcode: {
        device_name: '',
        img: ''
      },
      qrcodeVisible: false
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
        keyword: '',
        
        exportPageNum: 1,
        exportNum: 1000,
      };
      this.currentPage = 1;
      this.getList();
    },
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword,

        exportPageNum: this.queryForm.exportPageNum,
        exportNum: this.queryForm.exportNum,
      }
      this.getList();
    },

    //获取列表
    getList() {
      let queryVal = {
        page: this.currentPage,
        keyword: this.filter.keyword
      };

      this.$get('/admin/device/list', queryVal, res => {
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
        device_sn: '',
        device_name: '',
        device_image: '',
        device_show_sn: '',
        power_imei: '',
        power_number: '',
        uid: '',
        address: '',
        concact_name: '',
        concact_phone: '',
        sort: 999
      };
      if(this.$refs.add && this.$refs.add.$refs.thumb) this.$refs.add.$refs.thumb.clearFiles();
      this.addVisible = true;
    },
    addItem() {
      let params = {
        ...this.formData
      }
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传介绍图、勾选关联用户哦');
        }
      }
      
      if(params.concact_phone	 && !/^1[3456789]\d{9}$/.test(params.concact_phone)) {
        return this.$message.error('联系人的手机号码有误');
      }
      if(!params.sort || params.sort === '' || !/^(0|[1-9][0-9]*)$/.test(params.sort)) {
        return this.$message.error('排序不能为空，且要为1，2，3，4这种正整数哦');
      }
      if(!/^([1-9][0-9]*)$/.test(params.power_number)) {
        return this.$message.error('智能开关号码要为1，2，3，4这种正整数哦');
      }

      
      let address = params.address;
      let discernResults = AddressParse.parse(address);
      if(!discernResults || discernResults.length === 0) {
        return this.$message.error('未匹配到有效收货地址，请检查');
      }
      let result = discernResults[0];
      if(!result.area || result.area === '') {
        //数据可信任度比较低，不做数据填充。对东莞和中山做额外判断
        return this.$message.error('收货地址可能存在问题，请检查');
      }
      let address_detail = {
        Province: result.province,
        City: result.city,
        Area: result.area,
        ProvinceId: result.code.substring(0, 2),
        CityId: result.code.substring(0, 4),
        AreaId: result.code,
        address: result.details
      }
      params.address_detail = address_detail;

      this.$post('/admin/device/create', params, res => {
        this.$message.success('新增成功');
        this.addVisible = false;
        this.reloadPage();
      });
    },

    showEdit(row) {
      this.formData = {
        device_sn: row.device_sn,
        device_name: row.device_name,
        device_image: row.device_image,
        device_show_sn: row.device_show_sn,
        power_imei: row.power_imei,
        power_number: row.power_number,
        uid: row.uid,
        address: row.address,
        concact_name: row.concact_name,
        concact_phone: row.concact_phone,
        sort: row.sort,
      };
      

      if(this.$refs.edit && this.$refs.edit.$refs.thumb) this.$refs.edit.$refs.thumb.clearFiles();
      if(this.$refs.edit) this.$refs.edit.reInit(this.formData);
      this.editVisible = true;
    },

    editItem() {
      let params = {
        ...this.formData
      }
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return this.$message.error('请填写完所有信息，并上传介绍图、勾选关联用户哦');
        }
      }
      
      if(params.concact_phone	 && !/^1[3456789]\d{9}$/.test(params.concact_phone)) {
        return this.$message.error('联系人的手机号码有误');
      }
      if(!params.sort || params.sort === '' || !/^(0|[1-9][0-9]*)$/.test(params.sort)) {
        return this.$message.error('排序不能为空，且要为1，2，3，4这种正整数哦');
      }
      if(!/^([1-9][0-9]*)$/.test(params.power_number)) {
        return this.$message.error('智能开关号码要为1，2，3，4这种正整数哦');
      }

      
      let address = params.address;
      let discernResults = AddressParse.parse(address);
      if(!discernResults || discernResults.length === 0) {
        return this.$message.error('未匹配到有效收货地址，请检查');
      }
      let result = discernResults[0];
      if(!result.area || result.area === '') {
        //数据可信任度比较低，不做数据填充。对东莞和中山做额外判断
        return this.$message.error('收货地址可能存在问题，请检查');
      }
      let address_detail = {
        Province: result.province,
        City: result.city,
        Area: result.area,
        ProvinceId: result.code.substring(0, 2),
        CityId: result.code.substring(0, 4),
        AreaId: result.code,
        address: result.details
      }
      params.address_detail = address_detail;
      

      this.$post('/admin/device/update', params, res => {
        this.$message.success('编辑成功');
        this.editVisible = false;
        this.reloadPage();
      });

    },

    getQrcode(row) {
      this.$post('/admin/device/QrCode', {
        content: `http://device-cm.andyoudao.cn?sn=${row.device_sn}`,
        device_sn: row.device_sn,
        scheme_page: 'pages/index/index', //小程序跳转页面
        scheme_param: `redirect=%2Fmarket-pages%2Fpages%2Fdevice%2Fdetail%2Fdetail%3Fsn%3D${row.device_sn}`,  //小程序跳转query
        redirect_url: `http://wx-cm.andyoudao.cn/market-pages/pages/device/detail/detail?sn=${row.device_sn}`
      }, res => {
        this.qrcode = {
          device_name: row.device_name,
          img: res.data || ''
        }
        this.qrcodeVisible = true;
      });
    },
    toggleItem(row) {
      this.$confirm(`您将${row.status == 1 ? '禁用' : '启用'} ${row.device_name} 这个设备, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/device/status', {
          device_sn: row.device_sn,
          status: row.status
        }, res => {
          this.$message.success(`${row.status == 1 ? '禁用' : '启用'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    toggleItemDeviceStatus(row) {
      this.$confirm(`您将 ${row.device_name} 这个设备进行 ${row.device_status == 1 ? '设为维护' : '取消维护'} 操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/device/deviceStatus', {
          device_sn: row.device_sn,
          status: row.device_status
        }, res => {
          this.$message.success(`${row.status == 1 ? '设为维护状态' : '取消维护状态'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },

    tryPower(row) {
      this.$confirm(`您将 ${row.device_name} 这个设备进行 ${row.power_status == 1 ? '停机' : '开机'} 操作, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/device/power', {
          type: row.power_status == 1 ? 2 : 1,
          imei: row.power_imei,
          power_number: row.power_number
        }, res => {
          this.$message.success(`${row.power_status == 1 ? '停机' : '开机'}成功`);
          this.reloadPage();
        });
      }).catch(() => {});
    },
    deleteItem(row) {
      this.$confirm(`您将删除 ${row.device_name} 这个设备, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$post('/admin/device/delete', {
          device_sn: row.device_sn
        }, res => {
          this.$message.success('删除成功');
          this.reloadPage();
        });
      }).catch(() => {});
    },

    goToCombos(row) {
      this.$router.push({
        path: '/deviceCombos',
        query: {
          sn: row.device_sn,
          name: row.device_name
        }
      })
    },

    
    // 导出excel表格
    exportExcel() {
      let params = {
        keyword: this.filter.keyword,
        
        page: this.filter.exportPageNum,   //实际用参数名和变量名是不一致的哈
        pageNumber: this.filter.exportNum,   //实际用参数名和变量名是不一致的哈
      }
      
      if(!params.pageNumber || params.pageNumber == '' ||!(/^([1-9][0-9]*)$/.test(params.pageNumber))) {
        return this.$message.error(`导出页码数要为1，2，3，4这种大于0的正整数哦，请检查下哈`)
      }
      
      this.$get('/admin/device/list', params, res => {
        let data = res.data.list || [];
        
        if(data.length == 0) {
          return this.$message.warning('查无数据，请检查');
        }
        if(data.length > 100000) {
          return this.$message.warning('数量超过10万，您的设备性能可能无法支撑生成这么大数据量的表格生成，请检查时间选项是否合理');
        }


        let excelData = [];
        excelData.push([
          '设备编码', 
          '设备名', 
          '设备关联人', 
          '关联人手机号码',
          '设备地址',
          '设备状态',
          '运作状态',
          '状态'
        ]);
        for(let i = 0; i < data.length; i++) {
          let item = data[i];

          excelData.push([
            item.device_sn, 
            item.device_name, 
            item.concact_name, 
            item.concact_phone, 
            item.address, 
            this.deviceStatusTexts[item.device_status], 
            this.powerStatusTexts[item.power_status], 
            this.statusTexts[item.status]
          ]);
        }
        
        // 导出excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          {wpx: 160},
          {wpx: 180},
          {wpx: 120},
          {wpx: 120},
          {wpx: 300},
          {wpx: 120},
          {wpx: 120},
          {wpx: 120}
        ]
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, "设备列表");

        let time = moment().format('YYYYMMDDHHmm');
        /* generate file and send to client */
        XLSX.writeFile(wb, `设备列表${time}.xlsx`);
      });
    },


  }
};
</script>
