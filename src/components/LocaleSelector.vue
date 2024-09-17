<template>
  <v-menu top offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn class="mx-4" dark icon small v-bind="attrs" v-on="on">
        <v-icon small :class="`flag-icon-circle flag-icon-${localeFlag}`"></v-icon
      ></v-btn>
    </template>
    <v-list>
      <v-list-item v-for="locale in locales" :key="locale.code" @click="setLocale(locale)">
        <v-list-item-icon>
          <span :class="`flag-icon flag-icon-${locale.flag}`"></span>
        </v-list-item-icon>
        <v-list-item-title>{{ locale.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { requireLocale } from '@/helpers/requireLocales'

export default {
  data() {
    return {
      locales: [],
      selectedLocale: {}, // to store the currently selected locale
    }
  },
  created() {
    this.fetchLocales()
  },
  computed: {
    ...mapGetters({
      localeFlag: 'i18n/localeFlag',
      localeCode: 'i18n/localeCode',
    }),
  },
  methods: {
    ...mapActions({
      setGlobalLocale: 'i18n/setLocale',
    }),
    async setLocale(locale) {
      this.selectedLocale = locale
      console.log('selectedLocale', this.selectedLocale)
      await this.setGlobalLocale(locale.code)
    },
    async fetchLocales() {
      this.locales = await requireLocale(`./locales.json`)
      // Set default selected locale
      this.selectedLocale = this.locales.find((locale) => locale.code === this.localeCode) || this.locales[0]
    },
  },
}
</script>

<style scoped>
/* @import 'flag-icon-css/css/flag-icon.min.css'; */

.flag-icon-circle {
  background-position: 50%;
  background-size: cover;
  border-radius: 50%; /* Makes the icon circular */
  width: 24px; /* Adjust size as needed */
  height: 24px; /* Adjust size as needed */
  display: inline-block;
  overflow: hidden;
}
</style>
