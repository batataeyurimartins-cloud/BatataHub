import { handleChat } from '../../server/batatagpt.mjs';

// Native Web handlers use the default Node.js runtime on Vercel.
export default {
  fetch(request) {
    return handleChat(request, process.env);
  },
};
