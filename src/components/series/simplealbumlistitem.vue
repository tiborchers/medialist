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
            :src="album.image"
            class="card-image"
          />
        </b-col>
        <b-col sm="6">
          <b-card-body
            :title="album.title"
            :sub-title="album.Album.artist.toString()"
          >
            <b-card-text>
              <h4> ★ {{ album.Album.rating }} </h4>
              <h5> ⌚ {{ parseDuration(album.Album.duration) }}</h5>
              <h6> {{ album.commentary }} </h6>
              <h6> {{ album.year }} </h6>
              <div :v-if="album.UserGM.consumed">
                <h6> ♫ {{ parseDate(album.UserGM.consumedDate) }} </h6>
              </div>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(genre) in album.Genres"
                :key="genre.name"
                class="genre"
              >
                {{ genre.name }}
              </b-badge>
            </b-card-text>
            <b-card-text>
              <b-button
                v-b-toggle="album.title"
                size="sm"
                block
              >
                Canciones
              </b-button>
              <b-collapse
                :id="album.title"
                class="mt-2"
              >
                <b-table
                  striped
                  dark
                  hover
                  :items="parseSongs(album.Album.Songs)"
                />
              </b-collapse>
            </b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'SimpleAlbumListItem',
  props: ['album'],
  data () {
    return {

    }
  },
  methods: {
    parseDate: function (date) {
      let newDate = new Date(date)
      let dd = newDate.getDate()
      let mm = newDate.getMonth() + 1
      let yyyy = newDate.getFullYear()
      return dd.toString() + '-' + mm.toString() + '-' + yyyy.toString()
    },
    parseDuration: function (duration) {
      let minutes = Math.trunc(duration / 60)
      let seconds = duration % 60
      if (minutes >= 60) {
        let hours = Math.trunc(minutes / 60)
        let minutes2 = minutes % 60
        if (minutes2 < 10) {
          minutes = hours.toString() + ':0' + minutes2.toString()
        } else {
          minutes = hours.toString() + ':' + minutes2.toString()
        }
      }
      if (seconds < 10) {
        return minutes.toString() + ':0' + seconds.toString()
      }
      return minutes.toString() + ':' + seconds.toString()
    },
    parseSong: function (song) {
      let newSong = JSON.parse(JSON.stringify(song))
      newSong.duration = this.parseDuration(song.duration)
      return newSong
    },
    parseSongs: function (songs) {
      let hola = songs.map(song => { return this.parseSong(song) })
      return hola
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
