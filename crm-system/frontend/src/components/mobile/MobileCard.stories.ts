import type { Meta, StoryObj } from '@storybook/vue3'
import MobileCard from './MobileCard.vue'
import { ElButton, ElTag } from 'element-plus'

const meta: Meta<typeof MobileCard> = {
  title: 'Mobile/MobileCard',
  component: MobileCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: {
      control: 'text',
      description: '卡片标题',
    },
    extra: {
      control: 'text', 
      description: '标题右侧额外内容',
    },
    clickable: {
      control: 'boolean',
      description: '是否可点击',
    },
  },
}

export default meta
type Story = StoryObj<typeof MobileCard>

export const Default: Story = {
  args: {
    title: '默认卡片',
  },
  render: (args) => ({
    components: { MobileCard },
    setup() {
      return { args }
    },
    template: `
      <MobileCard v-bind="args">
        <p>这是卡片的主要内容，可以包含任何内容。</p>
        <p>支持多行文本和复杂的布局结构。</p>
      </MobileCard>
    `,
  }),
}

export const WithExtra: Story = {
  args: {
    title: '客户信息',
    extra: '重要',
  },
  render: (args) => ({
    components: { MobileCard },
    setup() {
      return { args }
    },
    template: `
      <MobileCard v-bind="args">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div><strong>客户名称：</strong>北京科技有限公司</div>
          <div><strong>联系人：</strong>张三</div>
          <div><strong>电话：</strong>138-0000-0000</div>
          <div><strong>邮箱：</strong>zhang@example.com</div>
        </div>
      </MobileCard>
    `,
  }),
}

export const Clickable: Story = {
  args: {
    title: '可点击卡片',
    clickable: true,
  },
  render: (args) => ({
    components: { MobileCard },
    setup() {
      const handleClick = () => {
        alert('卡片被点击了！')
      }
      return { args, handleClick }
    },
    template: `
      <MobileCard v-bind="args" @click="handleClick">
        <p>点击这个卡片试试看！</p>
        <p>点击时会有缩放动画效果。</p>
      </MobileCard>
    `,
  }),
}

export const WithFooter: Story = {
  args: {
    title: '销售机会',
    extra: '¥50,000',
  },
  render: (args) => ({
    components: { MobileCard, ElButton, ElTag },
    setup() {
      return { args }
    },
    template: `
      <MobileCard v-bind="args">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div><strong>项目名称：</strong>CRM系统升级</div>
          <div><strong>客户：</strong>ABC公司</div>
          <div><strong>阶段：</strong><el-tag type="warning">方案确认</el-tag></div>
          <div><strong>预计成交：</strong>2024-12-31</div>
        </div>
        <template #footer>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small">查看详情</el-button>
          </div>
        </template>
      </MobileCard>
    `,
  }),
}

export const CustomerCard: Story = {
  args: {
    title: '客户详情',
    clickable: true,
  },
  render: (args) => ({
    components: { MobileCard, ElTag },
    setup() {
      return { args }
    },
    template: `
      <MobileCard v-bind="args">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; color: #409EFF;">深圳创新科技有限公司</h4>
            <el-tag type="success" size="small">活跃</el-tag>
          </div>
          <div><strong>行业：</strong>软件开发</div>
          <div><strong>规模：</strong>100-500人</div>
          <div><strong>负责人：</strong>李经理</div>
          <div><strong>电话：</strong>0755-12345678</div>
          <div><strong>地址：</strong>深圳市南山区科技园</div>
          <div><strong>最后联系：</strong>2024-10-20</div>
        </div>
        <template #footer>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <el-button size="small" type="primary">联系</el-button>
            <el-button size="small" type="warning">跟进</el-button>
            <el-button size="small">详情</el-button>
          </div>
        </template>
      </MobileCard>
    `,
  }),
}

export const MultipleCards: Story = {
  render: () => ({
    components: { MobileCard, ElTag, ElButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
        <MobileCard title="客户A" extra="VIP" clickable>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div><strong>公司：</strong>阿里巴巴集团</div>
            <div><strong>联系人：</strong>王总</div>
            <div><strong>状态：</strong><el-tag type="success" size="small">活跃</el-tag></div>
          </div>
        </MobileCard>
        
        <MobileCard title="客户B" extra="潜在" clickable>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div><strong>公司：</strong>腾讯科技</div>
            <div><strong>联系人：</strong>李总</div>
            <div><strong>状态：</strong><el-tag type="warning" size="small">跟进中</el-tag></div>
          </div>
        </MobileCard>
        
        <MobileCard title="客户C" extra="流失" clickable>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div><strong>公司：</strong>字节跳动</div>
            <div><strong>联系人：</strong>张总</div>
            <div><strong>状态：</strong><el-tag type="info" size="small">已流失</el-tag></div>
          </div>
        </MobileCard>
      </div>
    `,
  }),
}