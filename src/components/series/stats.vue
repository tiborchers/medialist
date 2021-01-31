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
      <h5>Capitulos Por Ver: {{ count }} </h5>
      <h6>Capitulos Vistos: {{ countListened }} </h6>
      <h3>Horas Por Ver: {{ (sum / 60).toFixed(2) }} </h3>
      <h2>Horas Vistas: {{ (sumTotal()/60).toFixed(2) }} </h2>
      <h4>Promedio: {{ Math.trunc(averageTotal()) }} minutos al mes </h4>
      <p> {{ howLongWillItTake() }} años en total</p>
    </b-card>
    <div
      v-for="(value,key) in episodes"
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
          <h4>Minutos Vistos: {{ sumYear(key) }} </h4>
          <h2>Promedio: {{ Math.trunc(averageYear(key)) }} minutos </h2>
          <h5>Capitulos Vistos : {{ countYear(key) }} </h5>
          <div
            v-for="(value1, key1) in value"
            :key="key1"
          >
            <div v-if="sumMonth(key,key1) ==0 ">
              <b-button
                v-b-toggle="'collapse' + key + key1"
                block
                variant="danger"
              >
                {{ key1 }}
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
                    <h4>Minutos Vistos: {{ sumMonth(key,key1) }} </h4>
                    <h5>Capitulos Vistos : {{ countMonth(key, key1) }} </h5>
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
                {{ key1 }}
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
                    <h4>Minutos Vistos: {{ sumMonth(key,key1) }} </h4>
                    <h5>Capitulos Vistos : {{ countMonth(key, key1) }} </h5>
                    <div
                      v-for="(value3) in value2"
                      :key="value3.id"
                    >
                      <EpisodeStatListItem
                        :episode="value3"
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
import EpisodeStatListItem from '@/components/series/statslistitem.vue'

export default {
  name: 'EpisodeStats',
  components: {
    EpisodeStatListItem
  },
  data () {
    return {
      episodes: {},
      sum: 0,
      count: 0,
      minDate: new Date(),
      countListened: 0,
      loading: false,
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    }
  },
  mounted () {
    this.loading = true
    if (this.isOnline) {
      axios.get('http://192.168.1.90:3000/api/episode')
        .then(response => {
          this.$offlineStorage.set('episodes', response.data.episodes)
          if (response.data.episodes.length) {
            let mindate = new Date()
            response.data.episodes.map((res) => {
              if (res['UserEpisode.consumedDate'] && new Date(res['UserEpisode.consumedDate']) < mindate) {
                mindate = new Date(res['UserEpisode.consumedDate'])
              }
            })
            this.createList(mindate)
          } else {
            this.createList()
          }
          this.sortByMonth(response.data.episodes)
          this.loading = false
        })
      axios.get('http://192.168.1.90:3000/api/series/towatch/sum')
        .then(response => {
          this.$offlineStorage.set('episodesToWatchSum', response.data.minutes)
          this.sum = response.data.minutes
        })
      axios.get('http://192.168.1.90:3000/api/series/towatch/count')
        .then(response => {
          this.$offlineStorage.set('episodesToWatchCount', response.data.count)
          this.count = response.data.count
        })
      axios.get('http://192.168.1.90:3000/api/series/watched/count')
        .then(response => {
          this.$offlineStorage.set('episodesWatchedCount', response.data.count)
          this.countListened = response.data.count
        })
    } else {
      if (this.$offlineStorage.get('episodes').length) {
        let mindate = new Date()
        this.$offlineStorage.get('episodes').map((res) => {
          if (res.UserGM.consumedDate && new Date(res.UserGM.consumedDate) < mindate) {
            mindate = new Date(res.UserGM.consumedDate)
          }
        })
        this.createList(mindate)
      } else {
        this.createList()
      }
      this.sortByMonth(this.$offlineStorage.get('episodes'))
      this.sum = this.$offlineStorage.get('episodesWatchedSum')
      this.count = this.$offlineStorage.get('episodesToWatchCount')
      this.countListened = this.$offlineStorage.get('episodesWatchedCount')
      this.loading = false
    }
  },
  methods: {
    deleteThisRow: function (index) {
      this.episodes.data.splice(index, 1)
    },
    putEpisodeInMonth: function (episode) {
      let month = (new Date(episode['UserEpisode.consumedDate'])).getMonth()
      let year = (new Date(episode['UserEpisode.consumedDate'])).getFullYear()
      this.episodes[year.toString()][this.months[month]]['episodes'].push(episode)
    },
    sortByMonth: function (episodes, object) {
      episodes.map(episode => this.putEpisodeInMonth(episode))
    },
    range: function (size, startAt = 0) {
      return [...Array(size).keys()].map(i => i + startAt)
    },
    createList: function (mindate = new Date()) {
      let list = { }
      let MinDate = new Date(mindate)
      let nowDate = new Date()
      this.range(nowDate.getFullYear() - MinDate.getFullYear() + 1, MinDate.getFullYear()).map(
        year => {
          list[year.toString()] = { }
          if (year === nowDate.getFullYear() && year === MinDate.getFullYear()) {
            this.range(nowDate.getMonth() - MinDate.getMonth() + 1, MinDate.getMonth()).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['episodes'] = []
              }
            )
          } else if (year === nowDate.getFullYear()) {
            this.range(nowDate.getMonth() + 1).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['episodes'] = []
              }
            )
          } else if (year === MinDate.getFullYear()) {
            this.range(12 - MinDate.getMonth(), MinDate.getMonth()).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['episodes'] = []
              }
            )
          } else {
            this.range(12, 0).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['episodes'] = []
              }
            )
          }
        }
      )
      this.episodes = list
    },
    sumMonth: function (year, month) {
      let sum = 0
      for (const key in Object.keys(this.episodes[year.toString()][month.toString()]['episodes'])) {
        sum += this.episodes[year.toString()][month.toString()]['episodes'][key]['Season.Series.durationOfEpisode']
      }
      return sum
    },
    countMonth: function (year, month) {
      let sum = Object.keys(this.episodes[year.toString()][month.toString()]['episodes']).length
      return sum
    },
    sumYear: function (year) {
      let result = 0
      const keys = Object.keys(this.episodes[year])
      for (const key of keys) {
        result = result + this.sumMonth(year, key)
      }
      return result
    },
    countYear: function (year) {
      let result = 0
      const keys = Object.keys(this.episodes[year])
      for (const key of keys) {
        result = result + this.countMonth(year, key)
      }
      return result
    },
    sumTotal: function () {
      let result = 0
      const keys = Object.keys(this.episodes)
      for (const key of keys) {
        result = result + this.sumYear(key)
      }
      return result
    },
    averageYear: function (year) {
      if (typeof this.episodes[year] === 'undefined') {
        return 0
      }
      const keys = Object.keys(this.episodes[year]).length
      if (keys === 0) {
        return 0
      }
      let total = this.sumYear(year)
      return (total / keys).toFixed(2)
    },
    averageTotal: function () {
      let result = 0
      const number = Object.keys(this.episodes).length
      if (number === 0) {
        return 0
      }
      const keys = Object.keys(this.episodes)
      for (const key of keys) {
        result = result + parseFloat(this.averageYear(key))
      }
      return (result / number).toFixed(2)
    },
    howLongWillItTake: function () {
      return ((this.sum / (parseFloat(this.averageTotal()))) / 12).toFixed(2)
    },
    parseDuration: function (duration) {
      let minutes = Math.trunc(duration / 60)
      let seconds = duration % 60
      if (minutes >= 60) {
        let hours = Math.trunc(minutes / 60)
        let minutes2 = minutes % 60
        if (minutes2 < 10) {
          minutes = hours.toString() + ':0' + minutes2.toString()
        } else {
          minutes = hours.toString() + ':' + minutes2.toString()
        }
      }
      if (seconds < 10) {
        return minutes.toString() + ':0' + seconds.toString()
      }
      return minutes.toString() + ':' + seconds.toString()
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
