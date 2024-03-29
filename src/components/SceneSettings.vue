<template>
  <v-container class="py-6 mx-auto">
    <user-invite-dialog :value="userInviteDialog" @input="toggleInviteDialog" />
    <v-row>
      <v-col no-gutters>
        <div class="text-h5 mb-4">Scene Settings</div>
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
        <v-text-field label="Scene Name" outlined v-model="scene.name" :disabled="isDemoScene" hide-details />
        <!-- <div class="text-h5 mb-4">Scene Image</div>
        <v-img :src="scene.imageSrc" v-if="scene.imageSrc" />
        <v-btn :src="scene.imageSrc" v-if="!scene.imageSrc">
          <v-icon>mdi-upload</v-icon>
          Upload Image
        </v-btn> -->
      </v-col>
    </v-row>
    <v-row>
      <v-divider class="my-2" />
    </v-row>
    <v-row>
      <v-col sm="12">
        <div class="text-h6">Shared Access</div>
      </v-col>
      <v-col sm="12" v-if="!isDemoScene">
        <v-switch v-if="!isDemoScene" v-model="adminAccess" label="Enable VLM Admin Access" @change="toggleAdminAccess" dense hide-details />
      </v-col>
      <v-col sm="12" v-if="!isDemoScene">
        <div class="text-body ml-2 mb-4 grey--text">No Other Users Have Access</div>
        <div class="text-body mb-4">Invite A User To Collaborate:</div>
        <div class="d-flex align-center">
          <v-btn color="primary" @click="userInviteDialog = true" class="ml-4"
            ><v-icon small class="mr-2">mdi-paper-airplane</v-icon>Send Invite</v-btn
          >
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UserInviteDialog from './dialogs/UserInviteDialog'

export default {
  name: 'SceneSettings',
  components: { UserInviteDialog },
  data: () => ({
    adminAccess: false,
    userInviteDialog: false,
  }),
  mounted() {
    this.adminAccess = this.vlmAdminAccess
  },
  computed: {
    ...mapGetters({
      scene: 'scene/activeScene',
      vlmAdminAccess: 'scene/vlmAdminAccess',
      isDemoScene: 'scene/isDemoScene',
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
      updateSceneSetting: 'scene/updateSceneSetting',
      inviteUserToCollab: 'scene/inviteUserToCollab',
    }),
    toggleAdminAccess() {
      this.updateSceneSetting({ setting: 'access', settingName: 'VLM Admin Access', settingValue: this.adminAccess })
    },
    copySceneId() {
      navigator.clipboard.writeText(this.scene.sk)
      this.showSuccess({ message: 'Scene ID copied to clipboard' })
    },
    showSceneSetup() {
      this.$router.push(`/docs/getting-started?sceneId=${this.scene.sk}`)
    },
    toggleInviteDialog(value) {
      this.userInviteDialog = value
    },
  },
}
</script>
