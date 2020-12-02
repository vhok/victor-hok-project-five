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
    const dbRef = firebase.database().ref();
    // This isn't doing anything useful right now.
    dbRef.on('value', (data) => {
      console.log(data.val());
    });

    // I think it's more convenient to put axios request in IssueForm. But, chose this spot because I don't want it to be triggered everytime there's a mount/unmount.
    axios({
      // url: `https://api.github.com/users/vhok/repos`,
      // method: `GET`,
      // respponseType: `json`,
      // params not needed because only need repo name for now.
    })
    .then(
      // update the project name list
    ).catch( (error) => {
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
