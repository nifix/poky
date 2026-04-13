export enum EventKind {
    UserJoined = "user-joined",
    UserVoted = "user-voted",
    ResetVotes = "reset-votes",
    RevealVotes = "reveal-votes",
    LogMessage = "log-message",
    UserRemoved = "user-removed",
    UserLeft = "user-left",
    TopicUpdated = 'topic-updated',
    ObserverToggled = 'observer-toggled'
}

export interface PokyEvent {
    origin: string,
    kind: EventKind,
    roomId: string,
}

export interface CardPickedEvent extends PokyEvent {
    cardId: number
}