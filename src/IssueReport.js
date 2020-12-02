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
         * response: <response>,
         * status: <status>,
         * id: <id>,
         * dateOpened: <date> (in milliseconds for JavaScript Date() constructor )
         * }
         * */
        issueSelectedId: '',
        issueSelected: {
            title: '',
            details: '',
            dateOpened: '',
            status: '',
            response: ''
        },
        projectSelected: '',
        projectList: []
        };
    }

    updateIssueList = (dbSnap) => {
        // Updates the values of issueList after projectList fully updated
        const firebaseDataObj = dbSnap.child(`${this.state.projectSelected}/active`).val();
        const issues = [];

        for (let id in firebaseDataObj) {
            issues.push({
                id: id,
                title: firebaseDataObj[id].title,
                details: firebaseDataObj[id].details,
                dateOpened: firebaseDataObj[id].dateOpened,
                response: firebaseDataObj[id].response,
                status: firebaseDataObj[id].status
            });
        }
        // Update the issueList with database values
        this.setState({ issueList: issues });
    }

    projectSelectHandler = (event) => {
        // Need to reset issueSelectedId to prevent looking up bad value
        this.setState({
            projectSelected: event.target.value, issueSelectedId: '', issueSelected: {
                title: '',
                details: '',
                dateOpened: '',
                status: '',
                response: ''}
            });
        const dbRef = firebase.database().ref();

        dbRef.once('value')
            .then( (dbSnap) => {this.updateIssueList(dbSnap)} );
    }

    issueSelectHandler = (event) => {
        const dataKey = event.target.getAttribute('data-key');
        const selectedIndex = this.state.issueList.findIndex( issue => issue.id === dataKey)
        const issueObj = {...this.state.issueList[selectedIndex]};
        
        this.setState({ issueSelectedId: dataKey, issueSelected: issueObj});
    }

    inputEditHandler = (event, property) => {
        // Use updater function to modify the specified issue object that resides in the state object.
        this.setState( prevState => {
            const issueSelected = { ...prevState.issueSelected };
            delete issueSelected.id;
            
            issueSelected[property] = event.target.value;
            return { issueSelected };
        });
    }

    // Updates the database in response to user submit event
    submitResponseHandler = (event) => {
        event.preventDefault();
        const dbRef = firebase.database().ref(`${this.state.projectSelected}/active`);

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
        // Retrieves the issues from the database and stores them locally
        const dbRef = firebase.database().ref();
        
        dbRef.once('value')
        .then( (data) => {
            // Initialize the value of projectSelected on page load (if there's a value available).
            let projectName = '';
            if (data.exists()) {
                const dataObj = data.val();
                projectName = Object.keys(dataObj)[0];
            }

            // Wait for projectSelected to get new value and then activate the on listener
            this.setState({projectSelected: projectName}, () => {
                // Purpose is to update the array of issues on selected project whenever it detects a change in database.
                // This will take care of what happens in the background inbetween user interactions and not during the interaction itself.
                dbRef.on('value', (dbSnap) => {
                    // Updates the values of projectList 
                    const projectKeys = [];
                    for (let project in dbSnap.val()) {
                        projectKeys.push(project);
                    }

                    this.setState({projectList: projectKeys}, () => {
                        this.updateIssueList(dbSnap);
                    });
                });
            });
        })
    }

    componentWillUnmount() {
        const dbRef = firebase.database().ref();
        dbRef.off('value');
    }

    render() {
        return (
            <div className="report">
                <div className="report__div-project-dash">
                    {/* List of projects */}
                    <label htmlFor="report__select-project"></label>
                    <select id="report__select-project" onChange={ (event) => {this.projectSelectHandler(event);} }>
                        {this.state.projectList.map( (project) => {
                            return (
                                <option key={project} value={project}>{project}</option>
                            );
                        })}
                    </select>

                    {/* List of issues */}
                    <ol>
                        {this.state.issueList.map( (issue) => {
                            return (
                                // Create a custom data-key attribute to embed the firebase record id into the element.
                                // This creates an association between the button and makes available the firebase id in which the programmer can access. 
                                <li key={issue.id}>
                                    <button onClick={this.issueSelectHandler} data-key={issue.id}>{issue.title}</button>
                                </li>
                            );
                        } )
                    }
                    </ol>
                </div>

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