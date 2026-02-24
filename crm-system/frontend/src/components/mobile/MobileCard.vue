<template>
  <div :class="['mobile-card', { clickable }]" @click="handleClick">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="header-content">
          <span class="title">{{ title }}</span>
          <span v-if="extra" class="extra">{{ extra }}</span>
        </div>
      </slot>
    </div>

    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  extra?: string
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.mobile-card {
  background: $color-bg-card;
  border-radius: $border-radius-card; // 12px
  overflow: hidden;
  box-shadow: $box-shadow-light;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &.clickable {
    cursor: pointer;

    &:hover {
      box-shadow: $box-shadow-base;
      border-color: rgba($color-primary, 0.2);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0) scale(0.98);
      box-shadow: $box-shadow-light;
    }
  }

  .card-header {
    padding: $spacing-md $spacing-md;
    border-bottom: 1px solid $color-border-light;
    background: linear-gradient(
      to bottom,
      $color-bg-card 0%,
      rgba($color-bg-page, 0.3) 100%
    );

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: $spacing-sm;

      .title {
        font-size: $font-size-base;
        font-weight: $font-weight-semibold;
        color: $color-text-primary;
        line-height: 1.5;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .extra {
        font-size: $font-size-sm;
        color: $color-text-secondary;
        flex-shrink: 0;
      }
    }
  }

  .card-body {
    padding: $spacing-md; // 16px
    word-break: break-word;
    overflow-wrap: break-word;
    font-size: $font-size-sm;
    color: $color-text-regular;
    line-height: 1.6;
  }

  .card-footer {
    padding: $spacing-sm $spacing-md;
    border-top: 1px solid $color-border-light;
    background: rgba($color-bg-page, 0.5);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-sm;

    :deep(.el-button) {
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
      }
    }
  }
}
</style>