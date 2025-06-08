// Core interfaces for the dynamic bot system

export interface UserSession {
    currentStep: string;
    data: Record<string, any>;
    language: string | null;
}

export interface Trigger {
    type: 'exact' | 'contains' | 'option';
    values: string[];
    nextStep?: string;
    storeAs?: string;
    setLanguage?: string;
    action?: 'reset' | 'end';
}

export interface LocalizedMessage {
    [language: string]: string;
}

export interface Step {
    type: 'text' | 'media' | 'document' | 'location' | 'contact' | 'sticker';
    message: string | LocalizedMessage;
    triggers?: Trigger[];
    errorMessage?: string | LocalizedMessage;
    resendOnError?: boolean;
    backStep?: string;
    mediaUrl?: string;
    filePath?: string;
    // Additional properties for specific step types
    latitude?: string;
    longitude?: string;
    contactNumber?: string;
    displayName?: string;
    stickerOptions?: {
        pack: string;
        author: string;
    };
}

export interface FlowConfig {
    steps: Record<string, Step>;
    settings?: {
        defaultLanguage?: string;
        sessionTimeout?: number;
        enableLogging?: boolean;
    };
}

export interface Message {
    from: string;
    body?: string;
    type?: string;
    timestamp?: number;
}

export interface BotConfig {
    flowConfigPath?: string;
    sessionTimeout?: number;
    enableLogging?: boolean;
    defaultLanguage?: string;
}

export interface SessionManager {
    getUserSession(userId: string): UserSession;
    resetUserSession(userId: string): void;
    clearExpiredSessions(): void;
    getAllSessions(): Map<string, UserSession>;
}

export interface MessageHandler {
    handleMessage(message: Message): Promise<void>;
    processCommand(command: string, sender: string): Promise<void>;
}

export interface FlowManager {
    getCurrentStep(stepId: string): Step | undefined;
    findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null;
    processVariables(text: string, sessionData: Record<string, any>): string;
    getLocalizedMessage(messageObj: string | LocalizedMessage | undefined, language: string | null): string | undefined;
}

// Utility types
export type TriggerType = Trigger['type'];
export type StepType = Step['type'];
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';

// Event types
export interface BotEvent {
    type: 'message' | 'ready' | 'qr' | 'auth_failure' | 'disconnected';
    data?: any;
    timestamp: number;
}

export interface MessageEvent extends BotEvent {
    type: 'message';
    data: Message;
}

export interface QREvent extends BotEvent {
    type: 'qr';
    data: string;
}

export interface AuthFailureEvent extends BotEvent {
    type: 'auth_failure';
    data: Error;
}

// Configuration validation
export interface ConfigValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Analytics and logging
export interface MessageAnalytics {
    userId: string;
    messageCount: number;
    lastMessageTime: number;
    currentStep: string;
    language: string | null;
    sessionDuration: number;
}

export interface BotAnalytics {
    totalUsers: number;
    activeUsers: number;
    totalMessages: number;
    averageSessionDuration: number;
    popularSteps: Record<string, number>;
    languageDistribution: Record<string, number>;
}