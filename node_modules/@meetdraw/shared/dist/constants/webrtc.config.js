export const DEFAULT_RTC_CONFIGURATION = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
};
export const DATA_CHANNEL_CONFIG = {
    ordered: true,
    maxRetransmits: 30,
};
export const DATA_CHANNEL_LABEL = 'nowadraw-data';
