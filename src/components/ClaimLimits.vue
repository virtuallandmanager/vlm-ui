<template>
  <v-card class="d-flex flex-column flex-stretch text-center flex-grow-1 pa-2 transparent" elevation="0">
    <v-dialog v-model="editing" width="380">
      <v-card>
        <v-card-title> {{ localeText('Adjust Claim Limits') }} </v-card-title>
        <v-card-subtitle>
          {{ itemName }}
        </v-card-subtitle>

        <v-card-text class="lighten-1">
          <v-text-field
            v-model.number="claimLimits.perUser"
            type="number"
            :label="localeText('User')"
            class="aligned-text"
            dense
            outlined
          ></v-text-field>
          <v-text-field v-model.number="claimLimits.perIp" type="number" :label="localeText('IP')" class="aligned-text" dense outlined></v-text-field>
          <v-text-field
            v-model.number="claimLimits.daily"
            type="number"
            :label="localeText('Daily')"
            class="aligned-text"
            dense
            outlined
          ></v-text-field>
          <v-text-field
            v-model.number="claimLimits.weekly"
            type="number"
            :label="localeText('Weekly')"
            class="aligned-text"
            dense
            outlined
          ></v-text-field>
          <v-text-field
            v-model.number="claimLimits.monthly"
            type="number"
            :label="localeText('Monthly')"
            class="aligned-text"
            dense
            outlined
          ></v-text-field>
          <v-text-field
            v-model.number="claimLimits.yearly"
            type="number"
            :label="localeText('Yearly')"
            class="aligned-text"
            dense
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="saveClaimLimits"> {{ localeAction('save') }} </v-btn>
          <v-btn color="grey" text @click="editing = false"> {{ localeAction('cancel') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="text-display font-weight-black">{{ localeText('Claim Limits') }}</div>
    <div class="d-flex justify-center align-center" v-if="!Object.keys(claimLimits).length">{{ localeText('No Limits Set') }}</div>
    <div class="d-flex justify-space-between align-center" v-if="claimLimits?.perUser">
      <div>{{ localeText('User') }}:</div>
      <div>{{ claimLimits.perUser }}</div>
    </div>
    <div class="d-flex justify-space-between align-center" v-if="claimLimits?.perIp">
      <div>{{ localeText('IP') }}:</div>
      <div>{{ claimLimits.perIp }}</div>
    </div>
    <div class="d-flex justify-space-between align-center" v-if="claimLimits?.daily">
      <div>{{ localeText('Daily') }}:</div>
      <div>{{ claimLimits.daily }}</div>
    </div>
    <div class="d-flex justify-space-between align-center" v-if="claimLimits?.weekly">
      <div>{{ localeText('Weekly') }}:</div>
      <div>{{ claimLimits.weekly }}</div>
    </div>
    <div class="d-flex justify-space-between align-center" v-if="claimLimits?.monthly">
      <div>{{ localeText('Monthly') }}:</div>
      <div>{{ claimLimits.monthly }}</div>
    </div>
    <div class="d-flex justify-space-between align-center" v-if="claimLimits?.yearly">
      <div>{{ localeText('Yearly') }}:</div>
      <div>{{ claimLimits.yearly }}</div>
    </div>
    <v-btn x-small class="mt-4" @click="editing = !editing">{{ localeText('Set Limits') }}</v-btn>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'ClaimLimits',
  data: () => ({ editing: false }),
  props: {
    itemName: String,
    claimLimits: {
      type: Object,
      default: () => ({
        perUser: 1,
        perIp: 3,
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
      }),
    },
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/claimLimits',
      localeAction: 'i18n/actions',
    }),
  },
  methods: {
    async saveClaimLimits() {
      this.editing = false
      this.$emit('updateClaimLimits', this.item, this.claimLimits)
    },
  },
}
</script>

<style scoped>
.aligned-text ::v-deep input {
  text-align: right;
}
</style>
