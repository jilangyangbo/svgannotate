import { HashRouter as Router, Switch, Route } from 'react-router-dom'

import Mark from '@/pages/mark'
import App from '@/App'
function Index() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Mark />
        </Route>
      </Switch>
    </Router>
  )
}
export default Index
