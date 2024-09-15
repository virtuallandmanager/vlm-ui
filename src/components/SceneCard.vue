<template>
  <v-card class="grey darken-3" elevation="1">
    <router-link :to="`scene/${scene.sk}`" class="scene-card-link">
      <v-img :src="scene?.imageLink || sceneImgPlaceholder" lazy-src="@/assets/placeholder.png" max-height="250">
        <template v-slot:placeholder>
          <v-row class="d-flex fill-height ma-0 align-center justify-center">
            <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
          </v-row>
        </template>
      </v-img>
    </router-link>
    <v-card-text class="pa-2">
      <v-container>
        <v-row>
          <v-col cols="12" class="d-flex justify-space-between">
            <div class="text-h6 font-weight-light text-left">
              {{ scene.name || 'New Scene' }}
            </div>
            <v-menu offset-y bottom left class="absolute" @click.stop style="z-index: 5000">
              <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon small v-bind="attrs" v-on="on" @click.stop>
                  <v-icon small>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item link @click="openConfirmLeaveDialog" v-if="shared" class="d-flex align-center">
                  <v-list-item-icon class="mx-0">
                    <v-icon small>mdi-hand-wave</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="pa-0 ma-0">
                    <v-list-item-title>Leave Scene</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item link @click="openConfirmDeleteDialog" v-if="!shared && !isDemoScene" class="d-flex align-center">
                  <v-list-item-icon class="mx-0">
                    <v-icon small>mdi-trash-can</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="pa-0 ma-0">
                    <v-list-item-title>Delete Scene</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item link @click="hideDemoScene" v-if="isDemoScene" class="d-flex align-center">
                  <v-list-item-icon class="mx-0">
                    <v-icon small>mdi-eye-off</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="pa-0 ma-0">
                    <v-list-item-title>Hide Demo Scene</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
        <router-link :to="`scene/${scene.sk}`" class="scene-card-link">
          <v-row>
            <v-col class="my-n1">
              <v-tooltip bottom v-if="dclLocations?.length">
                <template v-slot:activator="{ on, attrs }">
                  <v-card class="d-flex align-center justify-center black pa-2 my-1" v-bind="attrs" v-on="on">
                    <img src="@/assets/dcl-logo-sm.png" width="20px" height="20px" class="mr-2" />
                    {{ dclLocations.length }} location{{ dclLocations.length == 1 ? '' : 's' }}
                    <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.location?.parcels?.length">
                      {{ `${scene?.location?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? 's' : '' }}
                    </div>
                  </v-card>
                </template>
                <div class="d-flex justify-center text-center" v-for="(location, i) of dclLocations" :key="i">
                  <v-chip small class="text-caption ma-1"><v-icon x-small v-if="location.includes('.dcl.eth')">mdi-web</v-icon>{{ location }}</v-chip>
                </div>
              </v-tooltip>
              <v-tooltip bottom v-if="exodusLocations?.length">
                <template v-slot:activator="{ on, attrs }">
                  <v-card class="d-flex align-center justify-center black pa-2 my-1" v-bind="attrs" v-on="on">
                    <img src="@/assets/exodus-logo-sm.png" width="20px" height="20px" class="mr-2" />
                    {{ exodusLocations.length }} location{{ exodusLocations.length == 1 ? '' : 's' }}
                    <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.location?.parcels?.length">
                      {{ `${scene?.location?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? 's' : '' }}
                    </div>
                  </v-card>
                </template>
                <div class="d-flex justify-center text-center" v-for="(location, i) of exodusLocations" :key="i">
                  <v-chip small class="text-caption ma-1"><v-icon x-small v-if="location.includes('.dcl.eth')">mdi-web</v-icon>{{ location }}</v-chip>
                </div>
              </v-tooltip>
              <v-tooltip bottom v-if="hyperfyLocations?.length">
                <template v-slot:activator="{ on, attrs }">
                  <v-card class="d-flex align-center justify-center black pa-2 my-1" v-bind="attrs" v-on="on">
                    <img src="@/assets/hyperfy-logo-sm.png" width="20px" height="20px" class="mr-2" />
                    {{ hyperfyLocations.length }} location{{ hyperfyLocations.length == 1 ? '' : 's' }}
                    <div class="text-subtitle-2 font-weight-medium text-left" v-if="scene?.location?.parcels?.length">
                      {{ `${scene?.location?.parcels?.length} Parcel` }}{{ scene?.parcels?.length > 1 ? 's' : '' }}
                    </div>
                  </v-card>
                </template>
                <div class="d-flex justify-center text-center" v-for="(location, i) of hyperfyLocations" :key="i">
                  <v-chip small class="text-caption ma-1"><v-icon x-small>mdi-web</v-icon>{{ location }}</v-chip>
                </div>
              </v-tooltip>
              <v-card v-if="!scene?.locations?.length" class="d-flex align-center justify-center black pa-2"> World Not Assigned </v-card>
            </v-col>
          </v-row>
        </router-link>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import placeholderImage from '@/assets/placeholder.png'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {},

  name: 'SceneCard',

  data: () => ({ imagePath: '../assets/' }),
  props: {
    scene: Object,
    shared: Boolean,
  },
  computed: {
    ...mapGetters({
      userInfo: 'user/userInfo',
    }),
    isDemoScene() {
      return this.scene?.sk === 'demo' || this.scene?.sk === '00000000-0000-0000-0000-000000000000'
    },
    sceneImgPlaceholder() {
      return placeholderImage
    },
    dclLocations() {
      return this.scene?.locations
        ?.filter((location) => location.world === 'decentraland')
        .map((location) => {
          if (location?.realm?.serverName.includes('.dcl.eth')) {
            return location.realm.serverName
          } else {
            return `${location.coordinates[0]},${location.coordinates[1]}`
          }
        })
    },
    exodusLocations() {
      return this.scene?.locations
        ?.filter((location) => location.world === 'decentraland' && location?.realm?.serverName.includes('exodus.town'))
        .map((location) => {
          if (location?.realm?.serverName.includes('exodus.town')) {
            return location.realm.serverName
          } else {
            return `${location.coordinates[0]},${location.coordinates[1]}`
          }
        })
    },
    hyperfyLocations() {
      return this.scene?.locations
        ?.filter((location) => location.world === 'hyperfy')
        .map((location) => {
          return `${location.coordinates[0]},${location.coordinates[1]}`
        })
    },
  },
  methods: {
    ...mapActions({
      hideDemoScene: 'scene/hideDemoScene',
      showSuccess: 'banner/showSuccess',
    }),
    openConfirmDeleteDialog() {
      this.$emit('confirmDelete', this.scene)
    },
    openConfirmLeaveDialog() {
      this.$emit('confirmLeave', this.scene)
    },
  },
}
</script>
