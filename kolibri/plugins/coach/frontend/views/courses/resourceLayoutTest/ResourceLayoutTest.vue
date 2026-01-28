<template>

  <div class="main-content">
    <SidePanelContext>
      <BottomBarContext>
        <KToolbar type="clear" title="Just a random title" style="width: 100%">
          <template #icon>
            <KIconButton icon="back" aria-label="Go back" />
          </template>
          <template #actions>
            <SidePanelToggle>
              <template #default="{ isOpen, toggleSidePanel }">
                <KIconButton v-if="!isOpen" icon="sidebar" @click="toggleSidePanel" />
              </template>
            </SidePanelToggle>
          </template>
        </KToolbar>

        <main style="padding: 16px">
          <p>
            Just some random default content
          </p>
          <KButtonGroup>
            <KButton
              text="toggle children 1"
              @click="toggleChildren1"
            />
            <KButton
              text="toggle children 2"
              @click="toggleChildren2"
            />
          </KButtonGroup>
          <RootSidePanel>
            <ResourceLayoutExample
              v-if="children1"
              title="children 1"
              color="red"
            >
              <KButtonGroup>
                <KButton
                  text="toggle children 1 - 1"
                  @click="toggleChildren1_children1"
                />
                <KButton
                  text="toggle children 1 - 2"
                  @click="toggleChildren1_children2"
                />
              </KButtonGroup>
              <ResourceLayoutExample
                v-if="children1_children1"
                title="children 1 - 1 - without bottom bar"
                color="green"
                :requestBottomBar="false"
              />
              <ResourceLayoutExample
                v-if="children1_children2"
                title="children 1 - 2 - without side panel"
                color="purple"
                :requestSidePanel="false"
              />
            </ResourceLayoutExample>
            <ResourceLayoutExample
              v-if="children2"
              title="children 2"
              color="blue"
            >
              <KButtonGroup>
                <KButton
                  text="toggle children 2 - 1"
                  @click="toggleChildren2_children1"
                />
                <KButton
                  text="toggle children 2 - 2"
                  @click="toggleChildren2_children2"
                />
              </KButtonGroup>
              <ResourceLayoutExample
                v-if="children2_children1"
                title="children 2 - 1"
                color="orange"
              />
              <ResourceLayoutExample
                v-if="children2_children2"
                title="children 2 - 2"
                color="pink"
              />
            </ResourceLayoutExample>
          </RootSidePanel>
        </main>
        <BottomBar>
          <div style="height: 72px; display: flex; align-items: center; padding: 16px">
            This is a bottom bar rendered from the root level
          </div>
        </BottomBar>
      </BottomBarContext>
    </SidePanelContext>
  </div>
</template>


<script>

  import { ref } from 'vue';
  import SidePanelToggle from './sidePanels/SidePanelToggle.vue';
  import SidePanelContext from './sidePanels/SidePanelContext.vue';
import SidePanel from './sidePanels/SidePanel.vue';
import BottomBarContext from './bottomBars/BottomBarContext.vue';
import RootSidePanel from './resourceLayout/RootSidePanel.vue';
import ResourceLayoutExample from './resourceLayout/ResourceLayoutExample.vue';
import BottomBar from './bottomBars/BottomBar.vue';

  export default {
    name: 'SidePanelTest',
    components: {
      SidePanelContext,
      SidePanel,
      SidePanelToggle,
      BottomBar,
      BottomBarContext,
      RootSidePanel,
      ResourceLayoutExample
    },
    setup() {
      const children1 = ref(false);
      const children1_children1 = ref(false);
      const children1_children2 = ref(false);

      const children2 = ref(false);
      const children2_children1 = ref(false);
      const children2_children2 = ref(false);

      const toggleChildren1 = () => {
        children1.value = !children1.value;
        children1_children1.value = false;
        children1_children2.value = false;
      };
      const toggleChildren2 = () => {
        children2.value = !children2.value;
        children2_children1.value = false;
        children2_children2.value = false;
      };
      const toggleChildren1_children1 = () => {
        children1_children1.value = !children1_children1.value;
      };
      const toggleChildren1_children2 = () => {
        children1_children2.value = !children1_children2.value;
      };
      const toggleChildren2_children1 = () => {
        children2_children1.value = !children2_children1.value;
      };
      const toggleChildren2_children2 = () => {
        children2_children2.value = !children2_children2.value;
      };

      return {
        children1,
        children2,
        children1_children1,
        children1_children2,
        children2_children1,
        children2_children2,
        toggleChildren1,
        toggleChildren2,
        toggleChildren1_children1,
        toggleChildren1_children2,
        toggleChildren2_children1,
        toggleChildren2_children2,
      };
    },
  };

</script>


<style lang="scss" scoped>
  .main-content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
