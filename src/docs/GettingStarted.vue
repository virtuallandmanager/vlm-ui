<template>
  <content-page>
    <v-card class="pa-6 mx-auto" max-width="960">
      <div class="text-h4 text-center">Getting Started</div>
      <v-divider class="my-4"></v-divider>
      <div v-if="!world || world == 'decentraland'">
        <div class="d-flex justify-space-between align-top">
          <div class="text-h5 text-center mb-4">Decentraland SDK Setup</div>
          <div class="d-flex flex-column justify-center align-top">
            <div class="mb-2 text-center">Version</div>
            <v-btn-toggle v-model="version" @change="setVersion" class="mb-4">
              <v-btn color="secondary px-2">SDK6</v-btn>
              <v-btn color="secondary px-2">SDK7</v-btn>
            </v-btn-toggle>
          </div>
        </div>
        <div class="text-left mb-1">
          1. Install the VLM package for Decentraland
          <!-- Display the code in a textarea -->
          <v-textarea :value="installCode" rows="1" disabled filled ref="sceneJsonBlock"></v-textarea>
          <!-- Copy button -->
          <div class="mb-4">Run this command in a terminal window from the directory that contains your project files.</div>
          <v-btn @click="copyInstallCode" color="secondary">Copy install command</v-btn>
          <v-divider class="my-4"></v-divider>
          <div class="text-left mb-1">
            2. Add this line to your <code>scene.json</code> file.
            <!-- Display the code in a textarea -->
            <v-textarea :value="sceneJsonCode" rows="1" disabled filled ref="sceneJsonBlock"></v-textarea>
            <!-- Copy button -->
            <v-btn @click="copySceneJson" color="secondary">Copy scene.json code</v-btn>
          </div>
          <v-divider class="my-4" v-if="!sceneId"></v-divider>

          <div v-if="!sceneId">
            3. Copy your scene id from your scene's <strong><v-icon x-small>mdi-cog</v-icon>Settings</strong> tab.
          </div>
          <v-divider class="my-4" v-if="!sceneId"></v-divider>

          <div v-if="!sceneId">4. Replace the zeros copied in step 1 with the scene id you copied in step 2.</div>
          <v-divider class="my-4"></v-divider>
        </div>
        <div class="text-left mb-1">
          {{ sceneId ? '3.' : '5.' }} Add these lines to your <code>tsconfig.json</code> file:

          <!-- Display the code in a textarea -->
          <v-textarea :value="tsConfigJsonCode" rows="3" disabled filled ref="tsConfigBlock"></v-textarea>
          <!-- Copy button -->
          <v-btn @click="copyTsConfig" color="secondary">Copy tsconfig.json code</v-btn>
        </div>
        <v-divider class="my-4"></v-divider>
        <div class="text-left mb-1">
          {{ sceneId ? '4.' : '6.' }} Add these lines to your <code v-if="version == 1">index.ts</code><code v-else>game.ts</code> file.

          <!-- Display the code in a textarea -->
          <v-textarea :value="mainSceneCode" rows="3" disabled filled ref="tsConfigBlock"></v-textarea>
          <div class="mb-4">You can also create a new file called <code>vlm.ts</code> to put this in if you prefer to keep things separate.</div>
          <!-- Copy button -->
          <v-btn @click="copySceneCode" color="secondary">Copy scene code</v-btn>
        </div>
        <v-divider class="my-4" v-if="sceneId"></v-divider>
        <v-btn v-if="sceneId" @click="backToScene" color="primary" class="mr-2">Back To Scene</v-btn>
        <v-btn @click="devSetup" color="primary">Advanced Feature Setup</v-btn>
      </div>
    </v-card>
  </content-page>
</template>

<script>
import { mapActions } from 'vuex'
import ContentPage from '../components/ContentPage.vue'
const emptyGuid = '00000000-0000-0000-0000-000000000000'
export default {
  components: { ContentPage },
  props: {
    world: String,
    sceneId: String,
  },
  name: 'DocsGettingStarted',
  data: () => ({
    test: false,
    sceneJsonCode: '',
    version: 1,
    installCode: 'npm install vlm-dcl@sdk7',
    mainSceneCode: `import VLM from "vlm-dcl";
VLM.init();`,
    tsConfigJsonCode: `"skipLibCheck": true,`,
  }),
  mounted() {
    this.sceneJsonCode = `"vlm": { "sceneId": "${this.sceneId || emptyGuid}" },`
  },
  methods: {
    ...mapActions({ showSuccess: 'banner/showSuccess' }),
    setVersion() {
      this.installCode = this.version === 0 ? 'dcl install vlm-dcl@sdk6' : 'npm install vlm-dcl@sdk7'
      this.tsConfigJsonCode =
        this.version === 0
          ? `"noLib": false,
"skipLibCheck": true,
"moduleResolution": "node",
`
          : `"skipLibCheck": true,`
    },
    async copySceneJson() {
      try {
        // Use the Clipboard API to copy the code
        await navigator.clipboard.writeText(this.sceneJsonCode)
        this.showSuccess({ message: 'Copied scene.json code to clipboard.' })
      } catch (err) {
        console.error('Failed to copy code: ', err)
      }
    },
    async copyTsConfig() {
      try {
        // Use the Clipboard API to copy the code
        await navigator.clipboard.writeText(this.tsConfigJsonCode)
        this.showSuccess({ message: 'Copied tsconfig.json code to clipboard.' })
      } catch (err) {
        console.error('Failed to copy code: ', err)
      }
    },
    async copyInstallCode() {
      try {
        // Use the Clipboard API to copy the code
        await navigator.clipboard.writeText(this.installCode)
        this.showSuccess({ message: 'Copied install code to clipboard.' })
      } catch (err) {
        console.error('Failed to copy code: ', err)
      }
    },
    backToScene() {
      this.$router.back()
    },
    devSetup() {
      if (this.version == 1) {
        window.open('https://docs.vlm.gg/#/decentraland/getting-started/advanced-install?id=_5-configure-custom-widgets', '_blank')
      } else {
        window.open('https://docs.vlm.gg/#/decentraland/getting-started/advanced-install?id=_5-configure-custom-widgets-1', '_blank')
      }
    },
  },
}
</script>
