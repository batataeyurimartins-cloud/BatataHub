import { handleHealth } from '../../server/batatagpt.mjs';

export default {
  fetch(request) {
    return handleHealth(request, process.env);
  },
};
