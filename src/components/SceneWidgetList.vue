<template>
  <content-sub-panel :loading="processing" :hasContent="!!widgets?.length" loadingMessage="Loading video screens...">
    <template v-slot:header>
      <div>Widgets</div>
      <v-spacer></v-spacer>
      <v-btn @click="addWidget()" v-if="widgets.length"><v-icon class="mr-2">mdi-palette</v-icon>Add Widget</v-btn>
    </template>
    <template v-slot:no-content-header>No Widgets Have Been Added</template>
    <template v-slot:no-content-text>Would you like to add one?</template>
    <template v-slot:no-content-cta>
      <v-btn @click="addWidget()"><v-icon class="mr-2">mdi-palette</v-icon>Add Widget</v-btn>
    </template>
    <v-container fluid class="ma-0 pa-0">
      <v-row>
        <v-col xs="12" :sm="smSizing" v-for="(widget, i) of widgets" :key="i">
          <scene-widget-card :widget="widget" />
        </v-col>
      </v-row>
    </v-container>
  </content-sub-panel>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SceneWidgetCard from "./SceneWidgetCard";
import { SceneWidget } from "../models/SceneWidget";
import ContentSubPanel from "./ContentSubPanel";
import { getRandomControlName } from "../helpers/widgetNamer";

export default {
  name: "SceneWidgetList",
  components: { ContentSubPanel, SceneWidgetCard },
  data: () => ({
    defaultWidget: {
      type: 0,
      id: "",
      name: "New Widget",
      value: false,
      selections: [
        { text: "Option 1", value: "option-1" },
        { text: "Option 2", value: "option-2" },
        { text: "Option 3", value: "option-3" },
      ],
    },
  }),
  mounted() {},
  computed: {
    ...mapGetters({
      widgets: "scene/sceneWidgets",
      processing: "scene/processing",
    }),
    smSizing() {
      if (this.widgets.length < 2) {
        return 6;
      } else if (this.widgets.length % 3 < 1) {
        return 4;
      } else if (this.widgets.length % 2 < 1) {
        return 6;
      }
      return 6;
    },
  },
  methods: {
    ...mapActions({
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      deleteSceneElement: "scene/deleteSceneElement",
    }),
    addWidget() {
      const newWidgetName = getRandomControlName();

      const newWidget = new SceneWidget({
        name: newWidgetName,
        id: newWidgetName.createSlug(),
        type: 0,
      });

      this.createSceneElement({ element: "widget", elementData: newWidget });
    },
  },
};
</script>
