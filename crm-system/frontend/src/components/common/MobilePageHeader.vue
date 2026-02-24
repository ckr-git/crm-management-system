<template>
  <div class="mobile-page-header">
    <el-button
      v-if="showBack"
      :icon="ArrowLeft"
      circle
      class="back-btn"
      @click="handleBack"
    />
    <div class="header-title">{{ title }}</div>
    <div class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

interface Props {
  title: string
  showBack?: boolean
  backPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true
})

const router = useRouter()

const handleBack = () => {
  if (props.backPath) {
    router.push(props.backPath)
  } else {
    router.back()
  }
}
</script>

<style scoped lang="scss">
.mobile-page-header {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  height: 50px;
  background: $color-bg-card;
  border-bottom: 1px solid $color-border-light;
  box-shadow: $box-shadow-light;
  display: flex;
  align-items: center;
  padding: 0 $spacing-md;
  z-index: 100;
  transition: box-shadow 0.3s ease;

  .back-btn {
    flex-shrink: 0;
    border: none;
    width: 36px;
    height: 36px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(-2px);
      background: $color-bg-page;
    }

    &:active {
      transform: translateX(-3px) scale(0.95);
    }

    :deep(.el-icon) {
      font-size: $font-size-lg;
      color: $color-text-regular;
    }
  }

  .header-title {
    flex: 1;
    text-align: center;
    font-size: $font-size-lg; // 18px
    font-weight: $font-weight-semibold;
    color: $color-text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 $spacing-sm;
    line-height: 1.4;
  }

  .header-actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: $spacing-xs;

    :deep(.el-button) {
      padding: $spacing-xs $spacing-sm;
      height: 36px;
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
      }
    }
  }
}
</style>