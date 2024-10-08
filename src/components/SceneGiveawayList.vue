<template>
  <div>
    <content-sub-panel :loading="loadingGiveaways" :hasContent="!!claimPoints?.length" loadingMessage="Loading giveaway claim points...">
      <template v-slot:header>
        <div class="h4">{{ localeText('Giveaway Claim Points') }}</div>
        <v-spacer />
        <v-btn @click="openGiveawaySelectDialog" v-if="claimPoints?.length">
          <v-icon class="mr-1">mdi-plus</v-icon>
          {{ localeText('Claim Point') }}
        </v-btn>
      </template>

      <template v-slot:no-content-header>{{ localeText('NoData') }}</template>
      <template v-slot:no-content-text>{{ localeText('CTA') }}</template>
      <template v-slot:no-content-cta>
        <v-btn @click="openGiveawaySelectDialog">
          <v-icon class="mr-1">mdi-plus</v-icon>
          {{ localeText('Claim Point') }}
        </v-btn>
      </template>
      <v-container fluid class="pa-0">
        <v-row>
          <v-col md="4" sm="6" xs="12" v-for="(claimPoint, i) in claimPoints" :key="claimPoint.id">
            <claim-point-card :claimPoint="claimPoint" @onRemove="removeClaimPoint(i)" />
          </v-col>
        </v-row>
      </v-container>
    </content-sub-panel>
    <v-dialog v-model="newClaimPointDialog" max-width="390">
      <v-card>
        <v-card-title>
          <span class="text-h6">{{ localeText('Add Claim Point') }}</span>
        </v-card-title>
        <v-card-text>
          <v-autocomplete
            autofocus
            outlined
            :items="giveaways"
            item-text="name"
            item-value="sk"
            :label="localeText('Linked Giveaways')"
            v-model="selectedGiveaway"
            hide-details
            dense
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="addClaimPoint"> {{ localeAction('add') }} </v-btn>
          <v-btn color="grey" text @click="newClaimPointDialog = false"> {{ localeAction('cancel') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContentSubPanel from './ContentSubPanel'
import ClaimPointCard from './ClaimPointCard'
import { GiveawayClaimPoint } from '../models/GiveawayClaimPoint'
import { GiveawayClaimPointInstance } from '../models/GiveawayClaimPointInstance'

export default {
  components: {
    ContentSubPanel,
    ClaimPointCard,
  },
  name: 'SceneGiveawayList',
  data: () => ({
    clickEventDialog: false,
    propertiesDialog: false,
    transformDialog: false,
    deleteDialog: false,
    detailedMode: true,
    selectedImage: '',
    newClaimPointDialog: false,
    selectedGiveaway: null,
    dialogCallback: () => {},
  }),
  giveaways() {
    return this.linkedGiveaways(this.activeScene.sk) || []
  },
  computed: {
    ...mapGetters({
      activeScene: 'scene/activeScene',
      loadingGiveaways: 'giveaway/loadingGiveaways',
      claimPoints: 'scene/sceneClaimPoints',
      linkedGiveaways: 'event/giveawaysForScene',
      localeText: 'i18n/claimPoints',
      localeAction: 'i18n/actions',
    }),
    giveaways() {
      return this.linkedGiveaways(this.activeScene.sk)
    },
  },
  methods: {
    ...mapActions({
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      removeSceneElement: 'scene/removeSceneElement',
      toggleSoundLocators: 'scene/toggleSoundLocators',
    }),
    openGiveawaySelectDialog() {
      this.newClaimPointDialog = true
    },
    addClaimPoint() {
      this.newClaimPointDialog = false
      const elementData = new GiveawayClaimPoint({
        name: `Claim Point ${this.claimPoints.length + 1}`,
        giveawayId: this.selectedGiveaway,
      })
      const instanceData = new GiveawayClaimPointInstance({
        name: `Claim Point Instance ${this.claimPoints.length + 1}`,
      })
      elementData.instances.push(instanceData)
      this.createSceneElement({ element: 'claimpoint', elementData, instanceData })
    },
    removeClaimPoint(i) {
      const elementData = this.claimPoints[i]
      this.deleteSceneElement({ element: 'claimpoint', elementData, id: elementData.sk })
    },
    updateProperties(wssMessages) {
      this.$emit('updateProperties', { wssMessages })
    },
  },
}
</script>
