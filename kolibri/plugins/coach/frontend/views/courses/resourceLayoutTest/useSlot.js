import { computed, inject, nextTick, onBeforeUnmount, provide, ref, unref } from "vue";


let _contextUid = 0;
let _requesterUid = 0;

const getContextId = (slotName, instanceId) => `slot-context-${slotName}-${instanceId}`;

const getRequesterId = (slotName, instanceId) => `slot-requester-${slotName}-${instanceId}`;


const getKeys = (slotName) => ({
  CONTEXT_ID: `slot-context-${slotName}`,
  REQUEST: `request-${slotName}`,
  RELEASE: `release-${slotName}`,
  ACTIVE_ID: `active-${slotName}-id`,
  IS_VISIBLE: `${slotName}-is-visible`,
  TOGGLE: `toggle-${slotName}`,
  HOLDER_ID: `${slotName}-holder-id`,
});

const checkSlotName = (slotName) => {
  if (typeof slotName !== 'string' || slotName.trim() === '') {
    throw new Error('slotName must be a non-empty string');
  }
}

export const SlotNames = {
  SIDE_PANEL: 'side-panel',
  SIDE_PANEL_CONTENT: 'side-panel-content',
  BOTTOM_BAR: 'bottom-bar',
}

export const useSlotContext = (slotName, { alwaysVisible = false, isParentVisible = true } = {}) => {
  checkSlotName(slotName);
  const instanceId = String(_contextUid++);
  const slotContextId = getContextId(slotName, instanceId);
  const slotRequesters = ref([]);
  const Keys = getKeys(slotName);

  const currentHolderId = computed(() => {
    const requestersLength = slotRequesters.value.length;
    if (requestersLength > 0) {
      return slotRequesters.value[requestersLength - 1];
    }
    return null;
  });

  const isVisible = ref(alwaysVisible);

  const activeId = computed(() => {
    if (isVisible.value && unref(isParentVisible)) {
      return currentHolderId.value;
    }
    return null;
  });
  const isGranted = computed(() => currentHolderId.value !== null);

  const requestSlot = (id) => {
    if (!slotRequesters.value.includes(id)) {
      slotRequesters.value.push(id);
    }
  };

  const releaseSlot = (id) => {
    if (currentHolderId.value === id && !alwaysVisible) {
      isVisible.value = false;
    }
    slotRequesters.value = slotRequesters.value.filter(requesterId => requesterId !== id);
  }

  const toggleVisibility = () => {
    if (alwaysVisible) {
      return;
    }
    isVisible.value = !isVisible.value;
  };


  provide(Keys.CONTEXT_ID, slotContextId);
  provide(Keys.REQUEST, requestSlot);
  provide(Keys.RELEASE, releaseSlot);
  provide(Keys.ACTIVE_ID, activeId);
  provide(Keys.HOLDER_ID, currentHolderId);
  provide(Keys.IS_VISIBLE, isVisible);
  provide(Keys.TOGGLE, toggleVisibility);

  return {
    isGranted,
    slotContextId,
  };
};

export const useSlotRequester = (slotName, { request = true } = {}) => {
  checkSlotName(slotName);
  const instanceId = String(_requesterUid++);
  const requesterId = getRequesterId(slotName, instanceId);
  const Keys = getKeys(slotName);

  const slotContextId = inject(Keys.CONTEXT_ID, null);
  const requestSlot = inject(Keys.REQUEST, null);
  const releaseSlot = inject(Keys.RELEASE, null);
  const activeId = inject(Keys.ACTIVE_ID, null);

  if (request) {
    // Use nextTick to prevent potential race conditions with Teleport
    nextTick(() => {
      requestSlot(requesterId);
    });
  }

  onBeforeUnmount(() => {
    releaseSlot(requesterId);
  });


  const isActive = computed(() => activeId.value === requesterId);

  return {
    isActive,
    requesterId,
    slotContextId,
  };
}

export const useSlotControls = (slotName) => {
  checkSlotName(slotName);
  const Keys = getKeys(slotName);

  const isVisible = inject(Keys.IS_VISIBLE, null);
  const currentHolderId = inject(Keys.HOLDER_ID, null);
  const toggleVisibility = inject(Keys.TOGGLE, null);

  const isGranted = computed(() => currentHolderId.value !== null);

  return {
    isVisible,
    isGranted,
    toggleVisibility,
  };
};
