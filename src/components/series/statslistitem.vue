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
            :src="episode['Season.Series.image']"
            class="card-image"
          />
        </b-col>
        <b-col
          sm="6"
        >
          <b-card-body
            :title="episode.title"
            :sub-title="'S'+episode['Season.seasonNumber']+'E'+episode['episodeNumber']"
          >
            <b-card-text>
              <h4> ★ {{ episode["Season.Series.title"] }} </h4>
              <h6>
                {{ formateDate(episode["UserEpisode.consumedDate"]) }}
              </h6>
            </b-card-text>
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'EpisodeStatListItem',
  props: { 'episode': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
  data () {
    return {
    }
  },
  methods: {
    formateDate: function (value) {
      return moment(value).format('L')
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
