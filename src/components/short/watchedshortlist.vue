<template>
  <div class="main">
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
                placeholder="Nombre del corto"
              />
            </b-form-group>
            <b-form-group
              id="input-group-1"
              label="Por Año:"
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
              label="Por Duracion:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterDuration.low"
                type="number"
                placeholder="0"
                min="0.0"
                max="600.0"
              />
              <b-form-input
                v-model="filterDuration.high"
                type="number"
                placeholder="90"
                min="0.0"
                max="600.0"
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
              class="button-filter"
              variant="danger"
              @click="resetFilters()"
            >
              Reset
            </b-button>
            <b-button
              class="button-filter"
              variant="info"
              @click="filterAll()"
            >
              Filtrar
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
        @click="sortbyDuration()"
      >
        Duration ▲
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
        @click="rsortbyDuration()"
      >
        Duration ▼
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
        v-for="(short, index) in shorts"
        :key="short.id.toString()"
      >
        <WatchedShortListItem
          :short="short"
          @delete-row="deleteThisRow(index)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(short, index) in shorts"
        :key="short.id.toString()"
      >
        <SimpleShortListItem
          :short="short"
          @delete-row="deleteThisRow(index)"
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
import WatchedShortListItem from './watchedshortlistitem.vue'
import SimpleShortListItem from './simpleshortlistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'WatchedShortList',
  components: {
    WatchedShortListItem,
    SimpleShortListItem,
    InfiniteLoading
  },
  data () {
    return {
      shorts: [],
      allShorts: [],
      infiniteId: 0,
      loading: false,
      shortPage: [],
      done: false,
      pageSize: 50,
      pagesNumber: 2,
      filterText: '',
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
      filterDuration: {
        'low': null,
        'high': null,
        'exact': null
      },
      filterGenres: [],
      genresOptions: []
    }
  },

  mounted () {
    this.loading = true
    if (this.isOnline) {
      axios.get('http://192.168.1.90:3000/api/shorts/watched')
        .then(response => {
          this.loading = false
          this.shorts = response.data
          this.allShorts = this.shorts
          this.$offlineStorage.set('shortsWatched', response.data)
          this.initPages()
        })
    } else {
      this.loading = false
      this.shorts = this.$offlineStorage.get('shortsWatched')
      this.allShorts = this.shorts
      this.initPages()
    }
    this.getGenres()
    this.scroll()
  },
  methods: {
    deleteThisRow: function (index) {
      this.shortsPage.splice(index, 1)
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/shorts')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('shortsGenres', response.data.genres)
          })
      } else {
        this.allGenres = this.$offlineStorage.get('shortsGenres')
        this.genresOptions = this.genresToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
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
      const genreA = a.year
      const genreB = b.year

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByDuration: function (a, b) {
      const genreA = a.Short.duration
      const genreB = b.Short.duration

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByRating: function (a, b) {
      const genreA = a.Short.rating
      const genreB = b.Short.rating

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    sortbyTitle: function () {
      this.shorts = this.shorts.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.shorts = this.shorts.sort(this.compareByYear)
      this.initPages()
    },
    sortbyDuration: function () {
      this.shorts = this.shorts.sort(this.compareByDuration)
      this.initPages()
    },
    sortbyRating: function () {
      this.shorts = this.shorts.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.shorts = this.shorts.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.shorts = this.shorts.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyDuration: function () {
      this.shorts = this.shorts.sort(this.compareByDuration).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.shorts = this.shorts.sort(this.compareByRating).reverse()
      this.initPages()
    },
    filterbyText: function () {
      let ver = this.shorts.map(short => {
        if (short.title.toLowerCase().includes(this.filterText.toLowerCase())) {
          return short
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.shorts = ver
    },
    filterbyYear: function () {
      if (this.filterYear.exact) {
        let ver = this.shorts.map(short => {
          if (short.year === this.filterYear.exact) {
            return short
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.shorts = ver
      } else {
        let ver = this.shorts
        if (this.filterYear.low) {
          ver = ver.map(short => {
            if (short.year >= this.filterYear.low) {
              return short
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(short => {
            if (short.year <= this.filterYear.high) {
              return short
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.shorts = ver
      }
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.shorts.map(short => {
          if (short.Short.rating === this.filterRating.exact) {
            return short
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.shorts = ver
      } else {
        let ver = this.shorts
        if (this.filterRating.low) {
          ver = ver.map(short => {
            if (short.Short.rating >= this.filterRating.low) {
              return short
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(short => {
            if (short.Short.rating <= this.filterRating.high) {
              return short
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.shorts = ver
      }
    },
    filterbyDuration: function () {
      if (this.filterDuration.exact) {
        let ver = this.shorts.map(short => {
          if (short.Short.duration === this.filterDuration.exact) {
            return short
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.shorts = ver
      } else {
        let ver = this.shorts
        if (this.filterDuration.low) {
          ver = ver.map(short => {
            if (short.Short.duration >= this.filterDuration.low) {
              return short
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterDuration.high) {
          ver = ver.map(short => {
            if (short.Short.duration <= this.filterDuration.high) {
              return short
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.shorts = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.shorts.map(short => {
        if (this.filterGenres.every(
          genre => {
            return short.Genres.some(
              genre2 => { return genre2.name === genre }
            )
          }
        )) {
          return short
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.shorts = ver
    },
    filterAll: function () {
      this.shorts = this.allShorts
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyDuration()
      this.initPages()
    },
    resetFilters: function () {
      this.filterText = ''
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
      this.filterDuration = {
        'low': null,
        'high': null,
        'exact': null
      }
      this.filterGenres = []
      this.shorts = this.allShorts
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      this.shortPage = this.shorts.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
      this.infiniteId += 1
    },
    infinitehandler: function ($state) {
      let length = this.shortPage.length
      this.shortPage = this.shortPage.concat(this.shorts.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.shortPage.length === length) {
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

.filters{
  margin: 2rem;
}

.spinner{
  margin: 2rem;
}

.b-spinner{
  width: 10rem;
  height: 10rem;
}

.main {
  padding-top: 5rem;
}

.button-filter{
  margin-left: 0.6rem;
}

</style>
