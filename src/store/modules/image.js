export default {
  namespaced: true,
  state: () => ({
    uploadingImage: false,
    library: [],
  }),
  getters: {
    library: (state) => state.library,
  },
  mutations: {
    startImageUpload: (state) => (state.uploadingImage = true),
    stopImageUpload: (state, errorMessage) => {
      state.uploadingImage = false;
      state.imageUploadError = errorMessage;
    },
  },
  actions: {
    async uploadImage({ commit }, payload) {
      if (!payload.image || !payload.sceneId) {
        return;
      }
      const formData = new FormData(),
        options = {
          method: "POST",
          body: formData,
        };

      formData.append("imageFile", payload.image);
      commit("startImageUpload");
      try {
        const uploadedImage = await fetch(`${process.env.VUE_APP_API_URL}/image/upload/${payload.sceneId}${payload.id ? `?id=${payload.id}` : ""}`, options);
        commit("stopImageUpload");
        return uploadedImage;
      } catch (error) {
        commit("stopImageUpload", error);
      }
    },
  },
};
