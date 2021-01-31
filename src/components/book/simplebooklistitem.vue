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
          <b-card-img
            :src="book.image"
            class="card-image"
          />
        </b-col>
        <b-col sm="6">
          <b-card-body
            :title="book.title"
            :sub-title="book.year.toString()"
          >
            <b-card-text>
              <h4> ★ {{ book.Book.rating }} </h4>
              <h5 v-if="book.Book.pages > 36">
                ⌚ {{ HLTR(book.Book.pages) }} horas
              </h5>
              <h5 v-else>
                ⌚ {{ HLTR(book.Book.pages) }} hora
              </h5>
              <div :v-if="book.UserGM.consumed">
                <h6> &#128214; {{ parseDate(book.UserGM.consumedDate) }} </h6>
              </div>
            </b-card-text>
            <b-card-text>
              <b-badge
                v-for="(genre) in book.Genres"
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
  name: 'SimpleBookListItem',
  props: { 'book': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
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
    HLTR: function (pages) {
      return ((pages * 250.0) / (133.0 * 60.0)).toFixed(2)
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
    max-width: 192px;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
  }
}

@media only screen and (min-width: 576px)  {
  .card-image{
    position:absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    margin: auto;
    width: 250px; /*requires explicit height*/
    max-width: 250px;
  }
}

.lol{
  position:relative;
}

</style>
