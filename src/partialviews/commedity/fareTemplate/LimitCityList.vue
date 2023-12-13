<template>
  <div>
    <el-form label-width="0">
      <el-form-item label="">
        <div class="province-list">
          <!-- 省级 -->
          <template v-for="(item, index) in statusCityData">
            <div class="province-item" :class="{'current-province': expandIndex == index}" :key="item.code">
              <el-checkbox-group v-model="selectProvinceIds">
                <el-checkbox 
                  :label="item.code" 
                  :disabled="item.hasSelected" 
                  :indeterminate="provinceIndeterminate(item)" 
                  @change="selectAllCity($event, index)"
                >
                  <span class="checkbox-label">{{item.name}}</span>
                </el-checkbox>
              </el-checkbox-group> 
              <div class="province-expand-trigger-box" title="点击此处展开详细城市列表" @click="expandOrNot(index)">
                <i class="el-icon-caret-bottom" :class="{'el-icon-caret-top': expandIndex == index}"></i>
              </div>
            </div>
            <!-- 市级 -->
            <div v-if="expandIndex == index" class="city-list" :key="'ex' + index">
              <template v-for="(city, cityIndex) in statusCityData[index].city">
                <div class="city-item" :key="city.code">
                  <el-checkbox-group v-model="selectCityIds">
                    <el-checkbox 
                      :label="city.code" 
                      :indeterminate="cityIndeterminate(city)" 
                      :disabled="city.hasSelected" 
                      @change="updateCity($event, index, cityIndex)"
                    >
                      <span class="checkbox-label">{{city.name}}</span>
                    </el-checkbox>
                  </el-checkbox-group>
                  <div class="province-expand-trigger-box" title="点击此处展开详细地区列表" @click="subExpandOrNot(cityIndex)">
                    <i class="el-icon-caret-bottom" :class="{'el-icon-caret-top': subExpandIndex == cityIndex}"></i>
                  </div>
                </div>
                <!-- 区级 -->
                <div v-if="subExpandIndex == cityIndex" class="area-list" :key="'ex' + cityIndex">
                  <div v-for="area in statusCityData[index].city[cityIndex].area" class="area-item" :key="area.code">
                    <el-checkbox-group v-model="selectAreaIds">
                      <el-checkbox :label="area.code" :disabled="area.hasSelected" @change="updateArea($event, index, cityIndex)">
                        <span class="checkbox-label">{{area.name}}</span>
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                </div>
                </template>
            </div>
          </template>
          
        </div>
        
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CityList',
  data() {
    return {
      selectProvinceIds: [],
      selectCityIds: [],
      selectAreaIds: [],
      selectResults: {},

      expandIndex: null,    //市级展开索引
      subExpandIndex: null    //区级展开索引
    };
  },
  props: {
    type: Number,
    selectCity: Array,
    statusCityData: Array,
    selectInfos: Object
  },
  mounted() {
    this.resetResult(this.selectInfos);
  },
  methods: {
    // 城市是否只被选中一部分
    provinceIndeterminate(item) {
      // console.log(item.code, this.selectResults);
      if(
        this.selectResults[item.code] && 
        Object.keys(this.selectResults[item.code]).length > 0 && 
        Object.keys(this.selectResults[item.code]).length != item.city.length
      ) {
        return true;
      }
      for(let i = 0; i < item.city.length; i++) {
        let city = item.city[i];
        if(
          this.selectResults[item.code] && 
          this.selectResults[item.code][item.city[i].code] && 
          this.selectResults[item.code][item.city[i].code].length != city.area.length
        ) {
          return true;
        }
      }
      return false;
    },

    cityIndeterminate(item) {
      // console.log(item.code, this.selectResults);
      let provinceId = item.code.substring(0, 2);
      if(
        this.selectResults[provinceId] &&
        this.selectResults[provinceId][item.code] && 
        this.selectResults[provinceId][item.code].length > 0 && 
        this.selectResults[provinceId][item.code].length != item.area.length
      ) {
        return true;
      }
      return false;
    },

    resetResult(initInfo = {}) {
      this.expandIndex = null;
      this.selectProvinceIds = initInfo.selectProvinceIds || [];
      this.selectCityIds = initInfo.selectCityIds || [];
      this.selectAreaIds = initInfo.selectAreaIds || [];
      this.selectResults = initInfo.selectResults || {};
      console.log(this.selectProvinceIds, this.selectCityIds, this.selectAreaIds)
    },
    rebuildResult() {
      // 重新建立以省市为键，以区列表为值的键值对
      let selectResults = {};
      for(let i = 0; i < this.selectAreaIds.length; i++) {
        let item = this.selectAreaIds[i];
        let provinceId = item.substring(0, 2);
        let cityId = item.substring(0, 4);
        if(!this.selectProvinceIds.includes(provinceId)) this.selectProvinceIds.push(provinceId);
        if(!this.selectCityIds.includes(cityId)) this.selectCityIds.push(cityId);
        if(!selectResults[provinceId]) selectResults[provinceId] = {};
        if(!selectResults[provinceId][cityId]) selectResults[provinceId][cityId] = [];
        selectResults[provinceId][cityId].push(item);
      }
      this.selectResults = selectResults;
    },
    expandOrNot(index) {
      if(this.expandIndex === index) {
        this.expandIndex = null;
      } else {
        this.expandIndex = index;
      }
    },
    subExpandOrNot(index) {
      if(this.subExpandIndex === index) {
        this.subExpandIndex = null;
      } else {
        this.subExpandIndex = index;
      }
    },
    selectAllCity(val, index) {
      if(val) {
        // 选中状态，选中其下所有市、区
        if(!this.selectProvinceIds.includes(this.statusCityData[index].code)) this.selectProvinceIds.push(this.statusCityData[index].code);
        for(let i = 0; i < this.statusCityData[index].city.length; i++) {
          for(let j = 0; j < this.statusCityData[index].city[i].area.length; j++) {
            if(this.statusCityData[index].city[i].area[j].hasSelected) continue;
            if(!this.selectAreaIds.includes(this.statusCityData[index].city[i].area[j].code)) this.selectAreaIds.push(this.statusCityData[index].city[i].area[j].code);
          }
          if(this.statusCityData[index].city[i].hasSelected) continue;
          if(!this.selectCityIds.includes(this.statusCityData[index].city[i].code)) this.selectCityIds.push(this.statusCityData[index].city[i].code);
        }

      } else {
        // 非选中状态，移除其下所有选中
        for(let i = 0; i < this.statusCityData[index].city.length; i++) {
          for(let j = 0; j < this.statusCityData[index].city[i].area.length; j++) {
            console.log(this.statusCityData[index].city[i].area[j].code, this.selectAreaIds);
            if(this.selectAreaIds.includes(this.statusCityData[index].city[i].area[j].code)) this.selectAreaIds.splice(this.selectAreaIds.indexOf(this.statusCityData[index].city[i].area[j].code), 1);
            
          }
          if(this.selectCityIds.includes(this.statusCityData[index].city[i].code)) this.selectCityIds.splice(this.selectCityIds.indexOf(this.statusCityData[index].city[i].code), 1);
        }
        if(this.selectProvinceIds.includes(this.statusCityData[index].code)) this.selectProvinceIds.splice(this.selectProvinceIds.indexOf(this.statusCityData[index].code), 1);
      }

      this.rebuildResult();
    },
    updateCity(val, index, cityIndex) {
      if(val) {
        if(!this.selectCityIds.includes(this.statusCityData[index].city[cityIndex].code)) this.selectProvinceIds.push(this.statusCityData[index].city[cityIndex].code);
        for(let i = 0; i < this.statusCityData[index].city[cityIndex].area.length; i++) {
          if(this.statusCityData[index].city[cityIndex].area[i].hasSelected) continue;
          if(!this.selectAreaIds.includes(this.statusCityData[index].city[cityIndex].area[i].code)) this.selectAreaIds.push(this.statusCityData[index].city[cityIndex].area[i].code);
        }
      } else {
        for(let i = 0; i < this.statusCityData[index].city[cityIndex].area.length; i++) {
          if(this.selectAreaIds.includes(this.statusCityData[index].city[cityIndex].area[i].code)) this.selectAreaIds.splice(this.selectAreaIds.indexOf(this.statusCityData[index].city[cityIndex].area[i].code), 1);
        }
        if(this.selectCityIds.includes(this.statusCityData[index].city[cityIndex].code)) this.selectCityIds.splice(this.selectCityIds.indexOf(this.statusCityData[index].city[cityIndex].code), 1);
      }
      this.rebuildResult();
      if(
        !this.selectResults[this.statusCityData[index].code] || 
        this.selectResults[this.statusCityData[index].code].length == 0 
      ) {
        if(this.selectProvinceIds.indexOf(this.statusCityData[index].code) >= 0) this.selectProvinceIds.splice(this.selectProvinceIds.indexOf(this.statusCityData[index].code), 1);
      }
    },
    updateArea(val, index, cityIndex) {
      this.rebuildResult();

      let keys = Object.keys(this.selectResults);
      if(
        !this.selectResults[this.statusCityData[index].code][this.statusCityData[index].city[cityIndex].code] || 
        this.selectResults[this.statusCityData[index].code][this.statusCityData[index].city[cityIndex].code].length == 0 
      ) {
        console.log(this.selectResults[this.statusCityData[index].code][this.statusCityData[index].city[cityIndex].code], this.statusCityData[index].city[cityIndex].code)
        if(this.selectCityIds.indexOf(this.statusCityData[index].city[cityIndex].code) >= 0) this.selectCityIds.splice(this.selectCityIds.indexOf(this.statusCityData[index].city[cityIndex].code), 1);
      }
      if(
        !this.selectResults[this.statusCityData[index].code] || 
        !this.selectResults[this.statusCityData[index].code].length == 0 
      ) {
        if(this.selectProvinceIds.indexOf(this.statusCityData[index].code) >= 0) this.selectProvinceIds.splice(this.selectProvinceIds.indexOf(this.statusCityData[index].code), 1);
      }
      console.log(this.selectAreaIds, this.selectCityIds);
    },
    returnResult() {
      return {
        selectAreaIds: this.selectAreaIds || [],
        selectResults: this.selectResults || {}
      }
    }
  },
};
</script>

<style scoped>
.province-list {
  display: flex;
  flex-wrap: wrap;
}
.province-item {
  display: flex;
  align-items: baseline;
  width: 33%;
}
.current-province {
  width: 100%;
}
.province-expand-trigger-box {
  width: 20px;
  height: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
.city-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  background-color: #f3f4f4;
}
.city-item {
  display: flex;
  align-items: baseline;
  margin-right: 10px;
  white-space: nowrap;
}
.area-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  background-color: #eaebeb;
}
.area-item {
  margin-right: 10px;
  white-space: nowrap;
}
</style>
