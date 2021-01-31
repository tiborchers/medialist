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
            v-model="videoGame.GenericMedium.title"
            type="text"
            required
            placeholder="Ingrese titulo del Video Juego"
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
            v-model="videoGame.GenericMedium.year"
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
            v-model="videoGame.GenericMedium.image"
            placeholder="Imagen"
          />
          <b-img
            label-class="text-white"
            :src="videoGame.GenericMedium.image"
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
            v-model="videoGame.GenericMedium.Genres"
            :options="genresOptions"
            multiple
            :select-size="4"
          />
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Consolas Disponibles:"
          label-class="text-white"
        >
          <b-form-select
            v-model="videoGame.Consoles"
            :options="consolesOptions"
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
            v-model="videoGame.HLTB"
            type="number"
            required
            placeholder="Duración del Juego"
            min="0"
            step="0.5"
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
            v-model="videoGame.rating"
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
            v-model="videoGame.GenericMedium.commentary"
            type="text"
            placeholder="Ingrese un comentario sobre el Video Juego"
          />
        </b-form-group>

        <b-form-group
          id="input-group-2"
          label="Desarrollador:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="videoGame.developer"
            required
            placeholder="desarrollador del Juego"
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
  name: 'VideoGameCreate',
  data () {
    return {
      isNew: true,
      genresOptions: [],
      allGenres: [],
      consolesOptions: [],
      allConsoles: [],
      videoGame: {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: [],
          commentary: ''
        },
        HLTB: null,
        rating: null,
        developer: null,
        Consoles: []
      }
    }
  },
  mounted () {
    this.init()
    this.getGenres()
    this.getConsoles()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.onReset()
      vm.init()
      vm.getGenres()
      vm.getConsoles()
    })
  },
  methods: {
    init: function () {
      if (typeof this.$route.params.id !== 'undefined') {
        axios.get('http://192.168.1.90:3000/api/videogames/' + this.$route.params.id)
          .then(response => {
            this.videoGame = response.data.videoGame
            this.videoGame.GenericMedium.Genres = this.videoGame.GenericMedium.Genres.map(genre => {
              return genre.name
            })
            this.videoGame.Consoles = this.videoGame.Consoles.map(aConsole => {
              return aConsole.name
            })
            this.isNew = false
          })
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
    getConsoles: function () {
      if (this.isOnline) {
        axios.get('http://192.168.1.90:3000/api/consoles')
          .then(response => {
            this.allConsoles = response.data.consoles
            this.consolesOptions = this.consolesToOptions()
            this.$offlineStorage.set('Consoles', response.data.consoles)
          })
      } else {
        this.allConsoles = this.$offlineStorage.get('Consoles')
        this.consolesOptions = this.consolesToOptions()
      }
    },
    genresToOptions: function () {
      return this.allGenres.map(genre => {
        return { 'value': genre.name, 'text': genre.name }
      })
    },
    consolesToOptions: function () {
      return this.allConsoles.map(aConsole => {
        return { 'value': aConsole.name, 'text': aConsole.name }
      })
    },
    onSubmit: function (evt) {
      evt.preventDefault()
      this.videoGame.title = this.videoGame.GenericMedium.title
      this.videoGame.year = this.videoGame.GenericMedium.year
      this.videoGame.image = this.videoGame.GenericMedium.image
      this.videoGame.commentary = this.videoGame.GenericMedium.commentary
      if (this.isNew) {
        axios.post('http://192.168.1.90:3000/api/videogames/', this.videoGame)
          .then(response => {
            this.$router.push('/videogames')
          })
      } else {
        axios.patch('http://192.168.1.90:3000/api/videogames/' + this.$route.params.id, this.videoGame)
          .then(response => {
            axios.patch('http://192.168.1.90:3000/api/videogames/' + this.$route.params.id + '/genres', { 'genres': this.videoGame.GenericMedium.Genres })
              .then(response2 => {
                axios.patch('http://192.168.1.90:3000/api/videogames/' + this.$route.params.id + '/consoles', { 'consoles': this.videoGame.Consoles })
                  .then(response3 => {
                    this.$router.push('/videogames')
                  })
              })
          })
      }
    },
    onReset: function () {
      this.videoGame = {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: [],
          commentary: ''
        },
        duration: null,
        rating: null,
        consoles: [],
        developer: null
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
