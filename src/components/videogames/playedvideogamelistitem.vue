<template>
  <div>
    <b-card
      no-body
      class="main-card overflow-hidden"
      bg-variant="dark"
      text-variant="white"
    >
      <b-row no-gutters>
        <b-col
          sm="6"
          class="lol"
        >
          <b-card-img-lazy
            :src="videoGame.image"
            class="card-image"
          />
        </b-col>
        <b-col sm="6">
          <b-card-body
            :title="videoGame.title"
            :sub-title="videoGame.year.toString()"
          >
            <b-card-text>
              <h4> ★ {{ videoGame.VideoGame.rating }} </h4>
              <h5 v-if="videoGame.HLTB > 1">
                ⌚ {{ videoGame.VideoGame.HLTB }} horas
              </h5>
              <h5 v-else>
                ⌚ {{ videoGame.VideoGame.HLTB }} hora
              </h5>
              <h6> {{ videoGame.VideoGame.developer }} </h6>
              <h6> &#127918; {{ parseDate(videoGame.UserGM.consumedDate) }} </h6>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(genre) in videoGame.Genres"
                :key="genre.name"
                class="genre"
              >
                {{ genre.name }}
              </b-badge>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(aConsole) in videoGame.VideoGame.Consoles"
                :key="aConsole.name"
                class="console"
              >
                {{ aConsole.name }}
              </b-badge>
            </b-card-text>
            <b-card-text>
              <b-button
                variant="success"
                @click="markAsUnplayedVideoGame(videoGame)"
              >
                Desmarcar Como Jugado
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
  name: 'PlayedVideoGameListItem',
  props: { 'videoGame': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
  data () {
    return {

    }
  },
  methods: {
    markAsUnplayedVideoGame: function (videoGame) {
      this.$emit('delete-row')
      axios.patch('http://192.168.1.90:3000/api/videogames/' + videoGame.VideoGame.id + '/unplayed')
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
    max-width: 300px;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
  }
}

@media only screen and (min-width: 576px)  {
  .card-image{
    position:absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
    width: 256px; /*requires explicit height*/
  }
}

.lol{
  position:relative;
}

</style>
