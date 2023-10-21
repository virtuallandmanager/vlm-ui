export default {
  namespaced: true,
  state: () => ({
    transform: { open: false, props: { elementData: {}, instanceData: {}, title: "" } },
    properties: { open: false, props: { element: "", elementData: {}, instanceData: {}, instance: false, title: "" } },
    clickEvent: { open: false, props: { element: "", elementData: {}, instanceData: {}, instance: false, title: "" } },
    delete: { open: false, props: { element: "", elementData: {}, instanceData: {}, instance: false, title: "", property: "" } },
  }),
  getters: {
    transformDialogOpen: (state) => state.transform.open,
    transformDialogProps: (state) => state.transform.props,
    propertiesDialogOpen: (state) => state.properties.open,
    propertiesDialogProps: (state) => state.properties.props,
    clickEventDialogOpen: (state) => state.clickEvent.open,
    clickEventDialogProps: (state) => state.clickEvent.props,
    deleteDialogOpen: (state) => state.delete.open,
    deleteDialogProps: (state) => state.delete.props,
  },
  mutations: {
    SHOW_TRANSFORM_DIALOG(state, props) {
      state.transform = { open: true, props };
    },
    HIDE_TRANSFORM_DIALOG(state) {
      state.transform = { open: false, props: { instanceData: {}, title: "" } };
    },
    SHOW_PROPERTIES_DIALOG(state, props) {
      state.properties = { open: true, props };
    },
    HIDE_PROPERTIES_DIALOG(state) {
      state.properties = { open: false, props: { elementData: {}, title: "" } };
    },
    SHOW_CLICK_EVENT_DIALOG(state, props) {
      state.clickEvent = { open: true, props };
    },
    HIDE_CLICK_EVENT_DIALOG(state) {
      state.clickEvent = { open: false, props: { elementData: {}, title: "" } };
    },
    SHOW_DELETE_DIALOG(state, props) {
      state.delete = { open: true, props };
    },
    HIDE_DELETE_DIALOG(state) {
      state.delete = { open: false, props: { elementData: {}, title: "" } };
    },
  },
  actions: {
    showTransformDialog: ({ commit }, props) => {
      commit("SHOW_TRANSFORM_DIALOG", props);
    },
    hideTransformDialog: ({ commit }, props) => {
      commit("HIDE_TRANSFORM_DIALOG", props);
    },
    showPropertiesDialog: ({ commit }, props) => {
      commit("SHOW_PROPERTIES_DIALOG", props);
    },
    hidePropertiesDialog: ({ commit }, props) => {
      commit("HIDE_PROPERTIES_DIALOG", props);
    },
    showClickEventDialog: ({ commit }, props) => {
      commit("SHOW_CLICK_EVENT_DIALOG", props);
    },
    hideClickEventDialog: ({ commit }, props) => {
      commit("HIDE_CLICK_EVENT_DIALOG", props);
    },
    showDeleteDialog: ({ commit }, props) => {
      commit("SHOW_DELETE_DIALOG", props);
    },
    hideDeleteDialog: ({ commit }, props) => {
      commit("HIDE_DELETE_DIALOG", props);
    },
  },
};
