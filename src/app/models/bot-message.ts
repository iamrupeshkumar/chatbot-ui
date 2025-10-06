export interface BotMessage {
    user_id?: string;
    message?: string;
    buttons?: string[];
    typing?: boolean;
    fileName?: string;
    fileBlobUrl?: string;
}
