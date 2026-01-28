<template>
  <div class="bottom-bar-context">
    <div style="flex: 1 1 auto">
      <slot></slot>
    </div>
    <div :id="bottomBarContextId" style="flex: 0 0 auto;">
    </div>
  </div>
</template>

<script>

import { SlotNames, useSlotContext } from '../useSlot';

  export default {
    name: 'BottomBarContext',
    setup() {
      const { slotContextId: bottomBarContextId } = useSlotContext(SlotNames.BOTTOM_BAR, { alwaysVisible: true });

      return {
        bottomBarContextId,
      }
    },
  };

</script>

<style scoped>
  .bottom-bar-context {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
</style>
