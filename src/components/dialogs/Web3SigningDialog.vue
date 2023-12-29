<template>
  <v-dialog v-model="value" hide-overlay :persistent="!!signingTime || signingTime > 1" width="40%">
    <v-card>
      <v-card-text>
        <div class="text-h4 text-center pt-6">Sign Message To Log In</div>
        <div class="text-center d-flex justify-center flex-column" style="min-height: 150px" v-if="remainingTime >= 1">
          <v-progress-circular
            class="text-center mx-auto"
            rotate="-90"
            size="60"
            :value="remainingTime ? (remainingTime / 90) * 100 : 100"
            :color="signingTimerColor"
          >
            <span v-if="signingTimerTextColor">{{ remainingTime }}</span>
          </v-progress-circular>
        </div>
        <div class="text-center d-flex justify-center flex-column" style="min-height: 150px" v-if="signing && remainingTime < 1">
          <div v-if="signing && remainingTime < 1" class="text-center text-h6 error--text">Signature Request Expired</div>
          <div v-if="signing && remainingTime < 1" class="text-center text-display error--text">Please reject or close the request window</div>
        </div>
        <v-expansion-panels accordion>
          <v-expansion-panel>
            <v-expansion-panel-header>Learn More About Web3 Authentication</v-expansion-panel-header>
            <v-expansion-panel-content>
              <p>VLM allows you to log in by signing an encrypted message to prove that you are the true owner of your Web3 wallet.</p>
              <p>The message should look <strong>exactly</strong> like the one below.</p>
              <v-textarea :value="signatureMessage" disabled></v-textarea>
              <p>You will not be asked to pay a fee or be asked for permission to transfer tokens. If this occurs, please contact support.</p>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { DateTime } from 'luxon'

export default {
  name: 'Web3SigningDialog',
  data() {
    return {
      countdownTime: 90,
      countdownInterval: null,
    }
  },
  watch: {
    signing(newVal) {
      if (newVal) {
        this.startCountdown()
      }
    },
  },
  props: {
    value: Boolean,
  },
  computed: {
    ...mapGetters({
      connected: 'auth/connected',
      loadingAuth: 'auth/loadingAuth',
      signing: 'auth/signing',
      signatureMessage: 'auth/signatureMessage',
    }),
    show: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      },
    },
    remainingTime() {
      return this.countdownTime
    },
    showCountdown() {
      return this.signing && this.remainingTime > 0
    },
    signingTime() {
      return DateTime.now().toMillis() - (this.sigTokenExpires || 0)
    },
    signingTimerColor() {
      if ((this.remainingTime / 90) * 100 > 33) {
        return 'white'
      } else if ((this.remainingTime / 90) * 100 > 10) {
        return 'yellow'
      } else {
        return 'red'
      }
    },
    signingTimerTextColor() {
      if ((this.remainingTime / 90) * 100 > 33) {
        return ''
      } else if ((this.remainingTime / 90) * 100 > 10) {
        return 'yellow--text'
      } else {
        return 'error--text'
      }
    },
    environment() {
      return process.env.VUE_APP_NODE_ENV
    },
    connectedWallet() {
      return this.$store.getters['auth/walletAddress'](6, 4)
    },
  },
  methods: {
    startCountdown() {
      this.countdownTime = 90 // Reset the countdown time
      this.countdownInterval = setInterval(() => {
        if (this.countdownTime > 0) {
          this.countdownTime--
        } else {
          clearInterval(this.countdownInterval)
        }
      }, 1000) // Update every second
    },
    closeWindow() {
      this.enabled = false
    },
  },
}
</script>
