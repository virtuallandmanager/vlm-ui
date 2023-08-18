<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Scene Settings</h1>
      </v-col>
      <v-col class="d-flex justify-end" v-if="!isDemoScene">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-chip class="mr-4" v-bind="attrs" v-on="on" @click="copySceneId">
              <v-icon small class="mr-1">mdi-content-copy</v-icon>Scene ID: {{ scene.sk }}
            </v-chip>
          </template>
          <span>Copy Scene ID</span>
        </v-tooltip>

        <v-btn color="primary" @click="showSceneSetup"><v-icon small class="mr-2">mdi-map</v-icon>Scene Setup</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-text-field label="Scene Name" outlined v-model="scene.name" :disabled="isDemoScene" />
        <!-- <div class="text-display">Scene Image</div>
        <v-img :src="scene.imageSrc" v-if="scene.imageSrc" />
        <v-btn :src="scene.imageSrc" v-if="!scene.imageSrc">
          <v-icon>mdi-upload</v-icon>
          Upload Image
        </v-btn> -->
      </v-col>
    </v-row>
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Moderation</h1>
      </v-col>
    </v-row>
    <v-row class="d-flex">
      <v-col no-gutters>
        <h1 class="text-h6">
          Moderator Message
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="flex-grow-1">
        <v-select label="Font Color" :items="fontColors" v-model="messageColor"></v-select>
      </v-col>
      <v-col class="flex-grow-1">
        <v-select label="Font Size" :items="fontSizes" v-model="messageFontSize"></v-select>
      </v-col>
      <v-col class="flex-grow-1">
        <v-text-field label="Display Time (Seconds)" v-model="messageDelay" type="number"></v-text-field>
      </v-col>

    </v-row>
    <v-row>
      <v-col class="flex-grow-1">
        <v-text-field label="Message" placeholder="Hello World" v-model="messageText"></v-text-field>
      </v-col>
      <v-col class="flex-grow-0">
        <v-btn tile color="primary" @click="sendMessage">Send Message</v-btn>
      </v-col>
    </v-row>
    <div>
      <v-row>
        <v-col class="col-3" no-gutters>
          <h1 class="text-h6 white--text">Wearables</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-switch v-model="moderationPanels.banCertainWearables" @change="toggleBannedWearables()"
            label="Ban Certain Wearables"></v-switch>
        </v-col>
        <v-col>
          <v-switch v-model="moderationPanels.allowCertainWearables" @change="toggleAllowedWearables()"
            label="Only Allow Certain Wearables"></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.banCertainWearables" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text">
          Wearables Banned From Scene
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.banCertainWearables">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings['Banned Wearables']" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Contract Address" dense v-model="item.contractAddress"
                hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="4" md="3" sm="2" xs="6">
              <v-text-field label="Item ID" dense v-model="item.itemId" hide-details="auto"></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" xs="2" class="text-right">
              <v-btn icon color="gray" @click="removeBannedItem(i)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="addBannedItem()">Add Item</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.allowCertainWearables" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text">
          Wearables Allowed In Scene
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.allowCertainWearables">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings['Allowed Wearables']" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Contract Address" dense v-model="item.contractAddress"
                hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="4" md="3" sm="2" xs="6">
              <v-text-field label="Item ID" dense v-model="item.itemId" hide-details="auto"></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" xs="2" class="text-right">
              <v-btn icon color="gray" @click="removeAllowedItem(i)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="addAllowedItem()">Add Item</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="mx-n3">
        <v-col no-gutters>
          <h1 class="text-h6 white--text">Visitors</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-switch v-model="moderationPanels.banCertainUsers" @change="toggleBannedUsers()"
            label="Ban Certain People"></v-switch>
        </v-col>
        <v-col>
          <v-switch v-model="moderationPanels.allowCertainUsers" @change="toggleAllowedUsers()"
            label="Only Allow Certain People"></v-switch>
        </v-col>
        <v-col>
          <v-switch v-model="moderationSettings['Allow Web3 Only']" @change="toggleWeb3Only()"
            label="Only Allow Web3 Accounts"></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.banCertainUsers" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text">
          People Banned From Scene
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.banCertainUsers">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings['Banned Users']" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Wallet Address" dense v-model="item.walletAddress" hide-details="auto"
                @change="updateProperties"></v-text-field>
            </v-col>
            <v-col cols="4" md="3" sm="2" xs="6">
              <v-text-field label="Display Name" dense v-model="item.displayName" hide-details="auto"
                @change="updateProperties"></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" xs="2" class="d-flex flex-shrink-0">
              <v-btn icon color="gray" @click="crashUser(i)">
                <v-icon>mdi-nuke</v-icon>
              </v-btn>
              <v-btn icon color="gray" @click="removeBannedUser(i)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="addBannedUser()">Add Banned Person</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.allowCertainUsers" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text">
          People Allowed In Scene
        </v-col>
      </v-row>
      <v-row v-if="moderationPanels.allowCertainUsers">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings['Allowed Users']" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Wallet Address" dense v-model="item.walletAddress" hide-details="auto"></v-text-field>
            </v-col>
            <v-col cols="4" md="3" sm="2" xs="6">
              <v-text-field label="Display Name" dense v-model="item.displayName" hide-details="auto"></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" xs="2" class="text-right">
              <v-btn icon color="gray" @click="removeAllowedPerson(i)">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="addAllowedPerson()">Add Allowed Person</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="mx-n3">
        <v-col no-gutters>
          <h1 class="text-h6 white--text">Actions (Alpha)</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div class="text-subtitle-1">
            Actions taken when visitor is banned or restricted:
          </div>
          <v-select :items="banActions" v-model="moderationSettings['Banned Actions']"
            @change="changeRestrictionActions()" label="Moderation Actions" multiple></v-select>
          <v-select v-if="moderationSettings['Banned Actions'].includes(0)" :items="banWallTypes"
            v-model="moderationSettings['Ban Wall Type']" @change="changeRestrictionActions()"
            label="Wall Type"></v-select>
        </v-col>
        <v-col v-if="showAllowActions">
          <div class="text-subtitle-1">Actions taken when user is allowed:</div>
          <v-select :items="allowActions" v-model="moderationSettings['Allowed Actions']"
            @change="changeRestrictionActions()" label="Gated Actions" multiple></v-select>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import Vue from "vue";
import {
  EAllowActions,
  EBanActions,
  EBanWallTypes,
  ESettingType
} from "../models/SceneSettings";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "SceneSettings",

  data: () => ({
    moderationPanels: {
      banCertainWearables: false,
      allowCertainWearables: false,
      banCertainUsers: false,
      allowCertainUsers: false,
    },
    moderationSettings: {
      "Banned Wearables": [],
      "Allowed Wearables": [],
      "Banned Users": [],
      "Allowed Users": [],
      "Banned Actions": [],
      "Allowed Actions": [],
      "Ban Wall Type": 0,
      "Allow Web3 Only": false,
    },
    fontColors: [
      { text: "Black", value: "black" },
      { text: "Blue", value: "blue" },
      { text: "Gray", value: "gray" },
      { text: "Green", value: "green" },
      { text: "Magenta", value: "magenta" },
      { text: "Purple", value: "purple" },
      { text: "Red", value: "red" },
      { text: "Teal", value: "teal" },
      { text: "Yellow", value: "yellow" },
      { text: "White", value: "white", default: true },
    ],
    fontSizes: [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 55, 60],
    messageText: "",
    messageColor: "white",
    messageFontSize: 32,
    messageDelay: 5,
    banActions: [
      { text: "Blackout Visitor's Screen", value: EBanActions.BLACKOUT },
      {
        text: "Remove User and Block From Scene (Beta)",
        value: EBanActions.WALL,
      },
    ],
    banWallTypes: [
      { text: "Black Wall", value: EBanWallTypes.BLACK },
      { text: "Invisible Wall", value: EBanWallTypes.INVISIBLE },
      { text: "Mirage", value: EBanWallTypes.MIRROR },
    ],
    allowActions: [{ text: "Move User", value: EAllowActions.MOVE }],
  }),
  mounted() {
    this.settings.forEach((setting) => {
      this.moderationSettings[setting.settingName] = setting.value;
    });
  },
  computed: {
    ...mapGetters({
      scene: "scene/activeScene",
      isDemoScene: "scene/isDemoScene",
      settings: "scene/sceneSettings",
    })
  },
  methods: {
    ...mapActions({
      showTransformDialog: "dialog/showTransformDialog",
      showPropertiesDialog: "dialog/showPropertiesDialog",
      showClickEventDialog: "dialog/showClickEventDialog",
      showDeleteDialog: "dialog/showDeleteDialog",
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
      uploadImage: "media/uploadSceneImage",
      showSuccess: "banner/showSuccess",
      sendModMessage: "scene/sendModMessage",
      updateSceneSetting: "scene/updateSceneSetting",
      crashSceneUser: "scene/crashSceneUser",
    }),
    updateModerationSettings(settingName, settingValue) {
      this.updateSceneSetting({ setting: "moderation", settingName, settingValue: settingValue || this.moderationSettings[settingName] });
    },
    copySceneId() {
      navigator.clipboard.writeText(this.scene.sk);
      this.showSuccess({ message: "Scene ID copied to clipboard" });
    },
    toggleBannedWearables() {
      if (this.moderationPanels.allowCertainWearables) {
        this.moderationPanels.allowCertainWearables = false;
      }
    },
    toggleAllowedWearables() {
      if (this.moderationPanels.banCertainWearables) {
        this.moderationPanels.banCertainWearables = false;
      }
    },
    toggleBannedUsers() {
      if (this.moderationPanels.allowCertainUsers) {
        this.moderationPanels.allowCertainUsers = false;
      }
    },
    toggleAllowedUsers() {
      if (this.moderationPanels.banCertainUsers) {
        this.moderationPanels.banCertainUsers = false;
      }
    },
    toggleWeb3Only() {
      this.updateSceneSetting("Web3 Only");
    },
    changeRestrictionActions() {
      this.updateSceneSetting("Ban Restrictions");
    },
    addBannedItem() {
      const nextItem = { contractId: "", tokenId: "" };
      this.moderationSettings.bannedWearables.push(nextItem);
      this.updateSceneSetting({ settingName: "Banned Wearables", value: this.settings.bannedWearables, type: ESettingType.ARRAY });
    },
    addBannedUser() {
      const nextItem = { walletAddress: "", displayName: "" };
      this.moderationSettings["Banned Users"].push(nextItem);
    },
    removeBannedItem(i) {
      this.moderationSettings["Banned Wearables"].splice(i, 1);
      Vue.nextTick(() => {
        if (this.moderationSettings["Banned Wearables"].length < 1) {
          this.moderationPanels.banCertainWearables = false;
          this.moderationSettings["Banned Wearables"] = [];
        }
        this.updateSceneSetting("Banned Wearables");
      });
    },
    crashUser(i) {
      const user = this.moderationSettings["Banned Users"][i]
      this.crashSceneUser({ walletAddress: user.walletAddress, displayName: user.displayName });
    },
    removeBannedUser(i) {
      this.moderationSettings.bannedUsers.splice(i, 1);
      Vue.nextTick(() => {
        if (this.moderationSettings["Banned Users"].length < 1) {
          this.moderationPanels.banCertainUsers = false;
          this.moderationSettings["Banned Users"] = [{ walletAddress: "", displayName: "" }];
        }
        this.updateSceneSetting("Banned Users");
      });
    },
    addAllowedItem() {
      const nextItem = { contractId: "", tokenId: "" };
      this.moderationSettings["Allowed Wearables"].push(nextItem);
    },
    removeAllowedItem(i) {
      this.moderationSettings["Allowed Wearables"].splice(i, 1);
      Vue.nextTick(() => {
        if (this.moderationSettings["Allowed Wearables"].length < 1) {
          this.moderationPanels.allowCertainWearables = false;
          this.moderationSettings["Allowed Wearables"] = [{ contractId: "", tokenId: "" }];
        }
        this.updateSceneSetting("Allowed Wearables");
      });
    },
    showSceneSetup() {
      this.$router.push(`/docs/getting-started?sceneId=${this.scene.sk}`);
    },
    sendMessage() {
      this.sendModMessage({
        message: this.messageText,
        color: this.messageColor,
        fontSize: this.messageFontSize,
        delay: this.messageDelay,
      });
    },
  },
};
</script>
