<template>
  <div class="side-panel-context">
    <div style="flex: 1 1 auto">
      <slot></slot>
    </div>
    <div style="flex: 0 0 auto;" :id="sidePanelContextId">
    </div>
  </div>
</template>

<script>

import { SlotNames, useSlotContext } from '../useSlot';

  export default {
    name: 'SidePanelContext',
    setup() {
      const { slotContextId: sidePanelContextId } = useSlotContext(SlotNames.SIDE_PANEL);

      return {
        sidePanelContextId,
      }
    },
  };

</script>

<style scoped>
  .side-panel-context {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
  }
</style>
