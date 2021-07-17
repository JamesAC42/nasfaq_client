import React, { Component } from 'react';

import { connect } from 'react-redux';
import { adminActions } from '../../actions/actions';
import Report from './Report';

const mapStateToProps = (state:any, props:any) => ({
    admin:state.admin
});

const mapDispatchToProps = {
    setAdminReports: adminActions.setAdminReports
};

interface ReportsProps {
    admin: {
        reports:any
    },
    setAdminReports: (reports:any) => {}
}

class ReportsBind extends Component<ReportsProps> {
    removeReport(index:number) {
        let reports = [...this.props.admin.reports];
        reports.splice(index,1);
        this.props.setAdminReports(reports);
    }
    render() {
        return(
            <div className="reports-container">
                <div className="control-header">
                    Reports
                </div>
                <div className="control-description">
                    View and close reports that have come in from users.
                </div>
                {
                    this.props.admin.reports.length === 0 ?
                    <div className="no-reports">
                        No reports currently
                    </div> : null
                }
                <div className="reports-inner flex flex-col flex-center">
                    {
                        this.props.admin.reports.map((report:Report, index:number) => 
                            <Report
                                removeReport={(index:number) => this.removeReport(index)}
                                index={index}
                                report={report}
                                key={report.id} />
                        )
                    }
                </div>
            </div>
        )
    }
}

const Reports = connect(
    mapStateToProps,
    mapDispatchToProps
)(ReportsBind);

export default Reports;