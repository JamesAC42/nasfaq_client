import React, { Component } from 'react';

import { connect } from 'react-redux';
import Button from '../Button';
import { adminActions } from '../../actions/actions';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setAdminFilters: adminActions.setAdminFilters
};

class FiltersState {
    filters:string;
    updatedFilters:boolean;
    constructor() {
        this.filters = '';
        this.updatedFilters = false;
    }
}

interface FiltersProps {
    admin: {
        filters:any
    }
}

type formEvent = React.ChangeEvent<HTMLTextAreaElement>;

class FiltersBind extends Component<FiltersProps> {
    state:FiltersState;
    constructor(props:FiltersProps) {
        super(props);
        this.state = new FiltersState();
    }
    textFromFilters(words:any) {
        if(Array.isArray(words)) {
            let text = '';
            words.forEach((w:string) => {
                text += w + "\n";
            });
            return text;
        } else {
            let text = '';
            Object.keys(words).forEach((w:string) => {
                text += w + "\n";
            });
            return text;
        }
    }
    saveFilters() {
        let filterString = this.state.filters;
        let words = filterString.split("\n");
        words = words.filter((phrase:string) => {
            return phrase !== '';
        });
        fetch('/api/updateFilters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                words
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                this.setState({
                    updatedFilters:true
                });
                setTimeout(() => {
                    this.setState({
                        updatedFilters:false
                    })
                }, 2000);
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.error('Error: ' +  error);
        })
    }
    handleText(a:formEvent) {
        this.setState({
            [a.target.name]:a.target.value
        });
    }
    componentDidMount() {
        if(this.props.admin.filters !== undefined) {
            let text = this.textFromFilters(this.props.admin.filters);
            this.setState({filters:text});
        }
    }
    render() {
        return(
            <div className="word-filters-container flex-col flex-center">
                <div className="control-header">
                    Filters
                </div>
                <div className="control-description">
                    Add words/ phrases to be filtered from the chat. Separate individual words/phrases by a newline.
                </div>
                <div className="filter-textarea flex-row flex-stretch">
                    <textarea 
                        className="admin-textarea"
                        id="wordfilter"
                        name="filters"
                        placeholder="Filters..."
                        onChange={(
                            ev: formEvent
                        ): void => this.handleText(ev)}
                        value={this.state.filters}>
                    </textarea>
                </div>
                <div className="save-button flex-col flex-center">
                    <Button
                        className="green inverse"
                        onClick={() => this.saveFilters()}>
                            {
                            this.state.updatedFilters ?
                            "Saved" : "Save"
                            }
                    </Button>
                </div>
            </div>
        )
    }
}

const Filters = connect(
    mapStateToProps,
    mapDispatchToProps
)(FiltersBind);

export default Filters;