import React, { Component } from 'react'
import Main from './components/Main.jsx'
import Home from './components/Home.jsx'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

class App extends Component {
	render() {
		return (
			<div>
				<Router>
					<Switch>
						<Route path="/" exact component={Home} />
						<Route path="/:url" component={Main} />
					</Switch>
				</Router>
			</div>
		)
	}
}

export default App;