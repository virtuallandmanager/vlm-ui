<template>
  <v-sheet
    elevation="2"
    class="mx-auto fill-height pb-4"
    max-width="960"
    v-if="property"
  >
    <v-snackbar v-model="error" tile color="red accent-2" width=550>
      {{ errorMessage }}
    </v-snackbar>
    <v-container v-if="property">
      <v-row>
        <v-col>
          <v-btn @click="goBack">Back</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field
            v-if="editingName"
            v-model="property.propertyName"
            class="parcel-name-input"
            autofocus
            @blur="updateName()"
            append-icon="mdi-pencil"
          ></v-text-field>
          <v-hover
            v-slot="{ hover }"
            :value="editingName"
            open-delay="200"
            close-delay="200"
          >
            <h1 v-if="!editingName" @click="editName()">
              {{ property.propertyName }}
              <v-btn
                :class="!editingName && hover ? 'visible' : 'hidden'"
                icon
                color="black"
                fab
                x-small
                class="mb-1"
                @click="editName()"
                ><v-icon>mdi-pencil</v-icon></v-btn
              >
            </h1>
          </v-hover>
          <h5>
            Last updated {{ lastUpdate.howLongAgo }}
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="primary" dark v-bind="attrs" v-on="on" x-small>
                  mdi-information
                </v-icon>
              </template>
              <span
                >Updated {{ lastUpdate.date }} at {{ lastUpdate.time }} by
                {{ lastUpdate.wallet }}</span
              >
            </v-tooltip>
          </h5>
          <h5>
            {{ property.parcels.length }} Parcel{{
              property.parcels.length > 1 ? 's' : ''
            }}
          </h5>
          <h6>
            <span>Base Parcel: {{ property.baseParcel }}</span>
          </h6>
        </v-col>
        <v-col no-gutters align="right">
          <v-menu
            v-model="showParcelMap"
            transition="scale-transition"
            origin="top right"
            offset-y
            nudge-left="200"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon v-if="showParcelMap"> mdi-close </v-icon>
                <v-icon v-else> mdi-map </v-icon>
              </v-btn>
            </template>
            <parcel-map
              :property="property"
              wrapperClass="pa-4 elevation-0"
              hClass="pb-4 text-center"
            />
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
    <v-tabs v-model="tab" centered icons-and-text>
      <v-tabs-slider></v-tabs-slider>

      <v-tab href="#tab-1">
        Analytics
        <v-icon>mdi-chart-timeline-variant</v-icon>
      </v-tab>
      <v-tab href="#tab-2">
        Dialogs
        <v-icon>mdi-message</v-icon>
      </v-tab>
      <v-tab href="#tab-3">
        Video Screens
        <v-icon>mdi-video</v-icon>
      </v-tab>
      <v-tab href="#tab-4">
        Images
        <v-icon>mdi-image</v-icon>
      </v-tab>
      <!-- <v-tab href="#tab-5" disabled>
              Moderation
              <v-icon>mdi-gavel</v-icon>
            </v-tab> -->
      <v-tab href="#tab-6">
        Customizations
        <v-icon>mdi-palette</v-icon>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" class="elevation-0" v-if="property">
      <v-tab-item :value="'tab-1'">
        <scene-analytics
          :baseParcel="property.baseParcel"
          @updateProperties="updateProperties"
        />
      </v-tab-item>
      <v-tab-item :value="'tab-2'">
        <scene-dialog-list
          :dialogs="property.sceneData.dialogs"
          @updateProperties="updateProperties"
        />
      </v-tab-item>
      <v-tab-item :value="'tab-3'">
        <scene-video-list
          :videos="property.sceneData.videoSystems"
          @updateProperties="updateProperties"
        />
      </v-tab-item>
      <v-tab-item :value="'tab-4'">
        <scene-image-list
          :images="property.sceneData.imageTextures"
          :property="property"
          @updateProperties="updateProperties"
        />
      </v-tab-item>
      <v-tab-item :value="'tab-5'">
        <scene-moderation
          :settings="property.sceneData.moderation"
          @updateProperties="updateProperties"
        />
      </v-tab-item>
      <v-tab-item :value="'tab-6'">
        <scene-customization-list
          :customizations="property.sceneData.customizations"
          @updateProperties="updateProperties"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-sheet>
</template>

<script>
import ParcelMap from '../components/ParcelMap'
import SceneAnalytics from '../components/SceneAnalytics'
import SceneDialogList from '../components/SceneDialogList'
import SceneImageList from '../components/SceneImageList'
import SceneVideoList from '../components/SceneVideoList'
import SceneModeration from '../components/SceneModeration'
import SceneCustomizationList from '../components/SceneCustomizationList'
// import Property from '../models/Property'
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'Parcel',
  components: {
    SceneAnalytics,
    SceneDialogList,
    SceneImageList,
    SceneVideoList,
    SceneModeration,
    SceneCustomizationList,
    ParcelMap
  },
  data: () => ({
    showParcelMap: false,
    editingName: false,
    deleteScreenDialog: false,
    editingScreenName: false,
    tab: null
  }),
  created () {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        console.log(this.$route.params, toParams, previousParams)
        // react to route changes...
      }
    )
  },
  watch: {
    userLand: function (newVal, oldVal) {
      // watch it
      console.log('Prop changed: ', newVal, ' | was: ', oldVal)
    }
  },
  mounted () {
    if (!this.userLand || !this.userLand.length) {
      this.fetchUserLand()
    }
    console.log(this.property)
  },
  computed: {
    ...mapGetters('land', ['userLand']),
    error: {
      get () {
        return this.$store.getters['land/error']
      },
      set (value) {
        this.setErrorState(value)
      }
    },
    errorMessage: {
      get () {
        return this.$store.getters['land/errorMessage']
      }
    },
    property () {
      return this.$store.getters['land/property'](
        this.$route.params.xCoord,
        this.$route.params.yCoord
      )
    },
    sceneData () {
      return this.property.sceneData
    },
    lastUpdate () {
      const lastUpdate = this.$store.getters['land/lastUpdate'](
        this.$route.params.xCoord,
        this.$route.params.yCoord
      )
      if (!lastUpdate) {
        return false
      }
      return {
        howLongAgo: moment(lastUpdate.timestamp).fromNow(),
        date: moment(lastUpdate.timestamp).format('LL'),
        time: moment(lastUpdate.timestamp).format('LT'),
        wallet: lastUpdate.wallet
      }
    }
  },
  methods: {
    ...mapActions({
      fetchUserLand: 'land/fetchUserLand',
      updateLandProperties: 'land/updateLandProperties',
      setErrorState: 'land/setErrorState'
    }),
    editName () {
      this.editingName = true
      this.previousPropertyName = this.property.propertyName
    },
    updateName () {
      this.editingName = false
      if (this.property.propertyName === this.previousPropertyName) {
        return
      }
      this.updateProperties({
        action: 'update',
        entity: 'scene',
        property: 'name'
      })
    },
    updateProperties (options) {
      this.updateLandProperties({
        wssMessages: options.wssMessages,
        property: {
          propertyName: this.property.propertyName,
          baseParcel: this.property.baseParcel,
          sceneData: this.property.sceneData,
          tokenId: this.property.tokenId
        }
      })
    },
    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.parcel-name-input {
  font-size: 2em;
  font-weight: bold;
  height: 2em;
  width: 60%;
  max-width: 580px;
}
.visible {
  opacity: 1;
}
.hidden {
  opacity: 0;
}
</style>
