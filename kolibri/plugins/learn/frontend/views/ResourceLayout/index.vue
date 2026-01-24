<script>

  import { h, inject, provide, ref, markRaw, onBeforeUnmount } from 'vue';
  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
  import { themeTokens } from 'kolibri-design-system/lib/styles/theme';
  import SidePanelModal from 'kolibri-common/components/courses/sidePanel/SidePanelModal';

  // Side panel width used for both push mode (CSS) and modal mode (prop)
  const SIDE_PANEL_WIDTH = '350px';

  // Injection keys for provide/inject pattern
  const REQUEST_SIDE_PANEL_KEY = 'resourceLayoutRequestSidePanel';
  const REQUEST_BOTTOM_BAR_KEY = 'resourceLayoutRequestBottomBar';
  const IS_NESTED_KEY = 'resourceLayoutIsNested';

  // Pure helper: sync slot registration with parent
  function syncSlotRegistration(slot, parentRequest, reg) {
    if (slot && parentRequest) {
      if (!reg.registered) {
        parentRequest(() => slot());
        reg.registered = true;
      }
    } else if (reg.registered && parentRequest) {
      parentRequest(null);
      reg.registered = false;
    }
  }

  // Pure helper: get claimable slot content (child override or own slot)
  function getSlotContent(contentRef, slot) {
    if (contentRef.value) return contentRef.value();
    if (slot) return slot();
    return null;
  }

  export default {
    name: 'ResourceLayout',
    components: {
      SidePanelModal,
    },
    setup(props, { slots }) {
      const { windowBreakpoint } = useKResponsiveWindow();
      const $themeTokens = themeTokens();

      // Check if we have a parent ResourceLayout
      const parentRequestSidePanel = inject(REQUEST_SIDE_PANEL_KEY, null);
      const parentRequestBottomBar = inject(REQUEST_BOTTOM_BAR_KEY, null);
      const isNested = inject(IS_NESTED_KEY, false);

      // Side panel open/closed state (only top-level manages this)
      const sidePanelOpen = ref(false);

      // Store for child components that want to take over claimable slots
      const sidePanelContent = ref(null);
      const bottomBarContent = ref(null);

      // Factory for creating request functions for claimable slots
      function createRequestFn(parentRequest, contentRef) {
        return renderFn => {
          if (parentRequest) {
            parentRequest(renderFn);
          } else {
            contentRef.value = renderFn ? markRaw(renderFn) : null;
          }
        };
      }

      const requestSidePanel = createRequestFn(parentRequestSidePanel, sidePanelContent);
      const requestBottomBar = createRequestFn(parentRequestBottomBar, bottomBarContent);

      // Toggle function for side panel
      function toggleSidePanel() {
        sidePanelOpen.value = !sidePanelOpen.value;
      }

      // Close function for side panel (used by SidePanelModal)
      function closeSidePanel() {
        sidePanelOpen.value = false;
      }

      // Provide the request functions to descendants
      provide(REQUEST_SIDE_PANEL_KEY, requestSidePanel);
      provide(REQUEST_BOTTOM_BAR_KEY, requestBottomBar);
      provide(IS_NESTED_KEY, true);

      // Track slot registration state: { registered: boolean }
      const sidePanelReg = { registered: false };
      const bottomBarReg = { registered: false };

      // Cleanup when this component unmounts
      onBeforeUnmount(() => {
        if (sidePanelReg.registered && parentRequestSidePanel) {
          parentRequestSidePanel(null);
        }
        if (bottomBarReg.registered && parentRequestBottomBar) {
          parentRequestBottomBar(null);
        }
      });

      // Theme-based styles (static for session)
      const bgColor = $themeTokens.surface;
      const border = `1px solid ${$themeTokens.fineLine}`;

      // Helper to create toggle button
      const toggleButton = (onClick, icon) =>
        h(
          'button',
          {
            attrs: { 'data-testid': 'side-panel-toggle', type: 'button' },
            class: 'side-panel-toggle',
            on: { click: onClick },
          },
          [h('KIcon', { props: { icon } })]
        );

      // Content getters for claimable slots (child override or own slot)
      const getSidePanelContent = () => getSlotContent(sidePanelContent, slots.sidePanel);
      const getBottomBarContent = () => getSlotContent(bottomBarContent, slots.bottomBar);

      // Helper to render side panel area (used in both push and modal modes)
      const renderSidePanelArea = (extraClasses = '', extraStyles = {}) =>
        h(
          'div',
          {
            attrs: { 'data-testid': 'side-panel-area' },
            class: ['side-panel-area', extraClasses].filter(Boolean).join(' '),
            style: extraStyles,
          },
          getSidePanelContent()
        );

      // Helper to render side panel footer (used in both push and modal modes)
      const renderSidePanelFooter = (extraClasses = '', extraStyles = {}) =>
        h(
          'div',
          {
            attrs: { 'data-testid': 'side-panel-footer-area' },
            class: ['side-panel-footer-area', extraClasses].filter(Boolean).join(' '),
            style: { backgroundColor: bgColor, borderTop: border, ...extraStyles },
          },
          slots.sidePanelFooter()
        );

      return () => {
        // Nested ResourceLayouts: register slots with parent and render only default content
        if (isNested) {
          syncSlotRegistration(slots.sidePanel, parentRequestSidePanel, sidePanelReg);
          syncSlotRegistration(slots.bottomBar, parentRequestBottomBar, bottomBarReg);
          return slots.default ? slots.default() : null;
        }

        // === TOP-LEVEL RENDERING ===
        const hasSidePanelContent = sidePanelContent.value || slots.sidePanel;
        const showSidePanelColumn = hasSidePanelContent && sidePanelOpen.value && windowBreakpoint.value > 2;

        // === TOP ROW: topBar (left) + toggle (right) ===
        const topRowChildren = [];

        // Left: topBar content
        if (slots.topBar) {
          topRowChildren.push(
            h('div', { attrs: { 'data-testid': 'top-bar-area' }, class: 'top-bar-area' }, slots.topBar())
          );
        } else {
          topRowChildren.push(h('div', { class: 'top-bar-area' }));
        }

        // Right: toggle area (visually becomes side panel header when open)
        if (hasSidePanelContent) {
          const toggleAreaStyle = showSidePanelColumn
            ? { width: SIDE_PANEL_WIDTH, backgroundColor: bgColor, borderLeft: border, borderBottom: border }
            : {};

          topRowChildren.push(
            h(
              'div',
              { attrs: { 'data-testid': 'toggle-area' }, class: 'toggle-area', style: toggleAreaStyle },
              [toggleButton(toggleSidePanel, sidePanelOpen.value ? 'close' : 'menu')]
            )
          );
        }

        const topRow = h('div', { attrs: { 'data-testid': 'top-row' }, class: 'top-row' }, topRowChildren);

        // === MIDDLE ROW: main content (left) + side panel (right) ===
        const middleRowChildren = [];

        // Left: main content
        middleRowChildren.push(
          h(
            'div',
            { attrs: { 'data-testid': 'main-content-area' }, class: 'main-content-area' },
            slots.default ? slots.default() : []
          )
        );

        // Right: side panel content (push mode only)
        if (showSidePanelColumn) {
          middleRowChildren.push(
            renderSidePanelArea('', { width: SIDE_PANEL_WIDTH, backgroundColor: bgColor, borderLeft: border })
          );
        }

        const middleRow = h('div', { class: 'middle-row' }, middleRowChildren);

        // === BOTTOM ROW: bottomBar (left) + sidePanelFooter (right) ===
        const bottomRowChildren = [];
        let hasBottomRow = false;

        // Left: bottomBar content
        if (bottomBarContent.value || slots.bottomBar) {
          bottomRowChildren.push(
            h(
              'div',
              { attrs: { 'data-testid': 'bottom-bar-area' }, class: 'bottom-bar-area' },
              getBottomBarContent()
            )
          );
          hasBottomRow = true;
        } else if (showSidePanelColumn && slots.sidePanelFooter) {
          // Empty spacer to keep footer on the right
          bottomRowChildren.push(h('div', { class: 'bottom-bar-area' }));
        }

        // Right: sidePanelFooter (push mode only)
        if (showSidePanelColumn && slots.sidePanelFooter) {
          bottomRowChildren.push(
            renderSidePanelFooter('', { width: SIDE_PANEL_WIDTH, borderLeft: border })
          );
          hasBottomRow = true;
        }

        const bottomRow = hasBottomRow
          ? h('div', { class: 'bottom-row' }, bottomRowChildren)
          : null;

        const mainLayout = h(
          'div',
          { class: 'resource-layout' },
          [topRow, middleRow, bottomRow].filter(Boolean)
        );

        // === OVERLAY/MODAL MODE ===
        if (hasSidePanelContent && sidePanelOpen.value && windowBreakpoint.value <= 2) {
          const modalChildren = [
            // Close button at top
            h('div', { class: 'modal-header', style: { borderBottom: border } }, [
              toggleButton(closeSidePanel, 'close'),
            ]),
            // Side panel content
            renderSidePanelArea('modal-content'),
          ];

          if (slots.sidePanelFooter) {
            modalChildren.push(renderSidePanelFooter('modal-footer'));
          }

          const sidePanelModal = h(
            SidePanelModal,
            {
              props: { alignment: 'right', width: SIDE_PANEL_WIDTH },
              on: { closePanel: closeSidePanel },
            },
            [h('div', { class: 'side-panel-modal-content' }, modalChildren)]
          );

          return h('div', {}, [mainLayout, sidePanelModal]);
        }

        return mainLayout;
      };
    },
  };

</script>


<style lang="scss" scoped>

  .resource-layout {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
  }

  // === TOP ROW ===
  .top-row {
    display: flex;
    flex-shrink: 0;
  }

  .top-bar-area {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .toggle-area {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    padding: 8px;
  }

  .side-panel-toggle {
    padding: 8px;
    cursor: pointer;
    background: transparent;
    border: none;
  }

  // === MIDDLE ROW ===
  .middle-row {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .main-content-area {
    flex: 1;
    overflow: auto;
  }

  .side-panel-area {
    flex-shrink: 0;
    overflow: auto;
  }

  // === BOTTOM ROW ===
  .bottom-row {
    display: flex;
    flex-shrink: 0;
  }

  .bottom-bar-area {
    flex: 1;
  }

  .side-panel-footer-area {
    flex-shrink: 0;
  }

  // === MODAL STYLES ===
  .side-panel-modal-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .modal-header {
    display: flex;
    justify-content: flex-end;
    padding: 8px;
    flex-shrink: 0;
  }

  .modal-content {
    flex: 1;
    overflow: auto;
    width: auto;
    border-left: none;
  }

  .modal-footer {
    flex-shrink: 0;
    width: auto;
    border-left: none;
  }

</style>
