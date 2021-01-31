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
            class="card-image"
            :src="book.image"
          />
        </b-col>
        <b-col sm="6">
          <b-card-body
            :title="book.title"
            :sub-title="book.Book.author"
          >
            <b-card-text>
              <h6> {{ book.year }} </h6>
              <h4> ★ {{ book.Book.rating }} </h4>
              <h5 v-if=" book.Book.pages > 36">
                ⌚ {{ HLTR(book.Book.pages) }} horas
              </h5>
              <h5 v-else>
                ⌚ {{ HLTR(book.Book.pages) }} hora
              </h5>
              <h6> {{ book.commentary }} </h6>
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
            <b-card-text>
              <b-button
                variant="success"
                @click="markAsReadBook(book)"
              >
                Marcar Como leído
              </b-button>
            </b-card-text>
            <b-card-text>
              <b-button
                :href="'#/books/edit/'+book.id"
                variant="warning"
              >
                Edit
              </b-button>
              <b-button
                variant="danger"
                @click="deleteBook(book)"
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
  name: 'BookListItem',
  props: { 'book': { type: Object, default: function () { return { id: -1, title: 'error' } } } },
  data () {
    return {

    }
  },
  methods: {
    deleteBook: function (book) {
      this.$emit('delete-row')
      axios.delete('http://192.168.1.90:3000/api/books/' + book.Book.id)
    },
    markAsReadBook: function (book) {
      this.$emit('delete-row')
      axios.patch('http://192.168.1.90:3000/api/books/' + book.Book.id + '/read')
    },
    HLTR: function (pages) {
      return ((pages * 250.0) / (133.0 * 60.0)).toFixed(2)
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

.genre{
  margin-left:0.2rem;
}

</style>
