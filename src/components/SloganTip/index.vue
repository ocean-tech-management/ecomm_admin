<template>
  <el-popover :placement="placement" :width="width" trigger="hover">
    <div :style="{ color: default_color[type], 'border-color': default_color[type] }" class="warning-button"
      slot="reference">
      <i class="el-icon-warning"></i>
      <span>使用提醒</span>
    </div>
    <div class="popover-container">
      <img src="../../assets/imgs/warning.png" class="warning-image" />
      <div class="popover-content">
        <div class="popover-title">警告</div>
        <div class="popover-text">{{ content }}</div>
      </div>
    </div>
  </el-popover>
</template>
<script>
export default {
  name: 'SloganTip',
  componentName: 'SloganTip',
  data() {
    return {
      default_color: {
        primary: '#409EFF',
        success: '#67C23A',
        warning: '#E6A23C',
        danger: '#F56C6C',
        info: '#909399',
      }
    }
  },
  props: {
    title: {
      type: String,
      default: '警告'
    },
    content: {
      type: String,
      default: '本功能仅针对实际运营过程中包含但不限于 (对系统产生恶意攻击行为、产生恶劣影响、用户要求等)的用户 或 实际运营场景需要 使用。 若本功能涉及用户, 请在使用本功能前提前告知用户, 避免引起纠纷。请勿滥用本功能!',
    },
    placement: {
      // top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end
      type: String,
      default: 'right-start'
    },
    width: {
      type: String,
      default: '500'
    },
    type: {
      type: String,
      default: 'warning'
    },
  },
  computed: {
    hasSlotDefault() {
      return !!this.$slots.default
    }
  },
}
</script>
<style lang="less" scoped>
.warning-button {
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  padding: 4px 8px 4px 4px;
  font-size: 16px;
  box-sizing: border-box;

  .el-icon-warning {
    margin-right: 4px;
  }
}

.popover-container {
  display: flex;

  .warning-image {
    flex: none;
    width: 35px;
    height: 35px;
  }

  .popover-content {
    flex: auto;
    padding-left: 20px;

    .popover-title {
      font-size: 20px;
      font-weight: 600;
    }

    .popover-text {
      padding-top: 20px;
      font-size: 16px;
      color: #909399;
    }
  }
}
</style>