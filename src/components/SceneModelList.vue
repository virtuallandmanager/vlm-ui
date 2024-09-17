<template>
  <content-sub-panel :loading="processing" :hasContent="!!models?.length" :loadingMessage="localeText('Loading')">
    <template v-slot:header>
      <div class="h4">{{ localeText('3D Models') }}</div>
      <v-spacer />
      <v-btn @click="addModelConfig()" v-if="models?.length">
        <v-icon class="mr-1">mdi-plus</v-icon>
        {{ localeText('Model') }}
      </v-btn>
    </template>

    <template v-slot:no-content-header>{{ localeText('NoData') }}</template>
    <template v-slot:no-content-text>{{ localeText('CTA') }}</template>
    <template v-slot:no-content-cta>
      <v-btn @click="addModelConfig()">
        <v-icon class="mr-1">mdi-plus</v-icon>
        {{ localeText('Model') }}
      </v-btn>
    </template>
    <v-container fluid class="pa-0">
      <v-row>
        <v-col md="4" sm="6" xs="12" v-for="model in models" :key="model.id">
          <scene-model-card :model="model" />
        </v-col>
      </v-row>
    </v-container>
  </content-sub-panel>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SceneModelCard from './SceneModelCard'
import ContentSubPanel from './ContentSubPanel.vue'
import { SceneModel } from '../models/SceneModel'

export default {
  components: {
    ContentSubPanel,
    SceneModelCard,
  },
  name: 'SceneModelList',
  computed: {
    ...mapGetters({
      models: 'scene/sceneModels',
      processing: 'scene/processing',
      localeText: 'i18n/models',
      localeAction: 'i18n/actions',
    }),
  },
  methods: {
    ...mapActions({
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
    }),
    addModelConfig() {
      const elementData = new SceneModel({ name: `Model Config ${this.models.length + 1}` })
      this.createSceneElement({ element: 'model', elementData })
    },
    removeModelScreen(i) {
      const elementData = this.models[i]
      this.deleteSceneElement({ element: 'model', elementData, id: elementData.sk })
    },
  },
}
</script>
