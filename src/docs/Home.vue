<template>
  <focus-page>
    <v-card class="pa-6 mx-auto" max-width="960">
      <div class="d-flex flex-column align-center">
        <div class="text-center">
          <h1 class="display-h2">Virtual Land Manager Docs</h1>
          <p class="lead mt-4">
            This is the documentation for the Virtual Land Manager platform. Here you will find
            information on how to use the platform, how to create and manage
            content, and how to use the Virtual Land Manager SDK to integrate real-time content into
            your Decentraland scenes.
          </p>
        </div>
        <div class="text-center">
          <h2 class="display-h4">Getting Started</h2>
          <p class="lead mt-4">
            Connecting a Metaverse scene to VLM
          </p>
          <div class="mt-2">How-Tos</div>
          <div class="d-flex flex-column">
            <v-btn class="mt-4" color="primary" large outlined to="/docs/getting-started?world=decentraland">Decentraland SDK
              6</v-btn>
            <v-btn class="mt-4" color="primary" large outlined to="/docs/getting-started" disabled>Decentraland SDK
              7</v-btn>
            <v-btn class="mt-4" color="primary" large outlined to="/docs/getting-started" disabled>Hyperfy App</v-btn>
          </div>
        </div>
        <div class="text-center">
          <h2 class="display-h4 mt-6">Developer Guide</h2>
          <p class="lead mt-4">
            Full API reference for use of more advanced developer features
          </p>
          <div class="mt-2">API Guides Coming Soon</div>
          <div class="d-flex flex-column">
            <v-btn class="mt-4" color="primary" large outlined to="/docs/api" disabled>Decentraland SDK 6</v-btn>
            <v-btn class="mt-4" color="primary" large outlined to="/docs/api" disabled>Decentraland SDK 7</v-btn>
            <v-btn class="mt-4" color="primary" large outlined to="/docs/api" disabled>Hyperfy SDK 3</v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </focus-page>
</template>
  
<script>
import FocusPage from '../components/FocusPage.vue';
export default {
  components: { FocusPage },
  name: "DocsHome",
  data: () => ({}),
};
</script>
  