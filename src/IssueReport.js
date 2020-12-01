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
            date: '',
            status: ''
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

    inputEditTitleHandler = (event) => {
        // Use updater function
        this.setState( prevState => {
            const issueSelected = { ...prevState.issueSelected };
            issueSelected.title = event.target.value;
            return { issueSelected };
        });
    }

    inputEditDetailsHandler = (event) => {
        this.setState(prevState => {
            const issueSelected = { ...prevState.issueSelected };
            issueSelected.details = event.target.value;
            return { issueSelected };
        });
    }

    inputEditStatusHandler = (event) => {
        this.setState(prevState => {
            const issueSelected = { ...prevState.issueSelected };
            issueSelected.status = event.target.value;
            return { issueSelected };
        });
    }

    submitResponseHandler = (event) => {
        event.preventDefault();
        const dbRef = firebase.database().ref('active');

        if(this.state.issueSelectedId !== '') {
            dbRef.child(this.state.issueSelectedId).update(this.state.issueSelected);
        }
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
                <form onSubmit={this.submitResponseHandler}>
                    {/* value={this.state.issueSelected === '' ? '' : this.state.issueSelected} */}
                    <label htmlFor="report__input-id">ID</label>
                    <input type="text" id="report__input-id" value={this.state.issueSelectedId} readOnly />
                    <label htmlFor="report__input-date">Date</label>
                    <input type="datetime" id="report__input-date" value={this.state.issueSelected.date ? new Date(this.state.issueSelected.date).toLocaleString() : ''} readOnly />
                    <label htmlFor="report__input-title">Title</label>
                    <input type="text" id="report__input-title" onChange={this.inputEditTitleHandler} value={this.state.issueSelected.title} />
                    <label htmlFor="report__input-details">Details</label>
                    <textarea id="report__input-details" onChange={this.inputEditDetailsHandler} value={this.state.issueSelected.details} cols="30" rows="10"></textarea>
                    <label htmlFor="report__input-status">Status</label>
                    <select id="report__select-status" onChange={this.inputEditStatusHandler} value={this.state.issueSelected.status}>
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