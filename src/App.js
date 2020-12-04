import axios from 'axios';
import { Component } from 'react';
import { ReactComponent as Mascot } from './assets/duck-mascot.svg'; // Just wanted to experiment with importing svgs as Components
import speech from './assets/speech.png';
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

/** 
 * *************  FIREBASE DATA TREE (POTATO) STRUCTURE  **********************
 * 
 *                        FIREBASE
 *                           o dbRef
 *                          / \
 *   Live Projects (names) o   o Reports
 *                        /     \
 *     repo1, repo2, repo3...    proj1, proj2, proj3, ... (All projects we've ever had issues for)
 *                               / \
 *            archived (issues) o   o active (issues)
 *                                 / \
 *                                dateOpened, details, status, title, response
 * 
 * ****************************************************************************
 */

  componentDidMount() {
    // This API simply retrieves all the repo names from my GitHub profile and REPLACES the data on firebase.
    // If the request fails, then it's mostly a non-issue and will default to whatever is in firebase.
    // GitHub only allows 60 API calls per hour for unauthorized users. Originally, tried using authorization token. But, GitHub doesn't like that, and automatically de-activates your token if you try to commit with it in your code (obviously for security reasons).
    axios({
      url: `https://api.github.com/users/vhok/repos`,
      method: `GET`,
      responseType: `json`
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
      // Use local copy - nothing more is needed since it's all backed up on firebase.
    });
  }

  render() {
    return (
      <div className="App">
        
        {/* ******* HEADER ******* */}
        <header>
          <div className="wrapper">
            <h1>My Debug Pal</h1>
            <div className="header__div-img-speech">
              <p>Got a problem?
                Let's talk through it.
              </p>
              <img src={speech} alt="A rubber duck with a chatbox recommending to talk with it through coding problems"/>
            </div>
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
                {/* <li className="mobile--only"><button>Select Issue</button></li> --> FUTURE IMPLEMENTATION*/}
              </ul>
            </nav>
            {this.state.formActive ? <IssueForm/> : null}
            {this.state.reportActive ? <IssueReport/> : null}
          </div>
        </main>

        {/* ******* FOOTER ******* */}
        <footer>
          <p>Copyright <a href="https://victorhok.com/" target="_blank" rel="noopener noreferrer">Victor Hok</a> @ <a href="https://junocollege.com/" target="_blank" rel="noopener noreferrer">Juno College 2020.</a></p>
          <p>Credits to <a href="https://thenounproject.com/my__valerie/" target="_blank" rel="noopener noreferrer">Valerie Lamm</a> for the great icons @ The Noun Project.</p>
        </footer>
      </div>
    );
  }
}

export default App;
