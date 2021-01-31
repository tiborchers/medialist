<template>
  <div id="app">
    <div v-if="showNavbar">
      <b-navbar
        toggleable="lg"
        type="dark"
        variant="dark"
        fixed="top"
      >
        <b-navbar-brand
          style="cursor: pointer"
          @click="scrollToTop"
        >
          <img
            src="./assets/concert.png"
            style="height: 7vh;"
          >
          MediaList
        </b-navbar-brand>
        <b-navbar-toggle
          target="nav_collapse"
          right
        />
        <b-collapse
          id="nav_collapse"
          is-nav
        >
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Peliculas"
              variant="dark"
            >
              <b-dropdown-item href="#/movies">
                Por Ver
              </b-dropdown-item>
              <b-dropdown-item href="#/movies/watched">
                Vistos
              </b-dropdown-item>
              <b-dropdown-item href="#/movies/stats">
                Estadísticas
              </b-dropdown-item>
              <b-dropdown-item href="#/movies/new">
                Crear Película
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Cortos"
              variant="dark"
            >
              <b-dropdown-item href="#/shorts">
                Por Ver
              </b-dropdown-item>
              <b-dropdown-item href="#/shorts/watched">
                Vistos
              </b-dropdown-item>
              <b-dropdown-item href="#/shorts/stats">
                Estadísticas
              </b-dropdown-item>
              <b-dropdown-item href="#/shorts/new">
                Crear Corto
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Documentales"
              variant="dark"
            >
              <b-dropdown-item href="#/documentaries">
                Por Ver
              </b-dropdown-item>
              <b-dropdown-item href="#/documentaries/watched">
                Vistos
              </b-dropdown-item>
              <b-dropdown-item href="#/documentaries/stats">
                Estadísticas
              </b-dropdown-item>
              <b-dropdown-item href="#/documentaries/new">
                Crear Documentales
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Video Juegos"
              variant="dark"
            >
              <b-dropdown-item href="#/videoGames">
                Por Jugar
              </b-dropdown-item>
              <b-dropdown-item href="#/videoGames/played">
                Jugados
              </b-dropdown-item>
              <b-dropdown-item href="#/videoGames/stats">
                Estadísticas
              </b-dropdown-item>
              <b-dropdown-item href="#/videoGames/new">
                Crear Video Juego
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Libros"
              variant="dark"
            >
              <b-dropdown-item href="#/books">
                Por leer
              </b-dropdown-item>
              <b-dropdown-item href="#/books/read">
                Leídos
              </b-dropdown-item>
              <b-dropdown-item href="#/books/stats">
                Estadísticas
              </b-dropdown-item>
              <b-dropdown-item href="#/books/new">
                Crear Libros
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Albums"
              variant="dark"
            >
              <b-dropdown-item href="#/albums">
                Por escuchar
              </b-dropdown-item>
              <b-dropdown-item href="#/albums/listened">
                Escuchado
              </b-dropdown-item>
              <b-dropdown-item href="#/albums/stats">
                Estadísticas
              </b-dropdown-item>
              <b-dropdown-item href="#/albums/new">
                Crear Album
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav>
            <b-nav-item-dropdown
              text="Series"
              variant="dark"
            >
              <b-dropdown-item href="#/series">
                Por Ver
              </b-dropdown-item>
              <b-dropdown-item href="#/series/watching">
                Viendo
              </b-dropdown-item>
              <b-dropdown-item href="#/series/wfns">
                Esperando Nueva Temporada
              </b-dropdown-item>
              <b-dropdown-item href="#/series/done">
                Vistos
              </b-dropdown-item>
              <b-dropdown-item href="#/series/dropped">
                Botados
              </b-dropdown-item>
              <b-dropdown-item href="#/series/stats">
                Estadísticas
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown
              text="Usuario"
              right
            >
              <b-dropdown-item
                href="#"
              >
                <b-button
                  variant="danger"
                  @click="logout"
                >
                  Sign Out
                </b-button>
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <div v-else>
      <b-navbar
        toggleable="lg"
        type="dark"
        variant="dark"
        fixed="top"
      >
        <b-navbar-brand
          href="#/"
        >
          MediaList
        </b-navbar-brand>
      </b-navbar>
    </div>

    <router-view />

    <div
      color="stylish-color-dark"
      class="page-footer font-small pt-4 mt-4"
    >
      <hr>
      <div class="footer-copyright text-center py-3">
        <div fluid>
          &copy; 2019 Not Copyrighted by Tomás Borchers
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
      showNavbar: false
    }
  },
  watch: {
    '$route' (to, from) {
      // lets watch for route changes on our
      // main parent app component.
      if (to.name === 'Login') {
        this.showNavbar = false
      } else {
        this.showNavbar = true
      }
    }
  },
  mounted () {
    this.showNavbar = this.$route.name !== 'Login'
  },
  methods: {
    logout: function () {
      this.$offlineStorage.set('token', null)
      this.$offlineStorage.set('user', null)
      this.$router.push('/login')
    },
    scrollToTop: function () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: #292d32;
  margin-top: 56px;
  min-height: 100vh;
}

.footer-copyright{
  color: white;
};

</style>
