<template>
  <ccv-line-chart :data="data" :options="options"></ccv-line-chart>
</template>
<script>
import Vue from 'vue'

import '@carbon/styles/css/styles.css'

import '@carbon/charts/styles.css'
import chartsVue from '@carbon/charts-vue'

// IBM Plex should either be imported in your project by using Carbon
// or consumed manually through an import
// import '../ibm-plex-font.css'

Vue.use(chartsVue)

export default {
  name: 'LineChart',
  components: {},
  props: {
    data: Array,
    options: Object
  },
  data () {
    return {}
  }
}
</script>
