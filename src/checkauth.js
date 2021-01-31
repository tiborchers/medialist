import axios from 'axios'
import { VueOfflineStorage } from 'vue-offline'

function checkLogin () {
  if (VueOfflineStorage.get('token')) {
    axios.defaults.headers.common['Authorization'] = VueOfflineStorage.get('token').token
    if (!sameDay(new Date(), new Date(VueOfflineStorage.get('token').date)) && navigator.onLine) {
      return axios
        .get('http://192.168.1.90:3000/api/check/')
        .then(async response => {
          return axios.get('http://192.168.1.90:3000/api/renew/')
            .then(response1 => {
              VueOfflineStorage.set('token', { token: 'Bearer ' + response1.data.token, date: new Date() })
              axios.defaults.headers.common['Authorization'] = VueOfflineStorage.get('token').token
              return true
            })
            .catch(() => {
              return false
            })
        })
        .catch(() => {
          VueOfflineStorage.set('token', null)
          VueOfflineStorage.set('user', null)
          return false
        })
    } else {
      return true
    }
  } else {
    return false
  }
}

function sameDay (d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

export default checkLogin
