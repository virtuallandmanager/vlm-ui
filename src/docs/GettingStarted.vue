<template>
  <content-page>
    <v-card class="pa-6 mx-auto" max-width="960">
      <div class="text-h4 text-center">Getting Started</div>
      <v-divider class="my-4"></v-divider>
      <div v-if="!world || world == 'decentraland'">
        <div class="d-flex justify-space-between align-top">
          <div class="text-h4 text-center mb-4">Decentraland SDK Setup</div>
          <div class="d-flex flex-column justify-center align-top">
            <div class="mb-2 text-center">Version</div>
            <v-btn-toggle v-model="version" @change="setVersion" class="mb-4">
              <v-btn color="secondary px-2">SDK6</v-btn>
              <v-btn color="secondary px-2">SDK7</v-btn>
            </v-btn-toggle>
          </div>
        </div>
        <div class="text-left mb-1">
          <div class="text-h6 pb-4">1. Install the VLM package for Decentraland</div>
          <!-- Display the code in a textarea -->
          <v-textarea :value="installCode" rows="1" disabled filled ref="sceneJsonBlock"></v-textarea>

          <!-- Copy button -->
          <div>Run this command in a terminal window from the directory that contains your project files.</div>
          <div class="my-1">OR</div>
          <div class="mb-4">
            Install the package from the dependencies panel (
            <a
              :href="`https://docs.vlm.gg/#/decentraland/getting-started/basic-install?id=via-vs-code-extension${version !== 1 ? '-1' : ''}`"
              target="_blank"
            >
              Find out how...
            </a>
            )
          </div>
          <v-btn @click="copyInstallCode" color="secondary">Copy install command</v-btn>
          <v-divider class="my-4"></v-divider>
          <div class="text-left mb-1">
            <div class="text-h6 pb-4">2. Add this line to your <code>scene.json</code> file.</div>
            <!-- Display the code in a textarea -->
            <v-textarea :value="sceneJsonCode" rows="1" disabled filled ref="sceneJsonBlock"></v-textarea>
            <div class="pa-0" v-if="version == 1">
              TIP: Paste this on line 15, above <code>{{ `"main": "bin/index.js"` }}</code>
              <div style="color: #aaa; font-family: monospace; border: 1px solid white" class="my-2 pa-1">
                <div class="ma-0 pa-0">{{ sceneJsonCodeExampleLine1 }}</div>
                <div class="ma-0 pa-0 pl-4">{{ sceneJsonCodeExampleLine2 }}</div>
                <div class="ma-0 pa-0 pl-4">{{ sceneJsonCodeExampleLine3 }}</div>
                <div class="ma-0 pa-0 pl-4">{{ sceneJsonCodeExampleLine4 }}</div>
                <div style="font-weight: 800; color: white" class="ma-0 pa-0">
                  {{ sceneJsonCode }}
                </div>
                <div>{{ sceneJsonCodeExampleLine5 }}</div>
              </div>
            </div>
            <!-- Copy button -->
            <v-btn @click="copySceneJson" color="secondary">Copy scene.json code</v-btn>
          </div>
          <v-divider class="my-4" v-if="!sceneId"></v-divider>

          <div v-if="!sceneId" class="text-h6 pb-4">
            3. Copy your scene id from your scene's <strong><v-icon x-small>mdi-cog</v-icon>Settings</strong> tab.
          </div>
          <v-divider class="my-4" v-if="!sceneId"></v-divider>

          <div v-if="!sceneId" class="text-h6 pb-4">4. Replace the zeros copied in step 1 with the scene id you copied in step 2.</div>
          <v-divider class="my-4"></v-divider>
        </div>
        <div class="text-left mb-1">
          <div class="text-h6 pb-4">{{ sceneId ? '3.' : '5.' }} Add these lines to your <code>tsconfig.json</code> file:</div>
          <v-textarea :value="tsConfigJsonCode" :rows="version == 1 ? 2 : 4" disabled filled ref="tsConfigBlock" class="mt-2"></v-textarea>
          TIP: Paste this under <code>{{ `"compilerOptions": {` }}</code>
          <div style="color: #aaa; font-family: monospace; border: 1px solid white" class="my-2 pa-1">
            <div class="ma-0 pa-0">{{ tsConfigJsonCodeExampleLine1 }}</div>
            <div style="font-weight: 800; color: white; width: 350px; padding-left: 14pt" class="ma-0 pa-0 pl-4">
              {{ tsConfigJsonCodeExampleLine2 }}
            </div>
            <div style="width: 350px" class="ma-0 pa-0 pl-4">{{ tsConfigJsonCodeExampleLine3 }}</div>
            <div style="width: 350px" class="ma-0 pa-0 pl-4">{{ tsConfigJsonCodeExampleLine4 }}</div>
            <div style="width: 350px">{{ tsConfigJsonCodeExampleLine5 }}</div>
          </div>
          <!-- Display the code in a textarea -->

          <!-- Copy button -->
          <v-btn @click="copyTsConfig" color="secondary">Copy tsconfig.json code</v-btn>
        </div>
        <v-divider class="my-4"></v-divider>
        <div class="text-left mb-1">
          <div class="text-h6 pb-4">
            {{ sceneId ? '4.' : '6.' }} Paste this line at the TOP of your <code v-if="version == 1">index.ts</code><code v-else>game.ts</code> file
            (in the <code>src</code> folder).
          </div>

          <!-- Display the code in a textarea -->
          <v-textarea :value="importCode" rows="3" disabled filled ref="tsConfigBlock"></v-textarea>

          <!-- Copy button -->
          <v-btn @click="copyImportCode" color="secondary">Copy import code</v-btn>
        </div>
        <v-divider class="my-4"></v-divider>
        <div class="text-left mb-1">
          <div class="text-h6 pb-4">
            {{ sceneId ? '5.' : '7.' }} Paste this line into your <code v-if="version == 1">index.ts</code><code v-else>game.ts</code> file (in the
            <code>src</code> folder).
          </div>
          <!-- Display the code in a textarea -->
          <v-textarea :value="initCode" rows="3" disabled filled ref="tsConfigBlock"></v-textarea>
          TIP: Paste this under <code>{{ `main() {` }}</code>
          <div style="color: #aaa; font-family: monospace; border: 1px solid white" class="my-2 pa-1">
            <div class="ma-0 mb-4 pa-0">{{ importCode }}</div>
            <div class="ma-0 pa-0">{{ initCodeExampleLine1 }}</div>
            <div style="font-weight: 800; color: white" class="ma-0 pa-0 pl-4">
              {{ initCodeExampleLine2 }}
            </div>
            <div class="ma-0 pa-0 pl-4">{{ initCodeExampleLine3 }}</div>
            <div class="ma-0 pa-0">{{ initCodeExampleLine4 }}</div>
          </div>
          <!-- Copy button -->
          <v-btn @click="copyInitCode" color="secondary">Copy init code</v-btn>
        </div>
        <v-divider class="my-4"></v-divider>
        <v-btn v-if="sceneId" @click="backToScene" color="primary" class="mr-2">Back To Scene</v-btn>
        <v-btn @click="devSetup" color="primary">Advanced Feature Setup</v-btn>
      </div>
    </v-card>
  </content-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
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
    importCode: `import VLM from "vlm-dcl"`,
    initCode: `VLM.init()`,
    tsConfigJsonCode: `"skipLibCheck": true,`,
    tsConfigJsonCodeExampleLine1: `"compilerOptions": {`,
    tsConfigJsonCodeExampleLine2: `    "skipLibCheck": true,`,
    tsConfigJsonCodeExampleLine3: `    "allowJs": true,`,
    tsConfigJsonCodeExampleLine4: `    "strict": true`,
    tsConfigJsonCodeExampleLine5: `}`,
    initCodeExampleLine1: `main() {`,
    initCodeExampleLine2: `    VLM.init()`,
    initCodeExampleLine3: `//...existing code...`,
    initCodeExampleLine4: `}`,
    sceneJsonCodeExampleLine1: `"contact": {`,
    sceneJsonCodeExampleLine2: `"name": "",`,
    sceneJsonCodeExampleLine3: `"email": ""`,
    sceneJsonCodeExampleLine4: `},`,
    sceneJsonCodeExampleLine5: `"main": "bin/index.js"`,
  }),
  mounted() {
    this.sceneJsonCode = `"vlm": { "sceneId": "${this.sceneId || emptyGuid}" },`
  },
  computed: {
    ...mapGetters({ localeText: 'i18n/docs' }),
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
    async copyImportCode() {
      try {
        // Use the Clipboard API to copy the code
        await navigator.clipboard.writeText(this.importCode)
        this.showSuccess({ message: 'Copied import code to clipboard.' })
      } catch (err) {
        console.error('Failed to copy code: ', err)
      }
    },
    async copyInstallCode() {
      try {
        // Use the Clipboard API to copy the code
        await navigator.clipboard.writeText(this.installCode)
        this.showSuccess({ message: 'Copied import code to clipboard.' })
      } catch (err) {
        console.error('Failed to copy code: ', err)
      }
    },
    async copyInitCode() {
      try {
        // Use the Clipboard API to copy the code
        await navigator.clipboard.writeText(this.initCode)
        this.showSuccess({ message: 'Copied initialization code to clipboard.' })
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
