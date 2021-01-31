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
                placeholder="Nombre del Libro"
              />
            </b-form-group>
            <b-form-group
              id="input-group-1"
              label="Por Autor:"
              label-class="text-white"
            >
              <b-form-input
                v-model="filterAuthor"
                placeholder="Nombre del Autor"
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
                v-model="filterHLTR.low"
                type="number"
                placeholder="0"
                min="0.0"
                max="600.0"
              />
              <b-form-input
                v-model="filterHLTR.high"
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
        @click="sortbyHLTR()"
      >
        HLTR ▲
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
        @click="rsortbyHLTR()"
      >
        HLTR ▼
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
        v-for="(book, index) in books"
        :key="book.id.toString()"
      >
        <ReadBookListItem
          :book="book"
          @delete-row="deleteThisRow(index)"
        />
      </div>
    </div>
    <div v-else>
      <div
        v-for="(book, index) in books"
        :key="book.id.toString()"
      >
        <SimpleBookListItem
          :book="book"
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
import ReadBookListItem from './readbooklistitem.vue'
import SimpleBookListItem from './simplebooklistitem.vue'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'ReadBookList',
  components: {
    ReadBookListItem,
    SimpleBookListItem,
    InfiniteLoading
  },
  data () {
    return {
      books: [],
      allBooks: [],
      allGenres: [],
      genresOptions: [],
      booksPage: [],
      done: false,
      infiniteId: 0,
      pageSize: 50,
      pagesNumber: 2,
      loading: false,
      filterText: '',
      filterAuthor: '',
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
      filterHLTR: {
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
        axios.get('http://192.168.1.90:3000/api/books/read')
          .then(response => {
            this.loading = false
            this.books = response.data
            this.allBooks = this.books
            this.$offlineStorage.set('booksRead', response.data)
            this.initPages()
          })
      } else {
        this.loading = false
        this.books = this.$offlineStorage.get('booksRead')
        this.allBooks = this.books
        this.initPages()
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/books')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('booksGenres', response.data.Genres)
          })
      } else {
        this.allGenres = this.$offlineStorage.get('booksGenres')
        this.genresOptions = this.genresToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
    },
    deleteThisRow: function (index) {
      this.booksPage.splice(index, 1)
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
    compareByHLTR: function (a, b) {
      const genreA = a.Book.pages
      const genreB = b.Book.pages

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    compareByRating: function (a, b) {
      const genreA = a.Book.rating
      const genreB = b.Book.rating

      let comparison = 0
      if (genreA > genreB) {
        comparison = 1
      } else if (genreA < genreB) {
        comparison = -1
      }
      return comparison
    },
    sortbyTitle: function () {
      this.books = this.books.sort(this.compareByName)
      this.initPages()
    },
    sortbyYear: function () {
      this.books = this.books.sort(this.compareByYear)
      this.initPages()
    },
    sortbyHLTR: function () {
      this.books = this.books.sort(this.compareByHLTR)
      this.initPages()
    },
    sortbyRating: function () {
      this.books = this.books.sort(this.compareByRating)
      this.initPages()
    },
    rsortbyTitle: function () {
      this.books = this.books.sort(this.compareByName).reverse()
      this.initPages()
    },
    rsortbyYear: function () {
      this.books = this.books.sort(this.compareByYear).reverse()
      this.initPages()
    },
    rsortbyHLTR: function () {
      this.books = this.books.sort(this.compareByHLTR).reverse()
      this.initPages()
    },
    rsortbyRating: function () {
      this.books = this.books.sort(this.compareByRating).reverse()
      this.initPages()
    },
    filterbyText: function () {
      let ver = this.books.map(book => {
        if (book.title.toLowerCase().includes(this.filterText.toLowerCase())) {
          return book
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.books = ver
    },
    filterbyYear: function () {
      if (this.filterYear.exact) {
        let ver = this.books.map(book => {
          if (book.year === this.filterYear.exact) {
            return book
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.books = ver
      } else {
        let ver = this.books
        if (this.filterYear.low) {
          ver = ver.map(book => {
            if (book.year >= this.filterYear.low) {
              return book
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterYear.high) {
          ver = ver.map(book => {
            if (book.year <= this.filterYear.high) {
              return book
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.books = ver
      }
    },
    filterbyAuthor: function () {
      let ver = this.books.map(book => {
        if (book.Book.author.toLowerCase().includes(this.filterAuthor.toLowerCase())) {
          return book
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.books = ver
    },
    filterbyRating: function () {
      if (this.filterRating.exact) {
        let ver = this.books.map(book => {
          if (book.Book.rating === this.filterRating.exact) {
            return book
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.books = ver
      } else {
        let ver = this.books
        if (this.filterRating.low) {
          ver = ver.map(book => {
            if (book.Book.rating >= this.filterRating.low) {
              return book
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterRating.high) {
          ver = ver.map(book => {
            if (book.Book.rating <= this.filterRating.high) {
              return book
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.books = ver
      }
    },
    filterbyHLTR: function () {
      if (this.filterHLTR.exact) {
        let ver = this.books.map(book => {
          if (this.HLTR(book.Book.pages) === this.filterHLTR.exact) {
            return book
          }
        })
        ver = ver.filter(function (element) {
          return element !== undefined
        })
        this.books = ver
      } else {
        let ver = this.books
        if (this.filterHLTR.low) {
          ver = ver.map(book => {
            if (this.HLTR(book.Book.pages) >= this.filterHLTR.low) {
              return book
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        if (this.filterHLTR.high) {
          ver = ver.map(book => {
            if (this.HLTR(book.Book.pages) <= this.filterHLTR.high) {
              return book
            }
          })
          ver = ver.filter(function (element) {
            return element !== undefined
          })
        }
        this.books = ver
      }
    },
    filterbyGenre: function () {
      if (this.filterGenres.length === 0) {
        return
      }
      let ver = this.books.map(book => {
        if (this.filterGenres.every(
          genre => {
            return book.Genres.some(
              genre2 => { return genre2.name === genre }
            )
          }
        )) {
          return book
        }
      })
      ver = ver.filter(function (element) {
        return element !== undefined
      })
      this.books = ver
    },
    filterAll: function () {
      this.books = this.allBooks
      this.filterbyText()
      this.filterbyAuthor()
      this.filterbyYear()
      this.filterbyRating()
      this.filterbyGenre()
      this.filterbyHLTR()
      this.initPages()
    },
    resetFilters: function () {
      this.filterText = ''
      this.filterAuthor = ''
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
      this.filterHLTR = {
        'low': null,
        'high': null,
        'exact': null
      }
      this.filterGenres = []
      this.books = this.allBooks
      this.done = false
      this.initPages()
    },
    pagination: function (pageNumber) {
      this.booksPage = this.books.slice(this.pageSize * (pageNumber - 1), this.pageSize * (pageNumber))
    },
    initPages: function () {
      this.pagination(1)
      this.pagesNumber = 2
      this.done = false
      this.infiniteId += 1
    },
    HLTR: function (pages) {
      return (pages * 250) / (150 * 60)
    },
    infinitehandler: function ($state) {
      let length = this.booksPage.length
      this.booksPage = this.booksPage.concat(this.books.slice(this.pageSize * (this.pagesNumber - 1), this.pageSize * (this.pagesNumber)))
      this.pagesNumber += 1
      $state.loaded()
      if (this.booksPage.length === length) {
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
