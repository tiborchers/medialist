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
          placeholder="Ingrese URL de AllMusic o RateYourMusic"
          @keyup.enter.native="createAlbum()"
        />
        <b-button
          v-if="loading"
          disabled
          variant="info"
          @click="createAlbum()"
        >
          Agregar Album
        </b-button>
        <b-button
          v-else
          variant="info"
          @click="createAlbum()"
        >
          Agregar Album
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
                placeholder="Nombre del Album"
              />
            </b-form-group>
            <b-form-group
              id="input-group-1"
              label="Por Artista:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterArtist"
                placeholder="Nombre del Artista"
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
                max="10000.0"
              />
              <b-form-input
                v-model="filterHLTB.high"
                type="number"
                placeholder="90"
                min="0.0"
                max="10000.0"
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
        @click="sortbyArtist()"
      >
        Artist ▲
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
        @click="rsortbyArtist()"
      >
        Artist ▼
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
        v-for="(album, index) in albumPage"
        :key="album.id.toString()"
      >
        <AlbumListItem
          :album="album"
          @delete-row="deleteThisRow(index)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(album, index) in albumPage"
        :key="album.id.toString()"
      >
        <SimpleAlbumListItem
          :album="album"
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
import AlbumListItem from './albumlistitem.vue'
import SimpleAlbumListItem from './simplealbumlistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'AlbumList',
  components: {
    AlbumListItem,
    SimpleAlbumListItem,
    InfiniteLoading
  },
  data () {
    return {
      albums: [],
      allAlbums: [],
      allGenres: [],
      genresOptions: [],
      albumPage: [],
      done: false,
      pageSize: 50,
      pagesNumber: 2,
      url: '',
      infiniteId: 0,
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
  methods: {
    init: function () {
      this.loading = true
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/albums/tolisten')
          .then(response => {
            this.loading = false
            this.albums = response.data
            this.allAlbums = this.albums
            this.$offlineStorage.set('albumsToListen', response.data)
            this.initPages()
          })
          .catch(() => {
            this.loading = false
            this.albums = this.$offlineStorage.get('albumsToListen')
            this.allAlbums = this.albums
            this.initPages()
          })
      } else {
        this.loading = false
        this.albums = this.$offlineStorage.get('albumsToListen')
        this.allAlbums = this.albums
        this.initPages()
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/albums')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('albumsGenres', response.data.genres)
          })
      } else {
        this.allGenres = this.$offlineStorage.get('albumsGenres')
        this.genresOptions = this.genresToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
    },
    deleteThisRow: function (index) {
      this.albumPage.splice(index, 1)
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
      const genreA = a.Album.rating
      const genreB = b.Album.rating

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
      this.albums = this.albums.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.albums = this.albums.sort(this.compareByYear)
      this.initPages()
    },
    sortbyHLTB: function () {
      this.albums = this.albums.sort(this.compareByHLTB)
      this.initPages()
    },
    sortbyRating: function () {
      this.albums = this.albums.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.albums = this.albums.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.albums = this.albums.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyHLTB: function () {
      this.albums = this.albums.sort(this.compareByHLTB).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.albums = this.albums.sort(this.compareByRating).reverse()
      this.initPages()
    },
    sortbyArtist: function () {
      this.albums = this.albums.sort(this.compareByArtist)
      this.initPages()
    },
    rsortbyArtist: function () {
      this.albums = this.albums.sort(this.compareByArtist).reverse()
      this.initPages()
    },
    createAlbum: function () {
      this.loading = true
      axios.post('http://192.168.1.90:3000/api/albums/url', { 'url': this.url })
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
      let ver = this.albums.map(album => {
        if (album.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(this.filterText.toLowerCase())) {
          return album
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.albums = ver
    },
    filterbyArtist: function () {
      let ver = this.albums.map(album => {
        if (album.Album.artist.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(this.filterArtist.toLowerCase())) {
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
        let ver = this.albums.map(album => {
          if (album.year === this.filterYear.exact) {
            return album
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.albums = ver
      } else {
        let ver = this.albums
        if (this.filterYear.low) {
          ver = ver.map(album => {
            if (album.year >= this.filterYear.low) {
              return album
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(album => {
            if (album.year <= this.filterYear.high) {
              return album
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.albums = ver
      }
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.albums.map(album => {
          if (album.Album.rating === this.filterRating.exact) {
            return album
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.albums = ver
      } else {
        let ver = this.albums
        if (this.filterRating.low) {
          ver = ver.map(album => {
            if (album.Album.rating >= this.filterRating.low) {
              return album
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(album => {
            if (album.Album.rating <= this.filterRating.high) {
              return album
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.albums = ver
      }
    },
    filterbyHLTB: function () {
      if (this.filterHLTB.exact) {
        let ver = this.albums.map(album => {
          if (album.Album.duration === this.filterHLTB.exact) {
            return album
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.albums = ver
      } else {
        let ver = this.albums
        if (this.filterHLTB.low) {
          ver = ver.map(album => {
            if (album.Album.duration >= this.filterHLTB.low) {
              return album
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterHLTB.high) {
          ver = ver.map(album => {
            if (album.Album.duration <= this.filterHLTB.high) {
              return album
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.albums = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.albums.map(album => {
        if (this.filterGenres.every(
          genre => {
            return album.Genres.some(
              genre2 => {
                return genre2.name === genre
              }
            )
          }
        )) {
          return album
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.albums = ver
    },
    filterAll: function () {
      this.albums = this.allAlbums
      this.filterbyText()
      this.filterbyArtist()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyHLTB()
      this.initPages()
    },
    getRandom: function () {
      this.albums = this.allAlbums
      this.filterbyText()
      this.filterbyArtist()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyHLTB()
      this.albums = [this.albums[Math.floor(Math.random() * this.albums.length)]]
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
      this.albums = this.allAlbums
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      this.albumPage = this.albums.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
      this.infiniteId += 1
    },
    infinitehandler: function ($state) {
      let length = this.albumPage.length
      this.albumPage = this.albumPage.concat(this.albums.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.albumPage.length === length) {
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
