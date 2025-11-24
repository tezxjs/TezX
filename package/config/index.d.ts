export declare let Config: {
    new (): {};
    debugMode?: boolean;
    readonly debugging: {
        info: (msg: string, ...args: unknown[]) => void;
        warn: (msg: string, ...args: unknown[]) => void;
        error: (msg: string, ...args: unknown[]) => void;
        debug: (msg: string, ...args: unknown[]) => void;
        success: (msg: string, ...args: unknown[]) => void;
    };
};
