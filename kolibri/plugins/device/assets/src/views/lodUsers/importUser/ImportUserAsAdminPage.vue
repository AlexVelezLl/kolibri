<template>

  <ImmersivePage
    :primary="false"
    :appBarTitle="deviceString('importUserLabel')"
    :loading="usersLoading || taskLoading"
    @navIconClick="importLodMachineService.send('RESET_IMPORT')"
  >
    <KPageContainer class="device-container">
      <h1>{{ $tr('selectAUser') }}</h1>
      <KCircularLoader v-if="usersLoading" />
      <UsersList
        v-else
        isSearchable
        :users="usersList"
      >
        <template #action="{ user }">
          <KButton
            :text="coreString('importAction')"
            appearance="flat-button"
            :disabled="taskLoading"
            @click="startImport(user)"
          />
        </template>
      </UsersList>
    </KPageContainer>
  </ImmersivePage>

</template>


<script>

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import ImmersivePage from 'kolibri/components/pages/ImmersivePage';
  import TaskResource from 'kolibri/apiResources/TaskResource';
  import commonDeviceStrings from '../../commonDeviceStrings';
  import UsersList from '../UsersList.vue';
  import useLodDeviceUsers from '../composables/useLodDeviceUsers';

  export default {
    name: 'ImportUserAsAdmin',
    components: {
      UsersList,
      ImmersivePage,
    },
    mixins: [commonCoreStrings, commonDeviceStrings],
    setup() {
      const { users, loading, fetchUsers, usersBeingImported, importLodMachineService } =
        useLodDeviceUsers();

      fetchUsers();

      return {
        localUsers: users,
        usersLoading: loading,
        usersBeingImported,
        importLodMachineService,
      };
    },
    data: () => {
      return {
        taskLoading: false,
      };
    },
    computed: {
      remoteUsers() {
        return this.importLodMachineService.state.context.remoteUsers || [];
      },
      facility() {
        return this.importLodMachineService.state.context.selectedFacility;
      },
      deviceId() {
        return this.importLodMachineService.state.context.importDeviceId;
      },
      usersList() {
        return this.remoteUsers.map(user => ({
          ...user,
          isImported: this.localUsers.some(localUser => localUser.id === user.id),
          isImporting: this.usersBeingImported.some(importingUser => importingUser.id === user.id),
        }));
      },
    },
    methods: {
      async startImport(learner) {
        const task_name = 'kolibri.core.auth.tasks.peeruserimport';
        const params = {
          type: task_name,
          ...this.importLodMachineService.state.context.remoteAdmin,
          facility: this.facility.id,
          facility_name: this.facility.name,
          device_id: this.deviceId,
          user_id: learner.id,
          using_admin: true,
        };
        this.taskLoading = true;
        try {
          const result = await TaskResource.startTask(params);
          this.importLodMachineService.send({
            type: 'ADD_USER_BEING_IMPORTED',
            value: {
              id: learner.id,
              full_name: learner.full_name,
              username: learner.username,
              taskId: result.id,
            },
          });
          this.importLodMachineService.send({
            type: 'RESET_IMPORT',
          });
        } catch (error) {
          this.$store.dispatch('createSnackbar', this.deviceString('importUserError'));
        }
        this.taskLoading = false;
      },
    },
    $trs: {
      selectAUser: 'Select a user',
    },
  };

</script>


<style lang="scss" scoped>

  @import '../../../styles/definitions';

  .device-container {
    @include device-kpagecontainer;
  }

</style>
