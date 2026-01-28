<template>

  <div v-if="isActive">
    <Teleport v-if="showAsModal" :to="`#${sidePanelContextId}`">
      <aside style="width: 350px; border-left: 1px solid #ccc; height: 100%;">
        <slot></slot>
      </aside>
    </Teleport>
    <SidePanelModal width="350px"  v-else>
      <slot></slot>
    </SidePanelModal>
  </div>

</template>

<script>
import { computed  } from 'vue';
  import Teleport from 'vue2-teleport';
import SidePanelModal from 'kolibri-common/components/courses/sidePanel/SidePanelModal.vue';
  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
import { SlotNames, useSlotRequester } from '../useSlot';

export default {
  name: 'SidePanel',
  components: {
    Teleport,
    SidePanelModal,
  },
  setup() {
    const { windowBreakpoint } = useKResponsiveWindow();

    const showAsModal = computed(() => windowBreakpoint.value > 2);

    const { isActive, requesterId, slotContextId: sidePanelContextId } = useSlotRequester(SlotNames.SIDE_PANEL);

    return {
      isActive,
      showAsModal,
      requesterId,
      sidePanelContextId,
    };
  }
}
</script>
