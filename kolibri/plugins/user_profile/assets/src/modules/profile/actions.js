import isEmpty from 'lodash/isEmpty';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import useUser from 'kolibri/composables/useUser';
import { get } from '@vueuse/core';

export function updateUserProfile(store, { updates }) {
  if (isEmpty(updates)) {
    return Promise.resolve();
  }

  const user = useUser();

  return FacilityUserResource.saveModel({
    id: get(user.id),
    data: updates,
    exists: true,
  }).then(() => {
    user.setSession({ session: updates });
  });
}

export function updateUserProfilePassword(store, password) {
  const user = useUser();
  return FacilityUserResource.saveModel({
    id: get(user.id),
    data: { password },
    exists: true,
  });
}
