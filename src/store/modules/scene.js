import { createScene, sendSceneMessage, getSceneCards, connectToScene, disconnectFromScene } from "../dal/scene";
import store from "../../store";
import router from "../../router";

export default {
  namespaced: true,
  state: () => ({
    activeScene: {},
    userSceneCache: {},
    loadingScene: false,
    loadingPreset: false,
    room: null,
    inBlink: 0,
    outBlink: 0,
  }),
  getters: {
    activeScene: (state) => {
      return state.activeScene;
    },
    isDemoScene: (state) => {
      return state.activeScene?.sk == "00000000-0000-0000-0000-000000000000";
    },
    activePreset: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset;
    },
    sceneSettings: (state) => {
      return state.activeScene?.settings;
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
    sceneModels: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.models || [];
    },
    sceneWidgets: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.widgets || [];
    },
    sceneClaimPoints: (state) => {
      const activePresetId = state.activeScene?.scenePreset,
        activePreset = state.activeScene?.presets?.find((preset) => preset.sk == activePresetId);
      return activePreset?.claimPoints || [];
    },
    sceneList: (state) => Object.values(state.userSceneCache),
    sceneListSelect: (state) => Object.values(state.userSceneCache).map((scene) => ({ text: scene.name, value: scene.sk })),
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
    loadingScene: (state) => {
      return state.loadingScene;
    },
    hasDeployedDCLScene: (state) => {
      const findDCLLocation = (scene) => scene.locations.length && scene.locations.find((location) => location.world == "decentraland");
      return !!Object.keys(state.userSceneCache).find(sceneKey => findDCLLocation(state.userSceneCache[sceneKey]));
    },
    hasV1DclFeatures: (state, getters) => {
      const locationsWithDclIntegrationData = getters.activeScene?.locations?.filter((location) => location.world == "decentraland" && location.integrationData);
      // all locations have integration data and locations.integrationData.packageVersion >= 0.1.0
      return locationsWithDclIntegrationData?.every((location) => {
        const packageVersion = location.integrationData.packageVersion.split(".");
        return packageVersion[0] >= 0 && packageVersion[1] >= 1;
      });
    }
  },
  mutations: {
    SCENE_LOAD_START(state) {
      state.loadingScene = true;
    },
    SCENE_LOAD_STOP(state) {
      state.loadingScene = false;
    },
    PRESET_LOAD_START(state) {
      state.loadingPreset = true;
    },
    PRESET_LOAD_STOP(state) {
      state.loadingPreset = false;
    },
    STORE_SCENE(state, scene) {
      if (scene?.sk && state.userSceneCache) {
        state.userSceneCache = { ...state.userSceneCache, [scene.sk]: scene };
      }
      if (state.activeScene?.sk == scene?.sk) {
        state.activeScene = scene;
      }
    },
    SET_ACTIVE_SCENE(state, sceneId) {
      state.activeScene = state.userSceneCache[sceneId];
      if (state.activeScene) {
        state.activePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      }
    },
    UPDATE_SCENE(state, { scene, prop, val }) {
      const { sk, displayName } = this.$store.state.user.userInfo;
      const orgs = this.$store.state.organization.userOrgs.map((org) => org.sk);
      sendSceneMessage("update_scene", { scene: scene || state.activeScene, user: { sk, displayName, orgs }, prop, val });
    },
    UPDATE_SCENE_SETTING(state, { settingName, settingValue }) {
      const sceneSetting = state.activeScene.settings.find((setting) => setting.settingName === settingName);
      if (sceneSetting) {
        sceneSetting.settingValue = settingValue;
      } else {
        state.activeScene.settings.push({ settingName, settingValue });
      }
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
      const userId = userInfo.sk;
      console.log(userInfo, userId);
      await state.room.send("scene_sound_locator", { action: "scene_sound_locator", userId, property, id, element, instance, setting, elementData, instanceData, settingData, scenePreset, stage: "pre" });
    },
    updateSceneSetting: async ({ commit, state }, { setting, settingName, settingValue }) => {
      commit("UPDATE_SCENE_SETTING", { settingName, settingValue });
      const settingData = state.activeScene.settings.find((setting) => setting.settingName === settingName);
      await state.room.send("scene_setting_update", { action: "update", id: settingData.sk, setting, settingData, sceneData: state.activeScene });
    },
    sendModMessage: async ({ rootGetters, state, dispatch }, { message, color, fontSize, delay }) => {
      const userInfo = rootGetters["user/userInfo"];
      await state.room.send("scene_moderator_message", { message, color, fontSize, delay, userInfo });
      dispatch("banner/showSuccess", { message: `Message sent successfully: ${message}` }, { root: true });
    },
    crashSceneUser: async ({ state }, { walletAddress, displayName }) => {
      await state.room.send("scene_moderator_crash", { walletAddress, displayName });
    },
    // END SCENE ELEMENT ACTIONS //

    // SCENE C/U/D //
    getSceneCards: async ({ commit, dispatch }) => {
      commit("SCENE_LOAD_START");
      try {
        const { scenes } = await getSceneCards();
        scenes.forEach((scene) => {
          commit("STORE_SCENE", scene);
          commit("SCENE_LOAD_STOP");
        });
      } catch (error) {
        dispatch("banner/showError", { message: `Could not connect to the server.` }, { root: true });
        commit("SCENE_LOAD_STOP");
      }
    },
    createScene: async ({ commit }, sceneConfig) => {
      commit("SCENE_LOAD_START");
      const { scene } = await createScene(sceneConfig);
      commit("STORE_SCENE", scene);
      commit("SCENE_LOAD_STOP");
      return scene;
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
      commit("PRESET_LOAD_START");
      sendSceneMessage("scene_load_presets", { sceneId });
    },
    addPreset: async ({ state, commit }) => {
      commit("PRESET_LOAD_START");
      const scene = state.activeScene;
      sendSceneMessage("scene_add_preset_request", { scene });
    },
    deletePreset: async ({ state, commit }, presetId) => {
      commit("PRESET_LOAD_START");
      const sceneId = state.activeScene.sk;
      sendSceneMessage("scene_delete_preset_request", { sceneId, presetId });
    },
    changeScenePreset: async ({ state, commit }, presetId) => {
      commit("PRESET_LOAD_START");
      const sceneData = state.activeScene;
      sceneData.scenePreset = presetId;
      sendSceneMessage("scene_change_preset", { sceneData, id: presetId });
    },
    clonePreset: async ({ state, commit }, presetId) => {
      commit("PRESET_LOAD_START");
      const scene = state.activeScene;
      sendSceneMessage("scene_clone_preset_request", { scene, presetId });
    },
    // END SCENE PRESET C/U/D //

    // SCENE CONNECTION ACTIONS //
    connectToScene: async ({ rootGetters, state, commit, dispatch }, sceneId) => {
      commit("SET_ACTIVE_SCENE", sceneId);
      commit("SCENE_LOAD_START");
      try {
        const room = await connectToScene();


        if (!room || room.statusCode >= 400) {
          dispatch("banner/showError", { message: `Could not connect to the scene.` }, { root: true });
          router.push("/scenes");
          commit("SCENE_LOAD_STOP");
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
          commit("SCENE_LOAD_STOP");
        });
        room.onMessage("scene_update", ({ scene, user }) => {
          dispatch("banner/showSuccess", { message: `${user.displayName} made an edit to the scene.` }, { root: true });
          commit("STORE_SCENE", scene);
          commit("SCENE_LOAD_STOP");
        });
        room.onMessage("scene_preset_update", (message) => {
          commit("UPDATE_PRESET", message.scenePreset);
          commit("SCENE_LOAD_STOP");
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
                  message: `${message.user.displayName} made an update to the scene.`,
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
          commit("SCENE_LOAD_STOP");
        });
        room.onMessage("scene_change_preset", ({ user, scene, preset }) => {
          commit("STORE_SCENE", scene);
          dispatch("banner/showSuccess", { message: `${user.displayName} changed the scene preset to "${preset.name}"` }, { root: true });
          commit("PRESET_LOAD_STOP");
        });
        room.onMessage("scene_add_preset_response", ({ user, preset }) => {
          commit("ADD_PRESET", preset);
          dispatch("banner/showSuccess", { message: `${user.displayName} changed the scene preset to "${preset.name}"` }, { root: true });
          commit("PRESET_LOAD_STOP");
        });
        room.onMessage("scene_clone_preset_response", ({ user, preset, presetId }) => {
          const clonedPreset = state.activeScene.presets.find((preset) => preset.sk == presetId);
          commit("ADD_PRESET", preset);
          dispatch("banner/showSuccess", { message: `${user.displayName} created a new preset from "${clonedPreset.name}"` }, { root: true });
          commit("PRESET_LOAD_STOP");
        });
        room.onMessage("scene_delete_preset_response", ({ user, presetId }) => {
          const deletedPreset = state.activeScene.presets.find((preset) => preset.sk == presetId);
          commit("REMOVE_PRESET", presetId);
          dispatch("banner/showSuccess", { message: `${user.displayName} deleted the "${deletedPreset.name}" preset` }, { root: true });
          commit("PRESET_LOAD_STOP");
        });
        room.onMessage("update_preset_property_response", ({ user, preset, original }) => {
          commit("UPDATE_PRESET", preset);
          dispatch("banner/showSuccess", { message: `${user.displayName} renamed the "${original.name}" preset to "${preset.name}"` }, { root: true });
          commit("PRESET_LOAD_STOP");
        });
        sendSceneMessage("scene_load_request", { sceneId });
        return room;
      } catch (error) {
        console.error(error);
        dispatch("banner/showError", { message: `Could not connect to the scene.` }, { root: true });
        router.push("/scenes");
        commit("SCENE_LOAD_STOP");
      }
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
