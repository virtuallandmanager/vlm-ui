<template>
  <v-container class="py-6 mx-auto">
    <user-invite-dialog :value="userInviteDialog" @input="toggleInviteDialog" />
    <v-dialog v-model="confirmLeaveSceneDialog" width="400" persistent>
      <v-card>
        <v-card-title class="text-h5"> Leave Scene </v-card-title>
        <v-card-text class="text-center">
          <p>
            Are you sure you want to leave <strong>{{ scene?.name || 'this shared scene' }}</strong
            >?
          </p>
          <p>{{ scene?.ownerName || 'The scene owner' }} will have to send a new invite for you to collaborate on this scene again.</p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="confirmLeaveScene"> Leave </v-btn>
          <v-btn color="grey" text @click="confirmLeaveSceneDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDeleteSceneDialog" width="400" persistent>
      <v-card>
        <v-card-title class="text-h5"> Delete Scene </v-card-title>
        <v-card-text class="text-center"
          >Are you sure you want to delete <strong>{{ scene?.name || 'this scene' }}</strong
          >?</v-card-text
        >
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="confirmDeleteScene"> Delete </v-btn>
          <v-btn color="grey" text @click="confirmDeleteSceneDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        <v-text-field label="Scene Name" outlined v-model="scene.name" @change="updateName" :disabled="isDemoScene" hide-details />
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
    <v-row>
      <v-divider class="my-2" />
    </v-row>
    <div v-if="isSharedScene" class="d-flex pt-4">
      <v-spacer></v-spacer>
      <v-btn color="error" outlined @click="openLeaveSceneDialog(scene)" v-if="!isDemoScene">
        <v-icon small class="mr-2">mdi-hand-wave</v-icon>Leave Scene
      </v-btn>
    </div>
    <div v-if="!isSharedScene" class="d-flex pt-4">
      <v-spacer></v-spacer>
      <v-btn color="error" outlined @click="openDeleteSceneDialog(scene)" v-if="!isDemoScene">
        <v-icon small class="mr-2">mdi-delete</v-icon>Delete Scene
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import UserInviteDialog from './dialogs/UserInviteDialog'
import router from '../router'

export default {
  name: 'SceneSettings',
  components: { UserInviteDialog },
  data: () => ({
    adminAccess: false,
    userInviteDialog: false,
    confirmLeaveSceneDialog: false,
    confirmDeleteSceneDialog: false,
  }),
  mounted() {
    this.adminAccess = this.vlmAdminAccess
  },
  computed: {
    ...mapGetters({
      scene: 'scene/activeScene',
      vlmAdminAccess: 'scene/vlmAdminAccess',
      isDemoScene: 'scene/isDemoScene',
      sharedSceneList: 'scene/sharedSceneList',
    }),
    isSharedScene() {
      return this.sharedSceneList.map((scene) => scene.sk).includes(this.scene.sk)
    },
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
      updateSceneProperty: 'scene/updateSceneProperty',
      inviteUserToCollab: 'scene/inviteUserToCollab',
      leaveScene: 'scene/leaveScene',
      deleteScene: 'scene/deleteScene',
    }),
    updateName() {
      this.updateSceneProperty({ property: 'name', value: this.scene.name })
    },
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
    openDeleteSceneDialog() {
      this.confirmDeleteSceneDialog = true
    },
    openLeaveSceneDialog() {
      this.confirmLeaveSceneDialog = true
    },
    async confirmDeleteScene() {
      this.confirmDeleteSceneDialog = false
      await this.deleteScene(this.scene)
      router.push('/scenes')
    },
    async confirmLeaveScene() {
      this.confirmLeaveSceneDialog = false
      await this.leaveScene(this.scene)
      router.push('/scenes')
    },
    toggleInviteDialog(value) {
      this.userInviteDialog = value
    },
  },
}
</script>
