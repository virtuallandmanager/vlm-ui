import { createScene, sendSceneMessage, getSceneCards, connectToScene, disconnectFromScene } from "../dal/scene";
import store from "../../store";
import router from "../../router";

export const callbacks = {}
const placeInstanceNearPlayer = (message, instanceData) => {
  const positionData = message.positionData,
    xRotation = positionData[5],
    yRotation = positionData[4],
    yRotationOffset = yRotation / 12;

  let direction, height;
  if (xRotation > 45 && xRotation < 135) {
    direction = "east";
  } else if (xRotation > 135 && xRotation < 225) {
    direction = "south";
  } else if (xRotation > 225 && xRotation < 315) {
    direction = "west";
  } else {
    direction = "north";
  }
  if (yRotation < 12 && positionData[2] - yRotationOffset > 0) {
    height = positionData[2] - yRotationOffset
  } else if (yRotation > 12 && positionData[2] + yRotationOffset < 10) {
    height = positionData[2] + yRotationOffset
  } else {
    height = positionData[2] + 1;
  }
  console.log(message);
  instanceData.position.x = positionData[1];
  instanceData.position.y = height;
  instanceData.position.z = positionData[3];

  if (direction == "north") {
    instanceData.position.z += 1;
  } else if (direction == "east") {
    instanceData.position.x += 1;
    instanceData.rotation.y = 90;
  } else if (direction == "south") {
    instanceData.position.z -= 1;
  } else if (direction == "west") {
    instanceData.position.x -= 1;
    instanceData.rotation.y = 90;
  }
  if (!instanceData.position.x) {
    instanceData.position.x = 8;
  }
  if (!instanceData.position.y) {
    instanceData.position.y = 1;
  }
  if (!instanceData.position.z) {
    instanceData.position.z = 8;
  }
  return message;
}
export default {
  namespaced: true,
  state: () => ({
    activeScene: {},
    activeSceneHosts: [],
    activeSceneVisitors: [],
    sessionActionList: [],
    userSceneCache: {},
    loadingScene: false,
    loadingPreset: false,
    room: null,
    inBlink: 0,
    outBlink: 0,
    recentMetrics: [],
    sessionActionDuration: 10
  }),
  getters: {
    activeScene: (state) => {
      return state.activeScene;
    },
    activeSceneHosts: (state) => {
      return state.activeSceneHosts;
    },
    activeSceneVisitors: (state) => {
      return state.activeSceneVisitors;
    },
    sessionActions: (state) => {
      return state.sessionActionList;
    },
    sessionActionDuration: (state) => {
      return state.sessionActionDuration;
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
    sceneModerationSettings: (state) => {
      const setting = state.activeScene?.settings.find((setting) => setting.settingName === "Moderation Settings");
      return { sk: setting.sk, ...setting.settingValue };
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
    STORE_SCENE_SETTING(state, { sceneId, settingData }) {
      const sceneData = state.userSceneCache[sceneId];
      const settingIndex = sceneData.settings.findIndex((setting) => setting.sk == settingData.sk);
      if (settingIndex > -1) {
        sceneData.settings.splice(settingIndex, 1, settingData);
      } else {
        sceneData.settings.push(settingData);
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
    SET_ACTIVE_USERS(state, activeUsers) {
      state.activeSceneHosts = activeUsers.filter(user => user.host);
      state.activeSceneVisitors = activeUsers.filter(user => !user.host);
    },
    ADD_SESSION_ACTION(state, sessionAction) {
      state.sessionActionList.unshift(sessionAction);
    },
    REMOVE_SESSION_ACTION(state) {
      state.sessionActionList.pop();
    },
    SET_SESSION_ACTION_DURATION(state, duration) {
      state.sessionActionDuration = duration;
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
      state.sessionActionList = [];
      state.activeUserList = [];
      state.room = null;
    },
  },
  actions: {
    // SCENE ELEMENTS ARE THINGS SHOWN IN THE SCENE, BUT THEY ARE STORED IN SCENE PRESETS //
    createSceneElement: async ({ state, dispatch }, { property, element, instance, id, setting, elementData, instanceData, settingData }) => {
      const scenePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      if (instance) {
        await dispatch('requestPlayerPosition', instanceData);
      }
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
    requestPlayerPosition: async ({ state, rootGetters }, instanceData) => {
      const userInfo = rootGetters["user/userInfo"];
      return new Promise((resolve, reject) => {
        // Set up callback
        callbacks["requestPlayerPosition"] = (message) => {
          const processedMessage = placeInstanceNearPlayer(message, instanceData);
          resolve(processedMessage);
        }

        // Request player position
        state.room.send("request_player_position", { userId: userInfo.sk, connectedWallet: userInfo.connectedWallet });

        // handle timeout
        setTimeout(() => {
          if (callbacks["requestPlayerPosition"]) {
            delete callbacks["requestPlayerPosition"];
            reject(new Error('Timed out while requesting player position.'));
          }
        }, 5000); // 5 seconds timeout
      })
    },
    getPlayersInScene: async ({ state }) => {
      await state.room.send("scene_get_users");
    },
    toggleSoundLocators: async ({ rootGetters, state }, { property, element, instance, id, setting, elementData, instanceData, settingData }) => {
      const scenePreset = state.activeScene.presets.find((preset) => preset.sk == state.activeScene.scenePreset);
      const userInfo = rootGetters["user/userInfo"];
      const userId = userInfo.sk;
      await state.room.send("scene_sound_locator", { action: "scene_sound_locator", userId, property, id, element, instance, setting, elementData, instanceData, settingData, scenePreset, stage: "pre" });
    },
    updateSceneSetting: async ({ commit, state }, { setting, settingName, settingValue }) => {
      commit("UPDATE_SCENE_SETTING", { settingName, settingValue });
      const settingData = state.activeScene.settings.find((setting) => setting.settingName === settingName);
      if (settingData?.settingValue?.sk) {
        delete settingData.settingValue.sk;
      }
      await state.room.send("scene_setting_update", { action: "update", id: settingData.sk, setting, settingData, sceneData: state.activeScene });
    },
    sendModMessage: async ({ rootGetters, state, dispatch }, { message, color, fontSize, delay }) => {
      const userInfo = rootGetters["user/userInfo"];
      await state.room.send("scene_moderator_message", { message, color, fontSize, delay, userInfo });
      dispatch("banner/showSuccess", { message: `Message sent successfully: ${message}` }, { root: true });
    },
    crashSceneUser: async ({ state }, { connectedWallet, displayName }) => {
      await state.room.send("scene_moderator_crash", { connectedWallet, displayName });
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
    connectToScene: async ({ getters, rootGetters, state, commit, dispatch }, sceneId) => {
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
        room.onMessage("scene_setting_update", ({ user, sceneData, settingData }) => {
          commit("STORE_SCENE_SETTING", { sceneId: sceneData.sk, settingData });
          dispatch("banner/showSuccess", { message: `${user.displayName} updated ${settingData.settingName}` }, { root: true });
        });
        room.onMessage("send_player_position", (message) => {
          if (callbacks["requestPlayerPosition"]) {
            callbacks["requestPlayerPosition"](message);
            delete callbacks["requestPlayerPosition"];
          }
        });
        room.onMessage("send_active_users", ({ activeUsers }) => {
          console.log(activeUsers)
          commit("SET_ACTIVE_USERS", activeUsers);
        });
        room.onMessage("add_session_action", ({ action, metadata, pathPoint, displayName, timestamp }) => {
          const index = state.sessionActionList.length;
          commit("ADD_SESSION_ACTION", { action, metadata, pathPoint, displayName, timestamp });
          setTimeout(() => {
            commit("REMOVE_SESSION_ACTION", index);
          }, getters.sessionActionDuration * 1000);
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
    setSessionActionDuration: async ({ commit }, duration) => {
      commit("SET_SESSION_ACTION_DURATION", duration);
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
