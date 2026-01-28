<template>
  <ResourceLayout>
    <template #default>
      <div :style="`border: 2px solid ${color}; margin: 8px; padding: 8px`">
        Resource layout example - {{ title }}
        <slot></slot>
      </div>
    </template>
    <template #bottomBar v-if="requestBottomBar">
      <div style="height: 72px; display: flex; align-items: center; padding: 16px">
        Bottom bar being rendered from ResourceLayoutExample - {{ title }}
      </div>
    </template>
    <template #sidePanelContent v-if="requestSidePanel">
      Side panel content being rendered from ResourceLayoutExample - {{ title }}
    </template>
  </ResourceLayout>
</template>

<script>
import SidePanel from '../sidePanels/SidePanel.vue';
import ResourceLayout from './ResourceLayout.vue';

  export default {
    name: 'ResourceLayoutExample',
    components: {
      ResourceLayout,
      SidePanel
    },
    props: {
      title: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      requestSidePanel: {
        type: Boolean,
        required: false,
        default: true,
      },
      requestBottomBar: {
        type: Boolean,
        required: false,
        default: true,
      },
    },
  };
</script>
