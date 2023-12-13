<template>
  <div>
    <el-form :model="formData" label-width="100px">
      <el-form-item label="卡券批次">
        <el-input style="max-width: 250px" auto-complete="off" placeholder="请输入卡券名字" v-model="formData.title"></el-input>
      </el-form-item>
      <el-form-item label="时效性">
        <el-radio-group v-model="formData.limit_type">
          <el-radio :label="1">有时效</el-radio>
          <el-radio :label="-1">无时效</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.limit_type == 1" label="有效时间">
        <el-date-picker 
          v-model="formData.time"
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
      <el-form-item label="批次说明">
        <el-input
          style="max-width: 350px"
          auto-complete="off"
          type="textarea"
          placeholder="请输入卡券批次的简单说明哦"
          v-model="formData.remark"
        ></el-input>
      </el-form-item>
      <el-form-item label="限领">
        <el-input 
          style="max-width: 250px"
          auto-complete="off"
          placeholder="请填入" 
          type="number"
          v-model="formData.take_limit"
        ></el-input>
        <div class="form-tips">每人限领数量（正整数）</div>
      </el-form-item>
    </el-form>
    <div class="category-commodities">
      <el-table style="width: 100%" :data="formData.goods">
        <el-table-column label="名称" prop="title">
        </el-table-column>
        <el-table-column label="规格" width="200" prop="attrs">
        </el-table-column>
        <el-table-column label="总商品数" width="120" prop="total_number">
        </el-table-column>
        <el-table-column label="已占用" width="120">
          <template slot-scope="scope">
            {{scope.row.generate_number}}
            <span v-if="scope.row.current_stock">
              (余 <span class="warning-color">{{scope.row.current_stock}}</span>)
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已领取" width="120">
          <template slot-scope="scope">
            {{scope.row.take_number}}
            <span v-if="scope.row.current_untake">
              (余 <span class="warning-color">{{scope.row.current_untake}}</span>)
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已使用" width="120">
          <template slot-scope="scope">
            {{scope.row.used_number}}
            <span v-if="scope.row.current_unused">
              (余 <span class="warning-color">{{scope.row.current_unused}}</span>)
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {formNTimePickerConfig} from '@/config';
export default {
  name: "EditGiftCardBatch",
  data() {
    return {

      ...formNTimePickerConfig
    };
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


<style lang="less" scoped>
.discount-commodity-select {
  display: flex;
  align-items: center;
}
.commodity-select-wrapper {
  width: 250px;
  height: 300px;
  margin: 0 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow-y: scroll;
}
.commodity-select-item {
  display: flex;
  align-items: center;
  padding: 5px 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
  cursor: pointer;
}
.commodity-select-item:hover {
  background-color: #f2f3f3;
}
.commodity-select-item.active {
  color: #fff;
  background-color: #618df5;
}

.category-ctrl {
  margin-top: 40px;
}

.select-item-flex {
  flex: 1;
  width: 80px;
  text-overflow: ellipsis;
  overflow: hidden;
  user-select: none;
}
.select-item-delete {
  padding: 0 10px;
  margin-right: -15px;
  font-size: 24px;
  font-weight: 500;
}
.select-item-delete:hover {
  color: #618df5;
}
</style>