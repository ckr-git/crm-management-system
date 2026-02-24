<template>
  <div :class="['page-header', { mobile: isMobile }]">
    <!-- 面包屑导航 -->
    <el-breadcrumb v-if="breadcrumbs && breadcrumbs.length > 0" separator="/" class="page-breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
        {{ item.label }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="header-content">
      <div class="header-left">
        <el-button
          v-if="showBack"
          :icon="ArrowLeft"
          :circle="isMobile"
          :text="!isMobile"
          class="back-button"
          @click="handleBack"
        >
          <span v-if="!isMobile">返回</span>
        </el-button>
        <div class="header-title">
          <component :is="titleTag">{{ title }}</component>
          <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>
      </div>
      
      <div v-if="$slots.actions || $slots.extra" class="header-actions">
        <slot name="actions"></slot>
        <slot name="extra"></slot>
      </div>
    </div>
    
    <div v-if="description" class="header-description">
      <p>{{ description }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResponsive } from '@/composables/useResponsive'
import { ArrowLeft } from '@element-plus/icons-vue'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface Props {
  title: string
  subtitle?: string
  description?: string
  showBack?: boolean
  backPath?: string
  titleLevel?: 'h1' | 'h2' | 'h3'
  breadcrumbs?: BreadcrumbItem[]
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  titleLevel: 'h2'
})

const titleTag = computed(() => props.titleLevel)

const router = useRouter()
const { isMobile } = useResponsive()

const handleBack = () => {
  if (props.backPath) {
    router.push(props.backPath)
  } else {
    router.back()
  }
}
</script>
<style scoped lang="scss">
.page-header {
  background: $color-bg-card;
  border-radius: $border-radius-card;
  box-shadow: $box-shadow-light;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: $box-shadow-base;
  }

  &.mobile {
    position: sticky;
    top: 50px;
    z-index: 100;
    margin-bottom: 0;
    border-radius: 0;
    padding: $spacing-md;
  }
}

.page-breadcrumb {
  margin-bottom: $spacing-sm;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;

  .header-left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;

    .back-button {
      flex-shrink: 0;
    }

    .header-title {
      h1, h2, h3 {
        margin: 0;
        font-weight: $font-weight-bold;
        color: $color-text-primary;
      }

      h1 { font-size: $font-size-extra-large; }
      h2 { font-size: $font-size-large; }
      h3 { font-size: $font-size-medium; }

      .subtitle {
        margin: $spacing-xs 0 0;
        font-size: $font-size-sm;
        color: $color-text-secondary;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: $spacing-sm;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
}

.header-description {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $color-border-lighter;

  p {
    margin: 0;
    color: $color-text-regular;
    font-size: $font-size-sm;
    line-height: 1.6;
  }
}
</style>
