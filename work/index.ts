// bot.ts
import { BaileysClass } from '../lib/baileys'; // Make sure these types are available or define them manually
import fs from 'fs';
import path from 'path';

interface ValidationConfig {
    type: 'options' | 'number' | 'language' | 'custom';
    validOptions?: string[];
    min?: number;
    max?: number;
    errorMessage?: string;
}

interface Condition {
    type: 'equals' | 'contains' | 'language' | 'dataEquals';
    value?: string;
    nextStep: string;
    field?: string;
}

interface MediaConfig {
    type: 'image' | 'video' | 'audio' | 'document' | 'sticker';
    url: string;
    caption?: string;
    stickerOptions?: Record<string, any>;
}

interface ActionConfig {
    type: 'reset' | 'saveData' | 'sendLocation' | 'sendContact' | 'setPresence';
    latitude?: number;
    longitude?: number;
    number?: string;
    name?: string;
    presence?: string;
}

interface StepConfig {
    message?: string | Record<string, string>;
    media?: MediaConfig;
    action?: ActionConfig;
    setLanguage?: string;
    storeAs?: string;
    nextStep?: string;
    validation?: ValidationConfig;
    conditions?: Condition[];
    triggers?: string[];
}

interface Flow {
    languages: string[];
    steps: Record<string, StepConfig>;
}

interface UserState {
    currentStep: string;
    language: string | null;
    data: Record<string, string>;
}

class WhatsAppFlowBot {
    private botBaileys: BaileysClass;
    private userStates: Map<string, UserState>;
    private flow: Flow;

    constructor(flowFilePath: string) {
        this.botBaileys = new BaileysClass({});
        this.userStates = new Map();
        this.flow = this.loadFlow(flowFilePath);
        this.setupEventListeners();
    }

    private loadFlow(flowFilePath: string): Flow {
        try {
            const flowData = fs.readFileSync(flowFilePath, 'utf8');
            return JSON.parse(flowData);
        } catch (error) {
            console.error('Error loading flow file:', error);
            throw new Error('Failed to load flow configuration');
        }
    }

    private setupEventListeners() {
        this.botBaileys.on('auth_failure', (error: any) => {
            console.log("ERROR BOT: ", error);
        });

        this.botBaileys.on('qr', (qr: string) => {
            console.log("NEW QR CODE: ", qr);
        });

        this.botBaileys.on('ready', () => {
            console.log('READY BOT');
        });

        this.botBaileys.on('message', async (message) => {
            await this.handleMessage(message);
        });
    }

    private async handleMessage(message) {
        const sender = message.from;
        const text = message.body?.trim().toLowerCase() || '';

        try {
            let userState = this.userStates.get(sender) || {
                currentStep: 'start',
                language: null,
                data: {}
            };

            const nextStep = await this.processFlowStep(sender, text, userState);
            this.userStates.set(sender, nextStep);
        } catch (error) {
            console.error('Error handling message:', error);
            await this.botBaileys.sendText(sender, "Sorry, something went wrong. Please try again.");
        }
    }

    private async processFlowStep(sender: string, userInput: string, userState: UserState): Promise<UserState> {
        const currentStepConfig = this.flow.steps[userState.currentStep];

        if (!currentStepConfig) {
            console.error(`Step '${userState.currentStep}' not found in flow`);
            return userState;
        }

        const triggerResult = this.checkTriggers(userInput);
        if (triggerResult) {
            return await this.executeStep(sender, triggerResult, userState);
        }

        if (currentStepConfig.validation && !this.validateInput(userInput, currentStepConfig.validation, userState)) {
            await this.sendMessage(sender, currentStepConfig.validation.errorMessage || "Invalid input. Please try again.", userState);
            return userState;
        }

        if (currentStepConfig.storeAs) {
            userState.data[currentStepConfig.storeAs] = userInput;
        }

        let nextStepId = currentStepConfig.nextStep;

        if (currentStepConfig.conditions) {
            for (const condition of currentStepConfig.conditions) {
                if (this.evaluateCondition(userInput, condition, userState)) {
                    nextStepId = condition.nextStep;
                    break;
                }
            }
        }

        if (nextStepId) {
            userState.currentStep = nextStepId;
            await this.executeStep(sender, nextStepId, userState);
        }

        return userState;
    }

    private checkTriggers(userInput: string): string | null {
        for (const [stepId, stepConfig] of Object.entries(this.flow.steps)) {
            if (stepConfig.triggers?.includes(userInput)) {
                return stepId;
            }
        }
        return null;
    }

    private validateInput(input: string, validation: ValidationConfig, userState: UserState): boolean {
        switch (validation.type) {
            case 'options':
                return validation.validOptions?.includes(input) ?? false;
            case 'number':
                const num = Number(input);
                return !isNaN(num) && num >= (validation.min ?? 0) && num <= (validation.max ?? Infinity);
            case 'language':
                return this.flow.languages.includes(input);
            case 'custom':
                return true;
            default:
                return true;
        }
    }

    private evaluateCondition(input: string, condition: Condition, userState: UserState): boolean {
        switch (condition.type) {
            case 'equals':
                return input === condition.value;
            case 'contains':
                return input.includes(condition.value || '');
            case 'language':
                return userState.language === condition.value;
            case 'dataEquals':
                return userState.data[condition.field || ''] === condition.value;
            default:
                return false;
        }
    }

    private async executeStep(sender: string, stepId: string, userState: UserState) {
        const stepConfig = this.flow.steps[stepId];

        if (!stepConfig) {
            console.error(`Step '${stepId}' not found`);
            return;
        }

        if (stepConfig.setLanguage) {
            userState.language = stepConfig.setLanguage;
        }

        if (stepConfig.message) {
            await this.sendMessage(sender, stepConfig.message, userState);
        }

        if (stepConfig.media) {
            await this.sendMedia(sender, stepConfig.media, userState);
        }

        if (stepConfig.action) {
            await this.executeAction(sender, stepConfig.action, userState);
        }
    }

    private async sendMessage(sender: string, messageConfig: string | Record<string, string>, userState: UserState) {
        let message: string;

        if (typeof messageConfig === 'string') {
            message = messageConfig;
        } else {
            message = messageConfig[userState.language || ''] || messageConfig.default || messageConfig.english;
        }

        message = this.replacePlaceholders(message, userState);
        await this.botBaileys.sendText(sender, message);
    }

    private async sendMedia(sender: string, mediaConfig: MediaConfig, userState: UserState) {
        const { type, url, caption } = mediaConfig;
        const processedCaption = caption ? this.replacePlaceholders(caption, userState) : '';

        switch (type) {
            case 'image':
                await this.botBaileys.sendImage(sender, url, processedCaption);
                break;
            case 'video':
                await this.botBaileys.sendVideo(sender, url, processedCaption);
                break;
            case 'audio':
                await this.botBaileys.sendAudio(sender, url);
                break;
            case 'document':
                await this.botBaileys.sendFile(sender, url);
                break;
            case 'sticker':
                await this.botBaileys.sendSticker(sender, url, mediaConfig.stickerOptions || {});
                break;
        }
    }

    private async executeAction(sender: string, actionConfig: ActionConfig, userState: UserState) {
        switch (actionConfig.type) {
            case 'reset':
                this.userStates.delete(sender);
                break;
            case 'saveData':
                console.log('Saving user data:', userState.data);
                break;
            case 'sendLocation':
                await this.botBaileys.sendLocation(sender, actionConfig.latitude!, actionConfig.longitude!);
                break;
            case 'sendContact':
                await this.botBaileys.sendContact(sender, actionConfig.number!, actionConfig.name!);
                break;
            case 'setPresence':
                await this.botBaileys.sendPresenceUpdate(sender, actionConfig.presence!);
                break;
        }
    }

    private replacePlaceholders(text: string, userState: UserState): string {
        return text.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
            return userState.data[key] || (userState as any)[key] || _match;
        });
    }

    public reloadFlow(flowFilePath: string) {
        try {
            this.flow = this.loadFlow(flowFilePath);
            console.log('Flow configuration reloaded successfully');
        } catch (error) {
            console.error('Error reloading flow:', error);
        }
    }

    public getUserStats() {
        const stats = {
            totalUsers: this.userStates.size,
            usersByStep: {} as Record<string, number>,
            usersByLanguage: {} as Record<string, number>
        };

        for (const [, state] of this.userStates.entries()) {
            stats.usersByStep[state.currentStep] = (stats.usersByStep[state.currentStep] || 0) + 1;
            if (state.language) {
                stats.usersByLanguage[state.language] = (stats.usersByLanguage[state.language] || 0) + 1;
            }
        }

        return stats;
    }
}

// Initialize and export the bot
const bot = new WhatsAppFlowBot('./flow.json');
export default WhatsAppFlowBot;
