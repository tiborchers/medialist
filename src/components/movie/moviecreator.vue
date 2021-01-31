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
            v-model="movie.GenericMedium.title"
            type="text"
            required
            placeholder="Ingrese titulo de pelicula"
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
            v-model="movie.GenericMedium.year"
            type="number"
            required
            placeholder="1900"
            min="1880"
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
            v-model="movie.GenericMedium.image"
            placeholder="Imagen"
          />
          <b-img
            label-class="text-white"
            :src="movie.GenericMedium.image"
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
            v-model="movie.GenericMedium.Genres"
            :options="genresOptions"
            multiple
            :select-size="4"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Duración:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="movie.duration"
            type="number"
            required
            placeholder="Duración de la película"
            min="0"
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
            v-model="movie.rating"
            type="number"
            required
            placeholder="Nota de la pelicula"
            min="0"
            max="10"
            step="0.1"
            label-class="text-white"
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
  name: 'MovieCreate',
  data () {
    return {
      isNew: true,
      genresOptions: [],
      allGenres: [],
      movie: {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: []
        },
        duration: null,
        rating: null
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
        axios.get('http://192.168.1.90:3000/api/movies/' + this.$route.params.id)
          .then(response => {
            this.movie = response.data.movie
            this.movie.GenericMedium.Genres = this.movie.GenericMedium.Genres.map(genre => {
              return genre.name
            })
            this.isNew = false
          })
      } else {
        this.movie = {
          GenericMedium: {
            title: '',
            image: '',
            year: null,
            Genres: []
          },
          duration: null,
          rating: null
        }
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
    onSubmit: function (evt) {
      evt.preventDefault()
      this.movie.title = this.movie.GenericMedium.title
      this.movie.year = this.movie.GenericMedium.year
      this.movie.image = this.movie.GenericMedium.image
      if (this.isNew) {
        axios.post('http://192.168.1.90:3000/api/movies/', this.movie)
          .then(response => {
            this.$router.push('/movies')
          })
      } else {
        axios.patch('http://192.168.1.90:3000/api/movies/' + this.$route.params.id, this.movie)
          .then(response => {
            axios.patch('http://192.168.1.90:3000/api/movies/' + this.$route.params.id + '/genres', { 'genres': this.movie.GenericMedium.Genres })
              .then(response2 => {
                this.$router.push('/movies')
              })
          })
      }
    },
    onReset: function () {
      this.movie = {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: []
        },
        duration: null,
        rating: null
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
