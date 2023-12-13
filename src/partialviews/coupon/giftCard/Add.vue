<template>
  <div>
    <div class="category-commodities">
      <el-form>
        <el-form-item label="卡券名" label-width="100px">
          <el-input 
            style="max-width: 250px"
            auto-complete="off"
            placeholder="请填入" 
            v-model="formData.title"
          ></el-input>
        </el-form-item>
        <el-form-item label="每人限领" label-width="100px">
          <el-input 
            style="max-width: 250px"
            auto-complete="off"
            placeholder="请填入" 
            type="number"
            v-model="formData.take_limit"
          ></el-input>
        </el-form-item>
        <el-form-item label="使用时间限制" label-width="100px">
          <el-radio-group v-model="formData.used_limit_type">
            <div class="form-with-ctrl">
              <div class="form-with-ctrl-ctrl">
                <el-radio :label="2">获得后</el-radio>
              </div>
              <el-input
                class="form-with-ctrl-content"
                auto-complete="off"
                placeholder="请填入" 
                type="number"
                v-model="formData.valid_days"
                :disabled="formData.used_limit_type != 2"
              ></el-input>
              <div class="form-with-ctrl-ctrl">天内有效</div>
            </div>
            <div class="form-with-ctrl">
              <div class="form-with-ctrl-ctrl">
                <el-radio :label="1">日期</el-radio>
              </div>
              <el-date-picker
                class="form-with-ctrl-content"
                v-model="formData.used_time"
                type="datetimerange"
                :picker-options="formPickerOptions"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                :editable="false" 
                :disabled="formData.used_limit_type != 1"
              ></el-date-picker>
              <div class="form-with-ctrl-ctrl">内有效</div>
            </div>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="有无时效" label-width="100px">
          <el-checkbox :true-label="1" :false-label="-1" v-model="formData.take_limit_type">有时效</el-checkbox>
        </el-form-item>
        <el-form-item v-if="formData.take_limit_type == 1" label="可领取时间" label-width="100px">
          <el-date-picker
            v-model="formData.take_time"
            type="datetimerange"
            :picker-options="formPickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="yyyy-MM-dd HH:mm:ss"
            :editable="false"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="卡券数量" label-width="100px">
          <el-input 
            label-width="100px"
            style="max-width: 250px"
            auto-complete="off"
            placeholder="请填入" 
            type="number"
            v-model="formData.all_number" 
            @change="validNum"
          ></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-table style="width: 100%" :data="formData.goods">
            <el-table-column label="名称" prop="title"> </el-table-column>
            <el-table-column label="规格" prop="attrs"> </el-table-column>
            <el-table-column label="库存" width="150" prop="stock">
            </el-table-column>
            <el-table-column label="每张卡里的商品数" width="150">
              <template slot-scope="scope">
                <el-input
                  style="width: 120px"
                  auto-complete="off"
                  placeholder="填一下"
                  v-model="formData.goods[scope.$index].number"
                  type="number" 
                  @change="validItemNum($event, scope.$index)"
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column label="总商品数" width="150">
              <template slot-scope="scope">
                <span 
                  v-if="formData.goods[scope.$index].valid" 
                  :class="{'error-color': formData.goods[scope.$index].allNumber > formData.goods[scope.$index].stock}"
                >{{formData.goods[scope.$index].allNumber}}</span>
                <span v-else>商品数或卡券数有问题</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="deleteCommedity(scope.$index)"
                  >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>

    
    <div style="margin-top: 60px;">
      <div class="page-ctrl">
        <el-form :inline="true" :model="queryForm" @submit.native.prevent ref="queryForm">
          <el-form-item label="筛选" prop="keyword" label-width="100px">
            <el-input v-model="queryForm.keyword" placeholder="请输入手机号码或昵称" @keyup.enter.native="queryInfo"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryInfo">查询</el-button>
            <el-button @click="resetQuery('queryForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="预绑定上级" prop="pre_link_superior_user">
          <el-select class="standard-select" placeholder="不指定任何上级" v-model="formData.pre_link_superior_user" @change="$forceUpdate()">
            <el-option label="不指定任何上级" :value="null"></el-option>
            <el-option v-for="user in dataList" :label="user.user_name + (user.user_phone ? ('(' + user.user_phone + ')') : '')" :value="user.uid" :key="user.uid"></el-option>
          </el-select>
          <span style="margin-left: 15px;">共 {{dataList.length}} 个模糊选项</span>
          <div class="form-tips">先使用 昵称、手机 这筛选条件进行模糊寻找，然后从预绑定上级的选择器里进行精确指定</div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: "AddGiftCard",
  data() {
    return {
      leaderData: [],
      
      queryForm: {
        keyword: ''
      },
      filter: {
        keyword: ''
      },
      dataList: [],

      ...formNTimePickerConfig,
    };
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
    validNum(val) {
      let goods = this.formData.goods.slice(0);
      if((!val && val !== 0) || !(/^(0|[1-9][0-9]*)$/.test(val))) {
        for(let i = 0; i < this.formData.goods.length; i++) {
          goods[i].valid = false;
        }
      } else {
        for(let i = 0; i < goods.length; i++) {
          if((!goods[i].number && goods[i].number !== 0) || !(/^(0|[1-9][0-9]*)$/.test(goods[i].number))) {
            goods[i].valid = false;
          } else {
            goods[i].valid = true;
            goods[i].allNumber = parseInt(goods[i].number) * parseInt(this.formData.all_number);
          }
        }
      }
      this.formData.goods = goods;
    },
    validItemNum(val, index) {
      let goods = this.formData.goods.slice(0);
      if((!this.formData.all_number && this.formData.all_number !== 0) || !(/^(0|[1-9][0-9]*)$/.test(this.formData.all_number))) {
        for(let i = 0; i < this.formData.goods.length; i++) {
          goods[i].valid = false;
        }
      } else {
        if((!val && val !== 0) || !(/^(0|[1-9][0-9]*)$/.test(val))) {
          goods[index].valid = false;
        } else {
          goods[index].valid = true;
          goods[index].allNumber = parseInt(goods[index].number) * parseInt(this.formData.all_number);
        }
      }
      this.formData.goods = goods;
    },

    deleteCommedity(index) {
      this.formData.goods.splice(index, 1);
    },

    
    //查询
    queryInfo() {
      this.currentPage = 1;
      this.filter = {
        keyword: this.queryForm.keyword
      };
      this.formData.pre_link_superior_user = null;
      this.getUsers();
    },
    //获取列表
    getUsers() {
      let queryVal = {
        keyword: this.filter.keyword
      };

      this.$get('/admin/member/list', queryVal, res => {
        let dataList = res.data;
        this.dataList = dataList;
      });
    },
    //重置查询条件
    resetQuery(queryForm) {
      this.$refs[queryForm].resetFields();
      this.filter = {
        keyword: ''
      };
      this.formData.pre_link_superior_user = null;
      this.getUsers();
    },
  },
};
</script>
