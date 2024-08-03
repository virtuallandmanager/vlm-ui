<template>
  <v-container class="py-6 mx-auto">
    <v-row>
      <v-col no-gutters>
        <div class="text-h4">Moderation</div>
      </v-col>
    </v-row>
    <v-row class="d-flex">
      <v-col no-gutters>
        <h1 class="text-h6">Moderator Message</h1>
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
          <v-switch v-model="moderationSettings.banCertainWearables" @change="updateModerationSettings" label="Ban Certain Wearables"></v-switch>
        </v-col>
        <v-col>
          <v-switch
            v-model="moderationSettings.allowCertainWearables"
            @change="updateModerationSettings"
            label="Only Allow Certain Wearables"
          ></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="moderationSettings.banCertainWearables" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text"> Wearables Banned From Scene </v-col>
      </v-row>
      <v-row v-if="moderationSettings.banCertainWearables">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings.bannedWearables" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Contract Address" dense v-model="item.contractAddress" hide-details="auto"></v-text-field>
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
              <v-btn @click="addBannedItem()"><v-icon class="mr-1">mdi-plus</v-icon>Item</v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row v-if="moderationSettings.allowCertainWearables" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text"> Wearables Allowed In Scene </v-col>
      </v-row>
      <v-row v-if="moderationSettings.allowCertainWearables">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings.allowedWearables" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Contract Address" dense v-model="item.contractAddress" hide-details="auto"></v-text-field>
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
              <v-btn @click="addAllowedItem"><v-icon class="mr-1">mdi-plus</v-icon>Item</v-btn>
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
          <v-switch v-model="moderationSettings.banCertainUsers" @change="updateModerationSettings" label="Ban Certain People"></v-switch>
        </v-col>
        <v-col>
          <v-switch v-model="moderationSettings.allowCertainUsers" @change="updateModerationSettings" label="Only Allow Certain People"></v-switch>
        </v-col>
        <v-col>
          <v-switch v-model="moderationSettings.allowWeb3Only" @change="updateModerationSettings" label="Only Allow Web3 Accounts"></v-switch>
        </v-col>
      </v-row>
      <v-row v-if="moderationSettings.banCertainUsers" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text"> People Banned From Scene </v-col>
      </v-row>
      <v-row v-if="moderationSettings.banCertainUsers">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings.bannedUsers" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field
                label="Wallet Address"
                dense
                v-model="item.connectedWallet"
                hide-details="auto"
                @change="updateModerationSettings"
              ></v-text-field>
            </v-col>
            <v-col cols="4" md="3" sm="2" xs="6">
              <v-text-field
                label="Display Name"
                dense
                v-model="item.displayName"
                hide-details="auto"
                @change="updateModerationSettings"
              ></v-text-field>
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
      <v-row v-if="moderationSettings.allowCertainUsers" class="grey darken-5">
        <v-col class="text-subtitle-1 white--text"> People Allowed In Scene </v-col>
      </v-row>
      <v-row v-if="moderationSettings.allowCertainUsers">
        <v-col>
          <v-row v-for="(item, i) in moderationSettings.allowedUsers" :key="i" dense>
            <v-col cols="7" md="8" sm="9" xs="4">
              <v-text-field label="Wallet Address" dense v-model="item.connectedWallet" hide-details="auto"></v-text-field>
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
          <div class="text-subtitle-1">Actions taken when visitor is banned or restricted:</div>
          <v-select
            :items="banActions"
            v-model="moderationSettings.banActions"
            @change="updateModerationSettings"
            label="Moderation Actions"
            multiple
          ></v-select>
          <v-select
            v-if="moderationSettings.banActions?.includes(0)"
            :items="banWallTypes"
            v-model="moderationSettings.banWallType"
            @change="updateModerationSettings"
            label="Wall Type"
          ></v-select>
        </v-col>
        <v-col v-if="moderationSettings.allowCertainUsers">
          <div class="text-subtitle-1">Actions taken when user is allowed:</div>
          <!-- <v-select :items="allowActions" v-model="moderationSettings.allowActions" @change="updateModerationSettings"
            label="Gated Actions" multiple></v-select> -->
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import Vue from 'vue'
import { EAllowActions, EBanActions, EBanWallTypes, ESettingType } from '../models/SceneSettings'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SceneSettings',

  data: () => ({
    fontColors: [
      { text: 'Black', value: 'black' },
      { text: 'Blue', value: 'blue' },
      { text: 'Gray', value: 'gray' },
      { text: 'Green', value: 'green' },
      { text: 'Magenta', value: 'magenta' },
      { text: 'Purple', value: 'purple' },
      { text: 'Red', value: 'red' },
      { text: 'Teal', value: 'teal' },
      { text: 'Yellow', value: 'yellow' },
      { text: 'White', value: 'white', default: true },
    ],
    fontSizes: [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 55, 60],
    messageText: '',
    messageColor: 'white',
    messageFontSize: 32,
    messageDelay: 5,
    banActions: [
      { text: "Blackout Visitor's Screen", value: EBanActions.BLACKOUT },
      {
        text: 'Remove User and Block From Scene (Beta)',
        value: EBanActions.WALL,
      },
    ],
    banWallTypes: [
      { text: 'Black Wall', value: EBanWallTypes.BLACK },
      { text: 'Invisible Wall', value: EBanWallTypes.INVISIBLE },
      { text: 'Mirage', value: EBanWallTypes.MIRROR },
    ],
    allowActions: [{ text: 'Move User', value: EAllowActions.MOVE }],
    moderationSettings: {
      banCertainWearables: false,
      bannedWearables: [],
      allowCertainWearables: false,
      allowedWearables: [],
      banCertainUsers: false,
      bannedUsers: [{ connectedWallet: '', displayName: '' }],
      allowCertainUsers: false,
      allowedUsers: [{ connectedWallet: '', displayName: '' }],
      allowWeb3Only: false,
      banActions: [],
      banWallType: 0,
      allowActions: [],
    },
  }),
  mounted() {
    this.moderationSettings = this.sceneModerationSettings
  },
  computed: {
    ...mapGetters({
      scene: 'scene/activeScene',
      isDemoScene: 'scene/isDemoScene',
      sceneModerationSettings: 'scene/sceneModerationSettings',
    }),
  },
  methods: {
    ...mapActions({
      showTransformDialog: 'dialog/showTransformDialog',
      showPropertiesDialog: 'dialog/showPropertiesDialog',
      showClickEventDialog: 'dialog/showClickEventDialog',
      showDeleteDialog: 'dialog/showDeleteDialog',
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
      uploadImage: 'media/uploadSceneImage',
      showSuccess: 'banner/showSuccess',
      sendModMessage: 'scene/sendModMessage',
      updateSceneSetting: 'scene/updateSceneSetting',
      crashSceneUser: 'scene/crashSceneUser',
    }),
    updateModerationSettings() {
      this.updateSceneSetting({ setting: 'moderation', settingName: 'Moderation Settings', settingValue: this.moderationSettings })
    },
    copySceneId() {
      navigator.clipboard.writeText(this.scene.sk)
      this.showSuccess({ message: 'Scene ID copied to clipboard' })
    },
    addBannedItem() {
      const nextItem = { contractId: '', tokenId: '' }
      this.moderationSettings.bannedWearables.push(nextItem)
      this.updateSceneSetting({
        setting: 'moderation',
        settingName: 'Banned Wearables',
        value: this.settings.bannedWearables,
        type: ESettingType.ARRAY,
      })
    },
    addBannedUser() {
      const nextItem = { connectedWallet: '', displayName: '' }
      this.moderationSettings.bannedUsers.push(nextItem)
    },
    removeBannedItem(i) {
      this.moderationSettings.bannedWearables.splice(i, 1)
      Vue.nextTick(() => {
        if (this.moderationSettings.bannedWearables.length < 1) {
          this.moderationSettings.banCertainWearables = false
          this.moderationSettings.bannedWearables = []
        }
        this.updateModerationSettings()
      })
    },
    crashUser(i) {
      const user = this.moderationSettings.bannedUsers[i]
      this.crashSceneUser({ connectedWallet: user.connectedWallet, displayName: user.displayName })
    },
    removeBannedUser(i) {
      this.moderationSettings.bannedUsers.splice(i, 1)
      Vue.nextTick(() => {
        if (this.moderationSettings.bannedUsers.length < 1) {
          this.moderationSettings.banCertainUsers = false
          this.moderationSettings.bannedUsers = [{ connectedWallet: '', displayName: '' }]
        }
        this.updateModerationSettings()
      })
    },
    addAllowedItem() {
      const nextItem = { contractId: '', tokenId: '' }
      this.moderationSettings.allowedWearables.push(nextItem)
    },
    removeAllowedItem(i) {
      this.moderationSettings.allowedWearables.splice(i, 1)
      Vue.nextTick(() => {
        if (this.moderationSettings.allowedWearables.length < 1) {
          this.moderationSettings.allowCertainWearables = false
          this.moderationSettings.allowedWearables = [{ contractId: '', tokenId: '' }]
        }
        this.updateModerationSettings()
      })
    },
    showSceneSetup() {
      this.$router.push(`/docs/getting-started?sceneId=${this.scene.sk}`)
    },
    sendMessage() {
      this.sendModMessage({
        message: this.messageText,
        color: this.messageColor,
        fontSize: this.messageFontSize,
        delay: this.messageDelay,
      })
    },
  },
}
</script>
