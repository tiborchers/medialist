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
      <h5>VideoJuegos Por Jugar: {{ count }} </h5>
      <h6>VideoJuegos Jugados: {{ countPlayed }} </h6>
      <h3>Horas Por Jugar: {{ sum }} </h3>
      <h2>Horas Jugadas: {{ sumTotal() }} </h2>
      <h4>Promedio: {{ averageTotal() }} Horas al mes </h4>
      <p> {{ howLongWillItTake() }} años en total</p>
    </b-card>
    <div
      v-for="(value,key) in videoGames"
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
          <h4>Horas Jugadas: {{ sumYear(key) }} </h4>
          <h2>Promedio: {{ averageYear(key) }} </h2>
          <h5> Juegos jugados: {{ countYear(key) }} </h5>
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
                    <h4>Horas Jugadas: {{ sumMonth(key,key1) }} </h4>
                    <h5> Juegos jugados: {{ countMonth(key,key1) }} </h5>
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
                    <h4>Horas Jugadas: {{ sumMonth(key,key1) }} </h4>
                    <h5> Juegos jugados: {{ countMonth(key,key1) }} </h5>
                    <div
                      v-for="(value3) in value2"
                      :key="value3.id"
                    >
                      <SimpleVideoGameListItem
                        :video-game="value3"
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
import SimpleVideoGameListItem from '@/components/videogames/simplevideogamelistitem.vue'

export default {
  name: 'VideoGameStats',
  components: {
    SimpleVideoGameListItem
  },
  data () {
    return {
      videoGames: {},
      sum: 0,
      count: 0,
      countPlayed: 0,
      loading: false,
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    }
  },
  mounted () {
    this.loading = true
    if (this.isOnline) {
      axios.get('http://192.168.1.90:3000/api/videogames/played')
        .then(response => {
          this.$offlineStorage.set('videoGamesPlayed', response.data)
          if (response.data.length) {
            this.createList(response.data[0].UserGM.consumedDate)
          } else {
            this.createList()
          }
          this.sortByMonth(response.data)
          this.loading = false
        })
      axios.get('http://192.168.1.90:3000/api/videoGames/toplay/sum')
        .then(response => {
          this.$offlineStorage.set('videoGamesPlayedSum', response.data.videogames[0].total)
          this.sum = response.data.videogames[0].total
        })
      axios.get('http://192.168.1.90:3000/api/videoGames/toplay/count')
        .then(response => {
          this.$offlineStorage.set('videoGamesCount', response.data.count)
          this.count = response.data.count
        })
      axios.get('http://192.168.1.90:3000/api/videoGames/played/count')
        .then(response => {
          this.$offlineStorage.set('videoGamesPlayedCount', response.data.count)
          this.countPlayed = response.data.count
        })
    } else {
      if (this.$offlineStorage.get('videoGamesPlayed').length) {
        this.createList(this.$offlineStorage.get('videoGamesPlayed')[0].UserGM.consumedDate)
      } else {
        this.createList()
      }
      this.sortByMonth(this.$offlineStorage.get('videoGamesPlayed'))
      this.sum = this.$offlineStorage.get('videoGamesPlayedSum')
      this.count = this.$offlineStorage.get('videoGamesCount')
      this.countPlayed = this.$offlineStorage.get('videoGamesPlayedCount')
      this.loading = false
    }
  },
  methods: {
    putVideoGameInMonth: function (videoGame) {
      let month = (new Date(videoGame.UserGM.consumedDate)).getMonth()
      let year = (new Date(videoGame.UserGM.consumedDate)).getFullYear()
      this.videoGames[year.toString()][this.months[month]]['videoGames'].push(videoGame)
    },
    sortByMonth: function (videoGames, object) {
      videoGames.map(videoGame => this.putVideoGameInMonth(videoGame))
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
                list[year.toString()][this.months[month]]['videoGames'] = []
              }
            )
          } else if (year === nowDate.getFullYear()) {
            this.range(nowDate.getMonth() + 1).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['videoGames'] = []
              }
            )
          } else if (year === MinDate.getFullYear()) {
            this.range(12 - MinDate.getMonth(), MinDate.getMonth()).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['videoGames'] = []
              }
            )
          } else {
            this.range(12, 0).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['videoGames'] = []
              }
            )
          }
        }
      )
      this.videoGames = list
    },
    sumMonth: function (year, month) {
      let sum = 0
      for (const key in Object.keys(this.videoGames[year.toString()][month.toString()]['videoGames'])) {
        sum += this.videoGames[year.toString()][month.toString()]['videoGames'][key].VideoGame.HLTB
      }
      return sum
    },
    countMonth: function (year, month) {
      let sum = Object.keys(this.videoGames[year.toString()][month.toString()]['videoGames']).length
      return sum
    },
    sumYear: function (year) {
      let result = 0
      const keys = Object.keys(this.videoGames[year])
      for (const key of keys) {
        result = result + this.sumMonth(year, key)
      }
      return result
    },
    countYear: function (year) {
      let result = 0
      const keys = Object.keys(this.videoGames[year])
      for (const key of keys) {
        result = result + this.countMonth(year, key)
      }
      return result
    },
    sumTotal: function () {
      let result = 0
      const keys = Object.keys(this.videoGames)
      for (const key of keys) {
        result = result + this.sumYear(key)
      }
      return result
    },
    averageYear: function (year) {
      if (typeof this.videoGames[year] === 'undefined') {
        return 0
      }
      const keys = Object.keys(this.videoGames[year]).length
      if (keys === 0) {
        return 0
      }
      let total = this.sumYear(year)
      return (total / keys).toFixed(2)
    },
    averageTotal: function () {
      let result = 0
      const number = Object.keys(this.videoGames).length
      if (number === 0) {
        return 0
      }
      const keys = Object.keys(this.videoGames)
      for (const key of keys) {
        result = result + parseFloat(this.averageYear(key))
      }
      return (result / number).toFixed(2)
    },
    howLongWillItTake: function () {
      return ((this.sum / (parseFloat(this.averageTotal()))) / 12).toFixed(2)
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
