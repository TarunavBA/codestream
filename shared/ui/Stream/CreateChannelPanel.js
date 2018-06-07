import React, { Component } from "react";
import { connect } from "react-redux";
import * as contextActions from "../actions/context";
import { createStream } from "./actions";
import createClassString from "classnames";
import { getChannelStreamsForTeam } from "../reducers/streams";
import Button from "./Button";
import Tooltip from "./Tooltip";
import { FormattedMessage } from "react-intl";
import Select from "react-select";

const isNameInvalid = name => {
	const nameRegex = new RegExp("^[a-zA-Z0-9_-]+$");
	return nameRegex.test(name) === false;
};

export class SimpleCreateChannelPanel extends Component {
	constructor(props) {
		super(props);

		this.state = { privacy: "public", name: "" };
		this._createChannelPanel = React.createRef();
	}

	render() {
		const createChannelPanelClass = createClassString({
			panel: true,
			"create-channel-panel": true,
			"off-right": this.props.activePanel !== "create-channel"
		});

		return (
			<div className={createChannelPanelClass} ref={this._createChannelPanel}>
				<div className="panel-header">
					<span onClick={this.handleClick}>New Channel</span>
				</div>
				<form id="create-channel-form" className="standard-form postslist">
					<div className="form-body">
						{this.renderError()}
						<p className="explainer">
							Channels are where your dev team discusses projects, repos, or code in general. You
							might create one channel per repo, or one per client.
						</p>
						<div id="controls">
							<div id="privacy-controls" className="control-group">
								<label>Privacy</label>
								<Tooltip
									title="Private channels are only visible to people you invite"
									placement="left"
								>
									<div className="radio-group">
										<input
											id="radio-privacy-public"
											type="radio"
											name="privacy"
											checked={this.state.privacy === "public"}
											onChange={e => this.setState({ privacy: "public" })}
										/>
										<label htmlFor="radio-privacy-public">Public</label>
										<input
											id="radio-privacy-private"
											type="radio"
											name="privacy"
											checked={this.state.privacy === "private"}
											onChange={e => this.setState({ privacy: "private" })}
										/>
										<label htmlFor="radio-privacy-private">Private</label>
									</div>
								</Tooltip>
							</div>
							<div id="name-controls" className="control-group">
								<label>Channel Name</label>
								<Tooltip title="Names must match [a-zA-Z0-9._-]+" placement="left">
									<input
										className="native-key-bindings input-text control"
										type="text"
										name="name"
										tabIndex="0"
										value={this.state.name}
										onChange={e => this.setState({ name: e.target.value })}
										onBlur={this.onBlurName}
										required={this.state.nameTouched || this.state.formTouched}
									/>
								</Tooltip>
								{this.renderNameHelp()}
							</div>
							<div id="purpose-controls" className="control-group">
								<label>
									Purpose <span className="optional">(optional)</span>
								</label>
								<input
									className="native-key-bindings input-text control"
									type="text"
									name="purpose"
									tabIndex="0"
									value={this.state.purpose}
									onChange={e => this.setState({ purpose: e.target.value })}
								/>
							</div>
							<div id="members-controls" className="control-group react-select">
								<label>
									Add Members <span className="optional">(optional)</span>
								</label>
								<Select
									id="input-members"
									name="members"
									classNamePrefix="native-key-bindings react-select"
									isMulti={true}
									value={this.state.members || []}
									options={this.props.teammates}
									closeMenuOnSelect={false}
									isClearable={false}
									onChange={value => this.setState({ members: value })}
								/>
								{/* <div className="help-link">
								<a onClick={() => this.props.transition("forgotPassword")}>
									<FormattedMessage id="login.forgotPassword" />
								</a>
							</div> */}
							</div>
							<div className="button-group">
								<Button
									id="save-button"
									className="control-button"
									tabIndex="2"
									type="submit"
									loading={this.props.loading}
									onClick={this.handleClickCreateChannel}
								>
									Create
								</Button>
								<Button
									id="discard-button"
									className="control-button cancel"
									tabIndex="2"
									type="submit"
									loading={this.props.loading}
									onClick={this.handleClickCancel}
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}

	renderError = () => {
		if (!this.props.errors) return null;
		if (this.props.errors.invalidCredentials)
			return (
				<span className="error-message form-error">
					<FormattedMessage id="login.invalid" />
				</span>
			);
		// if (this.props.errors.unknown)
		// return <UnexpectedErrorMessage classes="error-message page-error" />;
	};

	renderNameHelp = () => {
		const { name, nameTouched, formTouched } = this.state;
		if ((nameTouched || formTouched) && isNameInvalid(name))
			return (
				<small className="error-message">
					<FormattedMessage id="createChannel.name.invalid" />
				</small>
			);
	};

	// onBlurPassword = () => this.setState({ passwordTouched: true });

	onBlurName = () => this.setState({ nameTouched: true });

	handleClick = event => {
		this.props.setActivePanel("channels");
	};

	resetForm = () => {
		this.setState({
			privacy: "public",
			name: "",
			members: [],
			nameTouched: false,
			formTouched: false
		});
	};

	handleClickCancel = event => {
		this.resetForm();
		this.props.setActivePanel("channels");
	};

	isFormInvalid = () => {
		return isNameInvalid(this.state.name);
	};

	handleClickCreateChannel = event => {
		this.setState({ formTouched: true });
		if (this.isFormInvalid()) return;

		const { privacy, name, members } = this.state;
		const memberIds = (members || []).map(member => {
			return member.value;
		});

		this.props.createStream({ type: "channel", privacy, name, memberIds });
		this.resetForm();
		// this.props.setActivePanel("channels");
	};
}

const mapStateToProps = ({ context, streams, users, teams }) => {
	const teamMembers = teams[context.currentTeamId].memberIds.map(id => users[id]).filter(Boolean);

	const channelStreams = getChannelStreamsForTeam(streams, context.currentTeamId) || {};

	const members = teamMembers.map(user => {
		return {
			value: user.id,
			label: user.firstName ? user.firstName + " " + user.lastName : user.username
		};
	});
	return {
		channelStreams,
		teammates: members,
		team: teams[context.currentTeamId]
	};
};

export default connect(mapStateToProps, {
	...contextActions,
	createStream
})(SimpleCreateChannelPanel);
