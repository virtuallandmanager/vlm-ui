import { uploadUserImage } from "../dal/media";

export default {
  namespaced: true,
  state: () => ({
    currentFolderPath: "/",
    uploadingImage: false,
    library: [],
  }),
  getters: {
    library: (state) => state.library,
    uploadingImage: (state) => state.uploadingImage,
  },
  mutations: {
    startImageUpload: (state) => (state.uploadingImage = true),
    stopImageUpload: (state, errorMessage) => {
      state.uploadingImage = false;
      state.imageUploadError = errorMessage;
    },
  },
  actions: {
    async uploadUserImage({ commit }, payload) {
      if (!payload.image) {
        return;
      }

      const formData = new FormData();

      // Append extra data to the form data
      formData.append("image", payload.image);

      commit("startImageUpload");
      try {
        const uploadedImage = await uploadUserImage(formData);
        commit("stopImageUpload");
        return uploadedImage;
      } catch (error) {
        commit("stopImageUpload", error);
      }
    },
  },
};
