/**
 * 响应式布局 Composable
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  const screenWidth = ref(window.innerWidth)

  const updateScreenSize = () => {
    screenWidth.value = window.innerWidth

    // 移动端：< 640px (手机)
    isMobile.value = screenWidth.value < 640

    // 平板：640px - 1024px
    isTablet.value = screenWidth.value >= 640 && screenWidth.value < 1024

    // 桌面：>= 1024px
    isDesktop.value = screenWidth.value >= 1024
  }

  onMounted(() => {
    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize)
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth
  }
}
