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
          <b-card-img
            :src="documentary.image"
            class="card-image"
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
              <div
                :v-if="documentary.UserGM.consumed"
              >
                <h6> 🎞 {{ parseDate(documentary.UserGM.consumedDate) }} </h6>
              </div>
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
          </b-card-body>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>

export default {
  name: 'SimpleDocumentaryListItem',
  props: { 'documentary': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
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
