<template>
  <div>
    <b-card
      no-body
      class="main-card overflow-hidden"
      bg-variant="dark"
      text-variant="white"
    >
      <button @click="selected">
        <b-row no-gutters>
          <b-col sm="6">
            <b-card-img
              :src="movie.Poster"
              class="card-image"
            />
          </b-col>
          <b-col sm="6">
            <b-card-body
              :title="movie.Title"
              :sub-title="movie.Year.toString()"
            />
          </b-col>
        </b-row>
      </button>
    </b-card>
  </div>
</template>

<script>

export default {
  name: 'SearchMovieListItem',
  props: { 'movie': { type: Object, required: true } },
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
    selected () {
      return this.$emit('add', 'https://www.imdb.com/title/' + this.movie.imdbID.toString())
    }
  }
}
</script>

<style scoped>

.genre{
  margin-left:0.2rem;
}

.main-card {
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.main-card{
  margin: 0 auto;
  max-height:200px; max-width:80%;
}

@media only screen and (min-width: 256px)  {
  .card-image{
    position: relative;
    max-width: 60px;
    height: 100%;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
  }
}

@media only screen and (min-width: 576px)  {
  .card-image{
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
    background: #000;
    width: 150px;
    max-width: 243.425px; /*requires explicit height*/
  }
}

</style>
