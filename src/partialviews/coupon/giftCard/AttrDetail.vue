<template>
  <div>
    <div class="category-commodities">
      <el-form>
        <el-form-item label="卡券名" label-width="100px">
          <div class="form-content-static">
            {{formData.title || '未命名'}}
          </div>
        </el-form-item>
        <el-form-item label="每人限领" label-width="100px">
          <div class="form-content-static">
            <span class="success-color">{{formData.take_limit || 0}} </span>张
          </div>
        </el-form-item>
        <el-form-item label="使用时间限制" label-width="100px">
          <template v-if="formData.used_limit_type == 2">
            <div class="form-content-static">
              获得后<span class="warning-color"> {{formData.valid_days}} </span>天内有效
            </div>
          </template>
          <template v-if="formData.used_limit_type == 1">
            <div class="form-content-static">
              {{formData.used_start_time}} ~ {{formData.used_end_time}}
            </div>
          </template>
        </el-form-item>
        
        <el-form-item label="有无时效" label-width="100px">
          <div class="form-content-static">{{formData.take_limit_type == 1 ? '有时效' : '无时效'}}</div>
        </el-form-item>
        <el-form-item label="可领取时间" label-width="100px">
          <div v-if="formData.take_limit_type == 1" class="form-content-static">
            {{formData.take_start_time}} ~ {{formData.take_end_time}}
          </div>
          <div v-if="formData.take_limit_type == -1" class="form-content-static">
            无领取时间限制
          </div>
        </el-form-item>
        <el-form-item label="卡券数量" label-width="100px">
          <div class="form-content-static">
            {{formData.all_number}} 张
          </div>
        </el-form-item>
        <el-form-item label="卡券库存" label-width="100px">
          <div class="form-content-static">
            已领<span class="warning-color"> {{formData.take_number}} </span>张，剩<span class="success-color"> {{formData.current_number}} </span>张
          </div>
        </el-form-item>
        <el-form-item label="预绑定上级" label-width="100px">
          <div v-if="formData.pre_link_superior_user" class="form-content-static">{{formData.pre_link_superior_user}}</div>
          <div v-else class="form-content-static">未设置关联上级</div>
        </el-form-item>

        <el-form-item label="">
          <el-table style="width: 100%" :data="formData.goods">
            <el-table-column label="名称" prop="title"> </el-table-column>
            <el-table-column label="规格" prop="attrs"> </el-table-column>
            <el-table-column label="每张卡里的商品数" width="150" prop="number">
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "EditAttr",
  data() {
    return {
    };
  },
  props: {
    formData: Object
  },
  mounted() {
  },
  methods: {
    
  },
};
</script>
