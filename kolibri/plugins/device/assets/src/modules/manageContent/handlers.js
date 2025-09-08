import useUser from 'kolibri/composables/useUser';
import { get } from '@vueuse/core';

export function showManageContentPage(store) {
  store.commit('manageContent/RESET_STATE');
  store.commit('manageContent/wizard/RESET_STATE');
  const user = useUser();
  if (get(user.canManageContent)) {
    return Promise.all([
      store.dispatch('manageContent/refreshTaskList'),
      store.dispatch('manageContent/refreshChannelList'),
    ]).then(() => store.dispatch('notLoading'));
  }
  store.dispatch('notLoading');
  return Promise.resolve();
}
