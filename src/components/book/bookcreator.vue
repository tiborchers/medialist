<template>
  <div class="main">
    <b-card bg-variant="dark">
      <b-form
        @submit="onSubmit"
        @reset="onReset"
      >
        <b-form-group
          id="input-group-1"
          label="Title:"
          label-class="text-white"
        >
          <b-form-input
            id="input-1"
            v-model="book.GenericMedium.title"
            type="text"
            required
            placeholder="Ingrese titulo del Libro"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Autor:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="book.author"
            required
            placeholder="Autor del libro"
            label-class="text-white"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Año:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="book.GenericMedium.year"
            type="number"
            required
            placeholder="1900"
            min="-1000"
          />
        </b-form-group>

        <b-form-group
          id="input-group-2"
          label="Imagen:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="book.GenericMedium.image"
            placeholder="Imagen"
          />
          <b-img
            label-class="text-white"
            :src="book.GenericMedium.image"
            fluid
            alt="Responsive image"
          />
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Generos:"
          label-class="text-white"
        >
          <b-form-select
            v-model="book.GenericMedium.Genres"
            :options="genresOptions"
            multiple
            :select-size="4"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Paginas:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="book.pages"
            type="number"
            required
            placeholder="Paginas del libro"
            min="0"
            step="1"
          />
        </b-form-group>

        <b-form-group
          id="input-group-2"
          label="Nota:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="book.rating"
            type="number"
            required
            placeholder="Nota del Juego"
            min="0"
            max="10"
            step="0.1"
            label-class="text-white"
          />
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Comentario:"
          label-class="text-white"
        >
          <b-form-input
            id="input-1"
            v-model="book.GenericMedium.commentary"
            type="text"
            placeholder="Ingrese un comentario sobre el Video Juego"
          />
        </b-form-group>

        <b-button
          type="submit"
          variant="primary"
        >
          Submit
        </b-button>
        <b-button
          type="reset"
          variant="danger"
        >
          Reset
        </b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'BookCreate',
  data () {
    return {
      isNew: true,
      genresOptions: [],
      allGenres: [],
      book: {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: [],
          commentary: ''
        },
        pages: null,
        rating: null,
        author: null
      }
    }
  },
  mounted () {
    this.init()
    this.getGenres()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.onReset()
      vm.init()
      vm.getGenres()
    })
  },
  methods: {
    init: function () {
      if (typeof this.$route.params.id !== 'undefined') {
        axios.get('http://192.168.1.90:3000/api/books/' + this.$route.params.id)
          .then(response => {
            this.book = response.data.book
            this.book.GenericMedium.Genres = this.book.GenericMedium.Genres.map(genre => {
              return genre.name
            })
            this.isNew = false
          })
      }
    },
    getGenres: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/genres/books')
          .then(response => {
            this.allGenres = response.data.genres
            this.genresOptions = this.genresToOptions()
            this.$offlineStorage.set('booksGenres', response.data.genres)
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
    onSubmit: function (evt) {
      evt.preventDefault()
      this.book.title = this.book.GenericMedium.title
      this.book.year = this.book.GenericMedium.year
      this.book.image = this.book.GenericMedium.image
      this.book.commentary = this.book.GenericMedium.commentary
      if (this.isNew) {
        axios.post('http://192.168.1.90:3000/api/books/', this.book)
          .then(response => {
            this.$router.push('/books')
          })
      } else {
        axios.patch('http://192.168.1.90:3000/api/books/' + this.$route.params.id, this.book)
          .then(response => {
            axios.patch('http://192.168.1.90:3000/api/books/' + this.$route.params.id + '/genres', { 'genres': this.book.GenericMedium.Genres })
              .then(response2 => {
                this.$router.push('/books')
              })
          })
      }
    },
    onReset: function () {
      this.book = {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: [],
          commentary: ''
        },
        pages: null,
        rating: null,
        author: null
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

</style>
