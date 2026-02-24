<template>
  <div class="opportunity-kanban">
    <PageHeader title="销售漏斗看板" description="拖拽机会卡片切换阶段" :show-back="false">
      <template #extra>
        <el-radio-group v-model="onlyMine" @change="loadKanbanData" size="default">
          <el-radio-button label="true">我的机会</el-radio-button>
          <el-radio-button label="false">全部机会</el-radio-button>
        </el-radio-group>
        <el-button @click="loadKanbanData" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
    </PageHeader>

    <div class="kanban-container" v-loading="loading">
      <div v-for="column in kanbanData" :key="column.stage" class="kanban-column">
        <div class="column-header">
          <div class="column-title">{{ column.stageName }}</div>
          <div class="column-stats">
            <span class="count">📄 {{ column.opportunities?.length || 0 }} 个机会</span>
            <span class="amount">💰 ¥{{ formatAmount(column.totalAmount || 0) }}</span>
          </div>
        </div>
        <draggable
          v-model="column.opportunities"
          group="opportunities"
          item-key="id"
          class="column-content"
          @change="(evt) => handleDragChange(evt, column.stage)"
        >
          <template #item="{ element }">
            <OpportunityCard
              :opportunity="element"
              @view="handleViewDetail"
              @win="handleWin"
              @lost="handleLost"
            />
          </template>
        </draggable>
      </div>
    </div>

    <!-- 赢单对话框 -->
    <WinDialog
      :visible="winDialogVisible"
      @update:visible="winDialogVisible = $event"
      :opportunity-id="currentOpportunityId"
      :opportunity-name="currentOpportunityName"
      :expected-amount="currentExpectedAmount"
      @success="handleWinSuccess"
    />

    <!-- 输单对话框 -->
    <LostDialog
      :visible="lostDialogVisible"
      @update:visible="lostDialogVisible = $event"
      :opportunity-id="currentOpportunityId"
      :opportunity-name="currentOpportunityName"
      @success="handleLostSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import PageHeader from '@/components/common/PageHeader.vue'
import OpportunityCard from './components/OpportunityCard.vue'
import WinDialog from '@/components/opportunity/WinDialog.vue'
import LostDialog from '@/components/opportunity/LostDialog.vue'
import { getKanbanData, updateOpportunityStage } from '@/api/opportunity'

const router = useRouter()

const loading = ref(false)
const onlyMine = ref('true')
const kanbanData = ref<any[]>([])

// 赢单/输单弹窗
const winDialogVisible = ref(false)
const lostDialogVisible = ref(false)
const currentOpportunityId = ref<number>()
const currentOpportunityName = ref('')
const currentExpectedAmount = ref(0)

// 加载看板数据
const loadKanbanData = async () => {
  try {
    loading.value = true
    const res = await getKanbanData({
      onlyMine: onlyMine.value
    })
    kanbanData.value = res.data || []
  } catch (error) {
    console.error('加载看板数据失败:', error)
    ElMessage.error('加载看板数据失败')
  } finally {
    loading.value = false
  }
}

// 处理拖拽变化
const handleDragChange = async (evt: any, toStage: string) => {
  // 只处理added事件（机会被拖入此列）
  if (evt.added) {
    const opportunity = evt.added.element
    const oldStage = opportunity.stage
    
    // 如果阶段没有变化，不需要更新
    if (oldStage === toStage) {
      return
    }

    try {
      // 更新后端
      await updateOpportunityStage(opportunity.id, toStage)
      
      // 更新本地数据
      opportunity.stage = toStage
      
      ElMessage.success(`已将"${opportunity.name}"移至${getStageName(toStage)}阶段`)
    } catch (error: any) {
      console.error('更新阶段失败:', error)
      ElMessage.error(error.response?.data?.message || '更新阶段失败')
      
      // 失败时重新加载数据，恢复原状
      loadKanbanData()
    }
  }
}

// 获取阶段名称
const getStageName = (stage: string) => {
  const stageMap: Record<string, string> = {
    potential: '潜在客户',
    intention: '意向客户',
    quotation: '报价',
    negotiation: '谈判',
    deal: '成交'
  }
  return stageMap[stage] || stage
}

// 格式化金额
const formatAmount = (amount: any) => {
  const num = parseFloat(amount)
  if (!num || isNaN(num)) return '0'
  return (num / 10000).toFixed(2) + '万'
}

// 查看机会详情
const handleViewDetail = (id: number) => {
  router.push(`/opportunities/${id}`)
}

// 处理赢单
const handleWin = (opportunity: any) => {
  currentOpportunityId.value = opportunity.id
  currentOpportunityName.value = opportunity.name
  currentExpectedAmount.value = parseFloat(opportunity.amount) || 0
  winDialogVisible.value = true
}

// 处理输单
const handleLost = (opportunity: any) => {
  currentOpportunityId.value = opportunity.id
  currentOpportunityName.value = opportunity.name
  lostDialogVisible.value = true
}

// 赢单成功回调
const handleWinSuccess = () => {
  loadKanbanData()
}

// 输单成功回调
const handleLostSuccess = () => {
  loadKanbanData()
}

onMounted(() => {
  loadKanbanData()
})
</script>
<style lang="scss" scoped>
.opportunity-kanban {
  padding: 0;
}

.kanban-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 20px 0;
  background: $color-bg-page;
}

.kanban-column {
  flex: 0 0 300px;
  background: $color-bg-card;
  border-radius: $border-radius-card;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  box-shadow: $box-shadow-base;
  border: 1px solid $color-border-light;

  @include mobile {
    flex: 0 0 260px;
    max-height: calc(100vh - 160px);
  }

  .column-header {
    padding: $spacing-lg;
    background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
    border-radius: $border-radius-card $border-radius-card 0 0;
    border-bottom: 3px solid darken($color-primary, 15%);

    .column-title {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
      color: white;
      margin-bottom: $spacing-sm;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .column-stats {
      display: flex;
      justify-content: space-between;
      font-size: $font-size-sm;

      .count {
        color: rgba(255, 255, 255, 0.9);
        font-weight: $font-weight-medium;
      }

      .amount {
        color: #FFF;
        font-weight: $font-weight-bold;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .column-content {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-md;
    min-height: 300px;
    background: #F8F9FA;
  }
}
</style>
