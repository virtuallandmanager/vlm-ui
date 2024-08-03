<template>
  <v-card elevation="6">
    <div class="d-flex justify-space-between align-center primary pa-4">
      <div class="text-h6">
        {{ truncatedName }}
      </div>
    </div>
    <div class="d-flex justify-end align-center black dark pa-2">
      <span>Sends {{ giveaway.items.length }} Item{{ giveaway.items.length !== 1 ? "s" : "" }}</span>
      <v-spacer></v-spacer>
      <v-btn icon dark @click="toggleVisibility()" :disabled="claimPoint.customRendering">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" :class="claimPoint.enabled ? '' : 'red--text'">
              {{ claimPoint.enabled ? "mdi-eye" : "mdi-eye-off" }}
            </v-icon>
          </template>
          <span>Show/Hide Claim Point</span>
        </v-tooltip>
      </v-btn>
      <v-btn icon dark @click.stop="openGiveawayDeleteDialog()">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on"> mdi-trash-can </v-icon>
          </template>
          <span>Remove Giveaway</span>
        </v-tooltip>
      </v-btn>
    </div>
    <v-container>
      <v-row>
        <v-col :sm="itemColSize" v-for="(item) in giveaway.items" :key="item.sk">
          <v-img :src="item.imageSrc"></v-img>
          <v-card class="text-caption text-center black pa-1">
            <div class="text-caption">{{ item.name }}</div>
            <div class="text-caption grey--text">{{ item.category.capitalize() }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <div>
      <div class="d-flex justify-start align-center grey darken-2 pa-4">
        <h1 class="text-body-1 font-weight-bold flex-grow-1" dark>Claim Points</h1>
        <v-btn small @click="addClaimPoint()" class="flex-shrink-1"><v-icon small>mdi-plus</v-icon> Claim Point</v-btn>
      </div>
      <div class="d-flex flex-column my-0" v-if="giveaway?.claimPoints?.length">
        <div v-for="(claimPoint, i) in claimPoints" :key="i">
          <claim-point-card :claimPoint="claimPoint" :giveaway="giveaway" @updateSceneElement="updateSceneElement" />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
import Vue from "vue";
import GiveawayClaimPoint from "@/models/GiveawayClaimPoint";
import imgPlaceholder from "@/assets/placeholder.png";
import { mapActions } from "vuex";
import ClaimPointCard from "./ClaimPointCard";

export default {
  name: "SceneGiveawayCard",
  components: { ClaimPointCard },
  data: () => ({ imagePath: "../assets/" }),
  props: {
    claimPoint: Object,
  },
  computed: {
    truncatedName() {
      const giveawayNameArr = this.giveaway && this.giveaway.name.split("");
      let noSpacesLength = 0;
      let truncated = this.giveaway.name;
      giveawayNameArr.forEach((char) => {
        if (char !== " ") {
          noSpacesLength++;
        } else {
          noSpacesLength = 0;
        }

        if (noSpacesLength > 18) {
          truncated = truncated.substr(truncated.length - 18);
          noSpacesLength = 0;
        }
      });

      if (truncated !== this.giveaway.name) {
        return `...${truncated}`;
      } else {
        return this.giveaway.name;
      }
    },
    giveawayImgPlaceholder() {
      return imgPlaceholder;
    },
    paused() {
      return this.giveaway?.paused;
    },
    itemColSize() {
      const numItems = this.giveaway.items.length;
      if (numItems <= 2) {
        return 6;
      } else if (numItems <= 4) {
        return 3;
      } else {
        return 2;
      }
    },
  },
  methods: {
    ...mapActions({
      createSceneElement: "scene/createSceneElement",
      updateSceneElement: "scene/updateSceneElement",
      removeSceneElement: "scene/removeSceneElement",
      toggleGiveawayLocators: "scene/toggleGiveawayLocators",
      updateGiveaway: "giveaway/updateGiveaway",
    }),
    toggleEditMode() {
      this.editingName = !this.editingName;
    },

    validateInput() {
      this.errors = [];
      const forbiddenSubstrings = ["http://", "https://", "www."];

      forbiddenSubstrings.forEach((substring) => {
        if (this.giveaway.audioPath.includes(substring)) {
          this.errors.push("Unfortunately Decentraland does not support externally hosted files.");
        }
      });
    },

    removeGiveaway() {
      this.deleteDialog = false;
      this.$emit("onRemove");
    },
    removeClaimPoint(i) {
      const elementData = this.claimPoint[i];
      Vue.delete(this.claimPoint, i);

      this.removeSceneElement({
        element: "claimPoint",
        instance: true,
        id: instanceData.id,
        elementData,
      });
    },
    addClaimPoint(duplicate) {
      const newClaimPoint = new GiveawayClaimPoint();
      newClaimPoint.name = `Claim Point`;

      if (duplicate) {
        newClaimPoint.name = duplicate.name;
        newClaimPoint.enabled = !!duplicate.enabled;
        newClaimPoint.position = { ...duplicate.position };
        newClaimPoint.scale = { ...duplicate.scale };
        newClaimPoint.rotation = { ...duplicate.rotation };
        newClaimPoint.clickEvent = { ...duplicate.clickEvent };
      }

      this.giveaway.instances.push(newClaimPoint);
      this.createSceneElement({
        action: "create",
        element: "claimPoint",
        id: newClaimPoint.id,
        elementData: newClaimPoint,
      });
    },
    toggleLocators() {
      this.toggleGiveawayLocators({
        elementData: this.giveaway,
      });
    },
    editInstanceName(instance) {
      this.updateSceneElement({
        element: "claimPoint",
        property: "name",
        id: instance.id,
        elementData: instance,
      });
    },
    saveGiveawayProperties() {
      this.closePropertiesDialog();
    },
    toggleVisibility() {
        this.claimPoint.enabled = !this.claimPoint.enabled;
        this.updateSceneElement({
          element: "giveaway",
          property: "enabled",
          id: this.claimPoint.id,
          elementData: this.claimPoint,
        });
    },
    updateProperties() {
      this.updateGiveaway(this.giveaway);
    },
  },
};
</script>
