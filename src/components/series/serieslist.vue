<template>
  <div class="main">
    <div v-if="isOnline">
      <div v-if="error != ''">
        <b-card
          :title="error"
          bg-variant="danger"
          text-variant="white"
        />
      </div>
      <div class="creation">
        <b-form-input
          v-model="url"
          type="url"
          placeholder="Ingrese URL de IMDB o MyAnimeList"
          @keyup.enter.native="createSeries()"
        />
        <b-button
          v-if="loading"
          variant="info"
          disabled
          @click="createSeries()"
        >
          Agregar Series
        </b-button>
        <b-button
          v-else
          variant="info"
          @click="createSeries()"
        >
          Agregar Series
        </b-button>
      </div>
    </div>
    <div class="filters">
      <b-button
        v-b-toggle.collapse-1
        block
        variant="info"
      >
        Filtros
      </b-button>
      <b-collapse
        id="collapse-1"
        class="mt-2"
      >
        <b-card bg-variant="dark">
          <b-form>
            <b-form-group
              id="input-group-1"
              label="Por Titulo:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterText"
                placeholder="Nombre de la serie"
              />
            </b-form-group>
            <b-form-group
              id="input-group-1"
              label="Por Año de inicio:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterYear.low"
                type="number"
                placeholder="1900"
                min="1880"
              />
              <b-form-input
                v-model="filterYear.high"
                type="number"
                min="1880"
                placeholder="2019"
              />
            </b-form-group>
            <b-form-group
              id="input-group-1"
              label="Por Nota:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterRating.low"
                type="number"
                placeholder="0"
                min="0.0"
                max="10.0"
                step="0.1"
              />
              <b-form-input
                v-model="filterRating.high"
                type="number"
                placeholder="10"
                min="0.0"
                max="10.0"
                step="0.1"
              />
            </b-form-group>
            <b-form-group
              id="input-group-1"
              label="Por Genero:"
              label-class="text-white"
            >
              <b-form-select
                v-model="filterGenres"
                :options="genresOptions"
                multiple
                :select-size="4"
              />
            </b-form-group>
            <b-button
              pill
              class="button-filter"
              variant="danger"
              @click="resetFilters()"
            >
              Reset
            </b-button>
            <b-button
              pill
              class="button-filter"
              variant="info"
              @click="filterAll()"
            >
              Filtrar
            </b-button>
            <b-button
              pill
              class="button-filter"
              variant="warning"
              @click="getRandom()"
            >
              Get Random
            </b-button>
          </b-form>
        </b-card>
      </b-collapse>
    </div>
    <div>
      <b-button
        variant="warning"
        @click="sortbyTitle()"
      >
        Name ▲
      </b-button>
      <b-button
        variant="warning"
        @click="sortbyYear()"
      >
        Year ▲
      </b-button>
      <b-button
        variant="warning"
        @click="sortbyRating()"
      >
        Rating ▲
      </b-button>
    </div>
    <div>
      <b-button
        variant="secondary"
        @click="rsortbyTitle()"
      >
        Name ▼
      </b-button>
      <b-button
        variant="secondary"
        @click="rsortbyYear()"
      >
        Year ▼
      </b-button>
      <b-button
        variant="secondary"
        @click="rsortbyRating()"
      >
        Rating ▼
      </b-button>
    </div>
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
    <div v-if="isOnline">
      <div
        v-for="(seriess, index) in seriesPage"
        :key="seriess.id.toString()"
      >
        <SeriesListItem
          :series="seriess"
          @delete-row="deleteThisRow(index)"
          @modified="reloadRow(index, seriess.id)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(seriess) in seriesPage"
        :key="seriess.id.toString()"
      >
        <SimpleSeriesListItem
          :series="seriess"
        />
      </div>
    </div>
    <div v-if="!loading">
      <infinite-loading
        :identifier="infiniteId"
        @infinite="infinitehandler"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SimpleSeriesListItem from './simpleserieslistitem.vue'
import SeriesListItem from './serieslistitemtest.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'SeriesList',
  components: {
    SeriesListItem,
    SimpleSeriesListItem,
    InfiniteLoading
  },
  props: { mode: { type: String, default: 'To watch' } },
  data () {
    return {
      series: [],
      allSeries: [],
      allGenres: [],
      genresOptions: [],
      seriesPage: [],
      done: false,
      pageSize: 5,
      pagesNumber: 2,
      infiniteId: 0,
      url: '',
      error: '',
      loading: false,
      filterText: '',
      filterArtist: '',
      filterYear: {
        'low': null,
        'high': null,
        'exact': null
      },
      filterRating: {
        'low': null,
        'high': null,
        'exact': null
      },
      filterHLTB: {
        'low': null,
        'high': null,
        'exact': null
      },
      filterGenres: []
    }
  },

  mounted () {
    this.init()
    this.getGenres()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.series = []
      vm.seriesPage = []
      vm.init()
      vm.getGenres()
      vm.identifierId += 1
    })
  },
  methods: {
    init: function () {
      this.loading = true
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/series/' + this.mode)
          .then(response => {
            this.loading = false
            this.series = response.data
            this.allSeries = this.series
            this.$offlineStorage.set('seriesToWatch', response.data)
            this.initPages()
          })
          .catch(() => {
            this.loading = false
            this.series = this.$offlineStorage.get('seriesToWatch')
            this.allSeries = this.series
            this.initPages()
          })
      } else {
        this.loading = false
        this.series = this.$offlineStorage.get('seriesToWatch')
        this.allSeries = this.series
        this.initPages()
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/series')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('seriesGenres', response.data.genres)
          })
      } else {
        this.allGenres = this.$offlineStorage.get('seriesGenres')
        this.genresOptions = this.genresToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
    },
    deleteThisRow: function (index) {
      this.seriesPage.splice(index, 1)
    },
    compareByName: function (a, b) {
      const genreA = a.title.toUpperCase()
      const genreB = b.title.toUpperCase()

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByYear: function (a, b) {
      const genreA = a.initialYear
      const genreB = b.initialYear

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByHLTB: function (a, b) {
      const genreA = a.Album.duration
      const genreB = b.Album.duration

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByRating: function (a, b) {
      const genreA = a.rating
      const genreB = b.rating

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByArtist: function (a, b) {
      const genreA = a.Album.artist.toUpperCase()
      const genreB = b.Album.artist.toUpperCase()

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    sortbyTitle: function () {
      this.series = this.series.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.series = this.series.sort(this.compareByYear)
      this.initPages()
    },
    sortbyHLTB: function () {
      this.series = this.series.sort(this.compareByHLTB)
      this.initPages()
    },
    sortbyRating: function () {
      this.series = this.series.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.series = this.series.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.series = this.series.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyHLTB: function () {
      this.series = this.series.sort(this.compareByHLTB).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.series = this.series.sort(this.compareByRating).reverse()
      this.initPages()
    },
    sortbyArtist: function () {
      this.series = this.series.sort(this.compareByArtist)
      this.initPages()
    },
    rsortbyArtist: function () {
      this.series = this.series.sort(this.compareByArtist).reverse()
      this.initPages()
    },
    createSeries: function () {
      this.loading = true
      axios.post('http://192.168.1.90:3000/api/series/url', { 'url': this.url })
        .then(response => {
          this.url = ''
          this.error = ''
          this.loading = false
          this.init()
        })
        .catch(error => {
          this.loading = false
          this.error = error.response.data.message
        })
    },
    reloadRow: function (index, id) {
      axios.get('http://192.168.1.90:3000/api/series/' + id)
        .then(response => {
          let indexs = this.series.findIndex(x => x.id === id)
          let hey = this.series[indexs]['UserSerie']
          this.series[indexs] = response.data.series
          this.series[indexs]['UserSerie'] = hey
          this.seriesPage = this.series.slice(0, this.pageSize * (this.pagesNumber - 1))
          this.done = false
        })
        .catch(error => { this.error = error.response.data.message })
    },
    filterbyText: function () {
      let ver = this.series.map(series => {
        if (series.title.toLowerCase().includes(this.filterText.toLowerCase())) {
          return series
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.series = ver
    },
    filterbyArtist: function () {
      let ver = this.albums.map(album => {
        if (album.Album.artist.toLowerCase().includes(this.filterArtist.toLowerCase())) {
          return album
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.albums = ver
    },
    filterbyYear: function () {
      if (this.filterYear.exact) {
        let ver = this.series.map(series => {
          if (series.initialYear === this.filterYear.exact) {
            return series.initialYear
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.series = ver
      } else {
        let ver = this.series
        if (this.filterYear.low) {
          ver = ver.map(series => {
            if (series.initialYear >= this.filterYear.low) {
              return series
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(series => {
            if (series.initialYear <= this.filterYear.high) {
              return series
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.series = ver
      }
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.series.map(series => {
          if (series.rating === this.filterRating.exact) {
            return series
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.series = ver
      } else {
        let ver = this.series
        if (this.filterRating.low) {
          ver = ver.map(series => {
            if (series.rating >= this.filterRating.low) {
              return series
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(series => {
            if (series.rating <= this.filterRating.high) {
              return series
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.series = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.series.map(series => {
        if (this.filterGenres.every(
          genre => {
            return series.Genres.some(
              genre2 => {
                return genre2.name === genre
              }
            )
          }
        )) {
          return series
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.series = ver
    },
    filterAll: function () {
      this.series = this.allSeries
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.initPages()
    },
    getRandom: function () {
      this.series = this.allSeries
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.series = [this.series[Math.floor(Math.random() * this.series.length)]]
      this.initPages()
    },
    resetFilters: function () {
      this.filterText = ''
      this.filterArtist = ''
      this.filterYear = {
        'low': null,
        'high': null,
        'exact': null
      }
      this.filterRating = {
        'low': null,
        'high': null,
        'exact': null
      }
      this.filterHLTB = {
        'low': null,
        'high': null,
        'exact': null
      }
      this.filterGenres = []
      this.series = this.allSeries
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      let auxiliar = this.series.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
      this.seriesPage = auxiliar
      this.infiniteId += 1
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
    },
    reloadPages: function (pagesNumber) {
      this.pagination(pagesNumber - 1)
    },
    infinitehandler: function ($state) {
      let length = this.seriesPage.length
      this.seriesPage = this.seriesPage.concat(this.series.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.seriesPage.length === length) {
        this.done = true
        $state.complete()
      } else {
        $state.loaded()
      }
    }
  }
}
</script>

<style scoped>

.main {
  padding-top: 5rem;
}

.creation{
  margin: 2rem;
}

.spinner{
  margin: 2rem;
}

.b-spinner{
  width: 10rem;
  height: 10rem;
}

.filters{
  margin: 2rem;
}

.button-filter{
  margin-left: 0.6rem;
}

</style>
