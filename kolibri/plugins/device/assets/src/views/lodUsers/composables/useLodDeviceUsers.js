import Lockr from 'lockr';
import store from 'kolibri/store';
import { State, interpret } from 'xstate';
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { UserKinds } from 'kolibri/constants';
import UserType from 'kolibri-common/utils/userType';
import useSnackbar from 'kolibri/composables/useSnackbar';
import TaskResource from 'kolibri/apiResources/TaskResource';
import { TaskStatuses } from 'kolibri-common/utils/syncTaskUtils';
import useTaskPolling from 'kolibri-common/composables/useTaskPolling';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import { getImportLodUsersMachine } from 'kolibri-common/machines/importLodUsersMachine';

import { deviceString } from '../../commonDeviceStrings';
import { PageNames } from '../../../constants';

const SAVED_STATE_KEY = 'lodUsersImportSavedState';

const importLodMachineState = ref(null);
const users = ref([]);
const loading = ref(true);
const showCannotRemoveUser = ref(false);
const { tasks } = useTaskPolling('soud_sync');

let importLodMachineService = null;

const setupImportLodMachineService = ({ router, route }) => {
  const DeviceRouteNamesMap = {
    LOD_SETUP_TYPE: PageNames.USERS_ROOT,
    LOD_SELECT_FACILITY: PageNames.USERS_SELECT_FACILITY_FOR_IMPORT,
    LOD_IMPORT_USER_AUTH: PageNames.USERS_IMPORT_USER_WITH_CREDENTIALS,
    LOD_IMPORT_AS_ADMIN: PageNames.USERS_IMPORT_USER_AS_ADMIN,
  };

  const synchronizeRouteAndMachine = state => {
    if (!state) return;
    const { meta } = state;
    // Dump out of here if there is nothing to resume from
    if (!Object.keys(meta).length) {
      router.replace('/');
      return;
    }

    const machineRoute = meta[Object.keys(meta)[0]].route;
    if (machineRoute && DeviceRouteNamesMap[machineRoute.name]) {
      const newRoute = {
        name: DeviceRouteNamesMap[machineRoute.name],
      };

      // Avoid redundant navigation
      if (route.name !== newRoute.name) {
        router.replace(newRoute);
      }
    } else {
      router.replace(PageNames.USERS_ROOT);
    }
  };

  const savedStateObject = Lockr.get(SAVED_STATE_KEY, null);
  const savedState = savedStateObject ? State.create(savedStateObject) : null;
  if (savedState) {
    synchronizeRouteAndMachine(savedState);
  }

  importLodMachineService = interpret(getImportLodUsersMachine());
  importLodMachineService.start(savedState);
  importLodMachineService.onTransition(state => {
    importLodMachineState.value = state;
    synchronizeRouteAndMachine(state);
    Lockr.set(SAVED_STATE_KEY, state);
  });
};

export default function useLodDeviceUsers() {
  const route = useRoute();
  const router = useRouter();
  const { createSnackbar } = useSnackbar();

  if (!importLodMachineService) {
    setupImportLodMachineService({ route, router });
  }

  const usersBeingImported = computed(() => {
    const { context: { usersBeingImported = [] } = {} } = importLodMachineState.value || {};
    return usersBeingImported;
  });

  async function fetchUsers({ force } = {}) {
    loading.value = true;

    try {
      const response = await FacilityUserResource.fetchCollection({
        force,
      });
      loading.value = false;
      response.forEach(user => {
        user.kind = UserType(user);
      });
      users.value = response;
    } catch (error) {
      store.dispatch('handleApiError', { error });
    }

    loading.value = false;
  }

  async function removeUser(userId) {
    const user = users.value.find(user => user.id === userId);
    if (!user) return;
    if (
      user.kind === UserKinds.SUPERUSER &&
      users.value.filter(user => user.kind === UserKinds.SUPERUSER).length === 1
    ) {
      showCannotRemoveUser.value = true;
      throw new Error('Cannot remove the last super admin');
    }

    try {
      await FacilityUserResource.removeImportedUser(userId);
      createSnackbar(deviceString('removeUserSuccess'));
      return true;
    } catch (error) {
      createSnackbar(deviceString('removeUserError'));
      return false;
    }
  }

  function resetShowCannotRemoveUser() {
    showCannotRemoveUser.value = false;
  }

  watch(tasks, () => {
    if (!usersBeingImported.value?.length || !tasks.value?.length) {
      return;
    }

    usersBeingImported.value.forEach(user => {
      const task = tasks.value.find(task => task.extra_metadata.user_id === user.id);
      if (!task) {
        return;
      }

      if (task.status === TaskStatuses.FAILED) {
        createSnackbar(deviceString('importUserError'));
      }
      if (task.status === TaskStatuses.COMPLETED) {
        createSnackbar(deviceString('importUserSuccess'));
      }

      if ([TaskStatuses.COMPLETED, TaskStatuses.FAILED].includes(task.status)) {
        importLodMachineService.send({
          type: 'REMOVE_USER_BEING_IMPORTED',
          value: user.id,
        });
        fetchUsers({ force: true });
        TaskResource.clear(task.id);
      }
    });
  });

  return {
    users,
    loading,
    usersBeingImported,
    showCannotRemoveUser,
    importLodMachineService,
    fetchUsers,
    removeUser,
    resetShowCannotRemoveUser,
  };
}
