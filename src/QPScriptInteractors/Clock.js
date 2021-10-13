import React, {Component} from 'react';
import PickyDateTime from 'react-picky-date-time';
import './Clock.css'


class Clock extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showPickyDateTime: true,
            date: '30',
            month: '01',
            year: '2000',
            hour: '03',
            minute: '10',
            second: '40',
            // meridiem: 'PM'
        };
    }
    onSecondChange(res) {
        this.setState({ second: res.value });
    }

    onMinuteChange(res) {
        this.setState({ minute: res.value });
    }

    onHourChange(res) {
        this.setState({ hour: res.value });
    }
    onMeridiemChange(res) {
        this.setState({ meridiem: res });
    }
    onClearTime(res) {
        this.setState({
            second: res.clockHandSecond.value,
            minute: res.clockHandMinute.value,
            hour: res.clockHandHour.value
        });
    }
    onResetTime(res) {
        this.setState({
            second: res.clockHandSecond.value,
            minute: res.clockHandMinute.value,
            hour: res.clockHandHour.value
        });
    }
    onClose() {
        this.setState({showPickyDateTime: false});
    }
    render() {
        const {
            showPickyDateTime,
            date,
            month,
            year,
            hour,
            minute,
            second,
            meridiem
        } = this.state;

        console.log(this.state.defaultTime)
        return(
            <><PickyDateTime
                size="xs"
                mode={2}
                locale="zh-cn"
                show={true}
                defaultDate={'2011-01-01'}
                // defaultTime={this.state.defaultTime}
                defaultTime={'10:11:11 AM'}
                onClose={() => this.onClose()}
                onYearPicked={res => this.onYearPicked(res)}
                onMonthPicked={res => this.onMonthPicked(res)}
                onDatePicked={res => this.onDatePicked(res)}
                onResetDate={res => this.onResetDate(res)}
                onResetDefaultDate={res => this.onResetDefaultDate(res)}
                onSecondChange={res => this.onSecondChange(res)}
                onMinuteChange={res => this.onMinuteChange(res)}
                onHourChange={res => this.onHourChange(res)}
                onMeridiemChange={res => this.onMeridiemChange(res)}
                onResetTime={res => this.onResetTime(res)}
                onResetDefaultTime={res => this.onResetDefaultTime(res)}
                onClearTime={res => this.onClearTime(res)}
                ref={e=>this.clockRef=e}
            /><div onClick={event => {
                console.log('点了')
                this.setState({defaultTime:'10:11:11 AM'})
            }}>点一下</div></>
        );
    }
}

export default Clock;