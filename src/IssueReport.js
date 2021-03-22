import { Component } from 'react';
import firebase from './firebase';

class IssueReport extends Component {
    constructor() {
        super();
        this.state = {
        issueList: [], // Holds the issue objects of the CURRENTLY selected project only.
        /**
         * bugList: [ {issue}, ... ]
         * 
         * issue = {
         * title: <title>,
         * details: <details>,
         * response: <response>,
         * status: <status>,
         * id: <id>,
         * dateOpened: <date> (in milliseconds for JavaScript Date() constructor )
         * }
         * 
         * */
        issueSelectedId: '',
        issueSelected: {
            title: '',
            details: '',
            dateOpened: '',
            status: '',
            response: ''
        },
        projectSelected: '', // Holds the value of currently selected project per dropdown menu.
        projectList: [] // Holds the name of project objects that's ever had issues submitted against them.
        };
    }

    // This helper function updates our state array of local issues with what's in the database, based on the CURRENTLY selected project.
    updateIssueList = (dbSnap) => {
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

    // This event handler is triggered by a dropdown change of the project list and updates the local list of issues with the firebase list of issues.
    projectSelectHandler = (event) => {
        // Need to reset issueSelectedId to prevent looking up bad value.
        this.setState({
            projectSelected: event.target.value, issueSelectedId: '', issueSelected: {
                title: '',
                details: '',
                dateOpened: '',
                status: '',
                response: ''}
            });
        const dbRefReports = firebase.database().ref('reports');

        dbRefReports.once('value')
            .then( (dbSnap) => {this.updateIssueList(dbSnap)} );
    }

    // This event handler is to identify which issue button (issue) is being clicked on and populate the form with the information from our local issue array.
    issueSelectHandler = (event) => {
        // This one's a pretty neat trick I picked up. Basically if the JSX element has a custom attribute, you can tie information to it (ie the ID) and grab it through the event object to identify it.
        const dataKey = event.target.getAttribute('data-key');
        const selectedIndex = this.state.issueList.findIndex( issue => issue.id === dataKey)
        const issueObj = {...this.state.issueList[selectedIndex]};
        
        this.setState({ issueSelectedId: dataKey, issueSelected: issueObj});
    }

    // A general purpose event handler that detects changes in the input boxes and updates its corresponding state property.
    inputEditHandler = (event, property) => {
        this.setState( prevState => {
            const issueSelected = { ...prevState.issueSelected };
            delete issueSelected.id;
            
            issueSelected[property] = event.target.value;
            return { issueSelected };
        });
    }

    // This event handler updates a specific issue in firebase.
    submitResponseHandler = (event) => {
        event.preventDefault();
        const dbRefReports = firebase.database().ref(`reports/${this.state.projectSelected}/active`);

        if(this.state.issueSelectedId !== '') {
            dbRefReports.child(this.state.issueSelectedId).update(this.state.issueSelected);
        }
    }

    // Boolean function, checks if the issue is closed at database level. (We don't want to use the local status to check state in this case because it will end up disabling the ability to edit the issue prematurely)
    isIssueClosed = (selectedId) => {
        const selectedIndex = this.state.issueList.findIndex(issue => issue.id === selectedId);
        return this.state.issueList[selectedIndex].status === 'closed';
    }

    componentDidMount() {
        const dbRefReports = firebase.database().ref('reports');
        
        // Chooses the first project from firebase to populate issues. Otherwise, just empty dropdown box and empty list of issues.
        dbRefReports.once('value')
        .then( (data) => {
            // Initialize the value of projectSelected on page load (if there's a value available).
            let projectName = '';

            // Checks if our database is empty before attempting to grab the first project listed in our reports branch of database.
            if (data.exists()) {
                const dataObj = data.val();
                projectName = Object.keys(dataObj)[0];
            }

            // Wait for projectSelected to get new value and then activate the .on() listener
            this.setState({projectSelected: projectName}, () => {
                // Purpose is to update the array of issue objects on selected project whenever it detects a change in database.
                dbRefReports.on('value', (dbSnap) => {
                    // Updates the values of projectList.
                    const projectNames = [];
                    for (let project in dbSnap.val()) {
                        projectNames.push(project);
                    }

                    this.setState({projectList: projectNames}, () => {
                        this.updateIssueList(dbSnap);
                    });
                });
            });
        })
    }

    componentWillUnmount() {
        const dbRefReports = firebase.database().ref('reports');
        dbRefReports.off('value');
    }

    render() {
        return (
            <div className="report">
                <div className="report__div-project-list">
                    {/* List of projects that had issues */}
                    <h2>Select Project</h2>
                    <select onChange={ (event) => {this.projectSelectHandler(event);} }>
                        {this.state.projectList.map( (project) => {
                            return (
                                <option key={project} value={project}>{project}</option>
                            );
                        })}
                    </select>

                    {/* List of issues */}
                    <h2>Select Issue</h2>
                    <ol aria-label="Select Issue">
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
                    <h2>Issue Details</h2>
                    <div className="report__div-fields">
                        <div className="report__div-lbl-inpt">
                            <label htmlFor="report__input-id">ID</label>
                            <input type="text" id="report__input-id" className="report__input-id"
                                value={this.state.issueSelectedId} 
                                readOnly />
                        </div>
                        <div className="report__div-lbl-inpt">
                            <label htmlFor="report__input-date-opened">Date Opened</label>
                            <input type="datetime" id="report__input-date-opened" className="report__input-date-opened"
                                value={this.state.issueSelected.dateOpened ? new Date(this.state.issueSelected.dateOpened).toLocaleString() : ''} 
                                readOnly />
                        </div>
                    </div>

                    <div className="report__div-fields">
                        <div className="report__div-lbl-inpt">
                            <label htmlFor="report__input-title">Title</label>
                            <input type="text" id="report__input-title" className="report__input-title"
                                onChange={(event) => this.inputEditHandler(event, 'title')} 
                                value={this.state.issueSelected.title} 
                                readOnly={this.state.issueSelected.status === "closed"}/>
                        </div>

                        <div className="report__div-lbl-inpt">
                            <label htmlFor="report__select-status">Status</label>
                            <select id="report__select-status"
                                onChange={(event) => this.inputEditHandler(event, 'status')}
                                value={this.state.issueSelected.status}
                                disabled={this.state.issueSelectedId ? this.isIssueClosed(this.state.issueSelectedId) : false}>
                                <option value="open">Open</option>
                                <option value="wip">In Progress</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="report__div-fields">
                        <div className="report__div-lbl-inpt">
                            <label htmlFor="report__textarea-details">Details</label>
                            <textarea id="report__textarea-details" 
                                onChange={(event) => this.inputEditHandler(event, 'details')} 
                                value={this.state.issueSelected.details} 
                                readOnly={this.state.issueSelected.status === "closed"}>
                            </textarea>
                        </div>

                        <div className="report__div-lbl-inpt">
                            <label htmlFor="report__textarea-response">Response</label>
                            <textarea id="report__textarea-response"
                                onChange={(event) => this.inputEditHandler(event, 'response')}
                                value={this.state.issueSelected.response}
                                readOnly={this.state.issueSelected.status === "closed"}>
                            </textarea>
                        </div>
                    </div>
                    
                    <button type="submit" className="report__button-submit">Update Response</button>
                    
                </form>
            </div>
        );
    }
}

export default IssueReport;