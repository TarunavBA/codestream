import { RequestType } from "vscode-jsonrpc";
import { NotificationType } from "vscode-languageserver-protocol";
import { Position, Range } from "vscode-languageserver-types";
import { EditorSelection, IpcRoutes } from "./webview.protocol.common";

export interface EditorHighlightRangeRequest {
	uri: string;
	range: Range;
	highlight: boolean;
}
export interface EditorHighlightRangeResponse {
	success: boolean;
}

export const EditorHighlightRangeRequestType = new RequestType<
	EditorHighlightRangeRequest,
	EditorHighlightRangeResponse,
	void,
	void
>(`${IpcRoutes.Host}/editor/range/highlight`);

export interface EditorRevealRangeRequest {
	uri: string;
	range: Range;
	preserveFocus?: boolean;
	atTop?: boolean;
}
export interface EditorRevealRangeResponse {
	success: boolean;
}
export const EditorRevealRangeRequestType = new RequestType<
	EditorRevealRangeRequest,
	EditorRevealRangeResponse,
	void,
	void
>(`${IpcRoutes.Host}/editor/range/reveal`);

export interface EditorSelectRangeRequest {
	uri: string;
	selection: EditorSelection;
	preserveFocus?: boolean;
}
export interface EditorSelectRangeResponse {
	success: boolean;
}
export const EditorSelectRangeRequestType = new RequestType<
	EditorSelectRangeRequest,
	EditorSelectRangeResponse,
	void,
	void
>(`${IpcRoutes.Host}/editor/range/select`);

export interface EditorScrollToNotification {
	uri: string;
	position: Position;
	atTop?: boolean;
}
export const EditorScrollToNotificationType = new NotificationType<
	EditorScrollToNotification,
	void
>(`${IpcRoutes.Host}/editor/scrollTo`);
