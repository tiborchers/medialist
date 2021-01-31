<template>
  <b-table
    striped
    responsive
    dark
    hover
    :items="value.Episodes"
    :fields="fields"
  >
    <template
      v-slot:cell(Users)="data"
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
</template>

<script>
import moment from 'moment'
import axios from 'axios'
export default {
  name: 'EpisodeTable',
  props: { 'value': { type: Array[Object], default: function () { return [] } }, 'fields': { type: Array[Object], default: function () { return [] } } },
  methods: {
    markAsWatchedEpisode: function (episode) {
      axios.patch('http://192.168.1.90:3000/api/episode/' + episode.id + '/watched')
        .then(() => {
          this.$emit('modified', 1)
        })
    },
    markAsWatchedNoStatsEpisode: function (episode) {
      axios.patch('http://192.168.1.90:3000/api/episode/' + episode.id + '/watchednostats')
        .then(() => {
          this.$emit('modified', 1)
        })
    },
    markAsUnwatchedEpisode: function (episode) {
      axios.patch('http://192.168.1.90:3000/api/episode/' + episode.id + '/unwatched')
        .then(() => {
          this.$emit('modified', -1)
        })
    },
    formateDate: function (value) {
      return moment(value).format('L')
    }
  }
}

</script>

<style scoped>

</style>
