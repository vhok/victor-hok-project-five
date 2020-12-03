import { Component } from 'react';
import firebase from './firebase';

class IssueForm extends Component {
    constructor() {
        super();
        this.state = {
            // Placeholders to "grab" current typed-in value prior to submit.
            issueTitle: '',
            issueDetails: '',
            issueDate: '',
            issueProject: '', // To be replaced.
            currentProjectsList: [] // [ {id: <projectId>, title: <projectName>},... ]
        };
    }

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
                // But, it's not a good idea to use because if firebase changes the id encoding algorithm
                // it will mess up the website, and that, we have no control of.
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

    selectProjectHandler = (event) => {
        this.setState({issueProject: event.target.value});
    }

    componentDidMount() {
        const dbRefProjectsCurrent = firebase.database().ref('projects-current');

        // Update the project list array when database changes.
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

        dbRefProjectsCurrent.off('value');
    }

    render() {
        return (
            <div className="submit">
                <form className="submit__form" onSubmit={this.submitIssueHandler}>
                    <h2>A new bug has been discovered in the wild! 🔍</h2>
                    <label htmlFor="submit__select-project">Project</label>
                    <select id="submit__select-project" onChange={this.selectProjectHandler} defaultValue="placeholder">
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
                    <label htmlFor="submit__input-title">Issue Title</label>
                    <input type="text" id="submit__input-title" maxLength="40" required onChange={this.inputIssueTitleHandler} value={this.state.issueTitle} />
                    <label htmlFor="submit__input-details">Details</label>
                    <textarea id="submit__input-details" cols="30" rows="10" required onChange={this.inputIssueDetailsHandler} value={this.state.issueDetails}></textarea>
                    <button type="submit">Submit</button>
                    {/* NEED TO PROVIDE ID BACK TO USER AT SOME POINT FOR REFERENCE */}
                </form>
            </div>
        );
    }
}

export default IssueForm;