import { Component } from 'react';
import { ReactComponent as Mascot } from './assets/duck-mascot.svg' // Just wanted to experiment with importing svgs as Components
import './styles/style.scss';

class App extends Component {
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
                <li><button>Submit Bug</button></li>
                <li><button>View Report</button></li>
              </ul>
            </nav>
            <div className="submit">
              <form className="submit__form">
                <h2>A new bug has been discovered in the wild! 🔍</h2>
                <label htmlFor="submit__input-title">Bug Title</label>
                <input type="text" id="submit__input-title" />
                <label htmlFor="submit__input-description">Details</label>
                <textarea id="submit__input-description" cols="30" rows="10"></textarea>
                <button type="submit">Submit</button>
                {/* NEED TO PROVIDE ID BACK TO USER AT SOME POINT FOR REFERENCE */}
              </form>
            </div>

            <div className="report">
              <ul>
                <li>Bug 1</li>
                <li>Bug 2</li>
                <li>Bug 3</li>
              </ul>
              <form>
                <label htmlFor="report__input-id">ID</label>
                <input type="text" id="report__input-id"/>
                <label htmlFor="report__input-title">Title</label>
                <input type="text" id="report__input-title"/>
                <label htmlFor="report__input-description">Description</label>
                <textarea id="report__input-description" cols="30" rows="10"></textarea>
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
