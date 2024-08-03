<template>
  <content-sub-panel :loading="processing" :hasContent="!!widgets?.length" loadingMessage="Loading video screens...">
    <template v-slot:header>
      <div>Widgets</div>
      <v-spacer></v-spacer>
      <v-btn @click="macroDialog = true" v-if="filteredWidgets?.length > 0" class="mr-2"><v-icon class="mr-2">mdi-spotlight</v-icon>Macro Mode</v-btn>
      <v-btn @click="addWidget()" v-if="widgets.length"><v-icon class="mr-1">mdi-plus</v-icon> Widget</v-btn>
    </template>
    <template v-slot:no-content-header>No Widgets Have Been Added</template>
    <template v-slot:no-content-text>Would you like to add one?</template>
    <template v-slot:no-content-cta>
      <v-btn @click="addWidget()"><v-icon class="mr-1">mdi-plus</v-icon> Widget</v-btn>
    </template>
    <v-container fluid class="ma-0 pa-0">
      <v-row>
        <v-col xs="12" :sm="smSizing" v-for="(widget, i) of widgets" :key="i">
          <scene-widget-card :widget="widget" />
        </v-col>
      </v-row>
    </v-container>
    <!-- Dialog to display the widgets -->
    <v-dialog v-model="macroDialog" fullscreen autofocus @keydown="toggleOrTrigger">
      <v-card>
        <v-card-title>Macro Mode</v-card-title>
        <v-card-subtitle>Use your number keys to control up to 10 different toggles and triggers</v-card-subtitle>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Loop through the filteredWidgets and create a card for each widget -->
              <v-col v-for="(widget, index) in filteredWidgets" :key="index" cols="12" sm="6" md="4">
                <v-card class="d-flex align-center pa-4">
                  <!-- Circle Indicator using Vuetify's v-avatar and v-icon -->
                  <v-avatar size="24" v-if="lightStatuses[index] == 'red'" transition="scale-transition" class="mr-2">
                    <v-icon color="red">mdi-circle-outline</v-icon>
                  </v-avatar>

                  <v-avatar size="24" v-if="lightStatuses[index] == 'green'" transition="scale-transition" class="mr-2">
                    <v-icon color="green">mdi-circle</v-icon>
                  </v-avatar>

                  <v-avatar size="24" v-if="lightStatuses[index] == 'transparent'" transition="scale-transition" class="mr-2">
                    <v-icon color="transparent">mdi-circle</v-icon>
                  </v-avatar>
                  <!-- Widget Name -->
                  <div class="flex-grow-1">{{ widget.name }}</div>
                  <v-card class="black flex-shrink-0 px-6 py-4">
                    {{ index + 1 }}
                  </v-card>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeMacroDialog">Close</v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </content-sub-panel>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SceneWidgetCard from './SceneWidgetCard'
import { SceneWidget } from '../models/SceneWidget'
import ContentSubPanel from './ContentSubPanel'
import { getRandomControlName } from '../helpers/widgetNamer'

export default {
  name: 'SceneWidgetList',
  components: { ContentSubPanel, SceneWidgetCard },
  data: () => ({
    macroDialog: false,
    lightStatuses: [],
    eventListener: null,
  }),
  mounted() {},
  watch: {
    macroDialog(newValue) {
      if (newValue) {
        // If dialog is opened
        this.lightStatuses = this.filteredWidgets.map((widget) => {
          if (widget.type === 1 && widget.value) {
            return 'green'
          } else if (widget.type === 1 && !widget.value) {
            return 'red'
          }
          return 'transparent'
        })
      }
    },
  },
  computed: {
    ...mapGetters({
      widgets: 'scene/sceneWidgets',
      processing: 'scene/processing',
    }),
    smSizing() {
      if (this.widgets.length < 2) {
        return 6
      } else if (this.widgets.length % 3 < 1) {
        return 4
      } else if (this.widgets.length % 2 < 1) {
        return 6
      }
      return 6
    },

    filteredWidgets() {
      return this.widgets.filter((widget) => widget.type === 1 || widget.type === 5)
    },
  },
  methods: {
    ...mapActions({
      createSceneElement: 'scene/createSceneElement',
      updateAllWidgets: 'scene/updateAllWidgets',
      directUpdateSceneElement: 'scene/directUpdateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
    }),
    toggleOrTrigger(event) {
      if (isNaN(event.key) || event.key.length !== 1) return

      const index = parseInt(event.key, 10) == 0 ? 9 : parseInt(event.key, 10) - 1
      const widget = this.filteredWidgets[index]

      if (!widget) return

      if (widget.type === 1) {
        widget.value = !widget.value
      }

      if (widget.type === 1 && widget.value) {
        this.lightStatuses.splice(index, 1, 'green')
      } else if (widget.type === 1 && !widget.value) {
        this.lightStatuses.splice(index, 1, 'red')
      } else if (widget.type === 5) {
        widget.value = true
        this.lightStatuses.splice(index, 1, 'green')
        setTimeout(() => {
          this.lightStatuses.splice(index, 1, 'transparent')
        }, 250)
      }

      this.directUpdateSceneElement({ element: 'widget', elementData: widget, id: widget.id })
    },
    addWidget() {
      const newWidgetName = getRandomControlName()

      const newWidget = new SceneWidget({
        name: newWidgetName,
        id: newWidgetName.createSlug(),
        type: 0,
      })

      this.createSceneElement({ element: 'widget', elementData: newWidget })
    },
    closeMacroDialog() {
      this.macroDialog = false
      this.updateAllWidgets({ element: 'widgets', allElementData: this.widgets })
    },
  },
}
</script>
