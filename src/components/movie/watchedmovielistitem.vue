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
            :src="movie.image"
            class="card-image"
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
              <h6> 🎞 {{ parseDate(movie.UserGM.consumedDate) }} </h6>
            </b-card-text>
            <b-card-text>
              {{ movie.commentary }}
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
                variant="success"
                @click="markAsUnwatchedMovie(movie)"
              >
                Desmarcar Como Visto
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
  name: 'WatchedMovieListItem',
  props: { 'movie': { type: Object, required: true } },
  data () {
    return {

    }
  },
  methods: {
    markAsUnwatchedMovie: function (movie) {
      this.$emit('delete-row')
      axios.patch('http://192.168.1.90:3000/api/movies/' + movie.Movie.id + '/unwatched')
    },
    parseDate: function (date) {
      let newDate = new Date(date)
      let dd = newDate.getDate()
      let mm = newDate.getMonth() + 1
      let yyyy = newDate.getFullYear()
      return dd.toString() + '-' + mm.toString() + '-' + yyyy.toString()
    }
  }
}
</script>

<style scoped>

.genre{
  margin-left:0.2rem;
}

.main-card{
  margin: 0 auto;
  min-height:320px; max-width:80%;
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

</style>
