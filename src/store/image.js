export default {
  namespaced: true,
  state: () => ({
    uploadingImage: false
  }),
  mutations: {
    startImageUpload: (state) => (state.uploadingImage = true),
    stopImageUpload: (state, errorMessage) => {
      state.uploadingImage = false;
      state.imageUploadError = errorMessage;
    }
  },
  actions: {
    async uploadImage({ commit }, payload) {
      if (!payload.image || !payload.baseParcel) {
        return;
      }
      const baseCoords = payload.baseParcel.split(","),
        formData = new FormData(),
        options = {
          method: "POST",
          body: formData
        };

      formData.append("imageFile", payload.image);
      commit("startImageUpload");
      try {
        const uploadedImage = await fetch(`${process.env.VUE_APP_API_URL}/image/upload/${baseCoords[0]}/${baseCoords[1]}${payload.id ? `?id=${payload.id}` : ''}`, options);
        commit("stopImageUpload");
        return uploadedImage;
      } catch (error) {
        commit("stopImageUpload", error);
      }
    }
  }
};
