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
      <div class="search">
        <b-form-input
          v-model="search"
          placeholder="Busqueda"
          @input="searchMovies()"
        />
        <div
          v-for="(result, index) in results"
          :key="index"
        >
          <SearchMovieListItem
            :movie="result"
            @add="createMovieS"
          />
        </div>
      </div>
      <div class="creation">
        <b-form-input
          v-model="url"
          type="url"
          placeholder="Ingrese URL de IMDB"
          @keyup.enter.native="createMovie()"
        />
        <b-button
          v-if="loading"
          disabled
          variant="info"
          @click="createMovie()"
        >
          Agregar Película
        </b-button>
        <b-button
          v-else
          variant="info"
          @click="createMovie()"
        >
          Agregar Película
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
            <b-button
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
      <transition-group
        name="moviesGroup"
        tag="div"
      >
        <div
          v-for="(movie, index) in moviesPage"
          :key="movie.id.toString()"
        >
          <MovieListItem
            :movie="movie"
            @delete-row="deleteThisRow(index)"
          />
        </div>
      </transition-group>
    </div>
    <div v-else>
      <div
        v-for="(movie, index) in moviesPage"
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
import SimpleMovieListItem from './simplemovielistitem.vue'
import SearchMovieListItem from './searchmovielistitem.vue'
import MovieListItem from './movielistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'MovieList',
  components: {
    MovieListItem,
    SimpleMovieListItem,
    SearchMovieListItem,
    InfiniteLoading
  },
  data () {
    return {
      movies: [],
      allMovies: [],
      allGenres: [],
      moviesPage: [],
      done: false,
      pageSize: 50,
      pagesNumber: 2,
      genresOptions: [],
      url: '',
      infiniteId: 0,
      error: '',
      search: '',
      results: [],
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
      filterGenres: []
    }
  },

  mounted () {
    this.init()
    this.getGenres()
  },
  methods: {
    init: function () {
      this.loading = true
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/movies/towatch')
          .then(response => {
            this.loading = false
            this.movies = response.data
            this.allMovies = this.movies
            this.$offlineStorage.set('moviesToWatch', response.data)
            this.initPages()
          })
          .catch((error) => {
            this.error = error
            this.loading = false
            this.movies = this.$offlineStorage.get('moviesToWatch')
            this.allMovies = this.movies
            this.initPages()
          })
      } else {
        this.loading = false
        this.movies = this.$offlineStorage.get('moviesToWatch')
        this.allMovies = this.movies
        this.initPages()
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/movies')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('moviesGenres', response.data.genres)
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
    deleteThisRow: function (index) {
      this.moviesPage.splice(index, 1)
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
      this.movies = this.movies.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.movies = this.movies.sort(this.compareByYear)
      this.initPages()
    },
    sortbyDuration: function () {
      this.movies = this.movies.sort(this.compareByDuration)
      this.initPages()
    },
    sortbyRating: function () {
      this.movies = this.movies.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.movies = this.movies.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.movies = this.movies.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyDuration: function () {
      this.movies = this.movies.sort(this.compareByDuration).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.movies = this.movies.sort(this.compareByRating).reverse()
      this.initPages()
    },
    createMovie: function () {
      this.loading = true
      axios.post('http://192.168.1.90:3000/api/movies/url', { 'url': this.url })
        .then(response => {
          this.url = ''
          this.error = ''
          this.results = []
          this.init()
          this.loading = false
        })
        .catch(error => {
          this.loading = false
          this.error = error.response.data.message
        })
    },
    createMovieS: function (url) {
      this.loading = true
      axios.post('http://192.168.1.90:3000/api/movies/url', { 'url': url })
        .then(response => {
          this.url = ''
          this.error = ''
          this.search = ''
          this.results = []
          this.loading = false
          this.init()
        })
        .catch(error => {
          this.loading = false
          this.error = error.response.data.message
        })
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
    getRandom: function () {
      this.movies = this.allMovies
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyDuration()
      this.movies = [this.movies[Math.floor(Math.random() * this.movies.length)]]
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
    },
    searchMovies: function (evt) {
      axios.get('http://www.omdbapi.com/?s=' + this.search + '&apikey=3f811ce1&type=movie')
        .then((response) => { this.results = response.data.Search })
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

.moviesGroup-active {
  transition: all .3s ease;
}

.moviesGroup-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.moviesGroup-enter, .moviesGroup-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
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
