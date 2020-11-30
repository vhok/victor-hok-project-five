import { Component } from 'react';
import firebase from './firebase';

class IssueReport extends Component {
    constructor() {
        super();
        this.state = {
        issueList: [],
        /**
         * bugList: [ {issue}, ... ]
         * issue = {
         * title: <title>,
         * details: <details>,
         * status: <status>,
         * id: <id>
         * date: <date> (in milliseconds for JavaScript Date() constructor )
         * }
         * */
        issueSelected: null
        };
    }

    issueSelectHandler = (event) => {
        console.log(event.target.getAttribute('data-key'));
    }

    componentDidMount() {
        const dbRef = firebase.database().ref('active');
        
        dbRef.on('value', (data) => {
            const firebaseDataObj = data.val();
            const issues = [];

            for(let id in firebaseDataObj) {
                issues.push({
                    id: id,
                    title: firebaseDataObj[id].title,
                    details: firebaseDataObj[id].details,
                    date: firebaseDataObj[id].date,
                    status: firebaseDataObj[id].status
                });
            }

            this.setState({issueList: issues});
        });
    }


    render() {
        return (
            <div className="report">
                <ul>
                    {this.state.issueList.map( (issue) => {
                        return (
                            // Create a custom data-key attribute to embed the firebase record id into the element.
                            // This creates an association between the button and the firebase id in which the programmer (myself) can access. 
                            <li key={issue.id}>
                                <button onClick={this.issueSelectHandler} data-key={issue.id}>{issue.title}</button>
                            </li>
                        );
                    } )
                    }
                </ul>
                <form>
                    <label htmlFor="report__input-id">ID</label>
                    <input type="text" id="report__input-id" readOnly />
                    <label htmlFor="report__input-title">Title</label>
                    <input type="text" id="report__input-title" />
                    <label htmlFor="report__input-details">Details</label>
                    <textarea id="report__input-details" cols="30" rows="10"></textarea>
                    <label htmlFor="report__input-status">Status</label>
                    <select id="report__select-status">
                        <option value="open">Open</option>
                        <option value="wip">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button>Update Response</button>
                </form>
            </div>
        );
    }
}

export default IssueReport;