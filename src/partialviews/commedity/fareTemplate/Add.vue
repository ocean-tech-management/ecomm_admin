<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="模板名称">
        <el-input style="width: 450px" auto-complete="off" placeholder="填一下邮费模板的名称呗" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item v-if="cityData" label="发货地址">
        <el-select placeholder="省份" name="type" v-model="formData.provinceIndex" @change="updateSelectProvince">
          <el-option v-for="(item, index) in cityData" :label="item.name" :value="index" :key="item.code"></el-option>
        </el-select>
        <el-select v-if="cityData[formData.provinceIndex]" placeholder="城市" name="type" v-model="formData.cityIndex">
          <el-option v-for="(item, index) in cityData[formData.provinceIndex].city" :label="item.name" :value="index" :key="item.code"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="默认模板">
        <el-checkbox v-model="formData.is_default" :true-label="1" :false-label="2">默认运费模板</el-checkbox>
      </el-form-item>
      <el-form-item label="是否包邮">
        <el-radio-group v-model="formData.free_shipping">
          <el-radio :label="2">自定义运费</el-radio>
          <el-radio :label="1">卖家承担邮费</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item v-if="formData.free_shipping == 2" label="模板内容">
        <div class="template-content">
          <div class="template-default-content">
            <div>默认运费</div>
            <el-input class="template-default-input" style="width: 60px" auto-complete="off" placeholder="首件数" v-model="formData.default.default_number"></el-input>
            <div>件内</div>
            <el-input class="template-default-input" style="width: 60px" auto-complete="off" placeholder="首费" v-model="formData.default.default_price"></el-input>
            <div>，每增加</div>
            <el-input class="template-default-input" style="width: 60px" auto-complete="off" placeholder="续建数" v-model="formData.default.create_number"></el-input>
            <div>件，增加运费</div>
            <el-input class="template-default-input" style="width: 60px" auto-complete="off" placeholder="续费" v-model="formData.default.create_price"></el-input>
            <div>元</div>
          </div>
          <div class="template-content-extends">
            <template v-if="formData.extends && formData.extends.length > 0">
              <el-table style="width: 100%" default-expand-all :data="formData.extends">

                <el-table-column label="运送到">
                  <template slot-scope="scope">
                    {{scope.row.names}}
                  </template>
                </el-table-column>
                <el-table-column label="首件数" width="80">
                  <template slot-scope="scope">
                    <el-input style="width: 60px" auto-complete="off" placeholder="填一下" v-model="formData.extends[scope.$index].default_number" type="number"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="首费" width="120">
                  <template slot-scope="scope">
                    <el-input style="width: 100px" auto-complete="off" placeholder="填一下" v-model="formData.extends[scope.$index].default_price" type="number"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="续件数" width="80">
                  <template slot-scope="scope">
                    <el-input style="width: 60px" auto-complete="off" placeholder="填一下" v-model="formData.extends[scope.$index].create_number" type="number"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="续费" width="120">
                  <template slot-scope="scope">
                    <el-input style="width: 100px" auto-complete="off" placeholder="填一下" v-model="formData.extends[scope.$index].create_price" type="number"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="showEditItem(scope.$index)">编辑</el-button>
                    <el-button type="text" class="warning-color" size="small" @click="deleteItem(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
                
              </el-table>
            </template>
          </div>
        </div>
        
        <div class="template-extends-ctrls">
          <el-button type="text" size="small" @click="showAddItem">为指定地区城市设置运费</el-button>
        </div>
      </el-form-item>

      <el-form-item label="限售地区">
        <div class="template-content">
          <div class="template-content-extends">
            <div class="">
              {{formData.notSaleArea.names}}
            </div>
          </div>
        </div>
        
        <div class="template-extends-ctrls">
          <el-button v-if="formData.notSaleArea.ids && formData.notSaleArea.ids.length > 0" type="text" size="small" @click="showEditLimitItem">点此编辑限售地区</el-button>
          <el-button v-else type="text" size="small" @click="showEditLimitItem">点此新增限售地区</el-button>
        </div>
      </el-form-item>
      
    </el-form>

    <template v-if="cityVisible">
      <el-dialog :append-to-body="true" title="选择指定城市" width="750px" :visible.sync="cityVisible">
        <CityList ref="cityPopup" :selectCity="selectCity" :type="ctrlType" :statusCityData="statusCityData" :selectInfos="selectInfos"></CityList>
        <div slot="footer" class="dialog-footer">
          <el-button @click="cityVisible = false">取 消</el-button>
          <el-button v-if="ctrlType == 1" type="primary" @click="addItem">确 定</el-button>
          <el-button v-if="ctrlType == 2" type="primary" @click="editItem">确 定</el-button>
        </div>
      </el-dialog>
    </template>

    <template v-if="limitCityVisible">
      <el-dialog :append-to-body="true" title="选择指定限售城市" width="750px" :visible.sync="limitCityVisible">
        <LimitCityList ref="limitCityPopup" :selectCity="selectLimitCity" :type="ctrlType" :statusCityData="statusLimitCityData" :selectInfos="selectLimitInfos"></LimitCityList>
        <div slot="footer" class="dialog-footer">
          <el-button @click="limitCityVisible = false">取 消</el-button>
          <el-button type="primary" @click="editLimitItem">确 定</el-button>
        </div>
      </el-dialog>
    </template>
    

  </div>
</template>

<script>
import CityList from './CityList';
import LimitCityList from './LimitCityList';
import uploadCtrl from '@/util/uploadCtrl';

export default {
  name: 'AddFareTemplate',
  components: {
    CityList,
    LimitCityList
  },
  data() {
    return {
      statusCityData: [],

      selectInfos: {},
      selectCity: [],   //当前项的code
      selectResult: {},

      selectLimitInfos: {},
      selectLimitCity: [],   //当前限售项的code
      selectLimitResult: {},

      allSelectCity: [],  //所有选中的指定城市的code列表
      allSelectLimitCity: [],  //所有选中的限售地区的code列表

      ctrlType: 1, //1新增，2编辑
      editIndex: 0, //被操作的省市区弹窗项索引
      cityVisible: false,

      limitCityVisible: false,

    };
  },
  props: {
    formData: Object,
    cityData: Array,
    cityNames: Object
  },
  mounted() {
    // this.getCities();
  },
  methods: {
    getCities() {
      let params = {
        type: [1, 2]  //1省2市3区，按需
      }
      this.$post('/admin/ship/city', params, (res) => {
        let cityData = res.data;
        let cityNames = {};
        for(let i = 0; i < cityData.length; i++) {
          cityNames[cityData[i].code] = cityData[i].name; //省级键值对
          for(let j = 0; j < cityData[i].city.length; j++) {
            cityNames[cityData[i].city[j].code] = `${cityData[i].name}${cityData[i].city[j].name}`; //市级键值对
            for(let k = 0; k < cityData[i].city[j].length; k++) {
              cityNames[cityData[i].city[j].area[k].code] = `${cityData[i].name}${cityData[i].city[j].name}${cityData[i].city[j].area[k].name}`;  //区级键值对
            }
          }
        }
        this.cityData = cityData;
        this.cityNames = cityNames;
      }, err => {
        console.log(err);
      });
    },
    returnCityInfo() {
      return {
        cityData: this.cityData,
        cityNames: this.cityNames
      }
    },
    
    // 省市联动
    updateSelectProvince(val) {
      this.formData.cityIndex = 0;
    },


    // 指定城市
    // 指定模板地点操作
    buildAllSelectCityIds() {
      let allSelectCity = [];
      // 计算所有被选中的省市区
      for(let i = 0; i < this.formData.extends.length; i++) {
        allSelectCity.push(...this.formData.extends[i].city_code);
      }
      this.allSelectCity = allSelectCity;
    },
    setSelectResult() {
      // 以所有选中的省为键，其下选中的市为值。构建省市关系
      let selects = {};
      for(let i = 0; i < this.allSelectCity.length; i++) {
        let province = this.allSelectCity[i].substring(0, 2);
        if(!selects[province]) selects[province] = [];
        selects[province].push(this.allSelectCity[i]);
      }
      this.selectResult = selects;
    },
    getSelectCityResultName(city) {
      let names = [];
      let keys = Object.keys(city);
      for(let i = 0; i < keys.length; i++) {
        for(let j = 0; j < this.cityData.length; j++) {
          if(keys[i] == this.cityData[j].code) {
            
            if(city[keys[i]].length == this.cityData[j].child_count) {
              names.push(this.cityNames[keys[i]]);
              break;
            }
            let values = city[keys[i]];
            for(let k = 0; k < values.length; k++) {
              names.push(this.cityNames[values[k]]);
            }
            break;
          }
        }
      }
      return names ? names.toString() : '';
    },


    deleteItem(index) {
      this.$confirm(`是否删除该指定城市项?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formData.extends.splice(index, 1);
        this.formData.extends = this.formData.extends.slice(0);
        this.buildAllSelectCityIds();
        this.setSelectResult(); //重新建立已选择省市的键值对关系
      }).catch(() => {});
    },
    showAddItem() {
      this.ctrlType = 1;
      // 设置其他被选中的项不允许选，直接从全部里面筛
      let statusCityData = [];
      for(let i = 0; i < this.cityData.length; i++) {
        statusCityData.push(JSON.parse(JSON.stringify(this.cityData[i])));
      }
      let selectProvince = Object.keys(this.selectResult);
      for(let i = 0; i < statusCityData.length; i++) {
        // 判断省code是否存在于被选中列表
        if(selectProvince.includes(statusCityData[i].code)) {
          // 如果省code对应的项长度和省列表的childcount数一致，那么这个项就是被全选了，不该被操作了
          if(statusCityData[i].child_count == this.selectResult[statusCityData[i].code].length) {
            statusCityData[i].hasSelected = true;
          }
          for(let j = 0; j < statusCityData[i].city.length; j++) {
            // 市项被省code对应的项包含，为选中
            if(this.selectResult[statusCityData[i].code].includes(statusCityData[i].city[j].code)) {
              statusCityData[i].city[j].hasSelected = true;
            }
          }
        }
      }
      this.statusCityData = statusCityData;
      this.cityVisible = true;
    },
    addItem() {
      let result = this.$refs.cityPopup.returnResult();

      let selectCity = result.selectCityIds;
      let selectResults = result.selectResults;

      if(selectCity.length == 0) {
        return this.$message.error('指定城市需要至少选中一个城市哦');
      }

      let item = {
        type: 2,
        city_code: selectCity,
        default_number: '1',
        default_price: '0',
        create_number: '0',
        create_price: '0'
      }
      
      item.names = this.getSelectCityResultName(selectResults);
      this.formData.extends.push(item);

      this.buildAllSelectCityIds();
      this.setSelectResult(); //重新建立已选择省市的键值对关系
      this.cityVisible = false;
    },
    
    showEditItem(index) {
      this.ctrlType = 2;
      this.editIndex = index;
      let currentItem = this.formData.extends[index]; //被操作项的省市选中结果

      // 设置被选中项不允许选，操作项的那些选中要允许选
      let statusCityData = [];
      for(let i = 0; i < this.cityData.length; i++) {
        statusCityData.push(JSON.parse(JSON.stringify(this.cityData[i])));
      }

      let selectProvince = Object.keys(this.selectResult);
      for(let i = 0; i < statusCityData.length; i++) {
        // 检查省项是否有选中值
        if(selectProvince.includes(statusCityData[i].code)) {
          // 和添加新项不同，优先判断子项被选中情况
          let existCity = false;  //用来判断用来判断的省市项中是否存在该操作项的子项。如存在，省项必然为可被选状态
          for(let j = 0; j < statusCityData[i].city.length; j++) {
            // 同添加，留意下方区别
            if(this.selectResult[statusCityData[i].code].includes(statusCityData[i].city[j].code)) {
              // 如果被操作项选中的市code存在当前市code，那么existCity为真，忽略对省的选中状态判断
              if(!currentItem.city_code.includes(statusCityData[i].city[j].code)) {
                statusCityData[i].city[j].hasSelected = true;
              } else {
                existCity = true;
              }
            }
          }
          
          if(existCity) continue; //被操作项选中了该省的子项，省肯定允许被操作
          // 省的子项不被被操作项选中，检查是否全选。全选情况下省不允许被操作
          if(statusCityData[i].child_count == this.selectResult[statusCityData[i].code].length) {
            statusCityData[i].hasSelected = true;
          }
        }
      }

      // 给弹窗赋被操作项的信息
      let selectInfos = {};
      selectInfos.selectCityIds = currentItem.city_code.slice(0);
      let selectResults = {}, selectProvinceIds = [];
      for(let i = 0; i < selectInfos.selectCityIds.length; i++) {
        let item = selectInfos.selectCityIds[i];
        let provinceId = item.substring(0, 2);
        if(!selectProvinceIds.includes(provinceId)) selectProvinceIds.push(provinceId); //还没加入就添加
        if(!selectResults[provinceId]) selectResults[provinceId] = [];
        selectResults[provinceId].push(item);
      }
      selectInfos.selectProvinceIds = selectProvinceIds;
      selectInfos.selectResults = selectResults;
      this.selectInfos = selectInfos;
      
      this.statusCityData = statusCityData;
      this.cityVisible = true;
    },
    editItem() {
      let result = this.$refs.cityPopup.returnResult();
      let currentItem = this.formData.extends[this.editIndex];

      let selectCity = result.selectCityIds;
      let selectResults = result.selectResults;

      if(selectCity.length == 0) {
        return this.$message.error('指定城市需要至少选中一个城市哦');
      }


      let item = {
        type: currentItem.type,
        city_code: selectCity,
        default_number: currentItem.default_number,
        default_price: currentItem.default_price,
        create_number: currentItem.create_number,
        create_price: currentItem.create_price
      }
      
      item.names = this.getSelectCityResultName(selectResults);
      this.formData.extends[this.editIndex] = item;
      this.formData.extends = this.formData.extends.slice(0); //强制表格更新数据
      
      this.buildAllSelectCityIds();
      this.setSelectResult(); //重新建立已选择省市的键值对关系

      this.$forceUpdate();
      this.cityVisible = false;
    },


    // 限售地区
    buildAllSelectLimitCityIds() {
      let allSelectLimitCity = [];
      // 计算所有被选中的限售省市区
      allSelectLimitCity.push(...this.formData.notSaleArea.ids);
      this.allSelectLimitCity = allSelectLimitCity;
    },
    setSelectLimitResult() {
      // 以所有选中的省市为键，其下选中的区为值。构建省市区关系
      let selects = {};
      for(let i = 0; i < this.allSelectLimitCity.length; i++) {
        let province = this.allSelectLimitCity[i].substring(0, 2);
        if(!selects[province]) selects[province] = {};
        let city = this.allSelectLimitCity[i].substring(0, 4);
        if(!selects[province][city]) selects[province][city] = [];
        selects[province][city].push(this.allSelectLimitCity[i]);
      }
      this.selectLimitResult = selects;
    },
    getSelectLimitCityResultName(city) {
      let names = [], codes = [];
      let keys = Object.keys(city); //获取省份
      for(let i = 0; i < keys.length; i++) {
        // 获取到省份后，去省市区数据中轮询找到其所对应的数据
        
        let storageCityName = [], storageCityCode = [];
        for(let a = 0; a < this.cityData.length; a++) {
          if(keys[i] == this.cityData[a].code) {
            
            let cityKeys = Object.keys(city[keys[i]]);
            let cityCount = 0;  //已全选城市计数器
            cityLoop: for(let j = 0; j < cityKeys.length; j++) {
              // 先进行一遍轮询，检查全选了多少城市
              for(let b = 0; b < this.cityData[a].city.length; b++) {
                if(cityKeys[j] != this.cityData[a].city[b].code) continue;
                if(city[keys[i]][cityKeys[j]].length == this.cityData[a].city[b].child_count) {
                  cityCount += 1;
                } else {
                  break;
                }
              }
              // 比较已全选城市，若已全选所有城市，那就不执行后面的相关操作了。只取省级数据
              if(cityCount == this.cityData[a].child_count) {
                names.push(this.cityNames[keys[i]]);
                codes.push(this.cityData[a].code);
                break cityLoop;
              }

              for(let b = 0; b < this.cityData[a].city.length; b++) {
                if(cityKeys[j] == this.cityData[a].city[b].code) {
                  
                  if(city[keys[i]][cityKeys[j]].length == this.cityData[a].city[b].child_count) {
                    storageCityName.push(this.cityNames[cityKeys[j]]);
                    storageCityCode.push(this.cityData[a].city[b].code);
                    break;
                  }

                  let values = city[keys[i]][cityKeys[j]];
                  for(let k = 0; k < values.length; k++) {
                    storageCityName.push(this.cityNames[values[k]]);
                    storageCityCode.push(values[k]);
                  }
                  break;
                }
              }
              if(j == cityKeys.length - 1) {
                names.push(...storageCityName);
                codes.push(...storageCityCode);
                break;
              }

            }
          }
        }
      }
      return {
        names: names ? names.toString() : '',
        codes: codes
      }
    },
    
    showEditLimitItem() {
      let notSaleArea = this.formData.notSaleArea; //被操作项的省市选中结果
      
      let currentItemCity = [];
      for(let i = 0; i < notSaleArea.ids.length; i++) {
        let city = notSaleArea.ids[i].substring(0, 4);
        if(!currentItemCity.includes(city)) currentItemCity.push(city);
      }
      

      // 设置被选中项不允许选，操作项的那些选中要允许选
      let statusLimitCityData = [];
      for(let i = 0; i < this.cityData.length; i++) {
        statusLimitCityData.push(JSON.parse(JSON.stringify(this.cityData[i])));
      }

      // 给弹窗赋被操作项的信息
      let selectInfos = {};
      selectInfos.selectAreaIds = notSaleArea.ids.slice(0);
      let selectResults = {}, selectProvinceIds = [], selectCityIds = [];
      for(let i = 0; i < selectInfos.selectAreaIds.length; i++) {
        let item = selectInfos.selectAreaIds[i];
        // 先创建省键
        let provinceId = item.substring(0, 2);
        if(!selectProvinceIds.includes(provinceId)) selectProvinceIds.push(provinceId); //还没加入就添加
        if(!selectResults[provinceId]) selectResults[provinceId] = {};
        // 再创建市键
        let cityId = item.substring(0, 4);
        if(!selectCityIds.includes(cityId)) selectCityIds.push(cityId); //还没加入就添加
        if(!selectResults[provinceId][cityId]) selectResults[provinceId][cityId] = [];
        selectResults[provinceId][cityId].push(item);
      }
      selectInfos.selectProvinceIds = selectProvinceIds;
      selectInfos.selectCityIds = selectCityIds;
      selectInfos.selectResults = selectResults;
      
      this.selectLimitInfos = selectInfos;

      this.statusLimitCityData = statusLimitCityData;
      this.limitCityVisible = true;

    },
    editLimitItem() {
      let result = this.$refs.limitCityPopup.returnResult();
      let selectAreaIds = result.selectAreaIds;
      let selectResults = result.selectResults;

      if(selectAreaIds.length == 0) {
        return this.$message.error('限售地区需要至少选中一个地区哦');
      }

      let notSaleArea = {
        ids: selectAreaIds
      }
      
      let calcLimitResult = this.getSelectLimitCityResultName(selectResults);
      notSaleArea.names = calcLimitResult.names;
      notSaleArea.codes = calcLimitResult.codes;
      this.formData.notSaleArea = notSaleArea;
      this.buildAllSelectLimitCityIds();
      this.setSelectLimitResult(); //重新建立已选择省市的键值对关系
      this.limitCityVisible = false;
    },

  }
};
</script>

<style lang="less" scoped>
  .template-content {
    padding: 20px;
    border: 1px solid #f2f3f3;
    border-radius: 8px;
  }
  .template-default-content {
    display: flex;
    flex-wrap: wrap;
  }
  .template-default-input {
    margin: 0 5px;
  }
</style>