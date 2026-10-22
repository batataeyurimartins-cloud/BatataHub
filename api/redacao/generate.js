import { handleGenerate } from '../../server/redacao.mjs';

// Native Web handler on the default Vercel Node.js runtime.
export default {
  fetch(request) {
    return handleGenerate(request, process.env);
  },
};
