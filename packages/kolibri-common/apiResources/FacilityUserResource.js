import { Resource } from 'kolibri/apiResource';
import urls from 'kolibri.urls';
import client from 'kolibri.client';

export default new Resource({
  name: 'facilityuser',
  removeImportedUser(user_id) {
    return client({
      url: urls['kolibri:core:deleteimporteduser'](),
      method: 'POST',
      data: {
        user_id,
      },
    });
  },
});
