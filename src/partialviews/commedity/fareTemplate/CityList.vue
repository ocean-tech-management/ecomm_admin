<template>
  <div>
    <el-form label-width="0">
      <el-form-item label="">
        <div class="province-list">
          <template v-for="(item, index) in statusCityData">
            <div class="province-item" :class="{'current-province': expandIndex == index}" :key="item.code">
              <el-checkbox-group v-model="selectProvinceIds">
                <el-checkbox :label="item.code" :disabled="item.hasSelected" :indeterminate="selectResults[item.code] && selectResults[item.code].length > 0 && selectResults[item.code].length != item.city.length" @change="selectAllCity($event, index)">
                  <span class="checkbox-label">{{item.name}}</span>
                </el-checkbox>
              </el-checkbox-group> 
              <div class="province-expand-trigger-box" title="点击此处展开详细城市列表" @click="expandOrNot(index)">
                <i class="el-icon-caret-bottom" :class="{'el-icon-caret-top': expandIndex == index}"></i>
              </div>
            </div>
            <div v-if="expandIndex == index" class="city-list" :key="'ex' + index">
              <div v-for="city in statusCityData[index].city" class="city-item" :key="city.code">
                <el-checkbox-group v-model="selectCityIds">
                  <el-checkbox :label="city.code" :disabled="city.hasSelected" @change="updateCity">
                    <span class="checkbox-label">{{city.name}}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
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
      selectResults: {},

      expandIndex: null
    };
  },
  props: {
    type: Number,
    selectCity: Array,
    statusCityData: Array,
    selectInfos: Object
  },
  mounted() {
    if(this.type == 2) {
      this.resetResult(this.selectInfos);
    }
  },
  methods: {
    resetResult(initInfo = {}) {
      this.expandIndex = null;
      this.selectProvinceIds = initInfo.selectProvinceIds || [];
      this.selectCityIds = initInfo.selectCityIds || [];
      this.selectResults = initInfo.selectResults || {};
    },
    rebuildResult() {
      // 重新建立以省为键，以市列表为值的键值对
      let selectResults = {};
      for(let i = 0; i < this.selectCityIds.length; i++) {
        let item = this.selectCityIds[i];
        let provinceId = item.substring(0, 2);
        if(!this.selectProvinceIds.includes(provinceId)) this.selectProvinceIds.push(provinceId);
        if(!selectResults[provinceId]) selectResults[provinceId] = [];
        selectResults[provinceId].push(item);
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
    selectAllCity(val, index) {
      if(val) {
        if(!this.selectProvinceIds.includes(this.statusCityData[index].code)) this.selectProvinceIds.push(this.statusCityData[index].code);
        for(let i = 0; i < this.statusCityData[index].city.length; i++) {
          if(this.statusCityData[index].city[i].hasSelected) continue;
          if(!this.selectCityIds.includes(this.statusCityData[index].city[i].code)) this.selectCityIds.push(this.statusCityData[index].city[i].code);
        }

      } else {
        for(let i = 0; i < this.statusCityData[index].city.length; i++) {
          if(this.selectCityIds.includes(this.statusCityData[index].city[i].code)) this.selectCityIds.splice(this.selectCityIds.indexOf(this.statusCityData[index].city[i].code), 1);
        }
        if(this.selectProvinceIds.includes(this.statusCityData[index].code)) this.selectProvinceIds.splice(this.selectProvinceIds.indexOf(this.statusCityData[index].code), 1);
      }
      this.selectCityIds = this.selectCityIds;
      this.rebuildResult();
    },
    updateCity(val) {
      this.rebuildResult();
      let keys = Object.keys(this.selectResults);
      for(let i = 0; i < keys.length; i++) {
        if(this.selectResults[keys[i]].length == 0) {
          if(this.selectProvinceIds.includes(keys[i])) this.selectProvinceIds.splice(i, 1);
        }
      }
    },
    returnResult() {
      return {
        selectCityIds: this.selectCityIds || [],
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
  margin-right: 10px;
  white-space: nowrap;
}
</style>
