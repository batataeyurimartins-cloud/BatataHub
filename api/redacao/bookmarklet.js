import { handleBookmarkletGenerate } from '../../server/redacao.mjs';

// Public, credential-free CORS endpoint for the UI injected by the bookmarklet.
export default {
  fetch(request) {
    return handleBookmarkletGenerate(request, process.env);
  },
};
