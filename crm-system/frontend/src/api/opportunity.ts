import request from '@/utils/request'

export function getOpportunityList(params: any) {
  return request({
    url: '/opportunities',
    method: 'get',
    params
  })
}

export function createOpportunity(data: any) {
  return request({
    url: '/opportunities',
    method: 'post',
    data
  })
}

export function getOpportunityDetail(id: number) {
  return request({
    url: `/opportunities/${id}`,
    method: 'get'
  })
}

export function updateOpportunity(id: number, data: any) {
  return request({
    url: `/opportunities/${id}`,
    method: 'put',
    data
  })
}

export function deleteOpportunity(id: number) {
  return request({
    url: `/opportunities/${id}`,
    method: 'delete'
  })
}

export function getOpportunityStats(params?: any) {
  return request({
    url: '/opportunities/stats',
    method: 'get',
    params
  })
}

export function getOpportunityFunnel(params?: any) {
  return request({
    url: '/opportunities/stats/funnel',
    method: 'get',
    params
  })
}

export function getOpportunityStageStats(params?: any) {
  return request({
    url: '/opportunities/stats/stage',
    method: 'get',
    params
  })
}

export function getOpportunityForecast(params?: any) {
  return request({
    url: '/opportunities/stats/forecast',
    method: 'get',
    params
  })
}

// 获取趋势分析数据
export function getOpportunityTrend(params?: any) {
  return request({
    url: '/opportunities/stats/trend',
    method: 'get',
    params
  })
}

// 获取团队对比数据
export function getOpportunityTeamComparison(params?: any) {
  return request({
    url: '/opportunities/stats/team-comparison',
    method: 'get',
    params
  })
}

// 获取带时间范围的统计数据
export function getOpportunityStatsWithTimeRange(params?: any) {
  return request({
    url: '/opportunities/stats/with-time-range',
    method: 'get',
    params
  })
}

// 获取看板数据（按阶段分组）
export function getKanbanData(params?: any) {
  return request({
    url: '/opportunities/kanban',
    method: 'get',
    params
  })
}

// 更新销售机会阶段
export function updateOpportunityStage(id: number, stage: string) {
  return request({
    url: `/opportunities/${id}/stage`,
    method: 'put',
    data: { stage }
  })
}

// 标记为赢单
export function markOpportunityAsWon(id: number, data: any) {
  return request({
    url: `/opportunities/${id}/won`,
    method: 'put',
    data
  })
}

// 标记为输单
export function markOpportunityAsLost(id: number, data: any) {
  return request({
    url: `/opportunities/${id}/lost`,
    method: 'put',
    data
  })
}
