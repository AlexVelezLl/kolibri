<template>

  <AppBarPage
    :title="usersLabel$()"
    class="users-page"
  >
    <KPageContainer>
      <div class="header">
        <h1>{{ usersLabel$() }}</h1>
        <KButton
          :text="importUserLabel$()"
          @click="showSelectDevice = true"
        />
      </div>
      <KCircularLoader v-if="loading" />
      <UsersList
        v-else
        :users="usersList"
      >
        <template #action="{ user }">
          <KButton
            :text="removeAction$()"
            appearance="flat-button"
            @click="userIdToRemove = user.id"
          />
        </template>
      </UsersList>
    </KPageContainer>
    <KModal
      v-if="userIdToRemove"
      :title="$tr('removeUserTitle')"
      :submitText="$tr('removeUserAction')"
      :cancelText="cancelAction$()"
      @submit="onRemoveUser(userIdToRemove)"
      @cancel="userIdToRemove = null"
    >
      <p>
        {{ $tr('removeUserDescription', { device: 'device' }) }}
      </p>
      <p>
        {{ $tr('removeUserCallToAction') }}
      </p>
    </KModal>
    <KModal
      v-if="showCannotRemoveUser"
      :title="$tr('cannotRemoveUserTitle')"
      :submitText="closeAction$()"
      @submit="resetShowCannotRemoveUser"
    >
      <p>
        {{ $tr('cannotRemoveUserDescription') }}
      </p>
      <KExternalLink
        :text="$tr('editPermissionsAction')"
        :href="getExternalEditPermissionsPath()"
        class="fix-link-line-height"
      />
    </KModal>
    <SelectDeviceModalGroup
      v-if="showSelectDevice"
      filterLODAvailable
      @submit="handleSelectDeviceSubmit"
      @cancel="showSelectDevice = false"
    />
  </AppBarPage>

</template>


<script>

  import { computed, ref } from 'vue';
  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import SelectDeviceModalGroup from 'kolibri-common/components/syncComponentSet/SelectDeviceModalGroup';
  import { LodTypePresets } from 'kolibri/constants';
  import { deviceStrings } from '../commonDeviceStrings';

  import useLodDeviceUsers from './composables/useLodDeviceUsers';
  import UsersList from './UsersList.vue';

  export default {
    name: 'UsersPage',
    components: {
      UsersList,
      AppBarPage,
      SelectDeviceModalGroup,
    },
    setup() {
      const userIdToRemove = ref(null);
      const showSelectDevice = ref(false);

      const {
        users,
        loading,
        usersBeingImported,
        showCannotRemoveUser,
        importLodMachineService,
        fetchUsers,
        removeUser,
        resetShowCannotRemoveUser,
      } = useLodDeviceUsers();

      const usersList = computed(() => [
        ...users.value,
        ...usersBeingImported.value.map(user => ({
          ...user,
          isImporting: true,
        })),
      ]);

      const onRemoveUser = async userId => {
        try {
          const success = await removeUser(userId);
          userIdToRemove.value = null;
          if (success) {
            await fetchUsers({ force: true });
          }
        } catch (error) {
          userIdToRemove.value = null;
        }
      };

      const handleSelectDeviceSubmit = device => {
        importLodMachineService.send({
          type: 'CONTINUE',
          value: {
            importOrJoin: LodTypePresets.IMPORT,
            importDeviceId: device.id,
          },
        });
      };

      const getExternalEditPermissionsPath = () => {
        const pathname = window.location.pathname;
        const deviceIndex = pathname.indexOf('/device');
        const base = pathname.slice(0, deviceIndex) + '/device/#';
        return base + '/permissions';
      };

      fetchUsers();

      const { usersLabel$, closeAction$, removeAction$, cancelAction$ } = coreStrings;
      const { importUserLabel$ } = deviceStrings;

      return {
        usersList,
        loading,
        userIdToRemove,
        showSelectDevice,
        showCannotRemoveUser,
        onRemoveUser,
        handleSelectDeviceSubmit,
        resetShowCannotRemoveUser,
        getExternalEditPermissionsPath,
        usersLabel$,
        closeAction$,
        removeAction$,
        cancelAction$,
        importUserLabel$,
      };
    },
    $trs: {
      removeUserTitle: 'Remove user',
      removeUserDescription:
        'If you remove this user from this device you will still be able to access their account and all their data from { device }.',
      removeUserCallToAction:
        'Please ensure that all data you would like to keep has been synced before removing this user. You will permanently lose any data that has not been synced.',
      removeUserAction: 'Remove user',
      editPermissionsAction: 'Edit admin permissions',
      cannotRemoveUserTitle: 'Cannot remove user',
      cannotRemoveUserDescription:
        'This user is the only super admin on this device and cannot be removed. Give or transfer super admin permissions to another user on this device if you would like to remove this user.',
    },
  };

</script>


<style lang="scss" scoped>

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .fix-link-line-height {
    // Override default global line-height of 1.15 which is not enough
    // space for links and makes scrollbar appear in their parent containers.
    line-height: 1.5;
  }

</style>
