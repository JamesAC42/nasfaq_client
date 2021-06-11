export type roomId = string;

export interface FloorSpace {
    postCount: number,
    rooms: Array<Room>
}

export interface Room {
    id:roomId,
    timestamp:number,
    subject:string,
    creator:string,
    opening:string,
    posts: number,
    posters: Array<string>
}

export type ChatLog = Array<IMessage>;

export interface IMessage {
    id:number,
    timestamp: number,
    username: string,
    text: string,
    mentions: Array<string>
}
export interface MetaMessage extends IMessage {
    replies: Array<string>,
    isMe: boolean,
    you: boolean
}

export interface ChatResult {
    success: boolean,
    prompt: string
}

