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
              <b-dropdown
                id="dropdown-1"
                text="Cambiar Estado"
                class="m-md-2"
              >
                <b-dropdown-item
                  v-if="series.UserSerie.state!='To watch'"
                  @click="changedStateSeries(series, 'To watch')"
                >
                  Por Ver
                </b-dropdown-item>
                <b-dropdown-item
                  v-if="series.UserSerie.state!='Watching'"
                  @click="changedStateSeries(series, 'Watching')"
                >
                  Viendo
                </b-dropdown-item>
                <b-dropdown-item
                  v-if="series.UserSerie.state!='Dropped'"
                  @click="changedStateSeries(series, 'Dropped')"
                >
                  Dejar de ver
                </b-dropdown-item>
                <b-dropdown-item
                  v-if="series.finalYear && series.UserSerie.state!='Done'"
                  @click="changedStateSeries(series, 'Done')"
                >
                  Listo
                </b-dropdown-item>
                <b-dropdown-item
                  v-if="!series.finalYear && series.UserSerie.state!='Waiting for new season'"
                  @click="changedStateSeries(series, 'Waiting for new season')"
                >
                  Esperando nueva Temporada
                </b-dropdown-item>
              </b-dropdown>
            </b-card-text>
            <b-card-text>
              <b-button
                :href="'https://thepiratebay.org/search/'+series.title+ '/0/99/0'"
                variant="info"
              >
                TPB
              </b-button>
              <b-button
                :href="'https://rarbgcore.org/torrents.php?search='+series.title"
                variant="info"
              >
                RARBG
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-button
                variant="warning"
                @click="updateSeries(series)"
              >
                Update
              </b-button>
              <b-button
                variant="danger"
                @click="deleteSeries(series)"
              >
                Delete
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-progress
                :value="watched"
                :max="total"
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
                    >
                      <template
                        slot="Users"
                        slot-scope="data"
                      >
                        <!-- `data.value` is the value after formatted by the Formatter -->
                        <b-button
                          v-if="data.value[0]"
                          variant="danger"
                          @click="markAsUnwatchedEpisode(data.value[1])"
                        >
                          Desmarcar como visto
                        </b-button>
                        <div v-else>
                          <div>
                            <b-button
                              variant="success"
                              @click="markAsWatchedEpisode(data.value[1])"
                            >
                              Marcar como visto
                            </b-button>
                          </div>
                          <div>
                            <b-button
                              variant="warning"
                              @click="markAsWatchedNoStatsEpisode(data.value[1])"
                            >
                              Marcar visto (No Stats)
                            </b-button>
                          </div>
                        </div>
                      </template>
                    </b-table>
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
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'SeriesListItem',
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
        },
        {
          // A virtual column with custom formatter
          key: 'Users',
          label: 'Visto',
          formatter: (value, key, item) => {
            if (value.length === 0) {
              return [false, { id: item.id }]
            }
            return [value[0].UserEpisode.consumed, { id: item.id, index: item.id }]
          }
        }
      ]
    }
  },
  created () {
    this.getProgress(this.series)
  },
  methods: {
    updateSeries: function (series) {
      axios.patch('http://192.168.1.90:3000/api/series/' + series.id)
        .then(() => {
          this.$emit('modified')
        })
    },
    getProgressSeason: async function (season) {
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
    getProgress: async function (series) {
      let total = 0
      let watched = 0
      for (let i = 0; i < series.Seasons.length; i++) {
        let aux = await this.getProgressSeason(series.Seasons[i])
        watched += aux[0]
        total += aux[1]
      }
      this.watched = watched
      this.total = total
    },
    deleteSeries: function (series) {
      this.$emit('delete-row')
      axios.delete('http://192.168.1.90:3000/api/series/' + series.id)
    },
    markAsWatchedEpisode: function (episode) {
      axios.patch('http://192.168.1.90:3000/api/episode/' + episode.id + '/watched')
        .then(() => {
          this.$emit('modified')
        })
    },
    markAsWatchedNoStatsEpisode: function (episode) {
      axios.patch('http://192.168.1.90:3000/api/episode/' + episode.id + '/watchednostats')
        .then(() => {
          this.$emit('modified')
        })
    },
    markAsUnwatchedEpisode: function (episode) {
      axios.patch('http://192.168.1.90:3000/api/episode/' + episode.id + '/unwatched')
        .then(() => {
          this.$emit('modified')
        })
    },
    changedStateSeries: function (series, state) {
      axios.patch('http://192.168.1.90:3000/api/series/' + series.id + '/state', { 'state': state })
        .then(() => {
          this.$emit('delete-row')
        })
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
