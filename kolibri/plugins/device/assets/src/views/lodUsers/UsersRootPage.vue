<template>

  <AppBarPage
    :title="coreString('usersLabel')"
    class="users-page"
  >
    <KPageContainer>
      <div class="header">
        <h1>{{ coreString('usersLabel') }}</h1>
        <KButton
          :text="deviceString('importUserLabel')"
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
            :text="coreString('removeAction')"
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
      :cancelText="coreString('cancelAction')"
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
      :submitText="coreString('closeAction')"
      @submit="resetShowCannotRemoveUser"
    >
      <p>
        {{ $tr('cannotRemoveUserDescription') }}
      </p>
      <KExternalLink
        :text="$tr('editPermissionsAction')"
        :href="genExternalEditPermissions()"
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

  import AppBarPage from 'kolibri/components/pages/AppBarPage';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import SelectDeviceModalGroup from 'kolibri-common/components/syncComponentSet/SelectDeviceModalGroup';
  import { LodTypePresets } from 'kolibri/constants';
  import commonDeviceStrings from '../commonDeviceStrings';

  import useLodDeviceUsers from './composables/useLodDeviceUsers';
  import UsersList from './UsersList.vue';

  export default {
    name: 'UsersPage',
    components: {
      UsersList,
      AppBarPage,
      SelectDeviceModalGroup,
    },
    mixins: [commonCoreStrings, commonDeviceStrings],
    setup() {
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

      fetchUsers();

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
    },
    data() {
      return {
        userIdToRemove: null,
        showSelectDevice: false,
      };
    },
    computed: {
      usersList() {
        return [
          ...this.users,
          ...this.usersBeingImported.map(user => ({
            ...user,
            isImporting: true,
          })),
        ];
      },
    },
    methods: {
      async onRemoveUser(userId) {
        try {
          const success = await this.removeUser(userId);
          this.userIdToRemove = null;
          if (success) {
            await this.fetchUsers({ force: true });
          }
        } catch (error) {
          this.userIdToRemove = null;
        }
      },

      handleSelectDeviceSubmit(device) {
        this.importLodMachineService.send({
          type: 'CONTINUE',
          value: {
            importOrJoin: LodTypePresets.IMPORT,
            importDeviceId: device.id,
          },
        });
      },

      genExternalEditPermissions() {
        const pathname = window.location.pathname;
        const deviceIndex = pathname.indexOf('/device');
        const base = pathname.slice(0, deviceIndex) + '/device/#';
        const path = '/permissions';
        return base + path;
      },
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
