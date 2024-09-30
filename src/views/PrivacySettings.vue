<template>
  <content-page centerContent>
    <gdpr-notice :value="showPrivacyPolicy" @input="togglePrivacyPolicy"></gdpr-notice>
    <template v-slot:header> {{ localeText('Privacy Settings') }} </template>
    <v-card-text class="d-flex">
      <v-container>
        <v-row>
          <v-col>
            <v-card elevation="12" class="d-flex flex-column justify-space-between pa-6 my-2">
              <v-card-text class="text-center text-h5">
                <v-icon>mdi-wallet</v-icon> {{ localeText('Connected Wallet') }}: {{ walletAddress() }}
              </v-card-text>
              <v-card-text class="text-left text-h5">
                <v-container>
                  <v-row>
                    <v-col>
                      <div class="font-weight-bold text-body-1">{{ localeText('VLMStoredData') }}</div>
                      <v-switch outlined v-model="canStore.displayName" :label="localeText('Display Name')" @onChange="updateToggles"></v-switch>
                      <v-switch
                        outlined
                        v-model="canStore.connectedWallet"
                        :label="localeText('Wallet Address')"
                        @onChange="updateToggles"
                      ></v-switch>
                      <v-switch outlined v-model="canStore.clientIp" :label="localeText('IP Address')" @onChange="updateToggles"></v-switch>
                      <v-switch outlined v-model="canStore.location" :label="localeText('Geographic Location')" @onChange="updateToggles"></v-switch>
                    </v-col>
                    <v-col>
                      <div class="font-weight-bold text-body-1">{{ localeText('VisibleData') }}</div>
                      <v-switch
                        outlined
                        v-model="canShare.displayName"
                        :disabled="!canStore.displayName"
                        :label="localeText('Display Name')"
                      ></v-switch>
                      <v-switch
                        outlined
                        v-model="canShare.connectedWallet"
                        :disabled="!canStore.connectedWallet"
                        :label="localeText('Wallet Address')"
                      ></v-switch>
                      <v-switch outlined v-model="canShare.clientIp" :disabled="!canStore.clientIp" :label="localeText('IP Address')"></v-switch>
                      <v-switch
                        outlined
                        v-model="canShare.location"
                        :disabled="!canStore.location"
                        :label="localeText('Geographic Location')"
                      ></v-switch>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </content-page>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters } from 'vuex'
import ContentPage from '../components/ContentPage'
import GdprNotice from '../components/dialogs/GDPRNotice'

export default {
  name: 'PrivacySettings',
  components: { GdprNotice, ContentPage },
  data: () => ({
    canStore: {
      displayName: true,
      connectedWallet: true,
      clientIp: true,
      location: true,
    },
    canShare: {
      displayName: true,
      connectedWallet: true,
      clientIp: true,
      location: true,
    },
    showPrivacyPolicy: false,
  }),
  mounted() {
    this.setNavState(false)
  },
  computed: {
    ...mapGetters({
      walletAddress: 'auth/walletAddress',
      localeText: 'i18n/privacySettings',
    }),
  },
  methods: {
    ...mapActions({ setNavState: 'app/setNavState' }),
    updateToggles() {
      Vue.nextTick(() => {
        Object.keys(this.canStore).forEach((key) => {
          if (!this.canStore[key]) {
            this.canShare[key] = false
          }
        })
      })
    },
    togglePrivacyPolicy() {
      this.showPrivacyPolicy = !this.showPrivacyPolicy
    },
  },
}
</script>
