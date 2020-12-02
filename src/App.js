import axios from 'axios';
import { Component } from 'react';
import { ReactComponent as Mascot } from './assets/duck-mascot.svg' // Just wanted to experiment with importing svgs as Components
import firebase from './firebase';
import IssueForm from './IssueForm';
import IssueReport from './IssueReport';
import './styles/style.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      formActive: true,
      reportActive: false
    };
  }

  componentDidMount() {
    // I chose the App component because I don't want it to call axios everytime there's a mount/unmount.
    axios({
      url: `https://api.github.com/users/vhok/repos`,
      method: `GET`,
      responseType: `json`,
      headers: {
        Authorization: `token ad2e83aa770043df2594530479e4de404e6170e1` 
       // This token is read-only. Also, this authorization method via query parameters valid until May 5, 2021.
       // https://developer.github.com/v3/#authentication
       // https://developer.github.com/v3/auth/#via-oauth-and-personal-access-tokens
      }
    })
    .then( (response) => {
      const dbRefProjects = firebase.database().ref('projects-current');
      const repoArray = response.data.map((repo) => repo.name);

      dbRefProjects.remove();
      for(let record of repoArray) {
        dbRefProjects.push(record);
      }
    })
    .catch( (error) => {
      // use local copy
      console.log("axios is catching");
    });
  }

  render() {
    return (
      <div className="App">
        
        {/* ******* HEADER ******* */}
        <header>
          <div className="wrapper">
            <h1>My Debug Pal</h1>
            <Mascot fill="#ffffff" width="10%" />
          </div>
        </header>

        {/* ******* MAIN ******* */}
        <main>
          
          <div className="wrapper">
            <nav>
              <ul>
                <li><button onClick={ () => { this.setState({formActive: true, reportActive: false}) }}>Submit Issue</button></li>
                <li><button onClick={ () => { this.setState({ formActive: false, reportActive: true }) }}>View Report</button></li>
              </ul>
            </nav>
            {this.state.formActive ? <IssueForm/> : null}
            {this.state.reportActive ? <IssueReport/> : null}
          </div>
        </main>

        {/* ******* FOOTER ******* */}
        <footer>
          <p>Copyright <a href="https://victorhok.com/" target="_blank" rel="noopener noreferrer">Victor Hok</a> @ <a href="https://junocollege.com/" target="_blank" rel="noopener noreferrer">Juno College 2020</a></p>
        </footer>
      </div>
    );
  }
}

export default App;
