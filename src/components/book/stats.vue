<template>
  <div class="main">
    <div
      v-if="loading"
      class="spinner"
    >
      <b-spinner
        class="b-spinner"
        variant="light"
        label="Spinning"
      />
    </div>
    <b-card
      bg-variant="dark"
      text-variant="white"
    >
      <h5>Libros Por Leer: {{ count }} </h5>
      <h6>Libros Leídos: {{ countRead }} </h6>
      <h3>Horas Por Leer: {{ HLTR(sum) }} </h3>
      <h2>Horas Leidas: {{ HLTR(countTotal()) }} </h2>
      <h4>Promedio: {{ HLTR(averageTotal()) }} Horas al mes </h4>
      <p> {{ howLongWillItTake() }} años en total</p>
    </b-card>
    <div
      v-for="(value,key) in books"
      :key="key"
    >
      <b-button
        v-b-toggle="'collapse' + key"
        block
        variant="primary"
      >
        {{ key }}
      </b-button>
      <b-collapse :id="'collapse' + key ">
        <b-card
          bg-variant="dark"
          text-variant="white"
        >
          <h4>Horas Leidas: {{ HLTR(countYear(key)) }} </h4>
          <h2>Promedio: {{ HLTR(averageYear(key)) }} </h2>
          <h5>Libros Leidos: {{ countReadYear(key) }} </h5>
          <div
            v-for="(value1, key1) in value"
            :key="key1"
          >
            <div v-if="countMonth(key,key1) ==0 ">
              <b-button
                v-b-toggle="'collapse' + key + key1"
                block
                variant="danger"
              >
                {{ key1 }}
              </b-button>
              <b-collapse
                :id="'collapse' + key + key1"
                class="mt-2"
              >
                <b-card
                  bg-variant="dark"
                  text-variant="white"
                >
                  <div
                    v-for="(value2, key2) in value1"
                    :key="key2"
                  >
                    <h4>Horas Leidas: {{ HLTR(countMonth(key,key1)) }} </h4>
                    <h5>Libros Leidos: {{ countReadMonth(key, key1) }} </h5>
                  </div>
                </b-card>
              </b-collapse>
            </div>
            <div v-else>
              <b-button
                v-b-toggle="'collapse' + key + key1"
                block
                variant="primary"
              >
                {{ key1 }}
              </b-button>
              <b-collapse
                :id="'collapse' + key + key1"
                class="mt-2"
                :visible="true"
              >
                <b-card
                  bg-variant="dark"
                  text-variant="white"
                >
                  <div
                    v-for="(value2, key2) in value1"
                    :key="key2"
                  >
                    <h4>Horas Leidas: {{ HLTR(countMonth(key,key1)) }} </h4>
                    <h5>Libros Leidos: {{ countReadMonth(key, key1) }} </h5>
                    <div
                      v-for="(value3) in value2"
                      :key="value3.Book.id"
                    >
                      <SimpleBookListItem
                        :book="value3"
                        @delete-row="deleteThisRow(index)"
                      />
                    </div>
                  </div>
                </b-card>
              </b-collapse>
            </div>
          </div>
        </b-card>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import SimpleBookListItem from './simplebooklistitem.vue'

export default {
  name: 'BookStats',
  components: {
    SimpleBookListItem
  },
  data () {
    return {
      books: {},
      sum: 0,
      count: 0,
      countRead: 0,
      loading: false,
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    }
  },
  mounted () {
    this.loading = true
    if (this.isOnline) {
      axios.get('http://192.168.1.90:3000/api/books/read')
        .then(response => {
          this.$offlineStorage.set('booksRead', response.data)
          if (response.data.length) {
            this.createList(response.data[0].UserGM.consumedDate)
          } else {
            this.createList()
          }
          this.sortByMonth(response.data)
          this.loading = false
        })
      axios.get('http://192.168.1.90:3000/api/books/toread/sum')
        .then(response => {
          this.$offlineStorage.set('booksReadSum', response.data.books[0].total)
          this.sum = response.data.books[0].total
        })
      axios.get('http://192.168.1.90:3000/api/books/toread/count')
        .then(response => {
          this.$offlineStorage.set('booksReadCount', response.data.count)
          this.count = response.data.count
        })
      axios.get('http://192.168.1.90:3000/api/books/read/count')
        .then(response => {
          this.$offlineStorage.set('booksReadedCount', response.data.count)
          this.countRead = response.data.count
        })
    } else {
      if (this.$offlineStorage.get('booksRead').length) {
        this.createList(this.$offlineStorage.get('booksRead')[0].UserGM.consumedDate)
      } else {
        this.createList()
      }
      this.sortByMonth(this.$offlineStorage.get('booksRead'))
      this.sum = this.$offlineStorage.get('booksReadSum')
      this.count = this.$offlineStorage.get('booksReadCount')
      this.countRead = this.$offlineStorage.get('booksReadedCount')
      this.loading = false
    }
  },
  methods: {
    deleteThisRow: function (index) {
      this.books.data.splice(index, 1)
    },
    putBookInMonth: function (book) {
      let month = (new Date(book.UserGM.consumedDate)).getMonth()
      let year = (new Date(book.UserGM.consumedDate)).getFullYear()
      this.books[year.toString()][this.months[month]]['books'].push(book)
    },
    sortByMonth: function (books, object) {
      books.map(book => this.putBookInMonth(book))
    },
    range: function (size, startAt = 0) {
      return [...Array(size).keys()].map(i => i + startAt)
    },
    createList: function (mindate = new Date()) {
      let list = { }
      let MinDate = new Date(mindate)
      let nowDate = new Date()
      this.range(nowDate.getFullYear() - MinDate.getFullYear() + 1, MinDate.getFullYear()).map(
        year => {
          list[year.toString()] = { }
          if (year === nowDate.getFullYear() && year === MinDate.getFullYear()) {
            this.range(nowDate.getMonth() - MinDate.getMonth() + 1, MinDate.getMonth()).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['books'] = []
              }
            )
          } else if (year === nowDate.getFullYear()) {
            this.range(nowDate.getMonth() + 1).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['books'] = []
              }
            )
          } else if (year === MinDate.getFullYear()) {
            this.range(12 - MinDate.getMonth(), MinDate.getMonth()).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['books'] = []
              }
            )
          } else {
            this.range(12, 0).map(
              month => {
                list[year.toString()][this.months[month]] = {}
                list[year.toString()][this.months[month]]['books'] = []
              }
            )
          }
        }
      )
      this.books = list
    },
    countMonth: function (year, month) {
      let count = 0
      for (const key in Object.keys(this.books[year.toString()][month.toString()]['books'])) {
        count += this.books[year.toString()][month.toString()]['books'][key].Book.pages
      }
      return count
    },
    countYear: function (year) {
      let result = 0
      const keys = Object.keys(this.books[year])
      for (const key of keys) {
        result = result + this.countMonth(year, key)
      }
      return result
    },
    countTotal: function () {
      let result = 0
      const keys = Object.keys(this.books)
      for (const key of keys) {
        result = result + this.countYear(key)
      }
      return result
    },
    countReadMonth: function (year, month) {
      let count = Object.keys(this.books[year.toString()][month.toString()]['books']).length
      return count
    },
    countReadYear: function (year) {
      let result = 0
      const keys = Object.keys(this.books[year])
      for (const key of keys) {
        result = result + this.countReadMonth(year, key)
      }
      return result
    },
    averageYear: function (year) {
      if (typeof this.books[year] === 'undefined') {
        return 0
      }
      const keys = Object.keys(this.books[year]).length
      if (keys === 0) {
        return 0
      }
      let total = this.countYear(year)
      return (total / keys).toFixed(2)
    },
    averageTotal: function () {
      let result = 0
      const number = Object.keys(this.books).length
      if (number === 0) {
        return 0
      }
      const keys = Object.keys(this.books)
      for (const key of keys) {
        result = result + parseFloat(this.averageYear(key))
      }
      return (result / number).toFixed(2)
    },
    howLongWillItTake: function () {
      return ((this.sum / (parseFloat(this.averageTotal()))) / 12).toFixed(2)
    },
    HLTR: function (pages) {
      return ((pages * 250.0) / (133.0 * 60.0)).toFixed(2)
    }
  }
}
</script>

<style scoped>
.main {
  padding-top: 2rem;
}

.spinner{
  margin: 2rem;
}

.b-spinner{
  width: 10rem;
  height: 10rem;
}

</style>
