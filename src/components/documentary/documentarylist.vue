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
          placeholder="Ingrese URL de IMDB"
          @keyup.enter.native="createDocumentary()"
        />
        <b-button
          v-if="loading"
          disabled
          variant="info"
          @click="createDocumentary()"
        >
          Agregar Documental
        </b-button>
        <b-button
          v-else
          variant="info"
          @click="createDocumentary()"
        >
          Agregar Documental
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
        <b-card
          bg-variant="dark"
        >
          <b-form>
            <b-form-group
              id="input-group-1"
              label="Por Titulo:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterText"
                placeholder="Nombre del documental"
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
      <div
        v-for="(documentary, index) in documentariesPage"
        :key="documentary.id.toString()"
      >
        <DocumentaryListItem
          :documentary="documentary"
          @delete-row="deleteThisRow(index)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(documentary, index) in documentariesPage"
        :key="documentary.id.toString()"
      >
        <SimpleDocumentaryListItem
          :documentary="documentary"
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
import DocumentaryListItem from './documentarylistitem.vue'
import SimpleDocumentaryListItem from './simpledocumentarylistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'DocumentaryList',
  components: {
    DocumentaryListItem,
    SimpleDocumentaryListItem,
    InfiniteLoading
  },
  data () {
    return {
      documentaries: [],
      allDocumentaries: [],
      allGenres: [],
      genresOptions: [],
      documentariesPage: [],
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
        axios.get('http://192.168.1.90:3000/api/documentaries/towatch')
          .then(response => {
            this.loading = false
            this.documentaries = response.data
            this.allDocumentaries = this.documentaries
            this.$offlineStorage.set('doumentariesToWatch', response.data)
            this.initPages()
          })
      } else {
        this.loading = false
        this.documentaries = this.$offlineStorage.get('doumentariesToWatch')
        this.allDocumentaries = this.documentaries
        this.initPages()
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/documentaries')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('documentariesGenres', response.data.genres)
          })
      } else {
        this.allGenres = this.$offlineStorage.get('documentariesGenres')
        this.genresOptions = this.genresToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
    },
    deleteThisRow: function (index) {
      this.documentariesPage.splice(index, 1)
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
      const genreA = a.Documentary.duration
      const genreB = b.Documentary.duration

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByRating: function (a, b) {
      const genreA = a.Documentary.rating
      const genreB = b.Documentary.rating

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    sortbyTitle: function () {
      this.documentaries = this.documentaries.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.documentaries = this.documentaries.sort(this.compareByYear)
      this.initPages()
    },
    sortbyDuration: function () {
      this.documentaries = this.documentaries.sort(this.compareByDuration)
      this.initPages()
    },
    sortbyRating: function () {
      this.documentaries = this.documentaries.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.documentaries = this.documentaries.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.documentaries = this.documentaries.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyDuration: function () {
      this.documentaries = this.documentaries.sort(this.compareByDuration).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.documentaries = this.documentaries.sort(this.compareByRating).reverse()
      this.initPages()
    },
    createDocumentary: function () {
      this.loading = true
      axios.post('http://192.168.1.90:3000/api/documentaries/url', { 'url': this.url })
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
      let ver = this.documentaries.map(documentary => {
        if (documentary.title.toLowerCase().includes(this.filterText.toLowerCase())) {
          return documentary
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.documentaries = ver
    },
    filterbyYear: function () {
      if (this.filterYear.exact) {
        let ver = this.documentaries.map(documentary => {
          if (documentary.year === this.filterYear.exact) {
            return documentary
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.documentaries = ver
      } else {
        let ver = this.documentaries
        if (this.filterYear.low) {
          ver = ver.map(documentary => {
            if (documentary.year >= this.filterYear.low) {
              return documentary
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(documentary => {
            if (documentary.year <= this.filterYear.high) {
              return documentary
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.documentaries = ver
      }
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.documentaries.map(documentary => {
          if (documentary.Documentary.rating === this.filterRating.exact) {
            return documentary
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.documentaries = ver
      } else {
        let ver = this.documentaries
        if (this.filterRating.low) {
          ver = ver.map(documentary => {
            if (documentary.Documentary.rating >= this.filterRating.low) {
              return documentary
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(documentary => {
            if (documentary.Documentary.rating <= this.filterRating.high) {
              return documentary
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.documentaries = ver
      }
    },
    filterbyDuration: function () {
      if (this.filterDuration.exact) {
        let ver = this.documentaries.map(documentary => {
          if (documentary.Documentary.duration === this.filterDuration.exact) {
            return documentary
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.documentaries = ver
      } else {
        let ver = this.documentaries
        if (this.filterDuration.low) {
          ver = ver.map(documentary => {
            if (documentary.Documentary.duration >= this.filterDuration.low) {
              return documentary
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterDuration.high) {
          ver = ver.map(documentary => {
            if (documentary.Documentary.duration <= this.filterDuration.high) {
              return documentary
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.documentaries = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.documentaries.map(documentary => {
        if (this.filterGenres.every(
          genre => {
            return documentary.Genres.some(
              genre2 => { return genre2.name === genre }
            )
          }
        )) {
          return documentary
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.documentaries = ver
    },
    filterAll: function () {
      this.documentaries = this.allDocumentaries
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyDuration()
      this.initPages()
    },
    getRandom: function () {
      this.documentaries = this.allDocumentaries
      this.filterbyText()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyDuration()
      this.documentaries = [this.documentaries[Math.floor(Math.random() * this.documentaries.length)]]
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
      this.documentaries = this.allDocumentaries
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      this.documentariesPage = this.documentaries.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
      this.infiniteId += 1
    },
    infinitehandler: function ($state) {
      let length = this.documentariesPage.length
      this.documentariesPage = this.documentariesPage.concat(this.documentaries.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.documentariesPage.length === length) {
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
