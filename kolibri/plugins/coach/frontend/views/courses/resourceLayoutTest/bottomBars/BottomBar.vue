<template>

  <div >
    <Teleport v-if="isActive" :to="`#${bottomBarContextId}`">
      <div style="width: 100%; border-top: 1px solid #ccc;">
        <slot></slot>
      </div>
    </Teleport>
  </div>

</template>

<script>
  import Teleport from 'vue2-teleport';
import { SlotNames, useSlotRequester } from '../useSlot';

export default {
  name: 'BottomBar',
  components: {
    Teleport,
  },
  setup() {
    const { isActive, slotContextId: bottomBarContextId } = useSlotRequester(SlotNames.BOTTOM_BAR);

    return {
      isActive,
      bottomBarContextId,
    };
  }
}
</script>
