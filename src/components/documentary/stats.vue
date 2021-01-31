<template>
  <div class="main">
    <div
      v-if="loading"
      class="spinner"
    >
      <b-spinner
        class="b-spinner"
        variant="light"
        label="Spinning"
      />
    </div>
    <b-card
      bg-variant="dark"
      text-variant="white"
    >
      <h6>Horas Por Ver: {{ (sum / 60).toFixed(2) }} </h6>
      <h3>Por Ver: {{ count }} </h3>
      <h2>Documentales vistos: {{ countTotal() }} </h2>
      <h4>Promedio: {{ averageTotal() }} documentales a la semana </h4>
      <p> {{ howLongWillItTake() }} años en total</p>
    </b-card>
    <div
      v-for="(value,key) in documentaries"
      :key="key"
    >
      <b-button
        v-b-toggle="'collapse' + key"
        block
        variant="primary"
      >
        {{ key }}
      </b-button>
      <b-collapse :id="'collapse' + key ">
        <b-card
          bg-variant="dark"
          text-variant="white"
        >
          <h4>Documentales vistos: {{ countYear(key) }} </h4>
          <h2>Promedio: {{ averageYear(key) }} </h2>
          <div
            v-for="(value1, key1) in value"
            :key="key1"
          >
            <div v-if="countWeek(key,key1)==0">
              <b-button
                v-b-toggle="'collapse' + key + key1"
                block
                variant="danger"
              >
                {{ key1 }} ({{ getDateOfWeek(key1, key) }})
              </b-button>
              <b-collapse
                :id="'collapse' + key + key1"
                class="mt-2"
              >
                <b-card
                  bg-variant="dark"
                  text-variant="white"
                >
                  <div
                    v-for="(value2, key2) in value1"
                    :key="key2"
                  >
                    <h4>Documentales vistos: {{ countWeek(key,key1) }} </h4>
                  </div>
                </b-card>
              </b-collapse>
            </div>
            <div v-else>
              <b-button
                v-b-toggle="'collapse' + key + key1"
                block
                variant="primary"
              >
                {{ key1 }} ({{ getDateOfWeek(key1, key) }})
              </b-button>
              <b-collapse
                :id="'collapse' + key + key1"
                class="mt-2"
                :visible="true"
              >
                <b-card
                  bg-variant="dark"
                  text-variant="white"
                >
                  <div
                    v-for="(value2, key2) in value1"
                    :key="key2"
                  >
                    <h4>Documentales vistos: {{ countWeek(key,key1) }} </h4>
                    <div
                      v-for="(value3) in value2"
                      :key="value3.id"
                    >
                      <SimpleDocumentaryListItem
                        :documentary="value3"
                        @delete-row="deleteThisRow(index)"
                      />
                    </div>
                  </div>
                </b-card>
              </b-collapse>
            </div>
          </div>
        </b-card>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SimpleDocumentaryListItem from './simpledocumentarylistitem.vue'
import moment from 'moment'

export default {
  name: 'DocumentaryStats',
  components: {
    SimpleDocumentaryListItem
  },
  data () {
    return {
      documentaries: {},
      count: 0,
      sum: 0,
      loading: false
    }
  },
  mounted () {
    moment.locale('es')
    this.loading = true
    if (this.isOnline) {
      axios.get('http://192.168.1.90:3000/api/documentaries/watched')
        .then(response => {
          this.$offlineStorage.set('documentariesWatched', response.data)
          if (response.data.length) {
            this.createList(response.data[0].UserGM.consumedDate)
          } else {
            this.createList()
          }
          this.sortByWeek(response.data)
          this.loading = false
        })
      axios.get('http://192.168.1.90:3000/api/documentaries/towatch/count')
        .then(response => {
          this.$offlineStorage.set('documentariesToWatchCount', response.data.count)
          this.count = response.data.count
        })
      axios.get('http://192.168.1.90:3000/api/documentaries/towatch/sum')
        .then(response => {
          this.$offlineStorage.set('documentariesWatchedSum', response.data.documentaries[0].total)
          this.sum = response.data.documentaries[0].total
        })
    } else {
      if (this.$offlineStorage.get('documentariesWatched').length) {
        this.createList(this.$offlineStorage.get('documentariesWatched')[0].UserGM.consumedDate)
      } else {
        this.createList()
      }
      this.sortByWeek(this.$offlineStorage.get('documentariesWatched'))
      this.count = this.$offlineStorage.get('documentariesToWatchCount')
      this.loading = false
    }
  },
  methods: {
    deleteThisRow: function (index) {
      this.documentariesPage.data.splice(index, 1)
    },
    getWeekNumber: function (d) {
      // Copy date so don't modify original
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
      // Get first day of year
      let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      // Calculate full weeks to nearest Thursday
      let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
      // Return array of year and week number
      return weekNo
    },
    putDocumentaryInWeek: function (documentary) {
      let nWeek = this.getWeekNumber(new Date(documentary.UserGM.consumedDate))
      let year = (new Date(documentary.UserGM.consumedDate)).getFullYear()
      this.documentaries[year.toString()][nWeek.toString()]['documentaries'].push(documentary)
    },
    sortByWeek: function (documentaries, object) {
      documentaries.map(documentary => this.putDocumentaryInWeek(documentary))
    },
    range: function (size, startAt = 0) {
      return [...Array(size).keys()].map(i => i + startAt)
    },
    createList: function (mindate = new Date()) {
      let list = { }
      let minDate = new Date(mindate)
      let nowDate = new Date()
      this.range(nowDate.getFullYear() - minDate.getFullYear() + 1, minDate.getFullYear()).map(
        year => {
          list[year.toString()] = { }
          if (year === nowDate.getFullYear() && year === minDate.getFullYear()) {
            this.range(this.getWeekNumber(nowDate) - this.getWeekNumber(minDate) + 1, this.getWeekNumber(minDate)).map(
              week => {
                list[year.toString()][week.toString()] = {}
                list[year.toString()][week.toString()]['documentaries'] = []
              }
            )
          } else if (year === nowDate.getFullYear()) {
            this.range(this.getWeekNumber(nowDate), 1).map(
              week => {
                list[year.toString()][week.toString()] = {}
                list[year.toString()][week.toString()]['documentaries'] = []
              }
            )
          } else if (year === minDate.getFullYear()) {
            this.range(52 - this.getWeekNumber(minDate) + 1, this.getWeekNumber(minDate)).map(
              week => {
                list[year.toString()][week.toString()] = {}
                list[year.toString()][week.toString()]['documentaries'] = []
              }
            )
          } else {
            this.range(52, 1).map(
              week => {
                list[year.toString()][week.toString()] = {}
                list[year.toString()][week.toString()]['documentaries'] = []
              }
            )
          }
        }
      )
      this.documentaries = list
    },
    countWeek: function (year, week) {
      return this.documentaries[year.toString()][week.toString()]['documentaries'].length
    },
    countYear: function (year) {
      let result = 0
      const keys = Object.keys(this.documentaries[year])
      for (const key of keys) {
        result = result + this.countWeek(year, key)
      }
      return result
    },
    countTotal: function () {
      let result = 0
      const keys = Object.keys(this.documentaries)
      for (const key of keys) {
        result = result + this.countYear(key)
      }
      return result
    },
    averageYear: function (year) {
      if (typeof this.documentaries[year] === 'undefined') {
        return 0
      }
      const keys = Object.keys(this.documentaries[year]).length
      if (keys === 0) {
        return 0
      }
      let total = this.countYear(year)
      return (total / keys).toFixed(2)
    },
    averageTotal: function () {
      let result = 0
      const number = Object.keys(this.documentaries).length
      if (number === 0) {
        return 0
      }
      const keys = Object.keys(this.documentaries)
      for (const key of keys) {
        result = result + parseFloat(this.averageYear(key))
      }
      return (result / number).toFixed(2)
    },
    howLongWillItTake: function () {
      return ((this.count / (parseFloat(this.averageTotal()))) / 52).toFixed(2)
    },
    getDateOfWeek: function (w, y) {
      let d = (1 + (w - 1) * 7) // 1st of January + 7 days for each week
      let d1 = w * 7
      let date = new Date(y, 0, d)
      date = moment(date).format('MMMM D')
      let date1 = new Date(y, 0, d1)
      date1 = moment(date1).format('MMMM D')
      return date + ' - ' + date1
    }
  }
}
</script>

<style scoped>
.main {
  padding-top: 2rem;
}

.spinner{
  margin: 2rem;
}

.b-spinner{
  width: 10rem;
  height: 10rem;
}

</style>
