import { ref, onMounted } from 'vue';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import useUser from 'kolibri/composables/useUser';
import { get } from '@vueuse/core';

// A usable that returns the Facility user tied to the session
export default function useCurrentUser() {
  const user = useUser();
  const currentUser = ref({});
  const isLoading = ref(false);

  onMounted(() => {
    isLoading.value = true;
    return FacilityUserResource.fetchModel({ id: get(user.id) }).then(userModel => {
      currentUser.value = { ...userModel };
      isLoading.value = false;
    });
  });

  return {
    currentUser,
    isLoading,
  };
}
