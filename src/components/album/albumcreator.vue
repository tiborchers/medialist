<template>
  <div
    class="main"
  >
    <b-card
      bg-variant="dark"
    >
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
            v-model="Album.GenericMedium.title"
            type="text"
            required
            placeholder="Ingrese titulo del album"
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
            v-model="Album.GenericMedium.year"
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
            v-model="Album.GenericMedium.image"
            placeholder="Imagen"
          />
          <b-img
            label-class="text-white"
            :src="Album.GenericMedium.image"
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
            v-model="Album.GenericMedium.Genres"
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
            v-model="Album.duration"
            type="number"
            required
            placeholder="Duración del album"
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
            v-model="Album.rating"
            type="number"
            required
            placeholder="Nota del Album"
            min="0"
            max="10"
            step="0.01"
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
            v-model="Album.GenericMedium.commentary"
            type="text"
            placeholder="Ingrese un comentario sobre el album"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Artista:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="Album.artist"
            required
            placeholder="Artista del album"
            label-class="text-white"
          />
        </b-form-group>
        <b-button
          v-b-toggle.Songs
          block
        >
          Canciones
        </b-button>
        <b-collapse
          id="Songs"
          visible
          class="mt-2"
        >
          <div
            v-for="(song, index) in Album.Songs"
            :key="index"
          >
            <b-card bg-variant="dark">
              <b-form-group
                id="input-group-2"
                label="Titulo de la canción:"
                label-for="input-2"
                label-class="text-white"
              >
                <b-form-input
                  id="input-2"
                  v-model="song.title"
                  required
                  placeholder="Titulo de la canción"
                  label-class="text-white"
                />
              </b-form-group>
              <b-form-group
                id="input-group-2"
                label="Duración de la canción:"
                label-for="input-2"
                label-class="text-white"
              >
                <b-form-input
                  id="input-2"
                  v-model="song.duration"
                  type="number"
                  min="0"
                  required
                  placeholder="Titulo de la canción"
                  label-class="text-white"
                />
              </b-form-group>
              <b-form-group
                id="input-group-2"
                label="Enumeración de la canción:"
                label-for="input-2"
                label-class="text-white"
              >
                <b-form-input
                  id="input-2"
                  v-model="song.trackNumber"
                  type="number"
                  min="1"
                  required
                  placeholder="Titulo de la canción"
                  label-class="text-white"
                />
              </b-form-group>
              <b-form-group
                id="input-group-2"
                label="Disco de la canción:"
                label-for="input-2"
                label-class="text-white"
              >
                <b-form-input
                  id="input-2"
                  v-model="song.disc"
                  type="number"
                  min="1"
                  required
                  placeholder="Titulo de la canción"
                  label-class="text-white"
                />
                <b-button
                  variant="danger"
                  @click="removeSong(index)"
                >
                  Delete Song
                </b-button>
              </b-form-group>
            </b-card>
          </div>
          <b-button
            variant="primary"
            @click="addSong"
          >
            Add Song
          </b-button>
        </b-collapse>
        <hr>
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
  name: 'AlbumCreate',
  data () {
    return {
      isNew: true,
      genresOptions: [],
      allGenres: [],
      consolesOptions: [],
      allConsoles: [],
      Album: {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: [],
          commentary: ''
        },
        duration: null,
        rating: null,
        artist: null,
        Songs: []
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
    addSong: function () {
      this.Album.Songs.push({ id: 0, trackNumber: null, disc: null, title: '', duration: 0 })
    },
    removeSong: function (index) {
      this.Album.Songs.splice(index, 1)
    },
    init: function () {
      axios.defaults.headers.common['Authorization'] = this.$offlineStorage.get('token').token
      if (typeof this.$route.params.id !== 'undefined') {
        axios.get('http://192.168.1.90:3000/api/albums/' + this.$route.params.id)
          .then(response => {
            this.Album = response.data.album
            this.Album.GenericMedium.Genres = this.Album.GenericMedium.Genres.map(genre => {
              return genre.name
            })
            this.isNew = false
          })
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
    onSubmit: function (evt) {
      evt.preventDefault()
      this.Album.title = this.Album.GenericMedium.title
      this.Album.year = this.Album.GenericMedium.year
      this.Album.image = this.Album.GenericMedium.image
      this.Album.commentary = this.Album.GenericMedium.commentary
      if (this.isNew) {
        axios.post('http://192.168.1.90:3000/api/albums/', this.Album)
          .then(response => {
            this.$router.push('/albums')
          })
      } else {
        axios.patch('http://192.168.1.90:3000/api/albums/' + this.$route.params.id, this.Album)
          .then(response => {
            axios.patch('http://192.168.1.90:3000/api/albums/' + this.$route.params.id + '/genres', { 'genres': this.Album.GenericMedium.Genres })
              .then(response2 => {
                axios.patch('http://192.168.1.90:3000/api/albums/' + this.$route.params.id + '/songs', { 'songs': this.Album.Songs })
                  .then(response3 => {
                    this.$router.push('/albums')
                  })
              })
          })
      }
    },
    onReset: function () {
      this.Album = {
        GenericMedium: {
          title: '',
          image: '',
          year: null,
          Genres: [],
          commentary: ''
        },
        duration: null,
        rating: null,
        artist: null,
        Songs: []
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
