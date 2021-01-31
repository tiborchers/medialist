<template>
  <div class="main">
    <b-card
      bg-variant="dark"
      text-variant="white"
      title="Login"
    >
      <div v-if="error != ''">
        <b-card
          :title="error"
          bg-variant="danger"
          text-variant="white"
        />
      </div>
      <b-form
        v-if="isOnline"
        @submit="onSubmit"
        @reset="onReset"
      >
        <b-form-group
          id="input-group-1"
          label="E-Mail:"
          label-class="text-white"
        >
          <b-form-input
            id="input-1"
            v-model="user.email"
            type="text"
            required
            placeholder="Ingrese su email"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Password:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="user.password"
            type="password"
            required
            label-class="text-white"
          />
        </b-form-group>
        <b-button
          type="submit"
          variant="primary"
        >
          Submit
        </b-button>
        <b-button
          type="reset"
          variant="danger"
        >
          Reset
        </b-button>
      </b-form>
    </b-card>
    <hr>
    <b-card
      bg-variant="dark"
      title="Registrar"
      text-variant="white"
    >
      <div v-if="error != ''">
        <b-card
          :title="error"
          bg-variant="danger"
          text-variant="white"
        />
      </div>
      <b-form
        v-if="isOnline"
        @submit="onSubmitRegister"
        @reset="onResetRegister"
      >
        <b-form-group
          id="input-group-1"
          label="Tu Nombre:"
          label-class="text-white"
        >
          <b-form-input
            id="input-1"
            v-model="user2.name"
            type="text"
            required
            placeholder="Ingrese su Nombre"
          />
        </b-form-group>
        <b-form-group
          id="input-group-1"
          label="Nombre de Usuario:"
          label-class="text-white"
        >
          <b-form-input
            id="input-1"
            v-model="user2.username"
            type="text"
            required
            placeholder="Ingrese su nombre de usuario"
          />
        </b-form-group>
        <b-form-group
          id="input-group-1"
          label="E-Mail:"
          label-class="text-white"
        >
          <b-form-input
            id="input-1"
            v-model="user2.email"
            type="text"
            required
            placeholder="Ingrese su email"
          />
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Password:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="user2.password"
            type="password"
            :state="nameState"
            required
            label-class="text-white"
          />
          <b-form-invalid-feedback id="input-live-feedback">
            Tiene que ser por lo menos 8 caracteres de largo
          </b-form-invalid-feedback>
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Confirm Password:"
          label-for="input-2"
          label-class="text-white"
        >
          <b-form-input
            id="input-2"
            v-model="confirmPassword"
            type="password"
            :state="check"
            required
            label-class="text-white"
          />
          <b-form-invalid-feedback id="input-live-feedback">
            Claves no coinciden
          </b-form-invalid-feedback>
        </b-form-group>
        <b-button
          type="submit"
          variant="primary"
        >
          Submit
        </b-button>
        <b-button
          type="reset"
          variant="danger"
        >
          Reset
        </b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data () {
    return {
      user: {
        email: '',
        password: ''
      },
      user2: {
        email: '',
        username: '',
        name: '',
        password: ''
      },
      confirmPassword: '',
      error: ''
    }
  },
  computed: {
    nameState () {
      return this.user2.password.length > 7
    },
    check () {
      return this.confirmPassword === this.user2.password
    }
  },
  mounted () {
    this.checkLogin()
  },
  methods: {
    checkLogin: function () {
      if (this.isOnline) {
        this.error = ''
        if (this.$offlineStorage.get('token')) {
          if (!this.sameDay(new Date(), this.$offlineStorage.get('token').date)) {
            axios.defaults.headers.common['Authorization'] = this.$offlineStorage.get('token').token
            axios
              .get('http://192.168.1.90:3000/api/check/')
              .then(async response => {
                let response1 = await axios.get('http://192.168.1.90:3000/api/renew/')
                this.$offlineStorage.set('token', { token: 'Bearer ' + response1.data.token, date: new Date() })
                this.$router.push('/movies')
              })
              .catch(error => {
                this.error = error
                this.$offlineStorage.set('token', null)
                this.$offlineStorage.set('user', null)
              })
          }
        }
      } else {
        this.error = 'Estas offline'
      }
    },
    sameDay: function (d1, d2) {
      return d1.getFullYear === d2.getFullYear &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    },
    onSubmit: function (evt) {
      axios
        .post('http://192.168.1.90:3000/api/login/', this.user)
        .then(response => {
          this.$offlineStorage.set('token', { token: 'Bearer ' + response.data.token, date: new Date() })
          this.$offlineStorage.set('user', response.data.user)
          this.$router.push('/movies')
        })
        .catch(error => { this.error = error })
    },
    onSubmitRegister: function (evt) {
      if (this.user2.password !== this.confirmPassword) {
        this.error = 'las claves no coinciden'
        return
      }
      axios
        .post('http://192.168.1.90:3000/api/register/', this.user2)
        .then(response => {
          this.$offlineStorage.set('token', { token: 'Bearer ' + response.data.token, date: new Date() })
          this.$offlineStorage.set('user', response.data.user)
          this.$router.push('/movies')
        })
        .catch(error => {
          this.error = error.data
        })
    },
    onReset: function () {
      this.user = {
        email: '',
        password: ''
      }
    },
    onResetRegister: function () {
      this.user2 = {
        email: '',
        username: '',
        name: '',
        password: ''
      }
      this.confirmPassword = ''
    }
  }
}
</script>

<style scoped>
.main {
  padding-top: 5rem;
}

.creation {
  margin: 2rem;
}

.spinner {
  margin: 2rem;
}

.b-spinner {
  width: 10rem;
  height: 10rem;
}

.filters {
  margin: 2rem;
}
</style>
