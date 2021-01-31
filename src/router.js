import Vue from 'vue'
import Router from 'vue-router'

import MovieList from '@/components/movie/movielisttest'
import WatchedMovieList from '@/components/movie/watchedmovielist'
import MovieStats from '@/components/movie/stats'
import MovieCreate from '@/components/movie/moviecreator'

import ShortList from '@/components/short/shortlist'
import WatchedShortList from '@/components/short/watchedshortlist'
import ShortStats from '@/components/short/stats'
import ShortCreate from '@/components/short/shortcreator'

import DocumentaryList from '@/components/documentary/documentarylist'
import WatchedDocumentaryList from '@/components/documentary/watcheddocumentarylist'
import DocumentaryStats from '@/components/documentary/stats'
import DocumentaryCreate from '@/components/documentary/documentarycreator'

import VideoGameList from '@/components/videogames/videogamelist'
import VideoGameCreate from '@/components/videogames/videogamecreator'
import PlayedVideoGameList from '@/components/videogames/playedvideogamelist'
import VideoGamesStats from '@/components/videogames/stats'

import BookList from '@/components/book/booklist'
import BookCreate from '@/components/book/bookcreator'
import ReadBookList from '@/components/book/readbooklist'
import BooksStats from '@/components/book/stats'

import AlbumList from '@/components/album/albumlist'
import ListenedAlbumList from '@/components/album/listenedalbumlist'
import AlbumCreate from '@/components/album/albumcreator'
import AlbumStats from '@/components/album/stats'

import SeriesList from '@/components/series/serieslist'
import EpisodeStats from '@/components/series/stats'

import Login from '@/components/login'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/movies',
      name: 'MovieList',
      component: MovieList,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies/watched',
      name: 'WatchedMovieList',
      component: WatchedMovieList,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies/stats',
      name: 'MovieStats',
      component: MovieStats,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies/edit/:id',
      name: 'MovieEdit',
      component: MovieCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/movies/new',
      name: 'MovieNew',
      component: MovieCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/shorts',
      name: 'ShortList',
      component: ShortList,
      meta: { requiresAuth: true }
    },
    {
      path: '/shorts/watched',
      name: 'WatchedShortList',
      component: WatchedShortList,
      meta: { requiresAuth: true }
    },
    {
      path: '/shorts/stats',
      name: 'ShortStats',
      component: ShortStats,
      meta: { requiresAuth: true }
    },
    {
      path: '/shorts/edit/:id',
      name: 'ShortEdit',
      component: ShortCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/shorts/new',
      name: 'ShortNew',
      component: ShortCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/documentaries',
      name: 'DocumentaryList',
      component: DocumentaryList,
      meta: { requiresAuth: true }
    },
    {
      path: '/documentaries/watched',
      name: 'WatchedDocumentaryList',
      component: WatchedDocumentaryList,
      meta: { requiresAuth: true }
    },
    {
      path: '/documentaries/stats',
      name: 'DocumentaryStats',
      component: DocumentaryStats,
      meta: { requiresAuth: true }
    },
    {
      path: '/documentaries/edit/:id',
      name: 'DocumentaryEdit',
      component: DocumentaryCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/documentaries/new',
      name: 'DocumentaryNew',
      component: DocumentaryCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/videoGames',
      name: 'VideoGameList',
      component: VideoGameList,
      meta: { requiresAuth: true }
    },
    {
      path: '/videoGames/played',
      name: 'PlayedVideoGameList',
      component: PlayedVideoGameList,
      meta: { requiresAuth: true }
    },
    {
      path: '/videoGames/new',
      name: 'VideoGameNew',
      component: VideoGameCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/videoGames/edit/:id',
      name: 'VideoGameEdit',
      component: VideoGameCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/videoGames/stats',
      name: 'VideoGamesStats',
      component: VideoGamesStats,
      meta: { requiresAuth: true }
    },
    {
      path: '/books',
      name: 'BookList',
      component: BookList,
      meta: { requiresAuth: true }
    },
    {
      path: '/books/read',
      name: 'ReadBookList',
      component: ReadBookList,
      meta: { requiresAuth: true }
    },
    {
      path: '/books/new',
      name: 'BookNew',
      component: BookCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/books/edit/:id',
      name: 'BookEdit',
      component: BookCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/books/stats',
      name: 'BooksStats',
      component: BooksStats,
      meta: { requiresAuth: true }
    },
    {
      path: '/albums/',
      name: 'AlbumList',
      component: AlbumList,
      meta: { requiresAuth: true }
    },
    {
      path: '/albums/listened',
      name: 'ListenedAlbumList',
      component: ListenedAlbumList,
      meta: { requiresAuth: true }
    },
    {
      path: '/albums/stats',
      name: 'AlbumStats',
      component: AlbumStats,
      meta: { requiresAuth: true }
    },
    {
      path: '/albums/new',
      name: 'AlbumNew',
      component: AlbumCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/albums/edit/:id',
      name: 'AlbumEdit',
      component: AlbumCreate,
      meta: { requiresAuth: true }
    },
    {
      path: '/series/',
      name: 'SeriesList',
      component: SeriesList,
      props: { 'mode': 'towatch' },
      meta: { requiresAuth: true }
    },
    {
      path: '/series/wfns',
      name: 'SeriesListWFNS',
      component: SeriesList,
      props: { 'mode': 'wfns' },
      meta: { requiresAuth: true }
    },
    {
      path: '/series/done',
      name: 'SeriesListDone',
      component: SeriesList,
      props: { 'mode': 'done' },
      meta: { requiresAuth: true }
    },
    {
      path: '/series/watching',
      name: 'SeriesListWatching',
      component: SeriesList,
      props: { 'mode': 'watching' },
      meta: { requiresAuth: true }
    },
    {
      path: '/series/dropped',
      name: 'SeriesListDropped',
      component: SeriesList,
      props: { 'mode': 'dropped' },
      meta: { requiresAuth: true }
    },
    {
      path: '/series/stats',
      name: 'EpisodeStats',
      component: EpisodeStats,
      meta: { requiresAuth: true }
    }
  ]
})
