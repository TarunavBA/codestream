import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { includes as _includes, sortBy as _sortBy, last as _last } from "lodash-es";
import { CodeStreamState } from "../store";
import Icon from "./Icon";
import Timestamp from "./Timestamp";
import { getCodeCollisions } from "../store/users/reducer";
import { ChangesetFile } from "./Review/ChangesetFile";
import { HostApi } from "..";
import { ReviewShowLocalDiffRequestType } from "../ipc/host.protocol.review";

const IconLabel = styled.span`
	white-space: nowrap;
	padding-right: 10px;
	.icon {
		margin-right: 5px;
	}
`;

export const ModifiedRepos = (props: {
	id: string;
	showModifiedAt?: boolean;
	defaultText?: string;
}) => {
	const derivedState = useSelector((state: CodeStreamState) => {
		const { session, users, teams, context } = state;
		const person = users[props.id];
		const me = users[session.userId!];
		const team = teams[context.currentTeamId];
		const xraySetting = team.settings ? team.settings.xray : "";
		const xrayEnabled = xraySetting !== "off";

		return {
			person,
			isMe: person ? person.id === session.userId : false,
			repos: state.repos,
			teamId: state.context.currentTeamId,
			currentUserEmail: me.email,
			collisions: getCodeCollisions(state),
			xrayEnabled
		};
	});

	const { person, isMe } = derivedState;

	if (!derivedState.person) return null;

	const { repos, teamId, currentUserEmail, collisions, xrayEnabled } = derivedState;
	const { modifiedRepos, modifiedReposModifiedAt } = person;

	if (!xrayEnabled) return null;
	if (!modifiedRepos || !modifiedRepos[teamId] || !modifiedRepos[teamId].length) return null;

	// FIXME we want to be able to show the diff here
	const clickFile = (repoId, path) => {
		HostApi.instance.send(ReviewShowLocalDiffRequestType, {
			path,
			repoId,
			includeSaved: true,
			includeStaged: true,
			baseSha: ""
		});
		// HostApi.instance.send(ShowLocalDiffRequestType, {
		// repoPath
		// file,
		// });
		// setState({			currentFile: path		});
	};

	const modified = modifiedRepos[teamId]
		.map(repo => {
			const { repoId = "", authors, modifiedFiles } = repo;
			if (modifiedFiles.length === 0) return null;
			const repoName = repos[repoId] ? repos[repoId].name : "";
			const added = modifiedFiles.reduce((total, f) => total + f.linesAdded, 0);
			const removed = modifiedFiles.reduce((total, f) => total + f.linesRemoved, 0);
			const stomp =
				person.email === currentUserEmail
					? null
					: (authors || []).find(a => a.email === currentUserEmail && a.stomped > 0);
			return (
				<div>
					<div>
						<IconLabel>
							<Icon name="repo" />
							{repoName}
						</IconLabel>{" "}
						<IconLabel>
							<Icon name="git-branch" />
							{repo.branch}
						</IconLabel>
					</div>
					<div style={{ margin: "0 -20px 0 -20px", padding: "5px 0 10px 0" }}>
						{modifiedFiles.map(f => {
							const hasConflict = isMe
								? collisions.repoFiles[`${repo.repoId}:${f.file}`]
								: collisions.userRepoFiles[`${person.id}:${repo.repoId}:${f.file}`];
							const className = hasConflict ? "file-has-conflict wide" : "wide";
							const onClick = isMe ? () => clickFile(repoId, f.file) : undefined;
							const selected = false;
							return (
								<ChangesetFile
									icon={<Icon className="file-icon" name={selected ? "arrow-right" : "blank"} />}
									className={className}
									onClick={onClick}
									noHover={!onClick}
									key={f.file}
									{...f}
								/>
							);
						})}
					</div>
					{stomp && (
						<div style={{ paddingTop: "5px" }}>
							<span className="stomped" style={{ paddingLeft: 0 }}>
								@{stomp.stomped}
							</span>{" "}
							= includes {stomp.stomped} change
							{stomp.stomped > 1 ? "s" : ""} to code you wrote
						</div>
					)}
					{collisions.userRepos[person.id + ":" + repo.repoId] && (
						<div style={{ paddingTop: "5px" }}>
							<Icon name="alert" className="conflict" /> = possible merge conflict
						</div>
					)}
				</div>
			);
		})
		.filter(Boolean);

	if (modified.length > 0) {
		return (
			<>
				{modified.length > 0 ? modified : props.defaultText}
				{props.showModifiedAt && modifiedReposModifiedAt && modifiedReposModifiedAt[teamId] && (
					<div style={{ color: "var(--text-color-subtle)" }}>
						Updated
						<Timestamp relative time={modifiedReposModifiedAt[teamId]} />
					</div>
				)}
			</>
		);
	} else return null;
};
