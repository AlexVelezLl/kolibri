<template>

  <div>
    <div class="selection-metadata-info">
      <p>{{ lessonLabel$() }}: {{ currentLesson.title }}</p>
      <p>{{ sizeLabel$() }}: {{ bytesForHumans(selectedResourcesSize) }}</p>
    </div>
    <DragContainer
      v-if="selectedResources.length > 0"
      :items="selectedResources"
      @sort="$emit('sortedResources', $event)"
    >
      <transition-group
        tag="div"
        name="list"
      >
        <Draggable
          v-for="(resource, index) in selectedResources"
          :key="resource.id"
        >
          <div
            class="resource-row"
            :style="lessonOrderListButtonBorder"
          >
            <div class="row-content">
              <DragHandle v-if="selectedResources.length > 1">
                <DragSortWidget
                  :moveUpText="upLabel$"
                  :moveDownText="downLabel$"
                  :noDrag="true"
                  :isFirst="index === 0"
                  :isLast="index === selectedResources.length - 1"
                  @moveUp="() => {}"
                  @moveDown="() => {}"
                />
              </DragHandle>
              <LearningActivityIcon
                :kind="resource.learning_activities[0]"
                class="icon-style"
              />
              <div>
                <span class="arrange-item-block">
                  <span>
                    <KRouterLink
                      :text="resource.title"
                      :to="{}"
                      style="font-size: 14px"
                    />
                  </span>
                  <p
                    class="resource-size"
                    :style="{
                      color: $themeTokens.annotation,
                    }"
                  >
                    {{ bytesForHumans(getResourceSize(resource)) }}
                  </p>
                </span>
              </div>
            </div>
            <span class="row-actions">
              <KIconButton
                icon="emptyTopic"
                :ariaLabel="$tr('openParentFolderLabel')"
                :tooltip="$tr('openParentFolderLabel')"
                @click="navigateToParent(resource)"
              />

              <KIconButton
                icon="minus"
                :ariaLabel="$tr('removeResourceLabel')"
                :tooltip="$tr('removeResourceLabel')"
                @click="removeResource(resource)"
              />
            </span>
          </div>
        </Draggable>
      </transition-group>
    </DragContainer>
    <p v-else>
      {{ $tr('emptyResourceList') }}
    </p>
  </div>

</template>


<script>

  import { mapState } from 'vuex';

  import DragSortWidget from 'kolibri-common/components/sortable/DragSortWidget';
  import DragContainer from 'kolibri-common/components/sortable/DragContainer';
  import DragHandle from 'kolibri-common/components/sortable/DragHandle';
  import Draggable from 'kolibri-common/components/sortable/Draggable';
  import LearningActivityIcon from 'kolibri-common/components/ResourceDisplayAndSearch/LearningActivityIcon.vue';
  import bytesForHumans from 'kolibri/uiText/bytesForHumans';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import { getCurrentInstance, onMounted, ref, watch } from 'vue';
  import { coachStrings } from '../../../../../common/commonCoachStrings.js';
  import { PageNames } from '../../../../../../constants/index.js';

  export default {
    name: 'SelectedResources',
    components: {
      DragSortWidget,
      DragContainer,
      DragHandle,
      Draggable,
      LearningActivityIcon,
    },
    setup(props) {
      const prevRoute = ref(null);

      const { upLabel$, downLabel$, numberOfSelectedResources$ } = searchAndFilterStrings;
      const { lessonLabel$, sizeLabel$ } = coachStrings;

      const instance = getCurrentInstance();

      onMounted(() => {
        const backRoute = prevRoute.value?.name
          ? prevRoute.value
          : {
            name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
          };
        if (props.selectedResources.length === 0) {
          instance.proxy.$router.replace(backRoute);
        }
        props.setTitle(numberOfSelectedResources$({ count: props.selectedResources.length }));
        props.setGoBack(() => {
          instance.proxy.$router.push(backRoute);
        });
      });

      watch(
        () => props.selectedResources,
        () => {
          props.setTitle(numberOfSelectedResources$({ count: props.selectedResources.length }));
        },
      );

      return {
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
        upLabel$,
        downLabel$,
        sizeLabel$,
        lessonLabel$,
      };
    },
    props: {
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      selectedResources: {
        type: Array,
        required: true,
      },
      selectedResourcesSize: {
        type: Number,
        required: true,
      },
    },

    computed: {
      ...mapState('lessonSummary', ['currentLesson']),
      lessonOrderListButtonBorder() {
        return {
          borderBottom: `1px solid ${this.$themeTokens.fineLine}`,
          height: `auto`,
          width: `100%`,
        };
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.prevRoute = from;
      });
    },
    methods: {
      bytesForHumans,
      getResourceSize(resource) {
        return resource.files.reduce((acc, file) => acc + file.file_size, 0);
      },
      removeResource(resource) {
        this.$emit('deselectResources', [resource]);
      },
      navigateToParent(resource) {
        this.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
          query: { topicId: resource.parent },
        });
      },
    },
    $trs: {
      openParentFolderLabel: {
        message: 'Open parent folder',
        context: 'Button label to open the parent folder of a resource',
      },
      removeResourceLabel: {
        message: 'Remove resource',
        context: 'Button label to remove a resource from the selected resources',
      },
      emptyResourceList: {
        message: 'No resources selected',
        context: 'Message displayed when no resources are selected',
      },
    },
  };

</script>


<style scoped lang="scss">

  .resource-row {
    display: flex;
    gap: 8px;
    justify-content: space-between;

    &:not(:first-of-type) {
      margin-top: 16px;
    }

    &:last-of-type {
      border-width: 0 !important;
    }

    .resource-size {
      margin-top: 10px;
      margin-bottom: 16px;
      font-size: 12px;
    }

    .row-content {
      display: flex;
      gap: 16px;
    }

    .row-actions {
      flex-shrink: 0;
    }
  }

  .arrange-item-block {
    display: block;
  }

  .icon-style {
    font-size: 21px;
  }

  .selection-metadata-info p {
    margin-top: 0;
    margin-bottom: 24px;
  }

</style>
