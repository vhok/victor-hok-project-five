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
        issueSelectedId: '',
        issueSelected: {
            title: '',
            details: '',
            dateOpened: '',
            status: '',
            response: ''
        }
        };
    }

    issueSelectHandler = (event) => {
        const dataKey = event.target.getAttribute('data-key');
        const selectedIndex = this.state.issueList.findIndex( issue => issue.id === dataKey)
        const issueObj = {};

        for(let property in this.state.issueSelected) {
            issueObj[property] = this.state.issueList[selectedIndex][property];
        }

        this.setState({ issueSelectedId: dataKey, issueSelected: issueObj});
    }

    inputEditHandler = (event, property) => {
        // Use updater function to modify the specified issue object that resides in the state object.
        this.setState( prevState => {
            const issueSelected = { ...prevState.issueSelected };
            issueSelected[property] = event.target.value;
            return { issueSelected };
        });
    }

    // UPDATES THE DATABASE VALUES
    submitResponseHandler = (event) => {
        event.preventDefault();
        const dbRef = firebase.database().ref('active');

        if(this.state.issueSelectedId !== '') {
            dbRef.child(this.state.issueSelectedId).update(this.state.issueSelected);
        }
    }

    // Checks if the issue is closed at live database level
    isIssueClosed = (selectedId) => {
        const selectedIndex = this.state.issueList.findIndex(issue => issue.id === selectedId);
        return this.state.issueList[selectedIndex].status === 'closed';
    }

    componentDidMount() {
        // RETRIEVES THE DATABASE VALUES AND KEEPS THE LOCAL ARRAY UP TO DATE
        const dbRef = firebase.database().ref('active');
        
        dbRef.on('value', (data) => {
            const firebaseDataObj = data.val();
            const issues = [];

            for(let id in firebaseDataObj) {
                issues.push({
                    id: id,
                    title: firebaseDataObj[id].title,
                    details: firebaseDataObj[id].details,
                    dateOpened: firebaseDataObj[id].dateOpened,
                    response: firebaseDataObj[id].response,
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
                <form onSubmit={this.submitResponseHandler}>
                    <label htmlFor="report__input-id">ID</label>
                    <input type="text" id="report__input-id" 
                        value={this.state.issueSelectedId} 
                        readOnly />

                    <label htmlFor="report__input-date-opened">Date Opened</label>
                    <input type="datetime" id="report__input-date-opened" 
                        value={this.state.issueSelected.dateOpened ? new Date(this.state.issueSelected.dateOpened).toLocaleString() : ''} 
                        readOnly />

                    <label htmlFor="report__input-title">Title</label>
                    <input type="text" id="report__input-title" 
                        onChange={(event) => this.inputEditHandler(event, 'title')} 
                        value={this.state.issueSelected.title} 
                        readOnly={this.state.issueSelected.status === "closed"}/>

                    <label htmlFor="report__input-details">Details</label>
                    <textarea id="report__input-details" cols="30" rows="10"
                        onChange={(event) => this.inputEditHandler(event, 'details')} 
                        value={this.state.issueSelected.details} 
                        readOnly={this.state.issueSelected.status === "closed"}>
                    </textarea>

                    <label htmlFor="report__input-response">Response</label>
                    <textarea id="report__input-response" cols="30" rows="10"
                        onChange={(event) => this.inputEditHandler(event, 'response')}
                        value={this.state.issueSelected.response}
                        readOnly={this.state.issueSelected.status === "closed"}>
                    </textarea>

                    <label htmlFor="report__input-status">Status</label>
                    <select id="report__select-status" 
                        onChange={(event) => this.inputEditHandler(event, 'status')} 
                        value={this.state.issueSelected.status}
                        disabled={this.state.issueSelectedId ? this.isIssueClosed(this.state.issueSelectedId) : false}>
                        <option value="open">Open</option>
                        <option value="wip">In Progress</option>
                        <option value="closed">Closed</option>
                    </select>
                    
                    <button type="submit">Update Response</button>
                </form>
            </div>
        );
    }
}

export default IssueReport;