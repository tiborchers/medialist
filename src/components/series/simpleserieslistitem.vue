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
            :src="series.image"
            class="card-image"
          />
        </b-col>
        <b-col
          sm="6"
        >
          <b-card-body
            :title="series.title"
          >
            <b-card-text>
              <h4> ★ {{ series.rating }} </h4>
              <h6>
                {{ series.initialYear }} - {{ series.finalYear }}
              </h6>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(genre) in series.Genres"
                :key="genre.name"
                class="genre"
              >
                {{ genre.name }}
              </b-badge>
            </b-card-text>
            <b-card-text>
              <b-progress
                :value="getProgress(series)[0]"
                :max="getProgress(series)[1]"
                variant="success"
                show-value
              />
              <br>
              <b-button
                v-b-toggle="series.title"
                block
              >
                Capitulos
              </b-button>
              <b-collapse
                :id="series.title"
                class="mt-2"
              >
                <div
                  v-for="(value) in series.Seasons"
                  :key="value.seasonNumber"
                >
                  <b-button
                    v-b-toggle="'collapse' + series.title + value.seasonNumber"
                    block
                  >
                    Temporada {{ value.seasonNumber }} ({{ formateDate(value.initialDate) }} - {{ formateDate(value.finalDate) }})
                  </b-button>
                  <b-collapse
                    :id="'collapse' + series.title + value.seasonNumber"
                    class="mt-2"
                  >
                    <b-table
                      striped
                      dark
                      hover
                      :items="value.Episodes"
                      :fields="fields"
                    />
                  </b-collapse>
                </div>
              </b-collapse>
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
  name: 'SimpleSeriesListItem',
  props: { 'series': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
  data () {
    return {
      total: 0,
      watched: 0,
      seasonstw: [],
      fields: [
        {
          // A column that needs custom formatting,
          // calling formatter 'fullName' in this app
          key: 'episodeNumber',
          label: 'N°'
        },
        {
          // A column that needs custom formatting,
          // calling formatter 'fullName' in this app
          key: 'title',
          label: 'Titulo'
        },
        {
          // A regular column with custom formatter
          key: 'aired',
          label: 'Fecha de emisión',
          formatter: value => {
            return moment(value).format('l')
          }
        }
      ]
    }
  },
  methods: {
    getProgressSeason: function (season) {
      let total = 0
      let watched = 0
      for (let i = 0; i < season.Episodes.length; i++) {
        if (season.Episodes[i].Users.length) {
          if (season.Episodes[i].Users[0].UserEpisode.consumed) {
            watched += 1
          }
        }
        total += 1
      }
      return [watched, total]
    },
    getProgress: function (series) {
      let total = 0
      let watched = 0
      for (let i = 0; i < series.Seasons.length; i++) {
        let aux = this.getProgressSeason(series.Seasons[i])
        watched += aux[0]
        total += aux[1]
      }
      this.watched = watched
      this.total = total
      return [watched, total]
    },
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

.genre{
  margin-left:0.2rem;
}

</style>
