<template>
  <div>
    <div class="grey darken-3 pa-6">
      <div class="d-flex justify-space-between">
        <div class="text-h5 white--text" v-if="!editingName">
          {{ event.name }}
          <v-btn icon small @click="toggleEditMode()">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </div>
        <div class="text-h5" v-if="editingName">
          <v-text-field
            autofocus
            label="Event Name"
            v-model="event.name"
            hide-details="auto"
            append-outer-icon="mdi-content-save"
            @click:append-outer="toggleEditMode()"
            @blur="toggleEditMode()"
            dense
          ></v-text-field>
        </div>
        <div>
          <v-select
            label="Event Type"
            :items="eventTypes"
            hide-details="auto"
            v-model="event.type"
            :disabled="locked"
            @change="changeEventType()"
          >
          </v-select>
        </div>
        <div>
          <v-text-field
            label="Event Id"
            v-model="event.id"
            hide-details="auto"
            :disabled="locked"
            @blur="editEvent()"
          ></v-text-field>
        </div>
        <div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click="toggleEventLock()"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>{{ locked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ locked ? 'Unlock' : 'Lock' }} Event Settings</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                @click="openDeleteDialog()"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </template>
            <span>Remove Event</span>
          </v-tooltip>
        </div>
      </div>
    </div>
    <div class="pa-4">
      <v-switch
        v-if="event.type == 0"
        v-model="event.value"
        hide-details
        class="mt-0"
        @change="editEvent()"
        ><template v-slot:label>
          <div class="text-body">
            {{ event.name }} is
            <strong
              :class="event.value ? 'green--text' : 'red--text'"
              >{{ event.value ? 'Enabled' : 'Disabled' }}</strong
            >
          </div>
        </template></v-switch
      >
      <v-text-field
        v-if="event.type == 1"
        v-model="event.value"
        :label="`${event.name} Value`"
        @change="editEvent()"
      ></v-text-field>

      <div
        class="d-flex align-center justify-space-between"
        v-if="event.type == 2"
      >
        <v-select
          :items="eventSelections"
          v-model="event.value"
          :label="`${event.name} State`"
          hide-details="auto"
          @change="editEvent()"
        ></v-select>
        <v-btn
          class="ml-4"
          :disabled="locked"
          @click.stop="openEditSelectDialog"
        >
          Edit Selections
        </v-btn>
      </div>
      <div class="d-flex justify-center">
        <v-btn
          v-if="event.type == 3"
          color="green"
          @click="triggerEvent()"
          >Trigger {{ event.name }}</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapActions } from 'vuex'
import DeleteDialog from './dialogs/DeleteDialog'
import { SceneEvent } from '../models/SceneEvent'
import EditSelectDialog from '../components/dialogs/EditSelectDialog'

export default {
  components: {
    EditSelectDialog,
    DeleteDialog
  },
  name: 'SceneEvent',
  data: () => ({
    editingName: false,
    editingSelections: false,
    deleteDialog: false,
    eventTypes: [
      { text: 'Toggle', value: 0 },
      { text: 'Text', value: 1 },
      { text: 'Selector', value: 2 },
      { text: 'Trigger', value: 3 }
    ],
    locked: false
  }),
  props: {
    event: {
      type: Object,
      default: function () {
        return new SceneEvent()
      }
    }
  },
  mounted () {
    
  },
  computed: {
    eventSelections () {
      return this.event.selections.map(event => ({
        text: `${event.text}  [ id: ${event.value} ]`,
        value: event.value
      }))
    }
  },
  methods: {
    ...mapActions({
      uploadImage: 'image/uploadImage'
    }),
    removeEvent () {
      this.$emit('onRemove')
    },
    editEvent () {
      this.updateProperties({
        action: 'update',
        element: 'event',
        id: this.event.id,
        eventData: this.event
      })
    },
    triggerEvent () {
      this.event.value = true;
      this.updateProperties({
        action: 'update',
        element: 'event',
        id: this.event.id,
        eventData: this.event
      })
    },
    openEditSelectDialog () {
      this.editingSelections = true
    },
    openDeleteDialog () {
      this.deleteDialog = true
    },
    toggleEditMode () {
      this.editingName = !this.editingName

      if (!this.editingName && !this.locked) {
        this.event.id = this.event.name.createSlug()
      }
      
      this.editEvent()
    },
    changeEventType () {
      if (this.event.type == 0) {
        this.event.value = false
      } else if (this.event.type == 1) {
        this.event.value = ''
      }
      this.editEvent()
    },
    toggleEventLock () {
      this.locked = !this.locked
      Vue.set(this.event, 'locked', this.locked)
      this.editEvent()
    },
    updateProperties (wssMessages) {
      this.$emit('updateProperties', { ...wssMessages })
    }
  }
}
</script>
