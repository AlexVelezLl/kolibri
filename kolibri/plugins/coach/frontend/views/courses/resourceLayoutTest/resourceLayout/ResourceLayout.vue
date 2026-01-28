<template>
  <div>
    <slot></slot>
    <!--
      Use a key that changes with windowBreakpoint to force re-mounting Teleport on breakpoint change, this
      ensures that the Teleport updates its target location when the modal is toggled on/off at different breakpoints.
    -->
    <Teleport
      v-if="isSidePanelContentActive" :to="`#${sidePanelContentId}`"
      :key="`${sidePanelContentId}-${windowBreakpoint}`"
    >
      <slot name="sidePanelContent"></slot>
    </Teleport>
    <BottomBar v-if="hasBottomBar">
      <slot name="bottomBar"></slot>
    </BottomBar>
  </div>
</template>

<script>

import Teleport from 'vue2-teleport';
import { SlotNames, useSlotRequester } from '../useSlot';
import BottomBar from '../bottomBars/BottomBar.vue';

  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
import { computed } from 'vue';

export default {
  name: 'ResourceLayout',
  setup(props, { slots }) {
    const { windowBreakpoint } = useKResponsiveWindow();
    const { isActive: isSidePanelContentActive, slotContextId: sidePanelContentId } = useSlotRequester(SlotNames.SIDE_PANEL_CONTENT, {
      request: Boolean(slots.sidePanelContent),
    });

    const hasBottomBar = computed(() => Boolean(slots.bottomBar));


    return {
      hasBottomBar,
      windowBreakpoint,
      sidePanelContentId,
      isSidePanelContentActive,
    };
  },
  components: {
    Teleport,
    BottomBar,
  },
}
</script>
