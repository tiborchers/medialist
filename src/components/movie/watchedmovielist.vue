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
                placeholder="Nombre de Pelicula"
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
        v-for="(movie, index) in movies"
        :key="movie.id.toString()"
      >
        <WatchedMovieListItem
          :movie="movie"
          @delete-row="deleteThisRow(index)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(movie, index) in movies"
        :key="movie.id.toString()"
      >
        <SimpleMovieListItem
          :movie="movie"
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
import WatchedMovieListItem from './watchedmovielistitem.vue'
import SimpleMovieListItem from './simplemovielistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'WatchedMovieList',
  components: {
    WatchedMovieListItem,
    SimpleMovieListItem,
    InfiniteLoading
  },
  data () {
    return {
      movies: [],
      allMovies: [],
      moviesPage: [],
      infiniteId: 0,
      pageSize: 50,
      pages: 1,
      pagesNumber: 2,
      done: false,
      loading: false,
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
      axios.get('http://192.168.1.90:3000/api/movies/watched')
        .then(response => {
          this.loading = false
          this.movies = response.data
          this.allMovies = this.movies
          this.$offlineStorage.set('moviesWatched', response.data)
          this.initPages()
        })
        .catch((error) => {
          this.error = error || error.response.data.message
          this.loading = false
          this.movies = this.$offlineStorage.get('moviesWatched')
          this.allMovies = this.movies
          this.initPages()
        })
    } else {
      this.loading = false
      this.movies = this.$offlineStorage.get('moviesWatched')
      this.allMovies = this.movies
      this.initPages()
    }
    this.getGenres()
  },
  methods: {
    deleteThisRow: function (index) {
      this.moviesPage.splice(index, 1)
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/movies')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('moviesGenres', response.data)
          })
          .catch((error) => {
            this.error = error
            this.allGenres = this.$offlineStorage.get('moviesGenres')
            this.genresOptions = this.genresToOptions()
          })
      } else {
        this.allGenres = this.$offlineStorage.get('moviesGenres')
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
      const genreA = a.Movie.duration
      const genreB = b.Movie.duration

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByRating: function (a, b) {
      const genreA = a.Movie.rating
      const genreB = b.Movie.rating

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    sortbyTitle: function () {
      this.movies.data = this.movies.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.movies.data = this.movies.sort(this.compareByYear)
      this.initPages()
    },
    sortbyDuration: function () {
      this.movies.data = this.movies.sort(this.compareByDuration)
      this.initPages()
    },
    sortbyRating: function () {
      this.movies.data = this.movies.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.movies.data = this.movies.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.movies.data = this.movies.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyDuration: function () {
      this.movies.data = this.movies.sort(this.compareByDuration).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.movies.data = this.movies.sort(this.compareByRating).reverse()
      this.initPages()
    },
    filterbyText: function () {
      let ver = this.movies.map(movie => {
        if (movie.title.toLowerCase().includes(this.filterText.toLowerCase())) {
          return movie
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.movies = ver
    },
    filterbyYear: function () {
      if (this.filterYear.exact) {
        let ver = this.movies.map(movie => {
          if (movie.year === this.filterYear.exact) {
            return movie
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.movies = ver
      } else {
        let ver = this.movies
        if (this.filterYear.low) {
          ver = ver.map(movie => {
            if (movie.year >= this.filterYear.low) {
              return movie
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(movie => {
            if (movie.year <= this.filterYear.high) {
              return movie
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.movies = ver
      }
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.movies.map(movie => {
          if (movie.Movie.rating === this.filterRating.exact) {
            return movie
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.movies = ver
      } else {
        let ver = this.movies
        if (this.filterRating.low) {
          ver = ver.map(movie => {
            if (movie.Movie.rating >= this.filterRating.low) {
              return movie
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(movie => {
            if (movie.Movie.rating <= this.filterRating.high) {
              return movie
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.movies = ver
      }
    },
    filterbyDuration: function () {
      if (this.filterDuration.exact) {
        let ver = this.movies.map(movie => {
          if (movie.Movie.duration === this.filterDuration.exact) {
            return movie
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.movies = ver
      } else {
        let ver = this.movies
        if (this.filterDuration.low) {
          ver = ver.map(movie => {
            if (movie.Movie.duration >= this.filterDuration.low) {
              return movie
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterDuration.high) {
          ver = ver.map(movie => {
            if (movie.Movie.duration <= this.filterDuration.high) {
              return movie
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.movies = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.movies.map(movie => {
        if (this.filterGenres.every(
          genre => {
            return movie.Genres.some(
              genre2 => { return genre2.name === genre }
            )
          }
        )) {
          return movie
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.movies = ver
    },
    filterAll: function () {
      this.movies = this.allMovies
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
      this.movies = this.allMovies
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      this.moviesPage = this.movies.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
      this.infiniteId += 1
    },
    infinitehandler: function ($state) {
      let length = this.moviesPage.length
      this.moviesPage = this.moviesPage.concat(this.movies.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.moviesPage.length === length) {
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

.numPages{
  margin: 2rem auto;
  width: 70%;
  color: #61676c;
}

.button-filter{
  margin-left: 0.6rem;
}

</style>
