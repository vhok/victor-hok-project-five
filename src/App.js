import { Component } from 'react';
import { ReactComponent as Mascot } from './assets/duck-mascot.svg' // Just wanted to experiment with importing svgs as Components
import firebase from './firebase';
import './styles/style.scss';

class App extends Component {
  constructor() {
    super();
    this.state = {
      issueList: [],
      /**
       * bugList: [ {issue} ]
       * issue = {
       * title: <title>,
       * details: <details>,
       * status: <status>
       * }
       * */ 

      // Placeholders to "grab" current value.
      issueTitle: '',
      issueDetails: ''
    };
  }

  submitIssueHandler = (event) => {
    event.preventDefault();
    // console.log(this.state.issueTitle);
    // console.log(this.state.issueDetails);

    const dbRef = firebase.database().ref();

    dbRef.push({
      title: this.state.issueTitle,
      details: this.state.issueDetails,
      status: "open"
    });

    this.setState({
      issueTitle: '',
      issueDetails: ''
    })

  }

  inputIssueTitleHandler = (event) => {
    this.setState({
      issueTitle: event.target.value
    });
  }

  inputIssueDetailsHandler = (event) => {
    this.setState({
      issueDetails: event.target.value
    });
  }


  componentDidMount() {
    const dbRef = firebase.database().ref();

    dbRef.on('value', (data) => {
      console.log(data.val());
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
                <li><button>Submit Issue</button></li>
                <li><button>View Report</button></li>
              </ul>
            </nav>
            <div className="submit">
              <form className="submit__form" onSubmit={ this.submitIssueHandler }>
                <h2>A new bug has been discovered in the wild! 🔍</h2>
                <label htmlFor="submit__input-title">Issue Title</label>
                <input type="text" id="submit__input-title" required onChange={this.inputIssueTitleHandler} value={this.state.issueTitle}/>
                <label htmlFor="submit__input-details">Details</label>
                <textarea id="submit__input-details" cols="30" rows="10" required onChange={this.inputIssueDetailsHandler} value={this.state.issueDetails}></textarea>
                <button type="submit">Submit</button>
                {/* NEED TO PROVIDE ID BACK TO USER AT SOME POINT FOR REFERENCE */}
              </form>
            </div>

            <div className="report">
              <ul>
                <li><button>Issue 1</button></li>
                <li><button>Issue 2</button></li>
                <li><button>Issue 3</button></li>
              </ul>
              <form>
                <label htmlFor="report__input-id">ID</label>
                <input type="text" id="report__input-id" readOnly />
                <label htmlFor="report__input-title">Title</label>
                <input type="text" id="report__input-title"/>
                <label htmlFor="report__input-details">Details</label>
                <textarea id="report__input-details" cols="30" rows="10"></textarea>
                <label htmlFor="report__input-status">Status</label>
                <select id="report__select-status">
                  <option value="open">Open</option>
                  <option value="wip">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <button>Respond [Inactive]</button>
              </form>
            </div>
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
