import { UserKinds } from 'kolibri/constants';
import { registerNavItem } from 'kolibri/composables/useNav';
import urls from 'kolibri/urls';
import { coreStrings } from 'kolibri/uiText/commonCoreStrings';

registerNavItem({
  get url() {
    return urls['kolibri:kolibri.plugins.device:users_management']();
  },
  get label() {
    return coreStrings.$tr('usersLabel');
  },
  icon: 'audience',
  role: UserKinds.ADMIN,
});
