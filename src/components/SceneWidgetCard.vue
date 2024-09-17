<template>
  <v-card elevation="6">
    <edit-select-dialog v-if="editingSelections" :selections="widget.selections" v-model="editingSelections" @onChange="editWidget()" />
    <div class="primary darken-4 pa-6">
      <div class="d-flex align-center">
        <div class="text-h6 white--text" v-if="!editingName">
          {{ widget.name }}
        </div>
        <div v-if="editingName" class="flex-grow-1">
          <v-text-field
            outlined
            autofocus
            color="white"
            :label="localeText('Widget Name')"
            v-model="widget.name"
            hide-details="auto"
            append-outer-icon="mdi-content-save"
            @click:stop:append-outer="toggleEditMode"
            @blur="toggleEditMode"
            dense
          ></v-text-field>
        </div>
        <v-spacer v-if="editingName" class="flex-grow-2"></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click="toggleEditMode" class="ml-2" v-if="!editingName" v-bind="attrs" v-on="on">
              <v-icon small>mdi-rename</v-icon>
            </v-btn>
          </template>
          <span>{{ localeAction('rename') }}</span>
        </v-tooltip>
      </div>
    </div>
    <div v-if="widget.type > 0" class="d-flex pa-2 black">
      <v-btn text v-if="widget.type === 6 || widget.type == 4">{{ widget.value }}</v-btn>
      <v-spacer> </v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="copyIdToClipboard" v-bind="attrs" v-on="on">
            <v-icon>mdi-information</v-icon>
          </v-btn>
        </template>
        <div class="text-center">
          <strong>{{ localeText('Type') }}:</strong> {{ showTypeAsText() }}
        </div>
        <div class="text-center">
          <strong>{{ localeText('ID') }}:</strong> {{ widget.id }}
        </div>
        <div class="text-center">
          <strong>{{ localeText('Click to copy ID') }}</strong>
        </div>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="reconfigure()" v-bind="attrs" v-on="on">
            <v-icon>{{ !reconfiguring ? 'mdi-wrench' : 'mdi-content-save' }}</v-icon>
          </v-btn>
        </template>
        <span>{{ !reconfiguring ? localeText('Configure') : localeText('Save') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            @click="
              showDeleteDialog({
                element: 'widget',
                elementData: widget,
              })
            "
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </template>
        <span>{{ localeText('Delete Widget') }}</span>
      </v-tooltip>
    </div>
    <div class="pa-4">
      <div v-if="widget.type == 0">
        <v-row class="text-center d-flex justify-space-around">
          <v-col>
            <v-btn outlined @click="reconfigure"><v-icon class="mr-2">mdi-wrench</v-icon> {{ localeText('Configure Widget') }}</v-btn>
          </v-col>
          <v-col>
            <v-btn outlined @click="removeWidget"><v-icon class="mr-2">mdi-trash-can</v-icon> {{ localeText('Delete Widget') }}</v-btn>
          </v-col>
        </v-row>
      </div>
      <v-switch v-if="widget.type == 1" v-model="widget.value" hide-details class="mt-0" @change="editWidget"
        ><template v-slot:label>
          <div class="text-body">
            {{ widget.name }}
            (<strong :class="widget.value ? 'green--text' : 'red--text'">{{ widget.value ? localeText('Enabled') : localeText('Disabled') }}</strong
            >)
          </div>
        </template></v-switch
      >
      <v-text-field outlined v-if="widget.type == 2" v-model="widget.value" :label="`${widget.name} Value`" @change="editWidget"></v-text-field>

      <div class="d-flex align-center justify-center" v-if="widget.type == 3">
        <v-select
          outlined
          :items="widgetSelections"
          v-model="widget.value"
          :label="`${widget.name} ${localeText('State')}`"
          hide-details="auto"
          @change="editWidget()"
        ></v-select>
      </div>
      <div class="d-flex align-center justify-space-around" v-if="widget.type == 4">
        <v-menu v-model="editingDate" :close-on-content-click="false" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn outlined color="primary" v-bind="attrs" v-on="on"><v-icon class="mr-2">mdi-calendar</v-icon>{{ localeText('Set Date') }}</v-btn>
          </template>
          <v-date-picker color="primary" v-model="date" @change="setDateTime"></v-date-picker>
        </v-menu>
        <v-menu v-model="editingTime" :close-on-content-click="false" max-width="290">
          <template v-slot:activator="{ on, attrs }">
            <v-btn outlined color="primary" v-bind="attrs" v-on="on"><v-icon class="mr-2">mdi-clock</v-icon>{{ localeText('Set Time') }}</v-btn>
          </template>
          <v-time-picker v-if="editingTime" color="primary" v-model="time" @change="setDateTime"></v-time-picker>
        </v-menu>
      </div>
      <div v-if="widget.type === 4" class="text-button my-2 text-center">
        <div>{{ localeText('Format') }}</div>
        <v-btn-toggle v-if="widget.type === 4" v-model="dateTimeFormat" @change="setDateTime"
          ><v-btn>ISO 8601</v-btn><v-btn>{{ localeText('Timestamp') }}</v-btn></v-btn-toggle
        >
      </div>
      <!-- <v-autocomplete v-if="widget.type === 4" outlined :items="timeZones" label="Select a time zone" v-model="selectedTimeZone" item-text="text" item-value="value" @change="setDateTime" class="mt-2"></v-autocomplete> -->
      <div class="d-flex justify-center" v-if="widget.type == 5">
        <v-btn outlined v-if="widget.type == 5" color="primary" @click="triggerWidget()" elevation="6">Trigger Action</v-btn>
      </div>
      <div class="d-flex justify-center" v-if="widget.type == 6">
        <v-slider
          v-if="widget.type == 6"
          v-model="widget.value"
          :step="(widget.range[1] - widget.range[0]) / 100"
          :min="widget.range[0]"
          :max="widget.range[1]"
          thumb-label
          color="primary"
          @change="editWidget()"
          elevation="6"
        />
      </div>
    </div>
    <div v-if="reconfiguring" class="pa-6">
      <div class="d-flex align-center">
        <v-select
          outlined
          :label="localeText('Widget Type')"
          :items="widgetTypes"
          hide-details="auto"
          v-model="widget.type"
          @change="changeWidgetType"
        >
        </v-select>
        <v-btn outlined v-if="widget.type == 3" class="ml-4" @click.stop="openEditSelectDialog"> {{ localeText('Edit Selections') }} </v-btn>
      </div>
      <div class="d-flex" v-if="widget.type === 6">
        <v-text-field
          outlined
          v-model="widget.range[0]"
          :label="localeText('Slider Start')"
          hide-details="auto"
          @blur="editWidget()"
          class="mt-4"
        ></v-text-field>
        <v-text-field
          outlined
          v-model="widget.range[1]"
          :label="localeText('Slider End')"
          hide-details="auto"
          @blur="editWidget()"
          class="mt-4"
        ></v-text-field>
      </div>
      <v-text-field
        outlined
        :label="localeText('Widget ID')"
        v-model="widget.id"
        hide-details="auto"
        @blur="editWidget()"
        class="mt-4"
      ></v-text-field>
    </div>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { SceneWidget } from '../models/SceneWidget'
import EditSelectDialog from '../components/dialogs/EditSelectDialog'
import { DateTime } from 'luxon'

export default {
  components: {
    EditSelectDialog,
  },
  name: 'SceneWidgetCard',
  data: () => ({
    editingName: false,
    editingSelections: false,
    reconfiguring: false,
    editingDate: false,
    editingTime: false,
    selectedTimeZone: 'UTC',
    date: null,
    time: null,
    timeZones: [],
    dateTimeFormat: 0,
  }),
  props: {
    widget: {
      type: Object,
      default: function () {
        return new SceneWidget()
      },
    },
  },
  watch: {
    editingTime: function (val) {
      if (val) {
        this.time = null
      }
    },
  },
  mounted() {
    this.timeZones = this.getTimeZones()
    if (this.widget.type == 6 && !this.widget.range) {
      this.widget.range = [0, 100]
    }
    if (this.widget.type == 4 && (!this.widget.value || !isNaN(Date.parse(this.widget.value)))) {
      this.dateTimeFormat = this.isIsoDateOrTimestamp(this.widget.value)
      if (this.dateTimeFormat == 0) {
        this.widget.value = DateTime.fromISO(this.widget.value).toISO()
        const { date, time } = this.splitIsoString(this.widget.value)
        this.widget.value = this.combineDateAndTime(date, time)
      } else {
        this.widget.value = DateTime.fromSeconds(this.widget.value).toUnixInteger()
      }
    }
  },
  computed: {
    ...mapGetters({
      localeText: 'i18n/widgets',
      localeAction: 'i18n/actions',
    }),
    widgetTypes() {
      return [
        { text: this.localeText('None') || 'None', value: 0, disabled: true },
        { text: this.localeText('Toggle') || 'Toggle', value: 1 },
        { text: this.localeText('Text') || 'Text', value: 2 },
        { text: this.localeText('Selector') || 'Selector', value: 3 },
        { text: this.localeText('Date & Time') || 'Date & Time', value: 4 },
        { text: this.localeText('Trigger') || 'Trigger', value: 5 },
        { text: this.localeText('Slider') || 'Slider', value: 6 },
      ]
    },
    widgetSelections() {
      if (this.widget.selections) {
        return this.widget.selections.map((option) => ({
          text: `${option.text}  [ id: ${option.value} ]`,
          value: option.value,
        }))
      } else {
        return [{ text: `${this.localeText('Option')} 1`, value: `${this.localeText('option')}-1` }]
      }
    },
    needsSetup() {
      return this.widget.type == 0
    },
  },
  methods: {
    ...mapActions({
      showSuccess: 'banner/showSuccess',
      createSceneElement: 'scene/createSceneElement',
      updateSceneElement: 'scene/updateSceneElement',
      deleteSceneElement: 'scene/deleteSceneElement',
      showDeleteDialog: 'dialog/showDeleteDialog',
    }),
    getTimeZones() {
      const timeZoneNames = Intl.supportedValuesOf('timeZone')

      return timeZoneNames.map((timeZone) => {
        const now = DateTime.now().setZone(timeZone)
        const offset = now.toFormat('ZZZZZ')
        const displayName = `${offset} (${timeZone})`

        return { text: displayName, value: timeZone }
      })
    },
    removeWidget() {
      this.deleteSceneElement({ element: 'widget', elementData: this.widget, id: this.widget.id })
    },
    editWidget() {
      this.updateSceneElement({
        element: 'widget',
        id: this.widget.sk,
        elementData: this.widget,
      })
    },
    triggerWidget() {
      this.updateSceneElement({
        element: 'widget',
        id: this.widget.sk,
        elementData: { ...this.widget, value: true },
      })
    },
    openEditSelectDialog() {
      this.editingSelections = true
    },
    toggleEditMode() {
      this.editingName = !this.editingName

      if (!this.editingName) {
        this.widget.id = this.widget.name.createSlug()
        this.editWidget()
      }
    },
    copyIdToClipboard() {
      navigator.clipboard.writeText(this.widget.id).then(
        () => {
          // clipboard successfully set
          this.showSuccess({ message: `${this.localeText('Widget ID')} "${this.widget.id}" ${this.localeText('Copied to clipboard')}` })
        },
        () => {
          // clipboard write failed
          this.showError({ message: this.localeText('Could not copy ID to clipboard') })
        }
      )
    },
    changeWidgetType() {
      if (this.widget.type == 1) {
        this.widget.value = false
      } else if (this.widget.type == 2) {
        this.widget.value = ''
      } else if (this.widget.type == 4) {
        this.widget.value = Date.now().toISOString()
      } else if ((this.widget.type == 6 && !this.widget.range) || !this.widget?.range?.length) {
        this.widget.range = [0, 100]
      }

      this.editWidget()
    },
    setDateTime() {
      this.widget.value = this.combineDateAndTime(this.date, this.time)
      this.editWidget()
      this.editingDate = false
      this.editingTime = false
    },
    showTypeAsText() {
      switch (this.widget.type) {
        case 1:
          return this.localeText('Toggle')
        case 2:
          return this.localeText('Text')
        case 3:
          return this.localeText('Selector')
        case 4:
          return this.localeText('Date & Time')
        case 5:
          return this.localeText('Trigger')
        case 6:
          return this.localeText('Slider')
        default:
          return this.localeText('Not Configured')
      }
    },
    splitIsoString(isoString) {
      let date

      if (isNaN(Date.parse(isoString))) {
        date = new Date()
      } else {
        date = new Date(isoString)
      }

      let year = date.getFullYear()
      let month = date.getMonth() + 1 // JavaScript months are 0-based, so we add 1
      let day = date.getDate()

      // Adding leading zeroes where necessary
      month = month < 10 ? '0' + month : month
      day = day < 10 ? '0' + day : day

      let formattedDate = `${year}-${month}-${day}`

      let hours = date.getHours()
      let minutes = date.getMinutes()
      let seconds = date.getSeconds()

      // Adding leading zeroes where necessary
      hours = hours < 10 ? '0' + hours : hours
      minutes = minutes < 10 ? '0' + minutes : minutes
      seconds = seconds < 10 ? '0' + seconds : seconds

      let formattedTime = `${hours}:${minutes}:${seconds}`

      this.date = formattedDate
      this.time = formattedTime

      return {
        date: formattedDate,
        time: formattedTime,
      }
    },
    combineDateAndTime(dateString, time) {
      let date = DateTime.fromISO(dateString + 'T' + time, { zone: 'UTC' })
      return this.dateTimeFormat ? date.toUnixInteger() : date.toISO()
    },
    isIsoDateOrTimestamp(value) {
      if (typeof value === 'number') {
        // The value is a number, so it might be a Unix timestamp.
        // To be sure, let's see if it represents a valid date.
        const dateFromTimestamp = DateTime.fromMillis(value * 1000)
        return dateFromTimestamp.isValid ? 1 : 0
      } else if (typeof value === 'string') {
        // The value is a string, so it might be an ISO date.
        // To be sure, let's see if it represents a valid date.
        const dateFromIso = DateTime.fromISO(value)
        return dateFromIso.isValid ? 0 : 0
      } else {
        // The value is neither a number nor a string, so it's neither an ISO date nor a Unix timestamp.
        return 0
      }
    },
    reconfigure() {
      this.reconfiguring = !this.reconfiguring
    },
  },
}
</script>
