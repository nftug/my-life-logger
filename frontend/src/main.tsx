import IndexPage from '@/pages/IndexPage'
import { Route, Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import App from './App'
import './app.css'

render(
  () => (
    <Router root={App}>
      <Route path="/" component={IndexPage} />
    </Router>
  ),
  document.getElementById('root')!,
)
