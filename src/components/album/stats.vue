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
      <h5>Discos Por escuchar: {{ count }} </h5>
      <h6>Discos escuchados: {{ countListened }} </h6>
      <h3>Tiempo Por Escuchar: {{ parseDuration(sum) }} </h3>
      <h2>Tiempo Escuchado: {{ parseDuration(sumTotal()) }} </h2>
      <h4>Promedio: {{ Math.trunc(averageTotal() /60) }} minutos al mes </h4>
      <p> {{ howLongWillItTake() }} años en total</p>
    </b-card>
    <div
      v-for="(value,key) in albums"
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
          <h4>Tiempo Escuchado: {{ parseDuration(sumYear(key)) }} </h4>
          <h2>Promedio: {{ Math.trunc(averageYear(key)/60) }} minutos </h2>
          <h5>Discos escuchados : {{ countYear(key) }} </h5>
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
                    <h4>Tiempo Escuchado: {{ parseDuration(sumMonth(key,key1)) }} </h4>
                    <h5>Discos escuchados : {{ countMonth(key, key1) }} </h5>
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
                    <h4>Tiempo Escuchado: {{ parseDuration(sumMonth(key,key1)) }} </h4>
                    <h5>Discos escuchados : {{ countMonth(key, key1) }} </h5>
                    <div
                      v-for="(value3) in value2"
                      :key="value3.id"
                    >
                      <SimpleAlbumListItem
                        :album="value3"
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
import SimpleAlbumListItem from '@/components/album/simplealbumlistitem.vue'

export default {
  name: 'AlbumStats',
  components: {
    SimpleAlbumListItem
  },
  data () {
    return {
      albums: {},
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
      axios.get('http://192.168.1.90:3000/api/albums/listened')
        .then(response => {
          this.$offlineStorage.set('albumsListened', response.data)
          if (response.data.length) {
            this.createList(response.data[0].UserGM.consumedDate)
          } else {
            this.createList()
          }
          this.sortByMonth(response.data)
          this.loading = false
        })
      axios.get('http://192.168.1.90:3000/api/albums/tolisten/sum')
        .then(response => {
          this.$offlineStorage.set('albumsListenedSum', response.data.albums[0].total)
          this.sum = response.data.albums[0].total
        })
      axios.get('http://192.168.1.90:3000/api/albums/tolisten/count')
        .then(response => {
          this.$offlineStorage.set('albumsToListenCount', response.data.count)
          this.count = response.data.count
        })
      axios.get('http://192.168.1.90:3000/api/albums/listened/count')
        .then(response => {
          this.$offlineStorage.set('albumsListenedCount', response.data.count)
          this.countListened = response.data.count
        })
    } else {
      if (this.$offlineStorage.get('albumsListened').length) {
        this.createList(this.$offlineStorage.get('albumsListened')[0].UserGM.consumedDate)
      } else {
        this.createList()
      }
      this.sortByMonth(this.$offlineStorage.get('albumsListened'))
      this.sum = this.$offlineStorage.get('albumsListenedSum')
      this.count = this.$offlineStorage.get('albumsToListenCount')
      this.countListened = this.$offlineStorage.get('albumsListenedCount')
      this.loading = false
    }
  },
  methods: {
    deleteThisRow: function (index) {
      this.albums.data.splice(index, 1)
    },
    putAlbumInMonth: function (album) {
      let month = (new Date(album.UserGM.consumedDate)).getMonth()
      let year = (new Date(album.UserGM.consumedDate)).getFullYear()
      this.albums[year.toString()][this.months[month]]['albums'].push(album)
    },
    sortByMonth: function (albums, object) {
      albums.map(album => this.putAlbumInMonth(album))
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
                list[year.toString()][this.months[month]]['albums'] = []
              }
            )
          } else if (year === nowDate.getFullYear()) {
            this.range(nowDate.getMonth() + 1).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['albums'] = []
              }
            )
          } else if (year === MinDate.getFullYear()) {
            this.range(12 - MinDate.getMonth(), MinDate.getMonth()).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['albums'] = []
              }
            )
          } else {
            this.range(12, 0).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['albums'] = []
              }
            )
          }
        }
      )
      this.albums = list
    },
    sumMonth: function (year, month) {
      let sum = 0
      for (const key in Object.keys(this.albums[year.toString()][month.toString()]['albums'])) {
        sum += this.albums[year.toString()][month.toString()]['albums'][key].Album.duration
      }
      return sum
    },
    countMonth: function (year, month) {
      let sum = Object.keys(this.albums[year.toString()][month.toString()]['albums']).length
      return sum
    },
    sumYear: function (year) {
      let result = 0
      const keys = Object.keys(this.albums[year])
      for (const key of keys) {
        result = result + this.sumMonth(year, key)
      }
      return result
    },
    countYear: function (year) {
      let result = 0
      const keys = Object.keys(this.albums[year])
      for (const key of keys) {
        result = result + this.countMonth(year, key)
      }
      return result
    },
    sumTotal: function () {
      let result = 0
      const keys = Object.keys(this.albums)
      for (const key of keys) {
        result = result + this.sumYear(key)
      }
      return result
    },
    averageYear: function (year) {
      if (typeof this.albums[year] === 'undefined') {
        return 0
      }
      const keys = Object.keys(this.albums[year]).length
      if (keys === 0) {
        return 0
      }
      let total = this.sumYear(year)
      return (total / keys).toFixed(2)
    },
    averageTotal: function () {
      let result = 0
      const number = Object.keys(this.albums).length
      if (number === 0) {
        return 0
      }
      const keys = Object.keys(this.albums)
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
