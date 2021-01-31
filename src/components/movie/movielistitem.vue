<template>
  <div>
    <b-card
      no-body
      class="main-card overflow-hidden"
      bg-variant="dark"
      text-variant="white"
    >
      <b-row no-gutters>
        <b-col sm="6">
          <b-card-img-lazy
            class="card-image"
            :src="movie.image"
          />
        </b-col>
        <b-col sm="6">
          <b-card-body
            :title="movie.title"
            :sub-title="movie.year.toString()"
          >
            <b-card-text>
              <h4> ★ {{ movie.Movie.rating }} </h4>
              <h5> ⌚ {{ movie.Movie.duration }} minutos </h5>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(genre) in movie.Genres"
                :key="genre.name"
                class="genre"
              >
                {{ genre.name }}
              </b-badge>
            </b-card-text>
            <b-card-text>
              <b-button
                :href="'https://yts.am/browse-movies/'+movie.title+'/all/all/0/latest'"
                variant="info"
              >
                YTS
              </b-button>
              <b-button
                :href="'https://thepiratebay.org/search/'+movie.title+'/0/99/0'"
                variant="info"
              >
                TPB
              </b-button>
              <b-button
                :href="'https://rarbgcore.org/torrents.php?search='+movie.title"
                variant="info"
              >
                RARBG
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-button
                variant="success"
                @click="markAsWatchedMovie(movie)"
              >
                Marcar Como Visto
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-button
                :href="'#/movies/edit/'+movie.Movie.id"
                variant="warning"
              >
                Edit
              </b-button>
              <b-button
                variant="danger"
                @click="deleteMovie(movie)"
              >
                Delete
              </b-button>
            </b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MovieListItem',
  props: { 'movie': { type: Object, required: true } },
  data () {
    return {

    }
  },
  methods: {
    deleteMovie: function (movie) {
      this.$emit('delete-row')
      axios.delete('http://192.168.1.90:3000/api/movies/' + movie.Movie.id)
    },
    markAsWatchedMovie: function (movie) {
      this.$emit('delete-row')
      axios.patch('http://192.168.1.90:3000/api/movies/' + movie.Movie.id + '/watched')
    }
  }
}
</script>

<style scoped>

.main-card{
  margin: 0 auto;
  min-height: 320px;
  max-width: 80%;
  margin-top: 2%;
  margin-bottom: 2%;
}

@media only screen and (min-width: 256px)  {
  .card-image{
    position: relative;
    width: 100%;
    max-width: 243.425px;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
  }
}

@media only screen and (min-width: 576px)  {
  .card-image{
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
    background: #000;
    width: 243.425px;
    height:364px;
    max-width: 243.425px; /*requires explicit height*/
  }
}

.genre{
  margin-left:0.2rem;
}

</style>
