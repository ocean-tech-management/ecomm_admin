<template>
  <div>
    <el-form :model="formData" label-width="80px">
      <el-form-item v-if="formData.type == 2" label="用户名" prop="name">
        <div class="form-content-static">{{formData.name}}</div>
      </el-form-item>
      <el-form-item label="指定等级" prop="level">
        <el-select class="standard-select" placeholder v-model="formData.level" @change="$forceUpdate()">
          <el-option v-for="leader in leaderData" :label="leader.name" :value="leader.level" :key="leader.level"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.level" label="负责区域">
        <el-select class="standard-select" placeholder v-model="provinceIndex" @change="updateSelectProvince">
          <el-option v-for="(item, index) in provinces" :label="item.name" :value="index" :key="index"></el-option>
        </el-select>
        <el-select v-if="formData.level > 1" class="standard-select" placeholder v-model="cityIndex" @change="updateSelectCity">
          <el-option v-for="(item, index) in cities" :label="item.name" :value="index" :key="index"></el-option>
        </el-select>
        <el-select v-if="formData.level > 2" class="standard-select" placeholder v-model="areaIndex">
          <el-option v-for="(item, index) in areas" :label="item.name" :value="index" :key="index"></el-option>
        </el-select>
      </el-form-item>
      
    </el-form>
    <div v-if="formData.type == 1" style="margin-top: 60px;">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm" class="demo-form-inline" label-width="80px">
          <el-form-item label="筛选" prop="keyword">
            <el-input v-model="queryForm.keyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form :model="formData" label-width="80px">
        <el-form-item label="指定用户" prop="uid">
          <el-select class="standard-select" placeholder="请选择" v-model="formData.uid" @change="$forceUpdate()">
            <el-option label="请选择" value></el-option>
            <el-option v-for="user in dataList" :label="user.user_name + (user.user_phone ? ('(' + user.user_phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从指定上级的选择器里进行精确指定</div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Assign",
  data() {
    return {
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],

      cityData: [],
      provinces: [],
      provinceIndex: 0,
      cities: [],
      cityIndex: 0,
      areas: [],
      areaIndex: 0
    };
  },
  props: {
    formData: Object,
    leaderData: Array
  },
  mounted() {
    this.getCityList(() => {
      this.confirmInitSelect();
    })
  },
  methods: {
    init(data) {
      if(this.cityData && this.cityData.length > 0) {
        this.confirmInitSelect(data);
      } else {
        this.getCityList(() => {
          this.confirmInitSelect(data);
        })
      }
    },
    confirmInitSelect(data) {
      let formData = data || this.formData;
      let provinceIndex = 0, cityIndex = 0, areaIndex = 0;
      let cities = [], areas = [];
      for(let i = 0; i < this.cityData.length; i++) {
        let province = this.cityData[i];
        if(province.code == formData.province) {
          provinceIndex = i;
          break;
        }
      }
      for(let i = 0; i < this.cityData[provinceIndex].city.length; i++) {
        let city = this.cityData[provinceIndex].city[i];
        if(city.code == formData.city) cityIndex = i;
        cities.push({
          code: city.code,
          name: city.name
        })
      }
      
      for(let i = 0; i < this.cityData[provinceIndex].city[cityIndex].area.length; i++) {
        let area = this.cityData[provinceIndex].city[cityIndex].area[i];
        if(area.code == formData.area) areaIndex = i;
        areas.push({
          code: area.code,
          name: area.name
        })
      }
      
      this.provinceIndex = provinceIndex, this.cityIndex = cityIndex, this.areaIndex = areaIndex;
      this.cities = cities, this.areas = areas;
    },
    
    getCityList() {
      let params = {
        type: [1, 2, 3]  //1省2市3区，按需
      }
      this.$post('/admin/ship/city', params, (res) => {
        let cityData = res.data || [];
        this.cityData = cityData;
        let provinces = [], cities = [], areas = [];
        for(let i = 0; i < cityData.length; i++) {
          let province = cityData[i];
          provinces.push({
            code: province.code,
            name: province.name
          })
        }
        for(let i = 0; i < cityData[0].city.length; i++) {
          let city = cityData[0].city[i];
          cities.push({
            code: city.code,
            name: city.name
          })
        }
        
        for(let i = 0; i < cityData[0].city[0].area.length; i++) {
          let area = cityData[0].city[0].area[i];
          areas.push({
            code: area.code,
            name: area.name
          })
        }
        this.provinceIndex = 0, this.cityIndex = 0, this.areaIndex = 0;
        this.provinces = provinces, this.cities = cities, this.areas = areas;
      }, err => {
        console.log(err);
      });
    },

    updateSelectProvince() {
      let cities = [], areas = [];
      for(let i = 0; i < this.cityData[this.provinceIndex].city.length; i++) {
        let city = this.cityData[this.provinceIndex].city[i];
        cities.push({
          code: city.code,
          name: city.name
        })
      }
      
      for(let i = 0; i < this.cityData[this.provinceIndex].city[0].area.length; i++) {
        let area = this.cityData[this.provinceIndex].city[0].area[i];
        areas.push({
          code: area.code,
          name: area.name
        })
      }
      this.cityIndex = 0, this.areaIndex = 0;
      this.cities = cities, this.areas = areas;
    },

    updateSelectCity() {
      
      let areas = [];
      for(let i = 0; i < this.cityData[this.provinceIndex].city[this.cityIndex].area.length; i++) {
        let area = this.cityData[this.provinceIndex].city[this.cityIndex].area[i];
        areas.push({
          code: area.code,
          name: area.name
        })
      }
      this.areaIndex = 0;
      this.areas = areas;
    },
    


    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.formData.link_uid = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/member/list', queryVal, res => {
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].uid == this.formData.uid) {
            // 剔除他自己本身
            dataList.splice(i, 1);
            break;
          }
        }
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.formData.link_uid = null;
      this.getUsers();
    },
    
    confirmResult() {
      let result = {
        assign_type: this.formData.assign_type,
        level: this.formData.level,
        uid: this.formData.uid,
        province: this.provinces[this.provinceIndex].code,
        city: this.cities[this.cityIndex].code,
        area: this.areas[this.areaIndex].code
      }
      return result;
    }

  }
};
</script>