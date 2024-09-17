import store from '..'
import { AuthenticatedFetch } from './common'
import { DateTime } from 'luxon'

export const getRecentSceneMetrics = async (sceneId) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/analytics/recent/${sceneId}`)
  } catch (error) {
    return error
  }
}

export const getHistoricalData = async ({ sceneId, start, end, scale, tz }) => {
  try {
    const { sessionToken } = store.state.auth
    return await new AuthenticatedFetch(sessionToken).get(`/analytics/historical/${sceneId}?start=${start}&end=${end}&scale=${scale}&tz=${tz}`)
  } catch (error) {
    return error
  }
}

export const extractDateTimes = (data) => {
  const dateTimes = new Set()

  // Iterate through the top-level keys
  for (const key in data) {
    console.log('key', key)
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Iterate through the keys in the nested dictionary
      for (const datetimeKey in data[key]) {
        if (Object.prototype.hasOwnProperty.call(data[key], datetimeKey)) {
          dateTimes.add(datetimeKey)
        }
      }
    }
  }

  // Convert to an array and sort it
  let sortedDateTimes = Array.from(dateTimes).sort()

  // Create a new set to hold all DateTimes including missing hours
  const filledDateTimes = new Set()

  // Iterate through sorted DateTimes and fill missing hours
  sortedDateTimes.forEach((datetime) => {
    const datePart = datetime.split('T')[0] // Get the date part (e.g., "2024-08-05")
    for (let hour = 0; hour < 24; hour++) {
      const hourString = hour.toString().padStart(2, '0')
      const fullDateTime = `${datePart}T${hourString}:00:00.000`
      filledDateTimes.add(fullDateTime)
    }
  })

  return Array.from(filledDateTimes).map((dt) => DateTime.fromISO(dt).toLocaleString(DateTime.DATETIME_SHORT))
}

export const addMissingIntervals = (data, startDateTime, endDateTime, timeZone, timescale) => {
  const newData = {}

  // Determine the unit of time to use based on the timescale
  const unit = timescale

  console.log(`Unit of time: ${unit}`)

  // Convert startDateTime and endDateTime to Luxon DateTime objects in the provided time zone
  const start = DateTime.fromMillis(startDateTime, { zone: timeZone }).startOf(unit)
  const end = DateTime.fromMillis(endDateTime, { zone: timeZone }).endOf(unit)

  console.log(`Start DateTime: ${start.toISO()}`)
  console.log(`End DateTime: ${end.toISO()}`)

  // Process each dataset separately
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const dataset = data[key]
      newData[key] = {}

      // Find the earliest and latest date keys in the current dataset
      let earliestDate = null
      let latestDate = null

      const datetimeKeys = Object.keys(dataset)

      for (const datetime of datetimeKeys) {
        const date = DateTime.fromISO(datetime, { zone: timeZone })

        if (!earliestDate || date <= earliestDate) {
          earliestDate = date
        }
        if (!latestDate || date >= latestDate) {
          latestDate = date
        }
      }

      if (!earliestDate || !latestDate) {
        console.log(`No valid dates found in the data for key: ${key}`)
        continue
      }

      // console.log(`Earliest Date for ${key}: ${earliestDate.toISO()}`)
      // console.log(`Latest Date for ${key}: ${latestDate.toISO()}`)

      // Pad the start of the dataset if needed
      let current = start
      while (current.ts <= end.ts) {
        const currentISO = current.toISO({ includeOffset: false })
        // console.log(`Padding start for ${key}: Adding ${currentISO}`)
        newData[key][currentISO] = 0
        current = current.plus({ [unit]: 1 })
      }

      datetimeKeys.forEach((date) => {
        if (!dataset[date]) {
          newData[key][date] = 0
        } else {
          newData[key][date] = dataset[date]
        }
      })
    }
  }

  console.log('Final newData:', newData)

  return newData
}

export const addTotalCounts = (data) => {
  const newData = { ...data }

  for (const key in newData) {
    if (Object.prototype.hasOwnProperty.call(newData, key)) {
      const dataset = newData[key]
      let totalCount = 0

      // Sum up all the values in the nested dictionary
      for (const datetime in dataset) {
        if (Object.prototype.hasOwnProperty.call(dataset, datetime)) {
          totalCount += dataset[datetime]
        }
      }

      // Attach the total count to the parent dictionary key
      newData[key] = totalCount
      console.log(`Total count for ${key}: ${totalCount}`)
    }
  }

  return newData
}
