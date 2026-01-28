<template>

  <div v-if="isSidePanelGranted">
    <slot :isOpen="isOpen" :toggleSidePanel="toggleSidePanel"></slot>
  </div>

</template>

<script>
  import { useSlotControls, SlotNames } from '../useSlot';

  export default {
    name: 'SidePanelToggle',
    setup() {
      const { isVisible: isOpen, isGranted: isSidePanelGranted, toggleVisibility: toggleSidePanel } = useSlotControls(SlotNames.SIDE_PANEL);
      return {
        isOpen,
        toggleSidePanel,
        isSidePanelGranted,
      };
    },
  };
</script>
