import { Component } from 'react';
import firebase from './firebase';

class IssueForm extends Component {
    constructor() {
        super();
        this.state = {
            issueTitle: '',
            issueDetails: '',
            issueDate: '',
            issueProject: '',
            currentProjectsList: [] // [ {id: <projectId>, title: <projectName>}, ...] - Array of project objects with id & title values. 
        };
    }

    // When submit button is triggered. This function will push whatever data is in the input fields at that time (state property values) to firebase. It will then clear the input boxes in preparation for next submit.
    submitIssueHandler = (event) => {
        event.preventDefault();

        // Check if a select option other than the placeholder is selected.
        if(this.state.issueProject) {
            const dbRefIssues = firebase.database().ref(`reports/${this.state.issueProject}/active`);
    
            dbRefIssues.push({
                title: this.state.issueTitle,
                details: this.state.issueDetails,
                // JavaScript stores date in milliseconds in UTC.
                // We want to store it as a string in our database.
                // Note: firebase's ID is also technically an encoded date.
                // But, it's not a good idea to use it for time stamps because if firebase changes the id encoding algorithm
                // it will mess up the website in the future, and that, we have no control of.
                dateOpened: (new Date()).getTime(),
                status: 'open',
                response: ''
            });
    
            this.setState({
                issueTitle: '',
                issueDetails: '',
            })
        }
    }

    // A general purpose event handler that is called when a change is detected in the children form elements and updates corresponding state properties.
    inputIssueHandler = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    componentDidMount() {
        const dbRefProjectsCurrent = firebase.database().ref('projects-current');

        // When firebase data changes the project dropdown list is updated by the callback function in this .on() method.
        dbRefProjectsCurrent.on('value', (dbSnap) => {
            const projectList = [];
            const currentProjectsObj = dbSnap.val();

            for(let projectId in currentProjectsObj) {
                projectList.push({
                    id: projectId,
                    title: currentProjectsObj[projectId]
                });
            }

            this.setState({currentProjectsList: projectList});
        })
    }

    componentWillUnmount() {
        const dbRefProjectsCurrent = firebase.database().ref('projects-current');

        // Need to turn off the firebase event listener that's activated in componentDidMount() (otherwise, it'll be in limbo when this component gets unmounted which it likely will if user switches back and forth using navigation bar).
        dbRefProjectsCurrent.off('value');
    }

    render() {
        return (
            <div className={"submit " + `${this.state.issueTitle ? 'good' : 'bad'}`}>
                <h2>A new bug has been discovered in the wild! 🔍</h2>
                <form className="submit__form" onSubmit={this.submitIssueHandler}>
                    <label htmlFor="issueProject">Project</label>
                    <select id="issueProject" onChange={this.inputIssueHandler} defaultValue="placeholder">
                        {/* For now, these are just placeholders until I can pull directly from GitHub API without rate limiting calls */}
                        <option value="placeholder" disabled>Select a repository</option>
                        {
                            this.state.currentProjectsList.map( (project) => {
                                return (
                                    <option value={project.title} key={project.id}>{project.title}</option>
                                );
                            })
                        }
                    </select>
                    <label htmlFor="issueTitle">Issue Title</label>
                    <input type="text" id="issueTitle" maxLength="40" required onChange={this.inputIssueHandler} value={this.state.issueTitle} />
                    <label htmlFor="issueDetails">Details</label>
                    <textarea id="issueDetails" required onChange={this.inputIssueHandler} value={this.state.issueDetails}></textarea>
                    <button type="submit">Submit Issue</button>
                    {/* NEED TO PROVIDE ID BACK TO USER AT SOME POINT FOR REFERENCE */}
                </form>
            </div>
        );
    }
}

export default IssueForm;