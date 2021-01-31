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
            :src="documentary.image"
          />
        </b-col>
        <b-col sm="6">
          <b-card-body
            :title="documentary.title"
            :sub-title="documentary.year.toString()"
          >
            <b-card-text>
              <h4> ★ {{ documentary.Documentary.rating }} </h4>
              <h5> ⌚ {{ documentary.Documentary.duration }} minutos </h5>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(genre) in documentary.Genres"
                :key="genre.name"
                class="genre"
              >
                {{ genre.name }}
              </b-badge>
            </b-card-text>
            <b-card-text>
              <b-button
                :href="'https://yts.am/browse-documentaries/'+documentary.title+'/all/all/0/latest'"
                variant="info"
              >
                YTS
              </b-button>
              <b-button
                :href="'https://thepiratebay.org/search/'+documentary.title+'/0/99/0'"
                variant="info"
              >
                TPB
              </b-button>
              <b-button
                :href="'https://rarbgcore.org/torrents.php?search='+documentary.title"
                variant="info"
              >
                RARBG
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-button
                variant="success"
                @click="$emit('delete-row'); markAsWatchedDocumentary(documentary)"
              >
                Marcar Como Visto
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-button
                variant="warning"
                :href="'#/documentaries/edit/'+documentary.Documentary.id"
              >
                Edit
              </b-button>
              <b-button
                variant="danger"
                @click="$emit('delete-row'); deleteDocumentary(documentary)"
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
  name: 'DocumentaryListItem',
  props: { 'documentary': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
  data () {
    return {

    }
  },
  methods: {
    deleteDocumentary: function (documentary) {
      axios.delete('http://192.168.1.90:3000/api/documentaries/' + documentary.Documentary.id)
    },
    markAsWatchedDocumentary: function (documentary) {
      axios.patch('http://192.168.1.90:3000/api/documentaries/' + documentary.Documentary.id + '/watched')
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
