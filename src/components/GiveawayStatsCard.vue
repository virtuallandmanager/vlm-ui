<template>
  <v-card class="text-center transparent" elevation="0">
    <v-card-text>
      {{ localeText('Linked Giveaways') }}: {{ event.giveaways.length }}<br />
      {{ localeText('Total Giveaway Claims') }}: {{ totalClaims }}
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'GiveawayStatsCard',

  data: () => ({ imagePath: '../assets/', itemData: {} }),
  props: {
    event: Object,
  },
  computed: {
    ...mapGetters({ localeText: 'i18n/giveaways' }),
    totalClaims() {
      const total = this.event.giveaways.reduce((accumulator, giveaway) => {
        return accumulator + giveaway.claimCount
      }, 0)
      return total
    },
  },
}
</script>
