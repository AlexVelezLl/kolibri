<template>
  <div>
    <slot></slot>
    <SidePanel>
      <SidePanelLayout
        title="resource side panel"
        :closePanel="toggleVisibility"
        :headerContainerStyleOverrides="{ borderBottom: '1px solid #ccc', padding: '8px 12px' }"
      >
        <template #default>
          <div style="padding-top: 16px;">
            <div :id="sidePanelContentId">
            </div>
            <div v-if="!isSidePanelModalContentGranted">
              Side panel content from root side panel
            </div>
          </div>
        </template>
        <template #bottomNavigation>
          <div>
            Bottom navigation from root side panel
          </div>
        </template>
      </SidePanelLayout>
    </SidePanel>
  </div>
</template>

<script>
  import SidePanelLayout from 'kolibri-common/components/courses/sidePanel/SidePanelLayout.vue';
  import SidePanel from '../sidePanels/SidePanel.vue';
import { SlotNames, useSlotContext, useSlotControls } from '../useSlot';
import { watch } from 'vue';

  export default {
    name: 'RootSidePanel',
    setup() {
      const { isVisible: isSidePanelVisible, toggleVisibility } = useSlotControls(SlotNames.SIDE_PANEL);

      watch(isSidePanelVisible, (newVal) => {
        console.log('RootSidePanel: isSidePanelVisible changed to', newVal);
      }, { immediate: true });
      const {
        slotContextId: sidePanelContentId,
        isGranted: isSidePanelModalContentGranted
      } = useSlotContext(
        SlotNames.SIDE_PANEL_CONTENT,
        {
          alwaysVisible: true,
          isParentVisible: isSidePanelVisible,
        }
      );
      return {
        isSidePanelVisible,
        toggleVisibility,
        sidePanelContentId,
        isSidePanelModalContentGranted,
      };
    },
    components: {
      SidePanel,
      SidePanelLayout,
    },
  };
</script>
