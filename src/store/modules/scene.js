import { createScene, sendSceneMessage, getSceneCards, connectToScene, disconnectFromScene } from "../dal/scene";
import store from "../../store";
import router from "../../router";

export default {
  namespaced: true,
  state: () => ({
    activeScene: {},
    userSceneCache: {},
    processing: false,
    loadingPreset: false,
    room: null,
    inBlink: 0,
    outBlink: 0,
  }),
  getters: {
    activeScene: (state) => {
      return state.activeScene;
    },
    activePreset: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset;
    },
    sceneVideos: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.videos || [];
    },
    sceneImages: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.images || [];
    },
    sceneNfts: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.nfts || [];
    },
    sceneSounds: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.sounds || [];
    },
    sceneWidgets: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.widgets || [];
    },
    sceneList: (state) => Object.values(state.userSceneCache),
    connected: (state) => {
      return state.room?.state;
    },
    inBlink: (state) => {
      return state.inBlink;
    },
    outBlink: (state) => {
      return state.outBlink;
    },
    processing: (state) => {
      return state.processing;
    },
    loadingPreset: (state) => {
      return state.loadingPreset;
    },
  },
  mutations: {
    START(state) {
      state.processing = true;
    },
    STOP(state) {
      state.processing = false;
    },
    PRESET_LOAD_START(state) {
      state.loadingPreset = true;
    },
    PRESET_LOAD_STOP(state) {
      state.loadingPreset = false;
    },
    STORE_SCENE(state, scene) {
      if (scene.sk && state.userSceneCache) {
        state.userSceneCache = { ...state.userSceneCache, [scene.sk]: scene };
      }
      if (state.activeScene.sk == scene.sk) {
        state.activeScene = scene;
      }
    },
    SET_ACTIVE_SCENE(state, sceneId) {
      state.activeScene = state.userSceneCache[sceneId];
      state.activePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
    },
    UPDATE_SCENE(state, { scene, prop, val }) {
      const { sk, displayName } = this.$store.state.user.userInfo;
      const orgs = this.$store.state.organization.userOrgs.map((org) => org.sk);
      sendSceneMessage("update_scene", { scene: scene || state.activeScene, user: { sk, displayName, orgs }, prop, val });
    },
    ADD_PRESET(state, preset) {
      state.activeScene.presets.push(preset);
    },
    UPDATE_PRESET(state, preset) {
      const presetIndex = state.activeScene.presets.findIndex((preset) => preset.sk);
      state.activeScene.presets.splice(presetIndex, 1, preset);
    },
    REMOVE_PRESET(state, presetId) {
      const presetIndex = state.activeScene.presets.findIndex((preset) => preset.sk == presetId);
      state.activeScene.presets.splice(presetIndex, 1);
    },
    SET_ROOM(state, room) {
      if (room) {
        state.room = room;
      } else {
        state.room = null;
      }
    },
    BLINK(state, { direction, brightness }) {
      let prop;
      if (direction == "in") {
        prop = "inBlink";
      } else if (direction == "out") {
        prop = "outBlink";
      } else {
        return;
      }
      state[prop] = brightness;
    },
    UNSET_ROOM(state) {
      state.room = null;
    },
    CLEAR_ACTIVE_SCENE(state) {
      state.activeScene = {};
      state.room = null;
    },
  },
  actions: {
    // SCENE ELEMENTS ARE THINGS SHOWN IN THE SCENE, BUT THEY ARE STORED IN SCENE PRESETS //
    createSceneElement: async ({ state }, { property, element, instance, id, setting, elementData, instanceData, settingData }) => {
      const scenePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      await state.room.send("scene_preset_update", { action: "create", property, id, element, instance, setting, elementData, instanceData, settingData, scenePreset, stage: "pre" });
    },
    updateSceneElement: async ({ state }, { property, element, instance, id, setting, elementData, instanceData, settingData }) => {
      const scenePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      await state.room.send("scene_preset_update", { action: "update", property, id, element, instance, setting, elementData, instanceData, settingData, scenePreset, stage: "pre" });
    },
    deleteSceneElement: async ({ state }, { property, element, instance, id, setting, elementData, instanceData, settingData }) => {
      const scenePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      await state.room.send("scene_preset_update", { action: "delete", property, id, element, instance, setting, elementData, instanceData, settingData, scenePreset, stage: "pre" });
    },
    toggleSoundLocators: async ({ rootGetters, state }, { property, element, instance, id, setting, elementData, instanceData, settingData }) => {
      const scenePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      const userInfo = rootGetters["user/userInfo"];
      console.log(userInfo);
      const userId = userInfo.sk;
      await state.room.send("scene_sound_locator", { action: "scene_sound_locator", userId, property, id, element, instance, setting, elementData, instanceData, settingData, scenePreset, stage: "pre" });
    },
    // END SCENE ELEMENT ACTIONS //

    // SCENE C/U/D //
    getSceneCards: async ({ commit }) => {
      commit("START");
      const { scenes } = await getSceneCards();
      scenes.forEach((scene) => {
        commit("STORE_SCENE", scene);
      });
      commit("STOP");
    },
    createScene: async ({ commit }, sceneConfig) => {
      commit("START");
      const { scene } = await createScene(sceneConfig);
      commit("STORE_SCENE", scene);
      commit("STOP");
    },
    updateScene({ commit, dispatch }, scene, prop, val) {
      dispatch("fadeBlink", "out");
      commit("UPDATE_SCENE", { scene, prop, val });
    },
    deleteScene({ commit, dispatch }, scene, prop, val) {
      dispatch("fadeBlink", "out");
      commit("UPDATE_SCENE", { scene, prop, val });
    },
    // END SCENE C/U/D //

    // ACTIVE SCENE MANAGEMENT //
    clearActiveScene: async ({ commit }) => {
      commit("CLEAR_ACTIVE_SCENE");
    },
    // END ACTIVE SCENE MANAGEMENT //

    // SCENE PRESET C/U/D //
    loadAllPresets: async ({ commit }, sceneId) => {
      commit("PRESET_START");
      sendSceneMessage("scene_load_presets", { sceneId });
    },
    addPreset: async ({ state, commit }) => {
      commit("PRESET_START");
      const scene = state.activeScene;
      sendSceneMessage("scene_add_preset_request", { scene });
    },
    deletePreset: async ({ state, commit }, presetId) => {
      commit("PRESET_START");
      const sceneId = state.activeScene.sk;
      sendSceneMessage("scene_delete_preset_request", { sceneId, presetId });
    },
    changeScenePreset: async ({ state, commit }, presetId) => {
      commit("PRESET_LOAD_START");
      const sceneData = state.activeScene;
      sendSceneMessage("scene_change_preset", { sceneData, id: presetId });
    },
    clonePreset: async ({ state, commit }, presetId) => {
      commit("PRESET_START");
      const scene = state.activeScene;
      sendSceneMessage("scene_clone_preset_request", { scene, presetId });
    },
    // END SCENE PRESET C/U/D //

    // SCENE CONNECTION ACTIONS //
    connectToScene: async ({ rootGetters, state, commit, dispatch }, sceneId) => {
      commit("START");
      const room = await connectToScene(sceneId);
      if (!room) {
        dispatch("banner/showError", { message: `Could not connect to the scene.` }, { root: true });
        router.push("/scenes");
        commit("STOP");
        return;
      } else {
        commit("SET_ROOM", room);
      }
      room.onLeave((code) => {
        console.log("Room left, with code: ", code);
        router.push("/scenes");
      });
      room.onMessage("*", () => {
        dispatch("fadeBlink", "out");
      });
      room.onMessage("scene_load_response", (scene) => {
        commit("STORE_SCENE", scene);
        commit("SET_ACTIVE_SCENE", scene.sk);
        commit("STOP");
      });
      room.onMessage("scene_update", ({ scene, user }) => {
        dispatch("banner/showSuccess", { message: `${user.displayName} made an edit to the scene.` }, { root: true });
        commit("STORE_SCENE", scene);
        commit("STOP");
      });
      room.onMessage("scene_preset_update", (message) => {
        commit("UPDATE_PRESET", message.scenePreset);
        commit("STOP");
        if (message.user.sk == rootGetters["user/userInfo"].sk) {
          return;
        }
        switch (message.action) {
          case "created":
            dispatch("banner/showSuccess", { message: `${message.user.displayName} created a new ${message.element}` }, { root: true });
            break;
          case "update":
            dispatch(
              "banner/showSuccess",
              {
                message: `${message.user.displayName} made an update to the scene.
                }`,
              },
              { root: true }
            );
            break;
          case "delete":
            dispatch(
              "banner/showSuccess",
              { message: `${message.user.displayName} deleted ${message.instance ? "an instance of" : ""}  ${message.elementData ? "the " + message.elementData.name + " " + message.element : "a " + message.element}` },
              { root: true }
            );
            break;
        }
      });
      room.onMessage("started_editing", ({ user }) => {
        if (user.sk !== store.state.user.userInfo.sk) {
          dispatch("banner/showSuccess", { message: `${user.displayName} has started making edits with you.` }, { root: true });
        }
        commit("STOP");
      });
      room.onMessage("scene_change_preset", ({ user, scene, preset }) => {
        commit("STORE_SCENE", scene);
        dispatch("banner/showSuccess", { message: `${user.displayName} changed the scene preset to "${preset.name}"` }, { root: true });
        commit("PRESET_LOAD_STOP");
      });
      room.onMessage("scene_add_preset_response", ({ user, preset }) => {
        commit("ADD_PRESET", preset);
        dispatch("banner/showSuccess", { message: `${user.displayName} changed the scene preset to "${preset.name}"` }, { root: true });
        commit("PRESET_STOP");
      });
      room.onMessage("scene_clone_preset_response", ({ user, preset, presetId }) => {
        const clonedPreset = state.activeScene.presets.find((preset) => preset.sk == presetId);
        commit("ADD_PRESET", preset);
        dispatch("banner/showSuccess", { message: `${user.displayName} created a new preset from "${clonedPreset.name}"` }, { root: true });
        commit("PRESET_STOP");
      });
      room.onMessage("scene_delete_preset_response", ({ user, presetId }) => {
        const deletedPreset = state.activeScene.presets.find((preset) => preset.sk == presetId);
        commit("REMOVE_PRESET", presetId);
        dispatch("banner/showSuccess", { message: `${user.displayName} deleted the "${deletedPreset.name}" preset` }, { root: true });
        commit("PRESET_STOP");
      });
      room.onMessage("update_preset_property_response", ({ user, preset, original }) => {
        commit("UPDATE_PRESET", preset);
        dispatch("banner/showSuccess", { message: `${user.displayName} renamed the "${original.name}" preset to "${preset.name}"` }, { root: true });
        commit("PRESET_STOP");
      });
      sendSceneMessage("scene_load_request", { sceneId });
      return room;
    },
    disconnectFromScene: async ({ commit }) => {
      commit("CLEAR_ACTIVE_SCENE");
      await disconnectFromScene();
    },
    fadeBlink({ commit, state }, direction) {
      let prop;
      if (direction == "in") {
        prop = "inBlink";
      } else if (direction == "out") {
        prop = "outBlink";
      } else {
        return;
      }
      const duration = 1000; // Transition duration in milliseconds
      const interval = 50; // Interval between brightness updates in milliseconds (approx. 60 FPS)
      const steps = Math.ceil(duration / interval); // Number of steps to reach the target brightness
      const brightnessChange = (state[prop] - 0) / steps; // Amount to adjust brightness per step

      const fadeInterval = setInterval(() => {
        const nextLevel = state[prop] - brightnessChange;
        commit("BLINK", direction, nextLevel);
        if (state[prop] <= 0) {
          state[prop] = 0;
          clearInterval(fadeInterval);
        }
      }, interval);
    },
    // END SCENE CONNECTION ACTIONS //
  },
};
