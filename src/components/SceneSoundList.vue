<template>
  <content-sub-panel :loading="processing" :hasContent="!!sounds?.length" loadingMessage="Loading sound screens...">
    <template v-slot:header>
      <div class="h4">Sounds</div>
      <v-spacer />
      <v-btn @click="addSoundConfig()" v-if="sounds?.length">
        <v-icon class="mr-2">mdi-speaker</v-icon>
        New Sound
      </v-btn>
    </template>

    <template v-slot:no-content-header>No Sounds Have Been Added</template>
    <template v-slot:no-content-text>Would you like to add one?</template>
    <template v-slot:no-content-cta>
      <v-btn @click="addSoundConfig()">
        <v-icon class="mr-2">mdi-speaker</v-icon>
        New Sound
      </v-btn>
    </template>
    <v-container fluid class="pa-0">
      <v-row>
        <v-col md="4" sm="6" xs="12" v-for="(sound, i) in sounds" :key="sound.id">
          <scene-sound-card :sound="sound" :i="i" />
        </v-col>
      </v-row>
    </v-container>
  </content-sub-panel>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SceneSoundCard from './SceneSoundCard'
import ContentSubPanel from './ContentSubPanel.vue'
import { SceneSound } from '../models/SceneSound'

export default {
  components: {
    ContentSubPanel,
    SceneSoundCard,
  },
  name: 'SceneSoundList',
  computed: {
    ...mapGetters({
      sounds: 'scene/sceneSounds',
      processing: 'scene/processing',
    }),
  },
  methods: {
    ...mapActions({
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
    }),
    addSoundConfig() {
      const elementData = new SceneSound({ name: `Sound Source ${this.sounds.length + 1}` })
      this.createSceneElement({ element: 'sound', elementData })
    },
  },
}
</script>
