export default {
  namespaced: true,
  state: () => ({
    uploadingVideo: false,
    library: [],
  }),
  getters: {
    library: (state) => state.library,
  },
  mutations: {
    startVideoUpload: (state) => (state.uploadingVideo = true),
    stopVideoUpload: (state, errorMessage) => {
      state.uploadingVideo = false
      state.VideoUploadError = errorMessage
    },
  },
  actions: {
    async uploadVideo({ commit }, payload) {
      if (!payload.Video || !payload.baseParcel) {
        return
      }

      const baseCoords = payload.baseParcel.split(','),
        formData = new FormData(),
        options = {
          method: 'POST',
          body: formData,
        }

      formData.append('VideoFile', payload.Video)
      commit('startVideoUpload')
      try {
        const uploadedVideo = await fetch(
          `${process.env.VUE_APP_API_URL}/Video/upload/${baseCoords[0]}/${baseCoords[1]}${payload.id ? `?id=${payload.id}` : ''}`,
          options
        )
        commit('stopVideoUpload')
        return uploadedVideo
      } catch (error) {
        commit('stopVideoUpload', error)
      }
    },
  },
}
