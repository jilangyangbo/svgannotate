import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import Mark from '@/pages/mark'
import App from '@/App'
function Index() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App}></Route>
        <Route path="/mark">
          <Mark />
        </Route>
      </Switch>
    </Router>
  )
}
export default Index
