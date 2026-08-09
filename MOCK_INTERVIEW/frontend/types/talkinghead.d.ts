declare module '@met4citizen/talkinghead' {
  export class TalkingHead {
    constructor(node: HTMLElement, options?: any);
    showAvatar(options: any): Promise<void>;
    speakText(text: string, opt?: any, onsubtitles?: any, excludes?: any): void;
    speakAudio(audio: any, opt?: any, onsubtitles?: any): void;
    setMood(mood: string): void;
    makeEyeContact(durationMs?: number): void;
    lookAtCamera(durationMs?: number): void;
    stop(): void;
  }
}
