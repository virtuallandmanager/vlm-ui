export function downloadCsv(filename, text) {
  var pom = document.createElement('a')
  pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(text))
  pom.setAttribute('download', filename)

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    pom.dispatchEvent(event)
  } else {
    pom.click()
  }
}
