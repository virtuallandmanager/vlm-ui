<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <h1 class="text-h5 ml-2 mb-4">Moderation</h1>
      </v-col>
    </v-row>
    <v-row class="grey darken-3 mx-n3 d-flex">
      <v-col no-gutters>
        <h1 class="text-h6">
          Moderator Message
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon dark v-bind="attrs" v-on="on" small>
                mdi-information-outline
              </v-icon>
            </template>
            <span>Requires v1.5.0 or greater of the SDK library</span>
          </v-tooltip>
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="flex-grow-1">
        <v-select
          label="Font Color"
          :items="fontColors"
          v-model="messageColor"
        ></v-select>
      </v-col>
      <v-col class="flex-grow-1">
        <v-select
          label="Font Size"
          :items="fontSizes"
          v-model="messageFontSize"
        ></v-select>
      </v-col>
      <v-col class="flex-grow-1">
        <v-text-field
          label="Display Time (Seconds)"
          v-model="messageDelay"
          type="number"
        ></v-text-field>
      </v-col>
      <v-col class="flex-grow-0">
        <v-btn tile color="primary" @click="sendMessage">Send Message</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="col-12">
        <v-text-field
          label="Message"
          placeholder="Hello World"
          v-model="messageText"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="grey darken-3 mx-n3">
      <v-col class="col-3" no-gutters>
        <h1 class="text-h6 white--text">Wearables</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-switch
          v-model="settings.banCertainWearables"
          @change="toggleBannedWearables()"
          label="Ban Certain Wearables"
        ></v-switch>
      </v-col>
      <v-col>
        <v-switch
          v-model="settings.allowCertainWearables"
          @change="toggleAllowedWearables()"
          label="Only Allow Certain Wearables"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row v-if="settings.banCertainWearables" class="grey darken-5">
      <v-col class="text-subtitle-1 white--text">
        Wearables Banned From Scene
      </v-col>
    </v-row>
    <v-row v-if="settings.banCertainWearables">
      <v-col>
        <v-row v-for="(item, i) in settings.bannedWearables" :key="i" dense>
          <v-col cols="7" md="8" sm="9" xs="4">
            <v-text-field
              label="Contract Address"
              dense
              v-model="item.contractAddress"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="4" md="3" sm="2" xs="6">
            <v-text-field
              label="Item ID"
              dense
              v-model="item.itemId"
              hide-details="auto"
            ></v-text-field>
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
    <v-row v-if="settings.allowCertainWearables" class="grey darken-5">
      <v-col class="text-subtitle-1 white--text">
        Wearables Allowed In Scene
      </v-col>
    </v-row>
    <v-row v-if="settings.allowCertainWearables">
      <v-col>
        <v-row v-for="(item, i) in settings.allowedWearables" :key="i" dense>
          <v-col cols="7" md="8" sm="9" xs="4">
            <v-text-field
              label="Contract Address"
              dense
              v-model="item.contractAddress"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="4" md="3" sm="2" xs="6">
            <v-text-field
              label="Item ID"
              dense
              v-model="item.itemId"
              hide-details="auto"
            ></v-text-field>
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
    <v-row class="grey darken-3 mx-n3">
      <v-col no-gutters>
        <h1 class="text-h6 white--text">Visitors</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-switch
          v-model="settings.banCertainUsers"
          @change="toggleBannedUsers()"
          label="Ban Certain People"
        ></v-switch>
      </v-col>
      <v-col>
        <v-switch
          v-model="settings.allowCertainUsers"
          @change="toggleAllowedUsers()"
          label="Only Allow Certain People"
        ></v-switch>
      </v-col>
      <v-col>
        <v-switch
          v-model="settings.allowWeb3Only"
          @change="toggleWeb3Only()"
          label="Only Allow Web3 Accounts"
        ></v-switch>
      </v-col>
    </v-row>
    <v-row v-if="settings.banCertainUsers" class="grey darken-5">
      <v-col class="text-subtitle-1 white--text">
        People Banned From Scene
      </v-col>
    </v-row>
    <v-row v-if="settings.banCertainUsers">
      <v-col>
        <v-row v-for="(item, i) in settings.bannedUsers" :key="i" dense>
          <v-col cols="7" md="8" sm="9" xs="4">
            <v-text-field
              label="Wallet Address"
              dense
              v-model="item.walletAddress"
              hide-details="auto"
              @change="updateProperties"
            ></v-text-field>
          </v-col>
          <v-col cols="4" md="3" sm="2" xs="6">
            <v-text-field
              label="Display Name"
              dense
              v-model="item.displayName"
              hide-details="auto"
              @change="updateProperties"
            ></v-text-field>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="1" sm="1" xs="2" class="text-right">
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
    <v-row v-if="settings.allowCertainUsers" class="grey darken-5">
      <v-col class="text-subtitle-1 white--text">
        People Allowed In Scene
      </v-col>
    </v-row>
    <v-row v-if="settings.allowCertainUsers">
      <v-col>
        <v-row v-for="(item, i) in settings.allowedUsers" :key="i" dense>
          <v-col cols="7" md="8" sm="9" xs="4">
            <v-text-field
              label="Wallet Address"
              dense
              v-model="item.walletAddress"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <v-col cols="4" md="3" sm="2" xs="6">
            <v-text-field
              label="Display Name"
              dense
              v-model="item.displayName"
              hide-details="auto"
            ></v-text-field>
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
    <v-row class="grey darken-3 mx-n3" v-if="showActions">
      <v-col no-gutters>
        <h1 class="text-h6 white--text">Actions</h1>
      </v-col>
    </v-row>
    <v-row v-if="showActions">
      <v-col v-if="showBanActions">
        <div class="text-subtitle-1">
          Actions taken when visitor is banned or restricted:
        </div>
        <v-select
          :items="banActions"
          v-model="settings.banActions"
          @change="changeRestrictionActions()"
          label="Moderation Actions"
          multiple
        ></v-select>
        <!-- <v-select
          v-if="settings.banActions.includes(0)"
          :items="banWallTypes"
          v-model="settings.banWallType"
          @change="changeRestrictionActions()"
          label="Wall Type"
        ></v-select> -->
      </v-col>
      <v-col v-if="showAllowActions">
        <div class="text-subtitle-1">Actions taken when user is allowed:</div>
        <v-select
          :items="allowActions"
          v-model="settings.allowedActions"
          @change="changeRestrictionActions()"
          label="Gated Actions"
          multiple
        ></v-select>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";
import {
  EAllowActions,
  EBanActions,
  EBanWallTypes,
  SceneModeration,
} from "../models/SceneModeration";

export default {
  name: "SceneModeration",

  data: () => ({
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
  props: {
    settings: {
      type: Object,
      default: function () {
        return new SceneModeration();
      },
    },
  },
  computed: {
    showActions() {
      return (
        this.settings.banCertainUsers ||
        this.settings.banCertainWearables ||
        this.settings.allowCertainUsers ||
        this.settings.allowCertainWearables
      );
    },
    showBanActions() {
      return this.settings.banCertainUsers || this.settings.banCertainWearables;
    },
    showAllowActions() {
      return (
        this.settings.allowCertainUsers || this.settings.allowCertainWearables
      );
    },
  },
  methods: {
    toggleBannedWearables() {
      if (this.settings.allowCertainWearables) {
        this.settings.allowCertainWearables = false;
      }
      this.updateProperties();
    },
    toggleAllowedWearables() {
      if (this.settings.banCertainWearables) {
        this.settings.banCertainWearables = false;
      }
      this.updateProperties();
    },
    toggleBannedUsers() {
      if (this.settings.allowCertainUsers) {
        this.settings.allowCertainUsers = false;
      }
      this.updateProperties();
    },
    toggleAllowedUsers() {
      if (this.settings.banCertainUsers) {
        this.settings.banCertainUsers = false;
      }
      this.updateProperties();
    },
    toggleWeb3Only() {
      this.updateProperties();
    },
    changeRestrictionActions() {
      this.updateProperties();
    },
    addBannedItem() {
      const nextItem = { contractId: "", tokenId: "" };
      this.settings.bannedWearables.push(nextItem);
      this.updateProperties();
    },
    addBannedUser() {
      const nextItem = { walletAddress: "", displayName: "" };
      this.settings.bannedUsers.push(nextItem);
      this.updateProperties();
    },
    removeBannedItem(i) {
      this.settings.bannedWearables.splice(i, 1);
      Vue.nextTick(() => {
        if (this.settings.bannedWearables.length < 1) {
          this.settings.banCertainWearables = false;
          this.settings.bannedWearables = [{ contractId: "", tokenId: "" }];
        }
        this.updateProperties();
      });
    },
    removeBannedUser(i) {
      this.settings.bannedUsers.splice(i, 1);
      Vue.nextTick(() => {
        if (this.settings.bannedUsers.length < 1) {
          this.settings.banCertainUsers = false;
          this.settings.bannedUsers = [{ walletAddress: "", displayName: "" }];
        }
        this.updateProperties();
      });
    },
    addAllowedItem() {
      const nextItem = { contractId: "", tokenId: "" };
      this.settings.allowedWearables.push(nextItem);
      this.updateProperties();
    },
    removeAllowedItem(i) {
      this.settings.allowedWearables.splice(i, 1);
      Vue.nextTick(() => {
        if (this.settings.allowedWearables.length < 1) {
          this.settings.allowCertainWearables = false;
          this.settings.allowedWearables = [{ contractId: "", tokenId: "" }];
        }
        this.updateProperties();
      });
    },
    updateProperties() {
      const wssMessages = {
        action: "update",
        element: "moderation",
        settings: this.settings,
      };
      this.$emit("updateProperties", { wssMessages });
    },
    sendMessage() {
      const wssMessages = {
        action: "message",
        message: {
          text: this.messageText,
          config: {
            color: this.messageColor,
            fontSize: this.messageFontSize,
            delay: this.messageDelay,
          },
        },
      };
      this.$emit("sendMessage", { wssMessages });
      this.messageText = "";
    },
  },
};
</script>
