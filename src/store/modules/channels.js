import { fetchCommunityChannels } from '../dal/channels'

export default {
  namespaced: true,
  state: () => ({
    community: [
      {
        sk: 0,
        name: 'VTATV',
        description: 'Stream run by VTATV',
        url: 'https://video.dcl.guru/live/vtatvpublic/index.m3u8',
      },
      {
        sk: 1,
        name: 'SinfulMeatSticks',
        description: 'Stream run by the Sinful MEWer',
        url: 'https://meow.dclstream.com/memfs/fe2bd770-c28e-49f2-bb62-8a5721bd1f27.m3u8',
      },
    ],
  }),
  getters: {
    community: (state) => state.community,
  },
  mutations: {
    SET_CHANNELS(state, channels) {
      state.community = channels
    },
  },
  actions: {
    async getCommunityChannels({ commit }) {
      const { channels } = await fetchCommunityChannels()
      commit('SET_CHANNELS', channels)
    },
  },
}
