<template>
  <content-page loadingMessage="Loading your scenes..." :loading="loadingScene" :noContent="!scenes.length">
    <v-dialog v-model="newSceneDialog" width="400" persistent>
      <v-card>
        <v-card-title class="text-h5"> <v-icon class="mr-1">mdi-plus</v-icon> Scene </v-card-title>

        <v-card-text class="text-center">
          <v-text-field autofocus outlined label="Scene Name" v-model="newSceneName" placeholder="Enter A Scene Name..." />
          <div class="text-button">Show me how to connect to:</div>
          <div class="d-flex justify-center">
            <div>
              <div class="d-flex">
                <v-icon v-if="newSceneWorlds.decentraland" color="primary" small class="ml-n6 mr-2">mdi-check-circle</v-icon>
                <v-btn block outlined class="my-2" :color="newSceneWorlds.decentraland ? 'primary' : 'white'" @click="toggleWorld('decentraland')"
                  ><img src="@/assets/dcl-logo-sm.png" width="20px" height="20px" class="mr-2" /> Decentraland
                </v-btn>
              </div>

              <div class="d-flex">
                <v-btn block outlined disabled class="my-2" @click="toggleWorld('hyperfy')"
                  ><img src="@/assets/hyperfy-logo-sm.png" width="20px" height="20px" class="mr-2" /><v-icon
                    v-if="newSceneWorlds.hyperfy"
                    small
                    class="ml-n6 mr-2"
                  ></v-icon>
                  Hyperfy (Coming Soon!)
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="createNewScene"> Create </v-btn>
          <v-btn color="grey" text @click="resetNewSceneDialog"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmLeaveSceneDialog" width="400" persistent>
      <v-card>
        <v-card-title class="text-h5"> Leave Scene </v-card-title>
        <v-card-text class="text-center">
          <p>
            Are you sure you want to leave <strong>{{ sceneToLeave?.name || 'this shared scene' }}</strong
            >?
          </p>
          <p>{{ sceneToLeave?.ownerName || 'The scene owner' }} will have to send a new invite for you to collaborate on this scene again.</p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="confirmLeaveScene(sceneToLeave)"> Leave </v-btn>
          <v-btn color="grey" text @click="confirmLeaveSceneDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDeleteSceneDialog" width="400" persistent>
      <v-card>
        <v-card-title class="text-h5"> Delete Scene </v-card-title>
        <v-card-text class="text-center"
          >Are you sure you want to delete <strong>{{ sceneToDelete?.name || 'this scene' }}</strong
          >?</v-card-text
        >
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="confirmDeleteScene(sceneToDelete)"> Delete </v-btn>
          <v-btn color="grey" text @click="confirmDeleteSceneDialog = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <template v-slot:header>Scenes</template>
    <template v-slot:header-actions
      ><v-btn @click="openNewSceneDialog"><v-icon class="mr-1">mdi-plus</v-icon> Scene</v-btn></template
    >
    <template v-slot:no-content-header>No Scenes Found</template>
    <template v-slot:no-content-text> Would you like to create a new scene? </template>
    <template v-slot:no-content-cta>
      <v-btn @click="createNewScene(newSceneName)"><v-icon class="mr-1">mdi-plus</v-icon> Scene</v-btn>
    </template>
    <v-container fluid v-if="!loadingScene && scenes.length">
      <v-row class="text-center" v-if="sharedScenes.length">
        <v-col>My Scenes</v-col>
      </v-row>
      <v-row class="text-center" v-if="!loadingScene">
        <v-col lg="3" md="4" sm="6" xs="12" v-for="(scene, i) in scenes" :key="i">
          <scene-card :scene="scene" @confirmDelete="openDeleteSceneDialog" />
        </v-col>
      </v-row>
    </v-container>
    <v-container fluid v-if="!loadingScene && sharedScenes.length">
      <v-row class="text-center" v-if="scenes.length">
        <v-col>Shared Scenes</v-col>
      </v-row>
      <v-row class="text-center">
        <v-col lg="3" md="4" sm="6" xs="12" v-for="(scene, i) in sharedScenes" :key="i">
          <scene-card :scene="scene" :shared="true" @confirmLeave="openLeaveSceneDialog" />
        </v-col>
      </v-row>
    </v-container>
  </content-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SceneCard from '../components/SceneCard'
import store from '../store'
import { DateTime } from 'luxon'
import ContentPage from '../components/ContentPage'

export default {
  components: { SceneCard, ContentPage },
  name: 'Scenes',
  data: () => ({
    newSceneDialog: false,
    confirmDeleteSceneDialog: false,
    confirmLeaveSceneDialog: false,
    newSceneName: '',
    sceneToDelete: null,
    sceneToLeave: null,
    newSceneWorlds: {
      decentraland: false,
      hyperfy: false,
    },
  }),
  async mounted() {
    await this.getSceneCards()
  },
  computed: {
    ...mapGetters({
      scenes: 'scene/sceneList',
      sharedScenes: 'scene/sharedSceneList',
      loadingScene: 'scene/loadingScene',
    }),
    userInfo() {
      return store.state.user.userInfo
    },
    userOrgs() {
      return store.state.organization.userOrgs
    },
    memberSince() {
      return DateTime.fromMillis(this.userInfo.registeredAt).toLocaleString()
    },
  },
  methods: {
    ...mapActions({
      getSceneCards: 'scene/getSceneCards',
      createScene: 'scene/createScene',
      deleteScene: 'scene/deleteScene',
      leaveScene: 'scene/leaveScene',
    }),
    openNewSceneDialog() {
      this.newSceneDialog = true
    },
    openDeleteSceneDialog(scene) {
      this.sceneToDelete = scene
      this.confirmDeleteSceneDialog = true
    },
    openLeaveSceneDialog(scene) {
      this.sceneToLeave = scene
      this.confirmLeaveSceneDialog = true
    },
    confirmDeleteScene() {
      this.deleteScene(this.sceneToDelete)
      this.sceneToDelete = null
      this.confirmDeleteSceneDialog = false
    },
    confirmLeaveScene() {
      this.leaveScene(this.sceneToLeave)
      this.sceneToLeave = null
      this.confirmLeaveSceneDialog = false
    },
    resetNewSceneDialog() {
      this.newSceneDialog = false
      this.newSceneName = ''
      this.newSceneWorlds = {
        decentraland: false,
        hyperfy: false,
        roblox: false,
      }
    },
    toggleWorld(key) {
      this.newSceneWorlds[key] = !this.newSceneWorlds[key]
    },
    async createNewScene() {
      const name = this.newSceneName
      const scene = await this.createScene({ name })
      Object.keys(this.newSceneWorlds).forEach((key) => {
        if (this.newSceneWorlds[key]) {
          window.open(`/docs`, '_blank')
        }
      })
      this.$router.push(`/scene/${scene.sk}`)
      this.resetNewSceneDialog()
    },
  },
}
</script>

<style scoped>
.scene-card-link {
  text-decoration: none;
}
</style>
