<template>
  <div>
    <el-form :model="historyItem" label-width="160px">
      <template>
        <el-form-item label="操作人员">
          <div class="form-content-static">{{historyItem.admin_name}}</div>
        </el-form-item>
        <el-form-item label="操作类型">
          <div class="form-content-static">{{typeTexts[historyItem.type]}}</div>
        </el-form-item>
        <el-form-item label="操作日期">
          <div class="form-content-static">{{historyItem.create_time}}</div>
        </el-form-item>
        <el-form-item label="券包内容">
          <div class="form-content-static">{{historyItem.content}}</div>
        </el-form-item>
      </template>
    </el-form>

    <el-tabs type="border-card">
      <el-tab-pane label="失败记录">
        <el-table :data="historyItem.failList" max-height="600px">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="用户昵称" prop="name" width="150"></el-table-column>
          <el-table-column label="手机号码" prop="phone" width="120">
          </el-table-column>
          <el-table-column label="失败信息" prop="summary"></el-table-column>
          <el-table-column label="操作" width="80">
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="成功记录">
        <el-table :data="historyItem.successList" max-height="600px">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="用户昵称" prop="name" width="150"></el-table-column>
          <el-table-column label="手机号码" prop="phone" width="120">
          </el-table-column>
          <el-table-column label="成功信息" prop="summary"></el-table-column>
          <el-table-column label="操作" width="80">
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>
<script>
export default {
  name: 'DeliverHistoryDetail',
  data() {
    return {
      
      typeTexts: {
        [1]: '派券',
        [2]: '补发'
      },
    }
  },
  props: {
    historyItem: Object
  },
  methods: {
    
  }
}
</script>