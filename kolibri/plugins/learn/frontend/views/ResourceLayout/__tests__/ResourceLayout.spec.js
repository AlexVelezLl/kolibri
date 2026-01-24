import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import Vue from 'vue';
import { ref } from 'vue';
import ResourceLayout from '../index.vue';

// Mock useKResponsiveWindow
const mockBreakpoint = ref(4); // Default to desktop breakpoint (push mode)
jest.mock('kolibri-design-system/lib/composables/useKResponsiveWindow', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    windowBreakpoint: mockBreakpoint,
    windowIsSmall: { value: false },
  })),
}));

// Mock SidePanelModal to render its slot content directly for testing
jest.mock('kolibri-common/components/courses/sidePanel/SidePanelModal', () => ({
  __esModule: true,
  default: {
    name: 'SidePanelModal',
    render(h) {
      return h('div', { attrs: { 'data-testid': 'side-panel-modal-wrapper' } }, this.$slots.default);
    },
  },
}));

function setBreakpoint(breakpoint) {
  mockBreakpoint.value = breakpoint;
}

function renderResourceLayout(slots = {}) {
  return render(ResourceLayout, { slots });
}

describe('ResourceLayout', () => {
  beforeEach(() => {
    // Reset to desktop breakpoint before each test
    setBreakpoint(4);
  });

  describe('slot rendering - all 5 slots', () => {
    it('renders the topBar slot content', () => {
      renderResourceLayout({
        topBar: '<div data-testid="top-bar-content">Top Bar</div>',
      });
      expect(screen.getByTestId('top-bar-content')).toHaveTextContent('Top Bar');
    });

    it('renders the default slot as main content', () => {
      renderResourceLayout({
        default: '<div data-testid="main-content">Main Content</div>',
      });
      expect(screen.getByTestId('main-content')).toHaveTextContent('Main Content');
    });

    it('renders the sidePanel slot content when panel is open', async () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      expect(screen.getByTestId('side-panel-content')).toBeInTheDocument();
    });

    it('renders the bottomBar slot content', () => {
      renderResourceLayout({
        bottomBar: '<div data-testid="bottom-bar-content">Bottom Bar</div>',
      });
      expect(screen.getByTestId('bottom-bar-content')).toHaveTextContent('Bottom Bar');
    });

    it('renders the sidePanelFooter slot content when panel is open', async () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
        sidePanelFooter: '<div data-testid="side-panel-footer-content">Footer</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      expect(screen.getByTestId('side-panel-footer-content')).toBeInTheDocument();
    });

    it('renders all five slots together', async () => {
      renderResourceLayout({
        topBar: '<div data-testid="top-bar-content">Top</div>',
        default: '<div data-testid="main-content">Main</div>',
        sidePanel: '<div data-testid="side-panel-content">Side</div>',
        bottomBar: '<div data-testid="bottom-bar-content">Bottom</div>',
        sidePanelFooter: '<div data-testid="side-panel-footer-content">Footer</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      expect(screen.getByTestId('top-bar-content')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('side-panel-content')).toBeInTheDocument();
      expect(screen.getByTestId('bottom-bar-content')).toBeInTheDocument();
      expect(screen.getByTestId('side-panel-footer-content')).toBeInTheDocument();
    });
  });

  describe('empty slot collapse', () => {
    it('does not render top-bar-area when topBar slot is empty', () => {
      renderResourceLayout({
        default: '<div data-testid="main-content">Main</div>',
      });
      expect(screen.queryByTestId('top-bar-area')).not.toBeInTheDocument();
    });

    it('does not render bottom-bar-area when bottomBar slot is empty', () => {
      renderResourceLayout({
        default: '<div data-testid="main-content">Main</div>',
      });
      expect(screen.queryByTestId('bottom-bar-area')).not.toBeInTheDocument();
    });

    it('does not show toggle when sidePanel slot is empty', () => {
      renderResourceLayout({
        default: '<div data-testid="main-content">Main</div>',
      });
      expect(screen.queryByTestId('side-panel-toggle')).not.toBeInTheDocument();
    });

    it('does not render sidePanelFooter area when sidePanelFooter slot is empty', async () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      expect(screen.queryByTestId('side-panel-footer-area')).not.toBeInTheDocument();
    });
  });

  describe('toggle behavior', () => {
    it('shows toggle button when sidePanel slot has content', () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });
      expect(screen.getByTestId('side-panel-toggle')).toBeInTheDocument();
    });

    it('side panel is closed by default', () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });
      expect(screen.queryByTestId('side-panel-area')).not.toBeInTheDocument();
    });

    it('clicking toggle opens the side panel', async () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      expect(screen.getByTestId('side-panel-area')).toBeInTheDocument();
      expect(screen.getByTestId('side-panel-content')).toBeInTheDocument();
    });

    it('clicking toggle again closes the side panel', async () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle')); // Open
      await fireEvent.click(screen.getByTestId('side-panel-toggle')); // Close

      expect(screen.queryByTestId('side-panel-area')).not.toBeInTheDocument();
    });

    it('toggle button is in the top row', () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });

      const topRow = screen.getByTestId('top-row');
      const toggle = screen.getByTestId('side-panel-toggle');
      expect(topRow).toContainElement(toggle);
    });
  });

  describe('non-claimable slots (topBar, default, sidePanelFooter)', () => {
    it('nested ResourceLayout does NOT take over parent topBar', async () => {
      const ParentWithNestedChild = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #topBar>
              <div data-testid="parent-top-bar">Parent Top Bar</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #topBar>
                  <div data-testid="child-top-bar">Child Top Bar</div>
                </template>
                <template #default>
                  <div data-testid="child-main">Child Main</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ParentWithNestedChild);

      // Parent's topBar should remain (non-claimable)
      expect(screen.getByTestId('parent-top-bar')).toBeInTheDocument();
    });

    it('nested ResourceLayout does NOT take over parent sidePanelFooter', async () => {
      const ParentWithNestedChild = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #sidePanel>
              <div data-testid="parent-side-panel">Parent Side</div>
            </template>
            <template #sidePanelFooter>
              <div data-testid="parent-footer">Parent Footer</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #sidePanelFooter>
                  <div data-testid="child-footer">Child Footer</div>
                </template>
                <template #default>
                  <div data-testid="child-main">Child Main</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ParentWithNestedChild);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Parent's sidePanelFooter should remain (non-claimable)
      expect(screen.getByTestId('parent-footer')).toBeInTheDocument();
    });
  });

  describe('claimable slots (sidePanel and bottomBar) - nested takeover', () => {
    it('nested ResourceLayout with sidePanel slot takes over parent side panel', async () => {
      const ParentWithNestedChild = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #sidePanel>
              <div data-testid="parent-side-panel">Parent Side Panel</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #sidePanel>
                  <div data-testid="child-side-panel">Child Side Panel</div>
                </template>
                <template #default>
                  <div data-testid="child-main">Child Main Content</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ParentWithNestedChild);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // The child's side panel content should be rendered (deepest wins)
      expect(screen.getByTestId('child-side-panel')).toBeInTheDocument();
      // The parent's side panel should NOT be rendered since child took over
      expect(screen.queryByTestId('parent-side-panel')).not.toBeInTheDocument();
    });

    it('nested ResourceLayout without sidePanel slot does not affect parent side panel', async () => {
      const ParentWithNestedChildNoSidePanel = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #sidePanel>
              <div data-testid="parent-side-panel">Parent Side Panel</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #default>
                  <div data-testid="child-main">Child Main Content</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ParentWithNestedChildNoSidePanel);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Parent's side panel should still be rendered since child has no sidePanel slot
      expect(screen.getByTestId('parent-side-panel')).toBeInTheDocument();
    });

    it('nested ResourceLayout with bottomBar slot takes over parent bottom bar', async () => {
      const ParentWithNestedChild = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #bottomBar>
              <div data-testid="parent-bottom-bar">Parent Bottom Bar</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #bottomBar>
                  <div data-testid="child-bottom-bar">Child Bottom Bar</div>
                </template>
                <template #default>
                  <div data-testid="child-main">Child Main Content</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ParentWithNestedChild);

      // Wait for nested slot claiming to complete
      await waitFor(() => {
        expect(screen.getByTestId('child-bottom-bar')).toBeInTheDocument();
      });
      // The parent's bottom bar should NOT be rendered since child took over
      expect(screen.queryByTestId('parent-bottom-bar')).not.toBeInTheDocument();
    });

    it('nested ResourceLayout without bottomBar slot does not affect parent bottom bar', () => {
      const ParentWithNestedChildNoBottomBar = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #bottomBar>
              <div data-testid="parent-bottom-bar">Parent Bottom Bar</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #default>
                  <div data-testid="child-main">Child Main Content</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ParentWithNestedChildNoBottomBar);

      // Parent's bottom bar should still be rendered since child has no bottomBar slot
      expect(screen.getByTestId('parent-bottom-bar')).toBeInTheDocument();
    });
  });

  describe('independent side panel and bottom bar requesting', () => {
    it('child can request only side panel while parent keeps bottom bar', async () => {
      const Component = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #sidePanel>
              <div data-testid="parent-side-panel">Parent Side</div>
            </template>
            <template #bottomBar>
              <div data-testid="parent-bottom-bar">Parent Bottom</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #sidePanel>
                  <div data-testid="child-side-panel">Child Side</div>
                </template>
                <template #default>
                  <div>Child Main</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(Component);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Child's side panel takes over
      expect(screen.getByTestId('child-side-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('parent-side-panel')).not.toBeInTheDocument();
      // Parent's bottom bar remains
      expect(screen.getByTestId('parent-bottom-bar')).toBeInTheDocument();
    });

    it('child can request only bottom bar while parent keeps side panel', async () => {
      const Component = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #sidePanel>
              <div data-testid="parent-side-panel">Parent Side</div>
            </template>
            <template #bottomBar>
              <div data-testid="parent-bottom-bar">Parent Bottom</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #bottomBar>
                  <div data-testid="child-bottom-bar">Child Bottom</div>
                </template>
                <template #default>
                  <div>Child Main</div>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(Component);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Parent's side panel remains
      expect(screen.getByTestId('parent-side-panel')).toBeInTheDocument();
      // Child's bottom bar takes over
      expect(screen.getByTestId('child-bottom-bar')).toBeInTheDocument();
      expect(screen.queryByTestId('parent-bottom-bar')).not.toBeInTheDocument();
    });
  });

  describe('multiple nesting levels (deepest wins)', () => {
    it('deepest component with sidePanel slot wins over intermediate levels', async () => {
      const ThreeLevelNesting = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #sidePanel>
              <div data-testid="level-1-side-panel">Level 1 Side Panel</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #sidePanel>
                  <div data-testid="level-2-side-panel">Level 2 Side Panel</div>
                </template>
                <template #default>
                  <ResourceLayout>
                    <template #sidePanel>
                      <div data-testid="level-3-side-panel">Level 3 Side Panel</div>
                    </template>
                    <template #default>
                      <div data-testid="deepest-main">Deepest Main Content</div>
                    </template>
                  </ResourceLayout>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ThreeLevelNesting);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Only the deepest (level 3) side panel should be rendered
      expect(screen.getByTestId('level-3-side-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('level-2-side-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('level-1-side-panel')).not.toBeInTheDocument();
    });

    it('deepest component with bottomBar slot wins over intermediate levels', async () => {
      const ThreeLevelNesting = Vue.extend({
        components: { ResourceLayout },
        template: `
          <ResourceLayout>
            <template #bottomBar>
              <div data-testid="level-1-bottom-bar">Level 1 Bottom Bar</div>
            </template>
            <template #default>
              <ResourceLayout>
                <template #bottomBar>
                  <div data-testid="level-2-bottom-bar">Level 2 Bottom Bar</div>
                </template>
                <template #default>
                  <ResourceLayout>
                    <template #bottomBar>
                      <div data-testid="level-3-bottom-bar">Level 3 Bottom Bar</div>
                    </template>
                    <template #default>
                      <div data-testid="deepest-main">Deepest Main Content</div>
                    </template>
                  </ResourceLayout>
                </template>
              </ResourceLayout>
            </template>
          </ResourceLayout>
        `,
      });

      render(ThreeLevelNesting);

      // Wait for nested slot claiming to complete
      await waitFor(() => {
        expect(screen.getByTestId('level-3-bottom-bar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('level-2-bottom-bar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('level-1-bottom-bar')).not.toBeInTheDocument();
    });
  });

  describe('unmount cleanup', () => {
    it('when nested component unmounts, parent falls back to its own side panel content', async () => {
      const ParentWithConditionalChild = Vue.extend({
        components: { ResourceLayout },
        data() {
          return { showChild: true };
        },
        template: `
          <div>
            <ResourceLayout>
              <template #sidePanel>
                <div data-testid="parent-side-panel">Parent Side Panel</div>
              </template>
              <template #default>
                <ResourceLayout v-if="showChild">
                  <template #sidePanel>
                    <div data-testid="child-side-panel">Child Side Panel</div>
                  </template>
                  <template #default>
                    <div data-testid="child-main">Child Main Content</div>
                  </template>
                </ResourceLayout>
                <div v-else data-testid="no-child">No child</div>
              </template>
            </ResourceLayout>
            <button data-testid="toggle-child" @click="showChild = !showChild">Toggle Child</button>
          </div>
        `,
      });

      render(ParentWithConditionalChild);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Initially, child's side panel should be shown
      expect(screen.getByTestId('child-side-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('parent-side-panel')).not.toBeInTheDocument();

      // Unmount the child
      await fireEvent.click(screen.getByTestId('toggle-child'));

      // After child unmounts, parent's side panel should be shown again
      expect(screen.queryByTestId('child-side-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('parent-side-panel')).toBeInTheDocument();
    });

    it('when nested component unmounts, parent falls back to its own bottom bar content', async () => {
      const ParentWithConditionalChild = Vue.extend({
        components: { ResourceLayout },
        data() {
          return { showChild: true };
        },
        template: `
          <div>
            <ResourceLayout>
              <template #bottomBar>
                <div data-testid="parent-bottom-bar">Parent Bottom Bar</div>
              </template>
              <template #default>
                <ResourceLayout v-if="showChild">
                  <template #bottomBar>
                    <div data-testid="child-bottom-bar">Child Bottom Bar</div>
                  </template>
                  <template #default>
                    <div data-testid="child-main">Child Main Content</div>
                  </template>
                </ResourceLayout>
                <div v-else data-testid="no-child">No child</div>
              </template>
            </ResourceLayout>
            <button data-testid="toggle-child" @click="showChild = !showChild">Toggle Child</button>
          </div>
        `,
      });

      render(ParentWithConditionalChild);

      // Wait for nested slot claiming to complete
      await waitFor(() => {
        expect(screen.getByTestId('child-bottom-bar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('parent-bottom-bar')).not.toBeInTheDocument();

      // Unmount the child
      await fireEvent.click(screen.getByTestId('toggle-child'));

      // After child unmounts, parent's bottom bar should be shown again
      await waitFor(() => {
        expect(screen.getByTestId('parent-bottom-bar')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('child-bottom-bar')).not.toBeInTheDocument();
    });

    it('when nested slot conditionally disappears, parent falls back to its own content', async () => {
      // This tests the fix for the registration bug where slots were registered
      // on every render but never unregistered when they disappeared
      const ChildWithConditionalSlot = Vue.extend({
        components: { ResourceLayout },
        props: ['showSlot'],
        template: `
          <ResourceLayout>
            <template #sidePanel v-if="showSlot">
              <div data-testid="child-side-panel">Child Side Panel</div>
            </template>
            <template #default>
              <div data-testid="child-main">Child Main Content</div>
            </template>
          </ResourceLayout>
        `,
      });

      const ParentWithChild = Vue.extend({
        components: { ResourceLayout, ChildWithConditionalSlot },
        data() {
          return { childHasSlot: true };
        },
        template: `
          <div>
            <ResourceLayout>
              <template #sidePanel>
                <div data-testid="parent-side-panel">Parent Side Panel</div>
              </template>
              <template #default>
                <ChildWithConditionalSlot :showSlot="childHasSlot" />
              </template>
            </ResourceLayout>
            <button data-testid="toggle-slot" @click="childHasSlot = !childHasSlot">Toggle Slot</button>
          </div>
        `,
      });

      render(ParentWithChild);

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      // Initially, child's side panel should be shown (child claims it)
      expect(screen.getByTestId('child-side-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('parent-side-panel')).not.toBeInTheDocument();

      // Make the child's slot disappear (but child component stays mounted)
      await fireEvent.click(screen.getByTestId('toggle-slot'));

      // After child's slot disappears, parent's side panel should be shown
      expect(screen.queryByTestId('child-side-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('parent-side-panel')).toBeInTheDocument();

      // Re-enable child's slot
      await fireEvent.click(screen.getByTestId('toggle-slot'));

      // Child should reclaim the side panel
      expect(screen.getByTestId('child-side-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('parent-side-panel')).not.toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    describe('breakpoint 0-1 (overlay mode)', () => {
      beforeEach(() => {
        setBreakpoint(0);
      });

      it('side panel opens as modal overlay', async () => {
        renderResourceLayout({
          sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
        });

        await fireEvent.click(screen.getByTestId('side-panel-toggle'));

        // In overlay mode, side panel is rendered inside SidePanelModal
        expect(screen.getByTestId('side-panel-modal-wrapper')).toBeInTheDocument();
        expect(screen.getByTestId('side-panel-area')).toHaveClass('modal-content');
      });
    });

    describe('breakpoint 2 (modal mode)', () => {
      beforeEach(() => {
        setBreakpoint(2);
      });

      it('side panel opens as modal overlay', async () => {
        renderResourceLayout({
          sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
        });

        await fireEvent.click(screen.getByTestId('side-panel-toggle'));

        // In modal mode, side panel is rendered inside SidePanelModal
        expect(screen.getByTestId('side-panel-modal-wrapper')).toBeInTheDocument();
        expect(screen.getByTestId('side-panel-area')).toHaveClass('modal-content');
      });
    });

    describe('breakpoint 3+ (push mode)', () => {
      beforeEach(() => {
        setBreakpoint(4);
      });

      it('side panel pushes content when open', async () => {
        renderResourceLayout({
          sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
          default: '<div data-testid="main-content">Main</div>',
        });

        await fireEvent.click(screen.getByTestId('side-panel-toggle'));

        // In push mode, side panel is rendered inline (not in modal)
        expect(screen.queryByTestId('side-panel-modal-wrapper')).not.toBeInTheDocument();
        expect(screen.getByTestId('side-panel-area')).toBeInTheDocument();
      });

      it('side panel area is visible when open', async () => {
        renderResourceLayout({
          sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
          default: '<div data-testid="main-content">Main</div>',
        });

        await fireEvent.click(screen.getByTestId('side-panel-toggle'));

        expect(screen.getByTestId('side-panel-area')).toBeInTheDocument();
      });
    });
  });

  describe('layout structure', () => {
    it('renders side panel on the RIGHT side of main content', async () => {
      renderResourceLayout({
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
        default: '<div data-testid="main-content">Main</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      const mainContent = screen.getByTestId('main-content-area');
      const sidePanel = screen.getByTestId('side-panel-area');

      // Both should be in the DOM
      expect(mainContent).toBeInTheDocument();
      expect(sidePanel).toBeInTheDocument();

      // Side panel should come after main content in DOM order (right side in LTR)
      const parent = mainContent.parentElement;
      const children = Array.from(parent.children);
      const mainIndex = children.indexOf(mainContent);
      const sideIndex = children.indexOf(sidePanel);
      expect(sideIndex).toBeGreaterThan(mainIndex);
    });

    it('top row contains topBar slot and toggle button', () => {
      renderResourceLayout({
        topBar: '<div data-testid="top-bar-content">Top Bar</div>',
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
      });

      const topRow = screen.getByTestId('top-row');
      expect(topRow).toBeInTheDocument();
      expect(screen.getByTestId('top-bar-content')).toBeInTheDocument();
      expect(screen.getByTestId('side-panel-toggle')).toBeInTheDocument();
    });

    it('bottom bar is rendered below main content', async () => {
      renderResourceLayout({
        bottomBar: '<div data-testid="bottom-bar-content">Bottom Bar</div>',
        sidePanel: '<div data-testid="side-panel-content">Side Panel</div>',
        default: '<div data-testid="main-content">Main</div>',
      });

      await fireEvent.click(screen.getByTestId('side-panel-toggle'));

      const bottomBarArea = screen.getByTestId('bottom-bar-area');
      expect(bottomBarArea).toBeInTheDocument();
    });
  });
});
