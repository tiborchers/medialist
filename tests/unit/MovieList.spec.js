import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import MovieList from '@/components/movie/movielist'
import VueOffline from 'vue-offline'

const localVue = createLocalVue()
localVue.use(VueOffline)

jest.mock('axios')

describe('MovieList', () => {
  it('renders the component', async () => {
    // arrange
    const wrapper = mount(MovieList, { localVue })
    await flushPromises()
    // assert
    expect(wrapper.html()).toMatchSnapshot()
  })
})
