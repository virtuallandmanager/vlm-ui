<template>
  <v-card class="grey darken-3" elevation="2">
    <v-img :src="event?.imageLink || eventImgPlaceholder" lazy-src="@/assets/placeholder.png" max-height="250" class="text-right">
      <v-chip v-if="ongoing" class="green ma-4"><span>Ongoing</span></v-chip>
      <v-chip v-else-if="future" class="orange ma-4"
        ><span>Starts {{ startTimeString }}</span></v-chip
      >
      <v-chip v-else class="grey ma-4"
        ><span>Ended {{ endTimeString }}</span></v-chip
      >

      <template v-slot:placeholder>
        <v-row class="d-flex fill-height ma-0 align-center justify-center">
          <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
        </v-row>
      </template>
    </v-img>
    <v-card-text class="pa-2">
      <v-container>
        <v-row>
          <v-col>
            <div class="text-h5 text-left text-truncate">
              {{ event.name || 'New Event' }}
            </div>
            <div class="text-subtitle-2 font-weight-medium text-right mb-2"></div>
            <div class="text-subtitle-2 font-weight-light text-left">
              <span v-if="startTime && !endTime">Started {{ startTime }}</span>
              <span v-if="startTime && endTime">From {{ startTime }}</span>
              <span v-if="endTime"> to {{ endTime }}</span>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import imgPlaceholder from '@/assets/placeholder.png'
import { DateTime } from 'luxon'

export default {
  name: 'EventCard',

  data: () => ({ imagePath: '../assets/' }),
  props: {
    event: Object,
  },
  computed: {
    eventImgPlaceholder() {
      return imgPlaceholder
    },
    startTime() {
      if (!this.event?.eventStart) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventStart).toLocaleString()
    },
    startTimeString() {
      if (!this.event?.eventStart) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventStart).toRelative()
    },
    endTime() {
      if (!this.event?.eventEnd) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventEnd).toLocaleString()
    },
    endTimeString() {
      if (!this.event?.eventEnd) {
        return ''
      }
      return DateTime.fromMillis(this.event.eventEnd).toRelative()
    },
    ongoing() {
      return DateTime.now().toMillis() >= this.event.eventStart && (!this.event.eventEnd || DateTime.now().toMillis() <= this.event.eventEnd)
    },
    future() {
      return DateTime.now().toMillis() < this.event.startTime
    },
    past() {
      return DateTime.now().toMillis() > this.event.endTime
    },
  },
}
</script>
