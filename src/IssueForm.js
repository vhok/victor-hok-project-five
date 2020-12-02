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
            issueProject: 'X', // To be replaced.
            listProjectsCurrent: []
        };
    }

    submitIssueHandler = (event) => {
        event.preventDefault();

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

        dbRefProjectsCurrent.on('value', (dbSnap) => {
            // Unfinished work. Need to pull from firebase, create an array, map it, and fill out options L77-L79.
        })
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className="submit">
                <form className="submit__form" onSubmit={this.submitIssueHandler}>
                    <h2>A new bug has been discovered in the wild! 🔍</h2>
                    <label htmlFor="submit__select-project">Project</label>
                    <select id="submit__select-project" onChange={this.selectProjectHandler}>
                        {/* For now, these are just placeholders until I can pull directly from GitHub API without rate limiting calls */}
                        <option value="projectOne">Project One</option>
                        <option value="projectTwo">Project Two</option>
                        <option value="projectFive">Project Five</option>
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