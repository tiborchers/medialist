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
          placeholder="Ingrese URL de HLTB"
          @keyup.enter.native="createVideoGame()"
        />
        <b-button
          v-if="loading"
          variant="info"
          disabled
          @click="createVideoGame()"
        >
          Agregar Video Juego
        </b-button>
        <b-button
          v-else
          variant="info"
          @click="createVideoGame()"
        >
          Agregar Video Juego
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
                placeholder="Nombre del juego"
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
                v-model="filterHLTB.low"
                type="number"
                placeholder="0"
                min="0.0"
                max="600.0"
              />
              <b-form-input
                v-model="filterHLTB.high"
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
            <b-form-group
              id="input-group-1"
              label="Por Consola:"
              label-class="text-white"
            >
              <b-form-select
                v-model="filterConsole"
                :options="consolesOptions"
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
        @click="sortbyHLTB()"
      >
        HLTB ▲
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
        @click="rsortbyHLTB()"
      >
        HLTB ▼
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
        v-for="(videoGame, index) in videoGamePage"
        :key="videoGame.id.toString()"
      >
        <VideoGameListItem
          :video-game="videoGame"
          @delete-row="deleteThisRow(index)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(videoGame, index) in videoGamePage"
        :key="videoGame.id.toString()"
      >
        <SimpleVideoGameListItem
          :video-game="videoGame"
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
import VideoGameListItem from './videogamelistitem.vue'
import SimpleVideoGameListItem from './simplevideogamelistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'VideoGameList',
  components: {
    VideoGameListItem,
    SimpleVideoGameListItem,
    InfiniteLoading
  },
  data () {
    return {
      videoGames: [],
      allVideoGames: [],
      allGenres: [],
      allConsoles: [],
      genresOptions: [],
      consolesOptions: [],
      videoGamePage: [],
      done: false,
      infiniteId: 0,
      pageSize: 50,
      pagesNumber: 2,
      url: '',
      error: '',
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
      filterHLTB: {
        'low': null,
        'high': null,
        'exact': null
      },
      filterGenres: [],
      filterConsole: null
    }
  },

  mounted () {
    this.init()
    this.getGenres()
    this.getConsoles()
  },
  methods: {
    init: function () {
      this.loading = true
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/videogames/toplay')
          .then(response => {
            this.loading = false
            this.videoGames = response.data
            this.allVideoGames = this.videoGames
            this.$offlineStorage.set('videoGamesToPlay', response.data)
            this.initPages()
          })
          .catch(() => {
            this.loading = false
            this.videoGames = this.$offlineStorage.get('videoGamesToPlay')
            this.allVideoGames = this.videoGames
            this.initPages()
          })
      } else {
        this.loading = false
        this.videoGames = this.$offlineStorage.get('videoGamesToPlay')
        this.allVideoGames = this.videoGames
        this.initPages()
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/videogames')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('videoGamesGenres', response.data.genres)
          })
      } else {
        this.allGenres = this.$offlineStorage.get('videoGamesGenres')
        this.genresOptions = this.genresToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
    },
    getConsoles: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/consoles')
          .then(response => {
            this.allConsoles = response.data.consoles
            this.consolesOptions = this.consolesToOptions()
            this.$offlineStorage.set('consoles', response.data.consoles)
          })
      } else {
        this.allConsoles = this.$offlineStorage.get('consoles')
        this.consolesOptions = this.consolesToOptions()
      }
    },
    consolesToOptions: function () {
      return this.allConsoles.map(aConsole => {
        return { 'value': aConsole.name, 'text': aConsole.name }
      })
    },
    deleteThisRow: function (index) {
      this.videoGamePage.splice(index, 1)
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
    compareByHLTB: function (a, b) {
      const genreA = a.VideoGame.HLTB
      const genreB = b.VideoGame.HLTB

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByRating: function (a, b) {
      const genreA = a.VideoGame.rating
      const genreB = b.VideoGame.rating

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    sortbyTitle: function () {
      this.videoGames = this.videoGames.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.videoGames = this.videoGames.sort(this.compareByYear)
      this.initPages()
    },
    sortbyHLTB: function () {
      this.videoGames = this.videoGames.sort(this.compareByHLTB)
      this.initPages()
    },
    sortbyRating: function () {
      this.videoGames = this.videoGames.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.videoGames = this.videoGames.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.videoGames = this.videoGames.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyHLTB: function () {
      this.videoGames = this.videoGames.sort(this.compareByHLTB).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.videoGames = this.videoGames.sort(this.compareByRating).reverse()
      this.initPages()
    },
    createVideoGame: function () {
      this.loading = true
      axios.post('http://192.168.1.90:3000/api/videogames/url', { 'url': this.url })
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
    filterbyText: function () {
      let ver = this.videoGames.map(videoGame => {
        if (videoGame.title.toLowerCase().includes(this.filterText.toLowerCase())) {
          return videoGame
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.videoGames = ver
    },
    filterbyYear: function () {
      if (this.filterYear.exact) {
        let ver = this.videoGames.map(videoGame => {
          if (videoGame.year === this.filterYear.exact) {
            return videoGame
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.videoGames = ver
      } else {
        let ver = this.videoGames
        if (this.filterYear.low) {
          ver = ver.map(videoGame => {
            if (videoGame.year >= this.filterYear.low) {
              return videoGame
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(videoGame => {
            if (videoGame.year <= this.filterYear.high) {
              return videoGame
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.videoGames = ver
      }
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.videoGames.map(videoGame => {
          if (videoGame.VideoGame.rating === this.filterRating.exact) {
            return videoGame
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.videoGames = ver
      } else {
        let ver = this.videoGames
        if (this.filterRating.low) {
          ver = ver.map(videoGame => {
            if (videoGame.VideoGame.rating >= this.filterRating.low) {
              return videoGame
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(videoGame => {
            if (videoGame.VideoGame.rating <= this.filterRating.high) {
              return videoGame
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.videoGames = ver
      }
    },
    filterbyHLTB: function () {
      if (this.filterHLTB.exact) {
        let ver = this.videoGames.map(videoGame => {
          if (videoGame.VideoGame.HLTB === this.filterHLTB.exact) {
            return videoGame
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.videoGames = ver
      } else {
        let ver = this.videoGames
        if (this.filterHLTB.low) {
          ver = ver.map(videoGame => {
            if (videoGame.VideoGame.HLTB >= this.filterHLTB.low) {
              return videoGame
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterHLTB.high) {
          ver = ver.map(videoGame => {
            if (videoGame.VideoGame.HLTB <= this.filterHLTB.high) {
              return videoGame
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.videoGames = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.videoGames.map(videoGame => {
        if (this.filterGenres.every(
          genre => {
            return videoGame.Genres.some(
              genre2 => {
                return genre2.name === genre
              }
            )
          }
        )) {
          return videoGame
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.videoGames = ver
    },
    filterbyConsole: function () {
      let name = this.filterConsole
      if (!name) {
        return
      }
      let ver = this.videoGames.map(videoGame => {
        if (videoGame.VideoGame.Consoles.some(aConsole => { return aConsole.name === name })) {
          return videoGame
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.videoGames = ver
    },
    filterAll: function () {
      this.videoGames = this.allVideoGames
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyConsole()
      this.filterbyHLTB()
      this.initPages()
    },
    getRandom: function () {
      this.videoGames = this.allVideoGames
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyConsole()
      this.filterbyHLTB()
      this.videoGames = [this.videoGames[Math.floor(Math.random() * this.videoGames.length)]]
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
      this.filterHLTB = {
        'low': null,
        'high': null,
        'exact': null
      }
      this.filterGenres = []
      this.filterConsole = null
      this.videoGames = this.allVideoGames
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      this.videoGamePage = this.videoGames.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
      this.infiniteId += 1
    },
    infinitehandler: function ($state) {
      let length = this.videoGamePage.length
      this.videoGamePage = this.videoGamePage.concat(this.videoGames.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.videoGamePage.length === length) {
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
