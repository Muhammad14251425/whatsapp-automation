// import { BaileysClass } from '../lib/baileys.js';

// const botBaileys = new BaileysClass({});

// botBaileys.on('auth_failure', async (error) => console.log("ERROR BOT: ", error));
// botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
// botBaileys.on('ready', async () => console.log('READY BOT'))

// let awaitingResponse = false;

// botBaileys.on('message', async (message) => {
//     if (!awaitingResponse) {
//         await botBaileys.sendPoll(message.from, 'Select an option', {
//             options: ['text', 'media', 'file', 'sticker'],
//             multiselect: false
//         });
//         awaitingResponse = true;
//     } else {
//         const command = message.body.toLowerCase().trim();
//         switch (command) {
//             case 'text':
//                 await botBaileys.sendText(message.from, 'Hello world');
//                 break;
//             case 'media':
//                 await botBaileys.sendMedia(message.from, 'https://www.w3schools.com/w3css/img_lights.jpg', 'Hello world');
//                 break;
//             case 'file':
//                 await botBaileys.sendFile(message.from, 'https://github.com/pedrazadixon/sample-files/raw/main/sample_pdf.pdf');
//                 break;
//             case 'sticker':
//                 await botBaileys.sendSticker(message.from, 'https://gifimgs.com/animations/anime/dragon-ball-z/Goku/goku_34.gif', { pack: 'User', author: 'Me' });
//                 break;
//             default:
//                 await botBaileys.sendText(message.from, 'Sorry, I did not understand that command. Please select an option from the poll.');
//                 break;
//         }
//         awaitingResponse = false;
//     }
// });


// import fs from 'fs';
// import path from 'path';
// import mime from 'mime-types';
// import { downloadMediaMessage } from '@whiskeysockets/baileys';
// import { BaileysClass } from '../lib/baileys.js';

// const botBaileys = new BaileysClass({});
// let awaitingResponse = false;

// botBaileys.on('auth_failure', (error) => console.log("ERROR BOT: ", error));
// botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
// botBaileys.on('ready', () => console.log('READY BOT'));

// async function verifyPayment(apiKey, imageFile, requiredAmount = 500) {
//     try {
//         const filePath = imageFile.path;
//         const fileData = fs.readFileSync(filePath);
//         const base64Image = fileData.toString('base64');

//         const prompt = `I have uploaded a transaction receipt. Verify that the user has paid ${requiredAmount} rupees.

// If the user paid exactly the required amount, return:
// {
// "paymentStatus":"Successful",
// "message":"The user has paid the amount"
// }

// If the user paid more than the required amount, return:
// {
// "paymentStatus":"Successful",
// "message":"The user has paid the amount. You have paid more than the required amount. Required: ${requiredAmount} rupees, Paid: [actual amount found] rupees"
// }

// If the user paid less than the required amount, return:
// {
// "paymentStatus":"Unsuccessful", 
// "message":"The user has not paid the amount which was required. The required amount was ${requiredAmount} rupees and the user has paid [actual amount found] rupees"
// }

// Just return a json message and nothing else in the response.`;

//         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 contents: [{
//                     parts: [
//                         { text: prompt },
//                         {
//                             inline_data: {
//                                 mime_type: imageFile.type,
//                                 data: base64Image
//                             }
//                         }
//                     ]
//                 }]
//             })
//         });

//         if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);
//         const data = await response.json();

//         if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
//             const responseText = data.candidates[0].content.parts[0].text;
//             const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//             if (jsonMatch) {
//                 return JSON.parse(jsonMatch[0]);
//             } else {
//                 throw new Error('No JSON found in response');
//             }
//         } else {
//             throw new Error('Invalid response format from API');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         return {
//             paymentStatus: "Error",
//             message: `Verification failed: ${error.message}`
//         };
//     }
// }

// botBaileys.on('message', async (message) => {
//     const msg = message.message;

//     // If message contains an image
//     if (msg?.imageMessage) {
//         const buffer = await downloadMediaMessage(message, 'buffer', {}, {
//           // @ts-ignore
//             logger: console,
//             reuploadRequest: botBaileys.getInstance().waUploadToServer
//         });

//         const downloadsDir = path.join('.', 'downloads');
//         if (!fs.existsSync(downloadsDir)) {
//             fs.mkdirSync(downloadsDir, { recursive: true });
//         }

//         const fileName = `receipt-${Date.now()}.jpg`;
//         const filePath = path.join(downloadsDir, fileName);
//         fs.writeFileSync(filePath, buffer);
//         console.log('Saved image to:', filePath);

//         const imageFile = {
//             path: filePath,
//             name: fileName,
//             type: mime.lookup(filePath) || 'image/jpeg',
//         };

//         const result = await verifyPayment("AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw", imageFile, 500);

//         await botBaileys.sendText(message.key.remoteJid!, `Verification Result:\n${JSON.stringify(result, null, 2)}`);
//         return;
//     }

//     // Poll + response logic
//     if (!awaitingResponse) {
//         await botBaileys.sendPoll(message.key.remoteJid!, 'Select an option', {
//             options: ['text', 'media', 'file', 'sticker'],
//             multiselect: false
//         });
//         awaitingResponse = true;
//     } else {
//         const command = msg?.conversation?.toLowerCase().trim();
//         switch (command) {
//             case 'text':
//                 await botBaileys.sendText(message.key.remoteJid!, 'Hello world');
//                 break;
//             case 'media':
//                 await botBaileys.sendMedia(message.key.remoteJid!, 'https://www.w3schools.com/w3css/img_lights.jpg', 'Hello world');
//                 break;
//             case 'file':
//                 await botBaileys.sendFile(message.key.remoteJid!, 'https://github.com/pedrazadixon/sample-files/raw/main/sample_pdf.pdf');
//                 break;
//             case 'sticker':
//                 await botBaileys.sendSticker(message.key.remoteJid!, 'https://gifimgs.com/animations/anime/dragon-ball-z/Goku/goku_34.gif', { pack: 'User', author: 'Me' });
//                 break;
//             default:
//                 await botBaileys.sendText(message.key.remoteJid!, 'Sorry, I did not understand that command.');
//                 break;
//         }
//         awaitingResponse = false;
//     }
// });



// import { BaileysClass } from '../lib/baileys.js';

// const botBaileys = new BaileysClass({});

// botBaileys.on('auth_failure', (error) => console.log("ERROR BOT: ", error));
// botBaileys.on('qr', (qr) => console.log("NEW QR CODE: ", qr));
// botBaileys.on('ready', () => console.log('READY BOT'));

// let awaitingLanguage = {};
// let awaitingMenuOption = {};

// const greetings = ['hi', 'hello', 'salam', 'assalamualaikum'];
// const languages = ['english', 'urdu'];

// const menus = {
//     english: `Please reply with an option number from the below menu.

// 1️⃣ 🏢 Donate at any of our Offices 
// 2️⃣ 🏦 Transfer funds to our Bank Accounts 
// 3️⃣ 📱 Baitussalam App / Website 
// 4️⃣ 🤝 Bykea 
// 5️⃣ 🤝 Kuickpay
// 6️⃣ 🤝 TCS Express Centres 
// 7️⃣ 🤝 Mobile Wallets 
// 8️⃣ 🌎 Overseas Donors

// 🅱 🔙Previous Menu
// *️⃣ Main Menu`,
//     // Add `urdu` version here if needed
// };

// const bykeaSteps = `BYKEA

// 1. Open BYKEA app on your mobile
// 2. Tap on Cash Transfer
// 3. Choose Paisay Bhejain
// 4. Select Businesses from the header 
// 5. Tap on Baitussalam Welfare Trust
// 6. Input the donation amount
// 7. Select the payment method
// 8. Provide your location
// 9. Add details about your donation by clicking on +
// 10. Review the charges and tap on Collect Cash From Me

// A nearest bykea would come to your provided location.

// 🅱 🔙Previous Menu
// *️⃣ Main Menu`;

// botBaileys.on('message', async (message) => {
//     const sender = message.from;
//     const text = message.body.trim().toLowerCase();

//     // Check for greetings
//     if (greetings.includes(text)) {
//         awaitingLanguage[sender] = true;
//         awaitingMenuOption[sender] = false;
//         await botBaileys.sendText(sender, "Please choose a language:\n- English\n- Urdu");
//         return;
//     }

//     // Check for language selection
//     if (awaitingLanguage[sender]) {
//         if (languages.includes(text)) {
//             awaitingLanguage[sender] = false;
//             awaitingMenuOption[sender] = text; // Store selected language
//             await botBaileys.sendText(sender, menus[text]);
//         } else {
//             await botBaileys.sendText(sender, "Sorry, I did not understand the language.\nPlease reply with: English or Urdu.");
//         }
//         return;
//     }

//     // Check for menu response
//     const lang = awaitingMenuOption[sender];
//     if (lang) {
//         switch (text) {
//             case '4':
//                 await botBaileys.sendText(sender, bykeaSteps);
//                 break;
//             // Add more cases like '1', '2', etc. here...
//             default:
//                 await botBaileys.sendText(sender, `Sorry I did not understand that.\nPlease reply with option below\n\n${menus[lang]}`);
//                 break;
//         }
//         return;
//     }
// });






































// import { BaileysClass } from '../lib/baileys.js';
// import fs from 'fs';
// import path from 'path';

// // Type definitions
// interface UserSession {
//     currentStep: string;
//     data: Record<string, any>;
//     language: string | null;
// }

// interface Trigger {
//     type: 'exact' | 'contains' | 'option';
//     values: string[];
//     nextStep?: string;
//     storeAs?: string;
//     setLanguage?: string;
//     action?: 'reset';
// }

// interface LocalizedMessage {
//     [language: string]: string;
// }

// interface Step {
//     type: 'text' | 'media' | 'document';
//     message: string | LocalizedMessage;
//     triggers?: Trigger[];
//     errorMessage?: string | LocalizedMessage;
//     resendOnError?: boolean;
//     backStep?: string;
//     mediaUrl?: string;
//     filePath?: string;
// }

// interface FlowConfig {
//     steps: Record<string, Step>;
// }

// interface Message {
//     from: string;
//     body?: string;
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//     try {
//         const configPath = path.join(process.cwd(), '/examples/bot-config.json');
//         const configData = fs.readFileSync(configPath, 'utf8');
//         return JSON.parse(configData) as FlowConfig;
//     } catch (error) {
//         console.error('Error loading flow config:', error);
//         return null;
//     }
// };

// class DynamicChatBot {
//     private bot: BaileysClass;
//     private flowConfig: FlowConfig | null;
//     private userSessions: Map<string, UserSession>;

//     constructor() {
//         this.bot = new BaileysClass({});
//         this.flowConfig = loadFlowConfig();
//         this.userSessions = new Map<string, UserSession>();

//         this.setupEventListeners();
//     }

//     private setupEventListeners(): void {
//         this.bot.on('auth_failure', (error: any) => console.log("ERROR BOT: ", error));
//         this.bot.on('qr', (qr: string) => console.log("NEW QR CODE: ", qr));
//         this.bot.on('ready', () => console.log('READY BOT'));
//         this.bot.on('message', (message: Message) => this.handleMessage(message));
//     }



//     // Get or create user session
//     private getUserSession(userId: string): UserSession {
//         if (!this.userSessions.has(userId)) {
//             this.userSessions.set(userId, {
//                 currentStep: 'start',
//                 data: {},
//                 language: null
//             });
//         }
//         return this.userSessions.get(userId)!;
//     }

//     // Reset user session
//     private resetUserSession(userId: string): void {
//         this.userSessions.set(userId, {
//             currentStep: 'start',
//             data: {},
//             language: null
//         });
//     }

//     // Find matching trigger
//     private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//         if (!triggers) return null;

//         const normalizedInput = input.toLowerCase().trim();

//         for (const trigger of triggers) {
//             if (trigger.type === 'exact') {
//                 if (trigger.values.some(val => val.toLowerCase() === normalizedInput)) {
//                     return trigger;
//                 }
//             } else if (trigger.type === 'contains') {
//                 if (trigger.values.some(val => normalizedInput.includes(val.toLowerCase()))) {
//                     return trigger;
//                 }
//             } else if (trigger.type === 'option') {
//                 if (trigger.values.includes(normalizedInput)) {
//                     return trigger;
//                 }
//             }
//         }
//         return null;
//     }

//     // Process variables in text
//     private processVariables(text: string, sessionData: Record<string, any>): string {
//         if (!text) return text;

//         return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//             return sessionData[variable] || match;
//         });
//     }

//     // Get current step configuration
//     private getCurrentStep(stepId: string): Step | undefined {
//         return this.flowConfig?.steps?.[stepId];
//     }

//     // Handle user message
//     private async handleMessage(message: Message): Promise<void> {
//         try {
//             const sender = message.from;
//             const text = message.body?.trim() || '';
//             const session = this.getUserSession(sender);

//             // Handle main menu and back navigation
//             if (text.toLowerCase() === '*' || text === '*️⃣') {
//                 this.resetUserSession(sender);
//                 const startStep = this.getCurrentStep('start');
//                 if (startStep) {
//                     await this.sendStepMessage(sender, startStep, session);
//                 }
//                 return;
//             }

//             const currentStep = this.getCurrentStep(session.currentStep);
//             if (!currentStep) {
//                 console.error(`Step not found: ${session.currentStep}`);
//                 return;
//             }

//             // Find matching trigger
//             const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers);

//             if (matchingTrigger) {
//                 // Store data if specified
//                 if (matchingTrigger.storeAs) {
//                     session.data[matchingTrigger.storeAs] = text;
//                 }

//                 // Set language if specified
//                 if (matchingTrigger.setLanguage) {
//                     session.language = matchingTrigger.setLanguage;
//                 }

//                 // Move to next step
//                 if (matchingTrigger.nextStep) {
//                     session.currentStep = matchingTrigger.nextStep;
//                     const nextStep = this.getCurrentStep(matchingTrigger.nextStep);

//                     if (nextStep) {
//                         await this.sendStepMessage(sender, nextStep, session);
//                     }
//                 } else if (matchingTrigger.action === 'reset') {
//                     this.resetUserSession(sender);
//                     const startStep = this.getCurrentStep('start');
//                     if (startStep) {
//                         await this.sendStepMessage(sender, startStep, session);
//                     }
//                 }
//             } else {
//                 // Handle back navigation
//                 if (text.toLowerCase() === 'b' || text === '🅱') {
//                     if (currentStep.backStep) {
//                         session.currentStep = currentStep.backStep;
//                         const backStep = this.getCurrentStep(currentStep.backStep);
//                         if (backStep) {
//                             await this.sendStepMessage(sender, backStep, session);
//                         }
//                     }
//                     return;
//                 }

//                 // Send error message
//                 const errorMessage = this.getLocalizedMessage(currentStep.errorMessage, session.language) || 
//                                    "Sorry, I didn't understand that. Please try again.";
//                 await this.bot.sendText(sender, errorMessage);

//                 // Resend current step message if specified
//                 if (currentStep.resendOnError) {
//                     await this.sendStepMessage(sender, currentStep, session);
//                 }
//             }
//         } catch (error) {
//             console.error('Error handling message:', error);
//         }
//     }

//     // Get localized message
//     private getLocalizedMessage(messageObj: string | LocalizedMessage | undefined, language: string | null): string | undefined {
//         if (typeof messageObj === 'string') return messageObj;
//         if (typeof messageObj === 'object' && messageObj && language && messageObj[language]) {
//             return messageObj[language];
//         }
//         // Fallback to first available language or english
//         if (typeof messageObj === 'object' && messageObj) {
//             return messageObj.english || messageObj[Object.keys(messageObj)[0]];
//         }
//         // @ts-ignore
//         return messageObj as string;
//     }

//     // Send step message
//     private async sendStepMessage(sender: string, step: Step, session: UserSession): Promise<void> {
//         const message = this.getLocalizedMessage(step.message, session.language);
//         const processedMessage = this.processVariables(message || '', session.data);

//         switch (step.type) {
//             case 'text':
//                 await this.bot.sendText(sender, processedMessage);
//                 break;
//             case 'media':
//                 if (step.mediaUrl) {
//                     await this.bot.sendMedia(sender, step.mediaUrl, processedMessage);
//                 }
//                 break;
//             case 'document':
//                 if (step.filePath) {
//                     await this.bot.sendFile(sender, step.filePath);
//                     if (processedMessage) {
//                         await this.bot.sendText(sender, processedMessage);
//                     }
//                 }
//                 break;
//             default:
//                 await this.bot.sendText(sender, processedMessage);
//         }
//     }

//     // Reload configuration
//     public reloadConfig(): void {
//         this.flowConfig = loadFlowConfig();
//         console.log('Flow configuration reloaded');
//     }

//     // Getter for bot instance (for external access)
//     public get botInstance(): BaileysClass {
//         return this.bot;
//     }
// }

// // Create bot instance
// const dynamicBot = new DynamicChatBot();

// // Export for external use
// export default dynamicBot;
// export { DynamicChatBot, type UserSession, type Trigger, type Step, type FlowConfig, type Message };






























// import { BaileysClass } from '../lib/baileys.js';
// import fs from 'fs';
// import path from 'path';

// // Type definitions
// interface UserSession {
//     currentStep: string;
//     data: Record<string, any>;
//     language: string | null;
// }

// interface Trigger {
//     type: 'exact' | 'contains' | 'option';
//     values: string[];
//     nextStep?: string;
//     storeAs?: string;
//     setLanguage?: string;
//     action?: 'reset';
// }

// interface LocalizedMessage {
//     [language: string]: string;
// }

// interface NavigationConfig {
//     backKeywords?: string[];
//     mainMenuKeywords?: string[];
//     backText?: string | LocalizedMessage;
//     mainMenuText?: string | LocalizedMessage;
//     mainMenuStep?: string; // New field to specify main menu step
// }

// interface Step {
//     type: 'text' | 'media' | 'document';
//     message: string | LocalizedMessage;
//     triggers?: Trigger[];
//     errorMessage?: string | LocalizedMessage;
//     resendOnError?: boolean;
//     backStep?: string;
//     mediaUrl?: string;
//     filePath?: string;
//     isMainMenu?: boolean; // New field to identify main menu steps
// }

// interface FlowConfig {
//     steps: Record<string, Step>;
//     navigation?: NavigationConfig;
// }

// interface Message {
//     from: string;
//     body?: string;
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//     try {
//         const configPath = path.join(process.cwd(), '/examples/bot-config.json');
//         const configData = fs.readFileSync(configPath, 'utf8');
//         return JSON.parse(configData) as FlowConfig;
//     } catch (error) {
//         console.error('Error loading flow config:', error);
//         return null;
//     }
// };

// class DynamicChatBot {
//     private bot: BaileysClass;
//     private flowConfig: FlowConfig | null;
//     private userSessions: Map<string, UserSession>;

//     constructor() {
//         this.bot = new BaileysClass({});
//         this.flowConfig = loadFlowConfig();
//         this.userSessions = new Map<string, UserSession>();

//         this.setupEventListeners();
//     }

//     private setupEventListeners(): void {
//         this.bot.on('auth_failure', (error: any) => console.log("ERROR BOT: ", error));
//         this.bot.on('qr', (qr: string) => console.log("NEW QR CODE: ", qr));
//         this.bot.on('ready', () => console.log('READY BOT'));
//         this.bot.on('message', (message: Message) => this.handleMessage(message));
//     }

//     // Get or create user session
//     private getUserSession(userId: string): UserSession {
//         if (!this.userSessions.has(userId)) {
//             this.userSessions.set(userId, {
//                 currentStep: 'start',
//                 data: {},
//                 language: null
//             });
//         }
//         return this.userSessions.get(userId)!;
//     }

//     // Reset user session
//     private resetUserSession(userId: string): void {
//         this.userSessions.set(userId, {
//             currentStep: 'start',
//             data: {},
//             language: null
//         });
//     }

//     // Check if input matches navigation keywords
//     private isNavigationCommand(input: string): 'back' | 'main' | null {
//         if (!this.flowConfig?.navigation) {
//             // Default navigation keywords if not configured
//             const normalizedInput = input.toLowerCase().trim();
//             if (normalizedInput === 'b' || normalizedInput === '🅱') return 'back';
//             if (normalizedInput === '*' || normalizedInput === '*️⃣') return 'main';
//             return null;
//         }

//         const navigation = this.flowConfig.navigation;
//         const normalizedInput = input.toLowerCase().trim();

//         // Check back keywords
//         const backKeywords = navigation.backKeywords || ['b', '🅱'];
//         if (backKeywords.some(keyword => keyword.toLowerCase() === normalizedInput)) {
//             return 'back';
//         }

//         // Check main menu keywords
//         const mainKeywords = navigation.mainMenuKeywords || ['*', '*️⃣'];
//         if (mainKeywords.some(keyword => keyword.toLowerCase() === normalizedInput)) {
//             return 'main';
//         }

//         return null;
//     }

//     // Find matching trigger
//     private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//         if (!triggers) return null;

//         const normalizedInput = input.toLowerCase().trim();

//         for (const trigger of triggers) {
//             if (trigger.type === 'exact') {
//                 if (trigger.values.some(val => val.toLowerCase() === normalizedInput)) {
//                     return trigger;
//                 }
//             } else if (trigger.type === 'contains') {
//                 if (trigger.values.some(val => normalizedInput.includes(val.toLowerCase()))) {
//                     return trigger;
//                 }
//             } else if (trigger.type === 'option') {
//                 if (trigger.values.includes(normalizedInput)) {
//                     return trigger;
//                 }
//             }
//         }
//         return null;
//     }

//     // Process variables in text
//     private processVariables(text: string, sessionData: Record<string, any>): string {
//         if (!text) return text;

//         return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//             return sessionData[variable] || match;
//         });
//     }

//     // Get current step configuration
//     private getCurrentStep(stepId: string): Step | undefined {
//         return this.flowConfig?.steps?.[stepId];
//     }

//     // Get main menu step from configuration
//     private getMainMenuStep(): string {
//         return this.flowConfig?.navigation?.mainMenuStep || 'main_menu';
//     }

//     // Check if current step is main menu
//     private isCurrentStepMainMenu(stepId: string): boolean {
//         const step = this.getCurrentStep(stepId);
//         return step?.isMainMenu === true || stepId === this.getMainMenuStep();
//     }

//     // Handle user message
//     private async handleMessage(message: Message): Promise<void> {
//         try {
//             const sender = message.from;
//             const text = message.body?.trim() || '';
//             const session = this.getUserSession(sender);

//             // Check for navigation commands
//             const navCommand = this.isNavigationCommand(text);

//             if (navCommand === 'main') {
//                 // Handle main menu navigation
//                 const mainMenuStepId = this.getMainMenuStep();

//                 // If already on main menu, just resend the same menu
//                 if (this.isCurrentStepMainMenu(session.currentStep)) {
//                     const currentStep = this.getCurrentStep(session.currentStep);
//                     if (currentStep) {
//                         await this.sendStepMessage(sender, currentStep, session);
//                     }
//                 } else {
//                     // Navigate to main menu
//                     session.currentStep = mainMenuStepId;
//                     const mainMenuStep = this.getCurrentStep(mainMenuStepId);
//                     if (mainMenuStep) {
//                         await this.sendStepMessage(sender, mainMenuStep, session);
//                     }
//                 }
//                 return;
//             }

//             const currentStep = this.getCurrentStep(session.currentStep);
//             if (!currentStep) {
//                 console.error(`Step not found: ${session.currentStep}`);
//                 return;
//             }

//             if (navCommand === 'back') {
//                 // Handle back navigation
//                 if (this.isCurrentStepMainMenu(session.currentStep)) {
//                     // If on main menu, back should stay on main menu or go to previous step if defined
//                     if (currentStep.backStep) {
//                         session.currentStep = currentStep.backStep;
//                         const backStep = this.getCurrentStep(currentStep.backStep);
//                         if (backStep) {
//                             await this.sendStepMessage(sender, backStep, session);
//                         }
//                     } else {
//                         // Stay on main menu if no back step defined
//                         await this.sendStepMessage(sender, currentStep, session);
//                     }
//                 } else if (currentStep.backStep) {
//                     // Normal back navigation
//                     session.currentStep = currentStep.backStep;
//                     const backStep = this.getCurrentStep(currentStep.backStep);
//                     if (backStep) {
//                         await this.sendStepMessage(sender, backStep, session);
//                     }
//                 } else {
//                     // Send back navigation not available message
//                     const backText = this.getNavigationText('back', session.language) || 
//                                    "Back navigation not available from this step.";
//                     await this.bot.sendText(sender, backText);
//                 }
//                 return;
//             }

//             // Find matching trigger
//             const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers);

//             if (matchingTrigger) {
//                 // Store data if specified
//                 if (matchingTrigger.storeAs) {
//                     session.data[matchingTrigger.storeAs] = text;
//                 }

//                 // Set language if specified
//                 if (matchingTrigger.setLanguage) {
//                     session.language = matchingTrigger.setLanguage;
//                 }

//                 // Handle action
//                 if (matchingTrigger.action === 'reset') {
//                     this.resetUserSession(sender);
//                     const startStep = this.getCurrentStep('start');
//                     if (startStep) {
//                         await this.sendStepMessage(sender, startStep, session);
//                     }
//                     return;
//                 }

//                 // Move to next step
//                 if (matchingTrigger.nextStep) {
//                     session.currentStep = matchingTrigger.nextStep;
//                     const nextStep = this.getCurrentStep(matchingTrigger.nextStep);

//                     if (nextStep) {
//                         await this.sendStepMessage(sender, nextStep, session);
//                     }
//                 }
//             } else {
//                 // Send error message
//                 const errorMessage = this.getLocalizedMessage(currentStep.errorMessage, session.language) || 
//                                    "Sorry, I didn't understand that. Please try again.";
//                 await this.bot.sendText(sender, errorMessage);

//                 // Resend current step message if specified
//                 if (currentStep.resendOnError) {
//                     await this.sendStepMessage(sender, currentStep, session);
//                 }
//             }
//         } catch (error) {
//             console.error('Error handling message:', error);
//         }
//     }

//     // Get navigation text from config
//     private getNavigationText(type: 'back' | 'main', language: string | null): string | undefined {
//         if (!this.flowConfig?.navigation) return undefined;

//         const navigation = this.flowConfig.navigation;
//         const textObj = type === 'back' ? navigation.backText : navigation.mainMenuText;

//         return this.getLocalizedMessage(textObj, language);
//     }

//     // Get localized message
//     private getLocalizedMessage(messageObj: string | LocalizedMessage | undefined, language: string | null): string | undefined {
//         if (typeof messageObj === 'string') return messageObj;
//         if (typeof messageObj === 'object' && messageObj && language && messageObj[language]) {
//             return messageObj[language];
//         }
//         // Fallback to first available language or english
//         if (typeof messageObj === 'object' && messageObj) {
//             return messageObj.english || messageObj[Object.keys(messageObj)[0]];
//         }
//         // @ts-ignore
//         return messageObj as string;
//     }

//     // Send step message
//     private async sendStepMessage(sender: string, step: Step, session: UserSession): Promise<void> {
//         const message = this.getLocalizedMessage(step.message, session.language);
//         const processedMessage = this.processVariables(message || '', session.data);

//         switch (step.type) {
//             case 'text':
//                 await this.bot.sendText(sender, processedMessage);
//                 break;
//             case 'media':
//                 if (step.mediaUrl) {
//                     await this.bot.sendMedia(sender, step.mediaUrl, processedMessage);
//                 }
//                 break;
//             case 'document':
//                 if (step.filePath) {
//                     await this.bot.sendFile(sender, step.filePath);
//                     if (processedMessage) {
//                         await this.bot.sendText(sender, processedMessage);
//                     }
//                 }
//                 break;
//             default:
//                 await this.bot.sendText(sender, processedMessage);
//         }
//     }

//     // Reload configuration
//     public reloadConfig(): void {
//         this.flowConfig = loadFlowConfig();
//         console.log('Flow configuration reloaded');
//     }

//     // Getter for bot instance (for external access)
//     public get botInstance(): BaileysClass {
//         return this.bot;
//     }
// }

// // Create bot instance
// const dynamicBot = new DynamicChatBot();

// // Export for external use
// export default dynamicBot;
// export { DynamicChatBot, type UserSession, type Trigger, type Step, type FlowConfig, type Message, type NavigationConfig };






























































































































































// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"

// // Type definitions
// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// // Enhanced message interface to support multiple message types
// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage // For media with captions
//   delay?: number // Optional delay in milliseconds before sending this message
// }

// // Enhanced Step interface
// interface Step {
//   // Support both single message (backward compatibility) and multiple messages
//   type?: "text" | "media" | "document" // Keep for backward compatibility
//   message?: string | LocalizedMessage // Keep for backward compatibility
//   mediaUrl?: string // Keep for backward compatibility
//   filePath?: string // Keep for backward compatibility

//   // New multi-message support
//   messages?: MessageContent[] // Array of messages to send

//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
// }

// interface Message {
//   from: string
//   body?: string
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/enhanced-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class DynamicChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()

//     this.setupEventListeners()
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//     })
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             await this.sendStepMessages(sender, nextStep, session)
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       // Check if step uses new multi-message format
//       if (step.messages && step.messages.length > 0) {
//         // Send multiple messages
//         for (const messageContent of step.messages) {
//           // Apply delay if specified
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         // Backward compatibility: convert old format to new format
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const dynamicBot = new DynamicChatBot()

// // Export for external use
// export default dynamicBot
// export {
//   DynamicChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
// }










































// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"

// // Type definitions
// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// // Enhanced message interface to support multiple message types
// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// // Enhanced Step interface
// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
// }

// interface Message {
//   from: string
//   body?: string
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/enhanced-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class DynamicChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()

//     this.setupEventListeners()
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     // Clear any existing timeout
//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     // Clear any existing timeout
//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     // Set timeout to disable human chat after 8 hours
//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined

//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         // Bot should ignore messages when human chat is enabled
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             await this.sendStepMessages(sender, nextStep, session)
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       // Check if step uses new multi-message format
//       if (step.messages && step.messages.length > 0) {
//         // Send multiple messages
//         for (const messageContent of step.messages) {
//           // Apply delay if specified
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         // Backward compatibility: convert old format to new format
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const dynamicBot = new DynamicChatBot()

// // Export for external use
// export default dynamicBot
// export {
//   DynamicChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
// }


























// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// // Type definitions
// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
//   orderData?: {
//     category?: string
//     quantity?: number
//     customerName?: string
//     address?: string
//     phoneNumber?: string
//   }
// }

// interface OrderRecord {
//   orderId: string
//   phoneNumber: string
//   customerName: string
//   address: string
//   category: string
//   quantity: number
//   totalAmount: number
//   status: string
//   orderDate: string
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// // Enhanced message interface to support multiple message types
// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// // Enhanced Step interface
// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
// }

// interface Message {
//   from: string
//   body?: string
// }

// // Mango categories with pricing
// const MANGO_CATEGORIES = {
//   chaunsa: {
//     name: "Chaunsa",
//     pricePerCrate: 2500,
//     images: [
//       "https://example.com/chaunsa1.jpg",
//       "https://example.com/chaunsa2.jpg",
//       "https://example.com/chaunsa3.jpg",
//     ],
//     quality:
//       "Premium quality Chaunsa mangoes, sweet and juicy, perfect for the season. Hand-picked from the finest orchards.",
//   },
//   sindhri: {
//     name: "Sindhri",
//     pricePerCrate: 2200,
//     images: [
//       "https://example.com/sindhri1.jpg",
//       "https://example.com/sindhri2.jpg",
//       "https://example.com/sindhri3.jpg",
//     ],
//     quality:
//       "Authentic Sindhri mangoes with rich flavor and smooth texture. Known for their distinctive taste and aroma.",
//   },
//   anwar_ratol: {
//     name: "Anwar Ratol",
//     pricePerCrate: 2800,
//     images: ["https://example.com/anwar1.jpg", "https://example.com/anwar2.jpg", "https://example.com/anwar3.jpg"],
//     quality:
//       "Exquisite Anwar Ratol mangoes, considered the king of mangoes. Exceptionally sweet with a unique flavor profile.",
//   },
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class DynamicChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
//   private genAI: GoogleGenerativeAI
//   private csvFilePath: string

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsSnJKP_mtwzAH7g06ZMdI-Mw")
//     this.csvFilePath = path.join(process.cwd(), "orders.csv")

//     this.initializeCSV()
//     this.setupEventListeners()
//   }

//   private initializeCSV(): void {
//     if (!fs.existsSync(this.csvFilePath)) {
//       const headers = "orderId,phoneNumber,customerName,address,category,quantity,totalAmount,status,orderDate\n"
//       fs.writeFileSync(this.csvFilePath, headers)
//     }
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Generate random order ID
//   private generateOrderId(): string {
//     const timestamp = Date.now().toString(36)
//     const random = Math.random().toString(36).substr(2, 5)
//     return `MNG${timestamp}${random}`.toUpperCase()
//   }

//   // Save order to CSV
//   private saveOrderToCSV(orderData: OrderRecord): void {
//     const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}",${orderData.category},${orderData.quantity},${orderData.totalAmount},${orderData.status},${orderData.orderDate}\n`
//     fs.appendFileSync(this.csvFilePath, csvLine)
//   }

//   // Get order by ID and phone number
//   private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
//     try {
//       const csvData = fs.readFileSync(this.csvFilePath, "utf8")
//       const lines = csvData.split("\n").slice(1) // Skip header

//       for (const line of lines) {
//         if (line.trim()) {
//           const [id, phone, name, address, category, quantity, amount, status, date] = line.split(",")
//           if (id === orderId && phone === phoneNumber) {
//             return {
//               orderId: id,
//               phoneNumber: phone,
//               customerName: name.replace(/"/g, ""),
//               address: address.replace(/"/g, ""),
//               category,
//               quantity: Number.parseInt(quantity),
//               totalAmount: Number.parseFloat(amount),
//               status,
//               orderDate: date,
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error reading CSV:", error)
//     }
//     return null
//   }

//   // Validate order details with Gemini API
// private async validateOrderWithGemini(
//   orderText: string,
// ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
//   try {
//     const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const prompt = `
// Please validate the following mango order details and extract structured information:

// Order Text: "${orderText}"

// Required fields:
// 1. Customer Name (full name)
// 2. Phone Number (valid Pakistani format)
// 3. Complete Address (with city)
// 4. Quantity (number of crates, must be positive integer)

// Please respond in JSON format only (no extra text or explanation):
// {
//   "isValid": true/false,
//   "message": "validation message",
//   "extractedData": {
//     "customerName": "extracted name",
//     "phoneNumber": "extracted phone",
//     "address": "extracted address",
//     "quantity": extracted_number
//   }
// }

// Only respond with raw JSON. Do not include any text, explanation, or markdown.
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.log("Raw Gemini response:", text);

//     // Extract only the JSON part using a regex
//     const match = text.match(/\{[\s\S]*\}/);
//     if (match) {
//       const cleanJson = match[0];
//       return JSON.parse(cleanJson);
//     }

//     // If no match or parsing failed
//     return {
//       isValid: false,
//       message:
//         "Please provide your complete details: Name, Phone Number, Address, and Number of crates you want to order.",
//     };
//   } catch (error) {
//     console.error("Gemini API error:", error);
//     return {
//       isValid: false,
//       message: "Unable to process your order at the moment. Please try again later.",
//     };
//   }
// }


//   // Generate invoice
//   private generateInvoice(orderData: OrderRecord): string {
//     const invoice = `
// 🧾 **MANGO ORDER INVOICE**

// 📋 Order ID: ${orderData.orderId}
// 📅 Date: ${orderData.orderDate}

// 👤 **Customer Details:**
// Name: ${orderData.customerName}
// Phone: ${orderData.phoneNumber}
// Address: ${orderData.address}

// 🥭 **Order Details:**
// Category: ${orderData.category}
// Quantity: ${orderData.quantity} crate(s)
// Price per crate: Rs. ${MANGO_CATEGORIES[orderData.category as keyof typeof MANGO_CATEGORIES]?.pricePerCrate || 0}
// Total Amount: Rs. ${orderData.totalAmount}

// 📊 Status: ${orderData.status}

// Thank you for your order! 🙏
// For tracking, save your Order ID: ${orderData.orderId}
//     `
//     return invoice
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//         orderData: {},
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     // Clear any existing timeout
//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//       orderData: {},
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     // Clear any existing timeout
//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     // Set timeout to disable human chat after 8 hours
//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined

//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle special mango order steps
//   private async handleMangoOrderSteps(sender: string, text: string, session: UserSession): Promise<boolean> {
//     // Handle mango category selection
//     if (session.currentStep === "mango_categories") {
//       const categoryMap: { [key: string]: keyof typeof MANGO_CATEGORIES } = {
//         "1": "sindhri",
//         "2": "chaunsa",
//         "3": "anwar_ratol",
//       }

//       const selectedCategory = categoryMap[text.trim()]
//       if (selectedCategory) {
//         session.orderData!.category = selectedCategory
//         const categoryData = MANGO_CATEGORIES[selectedCategory]

//         // Send category details with images
//         await this.bot.sendText(
//           sender,
//           `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
//         )

//         // Send images
//         for (const imageUrl of categoryData.images) {
//           await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
//           await this.delay(500)
//         }

//         await this.delay(1000)
//         await this.bot.sendText(
//           sender,
//           "📝 Please provide your complete order details:\n\n• Your full name\n• Phone number\n• Complete address\n• Number of crates you want to order\n\nExample: John Doe, 03001234567, House 123 Street 5 Karachi, 2 crates",
//         )

//         session.currentStep = "order_details"
//         return true
//       }
//     }

//     // Handle order details validation
//     if (session.currentStep === "order_details") {
//       const validation = await this.validateOrderWithGemini(text)

//       if (validation.isValid && validation.extractedData) {
//         // Store order data
//         const orderData = validation.extractedData
//         const category = session.orderData!.category!
//         const categoryInfo = MANGO_CATEGORIES[category as keyof typeof MANGO_CATEGORIES]
//         const totalAmount = categoryInfo.pricePerCrate * orderData.quantity

//         // Generate order ID and save to CSV
//         const orderId = this.generateOrderId()
//         const orderRecord: OrderRecord = {
//           orderId,
//           phoneNumber: sender,
//           customerName: orderData.customerName,
//           address: orderData.address,
//           category,
//           quantity: orderData.quantity,
//           totalAmount,
//           status: "Pending",
//           orderDate: new Date().toISOString().split("T")[0],
//         }

//         this.saveOrderToCSV(orderRecord)

//         // Send invoice
//         const invoice = this.generateInvoice(orderRecord)
//         await this.bot.sendText(sender, invoice)

//         // Reset session
//         session.currentStep = "main_menu"
//         session.orderData = {}

//         return true
//       } else {
//         await this.bot.sendText(sender, validation.message)
//         return true
//       }
//     }

//     // Handle order tracking
//     if (session.currentStep === "track_order_input") {
//       const orderId = text.trim().toUpperCase()
//       const order = this.getOrderByIdAndPhone(orderId, sender)

//       if (order) {
//         const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Category: ${order.category}
// 📦 Quantity: ${order.quantity} crate(s)
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}
//         `
//         await this.bot.sendText(sender, trackingInfo)
//       } else {
//         await this.bot.sendText(
//           sender,
//           "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.",
//         )
//       }

//       session.currentStep = "main_menu"
//       return true
//     }

//     return false
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         // Bot should ignore messages when human chat is enabled
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Handle special mango order steps first
//       if (await this.handleMangoOrderSteps(sender, text, session)) {
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             await this.sendStepMessages(sender, nextStep, session)
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       // Check if step uses new multi-message format
//       if (step.messages && step.messages.length > 0) {
//         // Send multiple messages
//         for (const messageContent of step.messages) {
//           // Apply delay if specified
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         // Backward compatibility: convert old format to new format
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const dynamicBot = new DynamicChatBot()

// // Export for external use
// export default dynamicBot
// export {
//   DynamicChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
//   type OrderRecord,
// }




























// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// // Type definitions
// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
//   orderData?: {
//     category?: string
//     quantity?: number
//     customerName?: string
//     address?: string
//     phoneNumber?: string
//   }
// }

// interface OrderRecord {
//   orderId: string
//   phoneNumber: string
//   customerName: string
//   address: string
//   category: string
//   quantity: number
//   totalAmount: number
//   status: string
//   orderDate: string
//   comment?: string
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// // Enhanced message interface to support multiple message types
// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// // Enhanced Step interface
// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
// }

// interface Message {
//   from: string
//   body?: string
// }

// // Mango categories with pricing
// const MANGO_CATEGORIES = {
//   chaunsa: {
//     name: "Chaunsa",
//     pricePerCrate: 2500,
//     images: [
//       "https://example.com/chaunsa1.jpg",
//       "https://example.com/chaunsa2.jpg",
//       "https://example.com/chaunsa3.jpg",
//     ],
//     quality:
//       "Premium quality Chaunsa mangoes, sweet and juicy, perfect for the season. Hand-picked from the finest orchards.",
//   },
//   sindhri: {
//     name: "Sindhri",
//     pricePerCrate: 2200,
//     images: [
//       "https://example.com/sindhri1.jpg",
//       "https://example.com/sindhri2.jpg",
//       "https://example.com/sindhri3.jpg",
//     ],
//     quality:
//       "Authentic Sindhri mangoes with rich flavor and smooth texture. Known for their distinctive taste and aroma.",
//   },
//   anwar_ratol: {
//     name: "Anwar Ratol",
//     pricePerCrate: 2800,
//     images: ["https://example.com/anwar1.jpg", "https://example.com/anwar2.jpg", "https://example.com/anwar3.jpg"],
//     quality:
//       "Exquisite Anwar Ratol mangoes, considered the king of mangoes. Exceptionally sweet with a unique flavor profile.",
//   },
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class DynamicChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
//   private genAI: GoogleGenerativeAI
//   private csvFilePath: string

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw")
//     this.csvFilePath = path.join(process.cwd(), "orders.csv")

//     this.initializeCSV()
//     this.setupEventListeners()
//   }

//   private initializeCSV(): void {
//     if (!fs.existsSync(this.csvFilePath)) {
//       const headers =
//         "orderId,phoneNumber,customerName,address,category,quantity,totalAmount,status,orderDate,comment\n"
//       fs.writeFileSync(this.csvFilePath, headers)
//     }
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Generate random order ID
//   private generateOrderId(): string {
//     const timestamp = Date.now().toString(36)
//     const random = Math.random().toString(36).substr(2, 5)
//     return `MNG${timestamp}${random}`.toUpperCase()
//   }

//   // Save order to CSV
//   private saveOrderToCSV(orderData: OrderRecord): void {
//     const comment = orderData.comment ? `,"${orderData.comment}"` : `,""`
//     const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}",${orderData.category},${orderData.quantity},${orderData.totalAmount},${orderData.status},${orderData.orderDate}${comment}\n`
//     fs.appendFileSync(this.csvFilePath, csvLine)
//   }

//   // Get order by ID and phone number
//   private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
//     try {
//       const csvData = fs.readFileSync(this.csvFilePath, "utf8")
//       const lines = csvData.split("\n").slice(1) // Skip header

//       for (const line of lines) {
//         if (line.trim()) {
//           // Use regex to handle CSV parsing properly with quoted fields
//           const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)
//           if (matches && matches.length >= 9) {
//             const id = matches[0]
//             const phone = matches[1]
//             const name = matches[2].replace(/"/g, "")
//             const address = matches[3].replace(/"/g, "")
//             const category = matches[4]
//             const quantity = matches[5]
//             const amount = matches[6]
//             const status = matches[7]
//             const date = matches[8]
//             const comment = matches.length > 9 ? matches[9].replace(/"/g, "") : ""

//             if (id === orderId && phone === phoneNumber) {
//               return {
//                 orderId: id,
//                 phoneNumber: phone,
//                 customerName: name,
//                 address: address,
//                 category,
//                 quantity: Number.parseInt(quantity),
//                 totalAmount: Number.parseFloat(amount),
//                 status,
//                 orderDate: date,
//                 comment,
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error reading CSV:", error)
//     }
//     return null
//   }

//   // Validate order details with Gemini API
//   private async validateOrderWithGemini(
//     orderText: string,
//     phoneNumber: string,
//   ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
//     try {
//       const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

//       const prompt = `
// Please validate the following mango order details and extract structured information:

// Order Text: "${orderText}"

// Required fields:
// 1. Customer Name (full name)
// 2. Complete Address (with city)
// 3. Quantity (number of crates, must be positive integer)

// Please respond in JSON format only (no extra text or explanation):
// {
//   "isValid": true/false,
//   "message": "validation message",
//   "extractedData": {
//     "customerName": "extracted name",
//     "phoneNumber": "${phoneNumber}",
//     "address": "extracted address",
//     "quantity": extracted_number
//   }
// }

// Only respond with raw JSON. Do not include any text, explanation, or markdown.
// `

//       const result = await model.generateContent(prompt)
//       const response = await result.response
//       const text = response.text()

//       console.log("Raw Gemini response:", text)

//       // Extract only the JSON part using a regex
//       const match = text.match(/\{[\s\S]*\}/)
//       if (match) {
//         const cleanJson = match[0]
//         return JSON.parse(cleanJson)
//       }

//       // If no match or parsing failed
//       return {
//         isValid: false,
//         message:
//           "Please provide your complete details: Name, Phone Number, Address, and Number of crates you want to order.",
//       }
//     } catch (error) {
//       console.error("Gemini API error:", error)
//       return {
//         isValid: false,
//         message: "Unable to process your order at the moment. Please try again later.",
//       }
//     }
//   }

//   // Generate invoice
//   private generateInvoice(orderData: OrderRecord): string {
//     const invoice = `
// 🧾 **MANGO ORDER INVOICE**

// 📋 Order ID: ${orderData.orderId}
// 📅 Date: ${orderData.orderDate}

// 👤 **Customer Details:**
// Name: ${orderData.customerName}
// Phone: ${orderData.phoneNumber}
// Address: ${orderData.address}

// 🥭 **Order Details:**
// Category: ${orderData.category}
// Quantity: ${orderData.quantity} crate(s)
// Price per crate: Rs. ${MANGO_CATEGORIES[orderData.category as keyof typeof MANGO_CATEGORIES]?.pricePerCrate || 0}
// Total Amount: Rs. ${orderData.totalAmount}

// 📊 Status: ${orderData.status}
// ${orderData.comment ? `\n📝 Note: ${orderData.comment}` : ""}

// Thank you for your order! 🙏
// For tracking, save your Order ID: ${orderData.orderId}
//     `
//     return invoice
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//         orderData: {},
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     // Clear any existing timeout
//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//       orderData: {},
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     // Clear any existing timeout
//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     // Set timeout to disable human chat after 8 hours
//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined

//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle special mango order steps
//   private async handleMangoOrderSteps(sender: string, text: string, session: UserSession): Promise<boolean> {
//     // Handle mango category selection
//     if (session.currentStep === "mango_categories") {
//       const categoryMap: { [key: string]: keyof typeof MANGO_CATEGORIES } = {
//         "1": "sindhri",
//         "2": "chaunsa",
//         "3": "anwar_ratol",
//       }

//       const selectedCategory = categoryMap[text.trim()]
//       if (selectedCategory) {
//         session.orderData!.category = selectedCategory
//         const categoryData = MANGO_CATEGORIES[selectedCategory]

//         // Send category details with images
//         await this.bot.sendText(
//           sender,
//           `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
//         )

//         // Send images
//         for (const imageUrl of categoryData.images) {
//           await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
//           await this.delay(500)
//         }

//         await this.delay(1000)
//         await this.bot.sendText(
//           sender,
//           "📝 Please provide your complete order details:\n\n• Your full name\n• Complete address\n• Number of crates you want to order\n\nExample: John Doe, House 123 Street 5 Karachi, 2 crates",
//         )

//         session.currentStep = "order_details"
//         return true
//       }
//     }

//     // Handle order details validation
//     if (session.currentStep === "order_details") {
//       const validation = await this.validateOrderWithGemini(text, sender)

//       if (validation.isValid && validation.extractedData) {
//         // Store order data
//         const orderData = validation.extractedData
//         const category = session.orderData!.category!
//         const categoryInfo = MANGO_CATEGORIES[category as keyof typeof MANGO_CATEGORIES]
//         const totalAmount = categoryInfo.pricePerCrate * orderData.quantity

//         // Generate order ID and save to CSV
//         const orderId = this.generateOrderId()
//         const orderRecord: OrderRecord = {
//           orderId,
//           phoneNumber: sender,
//           customerName: orderData.customerName,
//           address: orderData.address,
//           category,
//           quantity: orderData.quantity,
//           totalAmount,
//           status: "Pending",
//           orderDate: new Date().toISOString().split("T")[0],
//           comment: "",
//         }

//         this.saveOrderToCSV(orderRecord)

//         // Send invoice
//         const invoice = this.generateInvoice(orderRecord)
//         await this.bot.sendText(sender, invoice)

//         // Reset session
//         session.currentStep = "main_menu"
//         session.orderData = {}

//         return true
//       } else {
//         await this.bot.sendText(sender, validation.message)
//         return true
//       }
//     }

//     // Handle order tracking - Fix the issue with needing to enter order ID twice
//     // Fix the track_order step to process the order ID immediately
//     if (session.currentStep === "track_order") {
//       if (text.trim().toUpperCase().includes("MNG")) {
//         const orderId = text.trim().toUpperCase()
//         const order = this.getOrderByIdAndPhone(orderId, sender)

//         if (order) {
//           const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Category: ${order.category}
// 📦 Quantity: ${order.quantity} crate(s)
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}
// ${order.comment ? `\n📝 Note: ${order.comment}` : ""}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}
//         `
//           await this.bot.sendText(sender, trackingInfo)
//         } else {
//           await this.bot.sendText(
//             sender,
//             "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.",
//           )
//         }

//         session.currentStep = "main_menu"
//         return true
//       }
//     }

//     // Keep the track_order_input handler for backward compatibility
//     if (session.currentStep === "track_order_input") {
//       const orderId = text.trim().toUpperCase()
//       const order = this.getOrderByIdAndPhone(orderId, sender)

//       if (order) {
//         const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Category: ${order.category}
// 📦 Quantity: ${order.quantity} crate(s)
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}
// ${order.comment ? `\n📝 Note: ${order.comment}` : ""}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}
//         `
//         await this.bot.sendText(sender, trackingInfo)
//       } else {
//         await this.bot.sendText(
//           sender,
//           "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.",
//         )
//       }

//       session.currentStep = "main_menu"
//       return true
//     }

//     return false
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         // Bot should ignore messages when human chat is enabled
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Handle special mango order steps first
//       if (await this.handleMangoOrderSteps(sender, text, session)) {
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             await this.sendStepMessages(sender, nextStep, session)
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       // Check if step uses new multi-message format
//       if (step.messages && step.messages.length > 0) {
//         // Send multiple messages
//         for (const messageContent of step.messages) {
//           // Apply delay if specified
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         // Backward compatibility: convert old format to new format
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const dynamicBot = new DynamicChatBot()

// // Export for external use
// export default dynamicBot
// export {
//   DynamicChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
//   type OrderRecord,
// }









































































// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// // Type definitions
// interface CartItem {
//   category: string
//   quantity: number
//   pricePerCrate: number
//   totalPrice: number
// }

// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
//   cart?: CartItem[]
//   orderData?: {
//     customerName?: string
//     address?: string
//     phoneNumber?: string
//   }
// }

// interface OrderRecord {
//   orderId: string
//   phoneNumber: string
//   customerName: string
//   address: string
//   items: CartItem[]
//   totalAmount: number
//   status: string
//   orderDate: string
//   comment?: string
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface MangoCategory {
//   name: string
//   pricePerCrate: number
//   images: string[]
//   quality: string
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
//   mangoCategories: Record<string, MangoCategory>
// }

// interface Message {
//   from: string
//   body?: string
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class EnhancedMangoChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
//   private genAI: GoogleGenerativeAI
//   private csvFilePath: string

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw")
//     this.csvFilePath = path.join(process.cwd(), "orders.csv")

//     this.initializeCSV()
//     this.setupEventListeners()
//   }

//   private initializeCSV(): void {
//     if (!fs.existsSync(this.csvFilePath)) {
//       const headers = "orderId,phoneNumber,customerName,address,items,totalAmount,status,orderDate,comment\n"
//       fs.writeFileSync(this.csvFilePath, headers)
//     }
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Get mango categories from config
//   private getMangoCategories(): Record<string, MangoCategory> {
//     return this.flowConfig?.mangoCategories || {}
//   }

//   // Generate random order ID
//   private generateOrderId(): string {
//     const timestamp = Date.now().toString(36)
//     const random = Math.random().toString(36).substr(2, 5)
//     return `MNG${timestamp}${random}`.toUpperCase()
//   }

//   // Save order to CSV
//   private saveOrderToCSV(orderData: OrderRecord): void {
//     // Properly escape JSON for CSV by replacing quotes with double quotes
//     const itemsJson = JSON.stringify(orderData.items).replace(/"/g, '""')
//     const comment = orderData.comment ? orderData.comment.replace(/"/g, '""') : ""
//     const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}","${itemsJson}",${orderData.totalAmount},${orderData.status},${orderData.orderDate},"${comment}"\n`
//     fs.appendFileSync(this.csvFilePath, csvLine)
//   }

//   // Get order by ID and phone number
//   private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
//     try {
//       const csvData = fs.readFileSync(this.csvFilePath, "utf8")
//       const lines = csvData.split("\n").slice(1) // Skip header

//       for (const line of lines) {
//         if (line.trim()) {
//           // More robust CSV parsing for quoted fields
//           const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
//           const fields = line.split(csvRegex)

//           if (fields && fields.length >= 9) {
//             const id = fields[0].trim()
//             const phone = fields[1].trim()
//             const name = fields[2].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const address = fields[3].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const itemsStr = fields[4].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const amount = fields[5].trim()
//             const status = fields[6].trim()
//             const date = fields[7].trim()
//             const comment = fields.length > 8 ? fields[8].replace(/^"|"$/g, "").replace(/""/g, '"') : ""

//             if (id === orderId && phone === phoneNumber) {
//               let items: CartItem[] = []
//               try {
//                 if (itemsStr && itemsStr.trim()) {
//                   items = JSON.parse(itemsStr)
//                 }
//               } catch (e) {
//                 console.error("Error parsing items JSON:", e)
//                 console.error("Raw items string:", itemsStr)
//                 // Try to handle malformed JSON by creating a fallback
//                 items = []
//               }

//               return {
//                 orderId: id,
//                 phoneNumber: phone,
//                 customerName: name,
//                 address: address,
//                 items,
//                 totalAmount: Number.parseFloat(amount) || 0,
//                 status,
//                 orderDate: date,
//                 comment,
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error reading CSV:", error)
//     }
//     return null
//   }

//   // Validate order details with Gemini API
//   private async validateOrderWithGemini(
//     orderText: string,
//     phoneNumber: string,
//   ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
//     try {
//       const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

//       const prompt = `
// Please validate the following mango order details and extract structured information:

// Order Text: "${orderText}"

// Required fields:
// 1. Customer Name (full name)
// 2. Complete Address (with city)

// Please respond in JSON format only (no extra text or explanation):
// {
//   "isValid": true/false,
//   "message": "validation message",
//   "extractedData": {
//     "customerName": "extracted name",
//     "phoneNumber": "${phoneNumber}",
//     "address": "extracted address"
//   }
// }

// Only respond with raw JSON. Do not include any text, explanation, or markdown.
// `

//       const result = await model.generateContent(prompt)
//       const response = await result.response
//       const text = response.text()

//       console.log("Raw Gemini response:", text)

//       const match = text.match(/\{[\s\S]*\}/)
//       if (match) {
//         const cleanJson = match[0]
//         return JSON.parse(cleanJson)
//       }

//       return {
//         isValid: false,
//         message: "Please provide your complete details: Name and Complete Address.",
//       }
//     } catch (error) {
//       console.error("Gemini API error:", error)
//       return {
//         isValid: false,
//         message: "Unable to process your order at the moment. Please try again.",
//       }
//     }
//   }

//   // Generate cart summary
//   private generateCartSummary(cart: CartItem[], language: string | null): string {
//     if (cart.length === 0) {
//       return language === "urdu" ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."
//     }

//     const isUrdu = language === "urdu"
//     let summary = isUrdu ? "🛒 **آپ کا کارٹ:**\n\n" : "🛒 **Your Cart:**\n\n"

//     let totalAmount = 0
//     cart.forEach((item, index) => {
//       const categories = this.getMangoCategories()
//       const categoryName = categories[item.category]?.name || item.category

//       summary += `${index + 1}. ${categoryName}\n`
//       summary += isUrdu
//         ? `   تعداد: ${item.quantity} کریٹ\n   قیمت: ${item.pricePerCrate} روپے فی کریٹ\n   کل: ${item.totalPrice} روپے\n\n`
//         : `   Quantity: ${item.quantity} crate(s)\n   Price: Rs. ${item.pricePerCrate} per crate\n   Total: Rs. ${item.totalPrice}\n\n`

//       totalAmount += item.totalPrice
//     })

//     summary += isUrdu ? `💰 **کل رقم: ${totalAmount} روپے**` : `💰 **Grand Total: Rs. ${totalAmount}**`

//     return summary
//   }

//   // Generate invoice
//   private generateInvoice(orderData: OrderRecord): string {
//     const invoice = `
// 🧾 **MANGO ORDER INVOICE**

// 📋 Order ID: ${orderData.orderId}
// 📅 Date: ${orderData.orderDate}

// 👤 **Customer Details:**
// Name: ${orderData.customerName}
// Phone: ${orderData.phoneNumber}
// Address: ${orderData.address}

// 🥭 **Order Details:**
// ${orderData.items
//         .map((item, index) => {
//           const categories = this.getMangoCategories()
//           const categoryName = categories[item.category]?.name || item.category
//           return `${index + 1}. ${categoryName} - ${item.quantity} crate(s) @ Rs. ${item.pricePerCrate} = Rs. ${item.totalPrice}`
//         })
//         .join("\n")}

// 💰 **Total Amount: Rs. ${orderData.totalAmount}**

// 📊 Status: ${orderData.status}
// ${orderData.comment ? `\n📝 Note: ${orderData.comment}` : ""}

// Thank you for your order! 🙏
// For tracking, save your Order ID: ${orderData.orderId}
//     `
//     return invoice
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//         cart: [],
//         orderData: {},
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//       cart: [],
//       orderData: {},
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined
//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle enhanced mango order steps with cart functionality
//   private async handleMangoOrderSteps(sender: string, text: string, session: UserSession): Promise<boolean> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     // Handle mango category selection
//     if (session.currentStep === "mango_categories") {
//       // Create dynamic category mapping from config
//       const categoryKeys = Object.keys(categories)
//       const categoryMap: { [key: string]: string } = {}

//       categoryKeys.forEach((key, index) => {
//         categoryMap[(index + 1).toString()] = key
//       })

//       const selectedCategory = categoryMap[text.trim()]
//       if (selectedCategory) {
//         const categoryData = categories[selectedCategory]

//         // Send category details with images
//         await this.bot.sendText(
//           sender,
//           `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
//         )

//         // Send images
//         for (const imageUrl of categoryData.images) {
//           await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
//           await this.delay(500)
//         }

//         await this.delay(1000)

//         // Line ~420-425 (in mango_categories step handler)
//         const quantityMessage = isUrdu
//           ? "📦 آپ کتنے کریٹ چاہتے ہیں؟ (صرف نمبر لکھیں، جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "📦 How many crates would you like? (Enter number only, e.g., 2)\n\n🅱 Press B to go back"

//         await this.bot.sendText(sender, quantityMessage)

//         // Store selected category in session
//         session.data.selectedCategory = selectedCategory
//         session.currentStep = "quantity_selection"
//         return true
//       }
//     }

//     // Handle quantity selection
//     if (session.currentStep === "quantity_selection") {

//       // Check for back navigation first
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         // Go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const quantity = Number.parseInt(text.trim())

//       if (isNaN(quantity) || quantity <= 0) {
//         // Line ~450-453 (in quantity_selection error handling)
//         const errorMessage = isUrdu
//           ? "❌ براہ کرم صحیح تعداد داخل کریں (جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "❌ Please enter a valid quantity (e.g., 2)\n\n🅱 Press B to go back"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }

//       const selectedCategory = session.data.selectedCategory
//       const categoryData = categories[selectedCategory]

//       // Add to cart
//       if (!session.cart) session.cart = []

//       // Check if category already exists in cart
//       const existingItemIndex = session.cart.findIndex((item) => item.category === selectedCategory)

//       if (existingItemIndex >= 0) {
//         // Update existing item
//         session.cart[existingItemIndex].quantity += quantity
//         session.cart[existingItemIndex].totalPrice =
//           session.cart[existingItemIndex].quantity * categoryData.pricePerCrate
//       } else {
//         // Add new item
//         session.cart.push({
//           category: selectedCategory,
//           quantity,
//           pricePerCrate: categoryData.pricePerCrate,
//           totalPrice: quantity * categoryData.pricePerCrate,
//         })
//       }

//       // Show cart and options
//       const cartSummary = this.generateCartSummary(session.cart, session.language)

//       const optionsMessage = isUrdu
//         ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں"
//         : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart"

//       await this.bot.sendText(sender, cartSummary + optionsMessage)

//       session.currentStep = "cart_options"
//       return true
//     }

//     // Handle cart options
//     if (session.currentStep === "cart_options") {
//       const option = text.trim()

//       if (option === "1") {
//         // Add more mangoes - go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       } else if (option === "2") {
//         // Complete order
//         if (!session.cart || session.cart.length === 0) {
//           const emptyCartMessage = isUrdu
//             ? "❌ آپ کا کارٹ خالی ہے۔ پہلے آم شامل کریں۔"
//             : "❌ Your cart is empty. Please add mangoes first."
//           await this.bot.sendText(sender, emptyCartMessage)
//           return true
//         }

//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi"

//         await this.bot.sendText(sender, orderDetailsMessage)
//         session.currentStep = "order_details"
//         return true
//       } else if (option === "3") {
//         // Clear cart
//         session.cart = []
//         const clearedMessage = isUrdu ? "🗑️ کارٹ خالی کر دیا گیا۔" : "🗑️ Cart cleared."
//         await this.bot.sendText(sender, clearedMessage)
//         session.currentStep = "main_menu"
//         return true
//       } else {
//         const invalidOptionMessage = isUrdu
//           ? "❌ براہ کرم صحیح آپشن منتخب کریں (1-3)"
//           : "❌ Please select a valid option (1-3)"
//         await this.bot.sendText(sender, invalidOptionMessage)
//         return true
//       }
//     }

//     // Handle order details validation
//     if (session.currentStep === "order_details") {
//       const validation = await this.validateOrderWithGemini(text, sender)

//       if (validation.isValid && validation.extractedData) {
//         // Store order data
//         const orderData = validation.extractedData

//         // Calculate total amount from cart
//         const totalAmount = session.cart!.reduce((sum, item) => sum + item.totalPrice, 0)

//         // Generate order ID and save to CSV
//         const orderId = this.generateOrderId()
//         const orderRecord: OrderRecord = {
//           orderId,
//           phoneNumber: sender,
//           customerName: orderData.customerName,
//           address: orderData.address,
//           items: session.cart!,
//           totalAmount,
//           status: "Pending",
//           orderDate: new Date().toISOString().split("T")[0],
//           comment: "",
//         }

//         this.saveOrderToCSV(orderRecord)

//         // Send invoice
//         const invoice = this.generateInvoice(orderRecord)
//         await this.bot.sendText(sender, invoice)

//         // Reset session
//         session.currentStep = "main_menu"
//         session.cart = []
//         session.orderData = {}

//         return true
//       } else {
//         await this.bot.sendText(sender, validation.message)
//         return true
//       }
//     }

//     // Handle order tracking
//     if (session.currentStep === "track_order") {
//       if (text.trim().toUpperCase().includes("MNG")) {
//         const orderId = text.trim().toUpperCase()
//         const order = this.getOrderByIdAndPhone(orderId, sender)

//         if (order) {
//           const categories = this.getMangoCategories()

//           // Generate items display
//           let itemsDisplay = ""
//           if (order.items && order.items.length > 0) {
//             itemsDisplay = order.items
//               .map((item) => {
//                 const categoryName = categories[item.category]?.name || item.category
//                 return `${categoryName} (${item.quantity} crates)`
//               })
//               .join(", ")
//           } else {
//             itemsDisplay = "Order details unavailable"
//           }

//           const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Items: ${itemsDisplay}
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}
// ${order.comment ? `\n📝 Note: ${order.comment}` : ""}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}
//         `
//           await this.bot.sendText(sender, trackingInfo)
//         } else {
//           await this.bot.sendText(
//             sender,
//             "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.",
//           )
//         }

//         session.currentStep = "main_menu"
//         return true
//       }
//     }

//     return false
//   }

//   // Send category selection message dynamically from config
//   private async sendCategorySelectionMessage(sender: string, session: UserSession): Promise<void> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     let message = isUrdu ? "🥭 **آم کی قسم منتخب کریں**\n\n" : "🥭 **Select Mango Category**\n\n"

//     const categoryKeys = Object.keys(categories)
//     categoryKeys.forEach((key, index) => {
//       const category = categories[key]
//       message += `${index + 1}️⃣ ${category.name} - Rs. ${category.pricePerCrate}/crate\n`
//     })

//     message += isUrdu
//       ? `\nبراہ کرم ایک قسم منتخب کریں (1-${categoryKeys.length}):`
//       : `\nPlease select a category (1-${categoryKeys.length}):`

//     await this.bot.sendText(sender, message)
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Handle special mango order steps first
//       if (await this.handleMangoOrderSteps(sender, text, session)) {
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             // Special handling for mango_categories step
//             if (matchingTrigger.nextStep === "mango_categories") {
//               await this.sendCategorySelectionMessage(sender, session)
//             } else {
//               await this.sendStepMessages(sender, nextStep, session)
//             }
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       if (step.messages && step.messages.length > 0) {
//         for (const messageContent of step.messages) {
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const enhancedMangoBot = new EnhancedMangoChatBot()

// // Export for external use
// export default enhancedMangoBot
// export {
//   EnhancedMangoChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
//   type OrderRecord,
//   type CartItem,
//   type MangoCategory,
// }
























































































// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// // Type definitions
// interface CartItem {
//   category: string
//   quantity: number
//   pricePerCrate: number
//   totalPrice: number
// }

// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
//   cart?: CartItem[]
//   orderData?: {
//     customerName?: string
//     address?: string
//     phoneNumber?: string
//     totalAmount?: number
//     orderId?: string
//   }
// }

// interface OrderRecord {
//   orderId: string
//   phoneNumber: string
//   customerName: string
//   address: string
//   items: CartItem[]
//   totalAmount: number
//   status: string
//   orderDate: string
//   comment?: string
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface MangoCategory {
//   name: string
//   pricePerCrate: number
//   images: string[]
//   quality: string
// }

// interface BankAccount {
//   bank: string
//   account: string
//   title: string
//   iban: string
// }

// interface MobilePayment {
//   account: string
//   name: string
// }

// interface PaymentConfig {
//   bankAccounts: BankAccount[]
//   mobilePayments: {
//     easypaisa: MobilePayment
//     jazzcash: MobilePayment
//     sadapay: MobilePayment
//   }
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
//   mangoCategories: Record<string, MangoCategory>
//   paymentConfig?: PaymentConfig
// }

// interface Message {
//   from: string
//   body?: string
//   hasMedia?: boolean
//   downloadMedia?: () => Promise<Buffer>
//   mimetype?: string
// }

// interface PaymentVerificationResult {
//   paymentStatus: "Successful" | "Unsuccessful" | "Error"
//   message: string
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class EnhancedMangoChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
//   private genAI: GoogleGenerativeAI
//   private csvFilePath: string

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw")
//     this.csvFilePath = path.join(process.cwd(), "orders.csv")

//     this.initializeCSV()
//     this.setupEventListeners()
//   }

//   private initializeCSV(): void {
//     if (!fs.existsSync(this.csvFilePath)) {
//       const headers = "orderId,phoneNumber,customerName,address,items,totalAmount,status,orderDate,comment\n"
//       fs.writeFileSync(this.csvFilePath, headers)
//     }
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Convert file to base64
//   private async fileToBase64(file: Buffer, mimeType: string): Promise<string> {
//     return file.toString("base64")
//   }

//   // Verify payment using Gemini API
//   private async verifyPayment(
//     imageBuffer: Buffer,
//     mimeType: string,
//     requiredAmount: number,
//   ): Promise<PaymentVerificationResult> {
//     try {
//       const base64Image = await this.fileToBase64(imageBuffer, mimeType)

//       const prompt = `I have uploaded a transaction receipt. Verify that the user has paid ${requiredAmount} rupees.

// If the user paid exactly the required amount, return:
// {
// "paymentStatus":"Successful",
// "message":"The user has paid the amount"
// }

// If the user paid more than the required amount, return:
// {
// "paymentStatus":"Successful",
// "message":"The user has paid the amount. You have paid more than the required amount. Required: ${requiredAmount} rupees, Paid: [actual amount found] rupees"
// }

// If the user paid less than the required amount, return:
// {
// "paymentStatus":"Unsuccessful", 
// "message":"The user has not paid the amount which was required. The required amount was ${requiredAmount} rupees and the user has paid [actual amount found] rupees"
// }

// Just return a json message and nothing else in the response.`

//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw"}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: prompt,
//                   },
//                   {
//                     inline_data: {
//                       mime_type: mimeType,
//                       data: base64Image,
//                     },
//                   },
//                 ],
//               },
//             ],
//           }),
//         },
//       )

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status} ${response.statusText}`)
//       }

//       const data = await response.json()

//       if (data.candidates && data.candidates[0] && data.candidates[0].content) {
//         const responseText = data.candidates[0].content.parts[0].text

//         // Try to parse JSON from the response
//         try {
//           const jsonMatch = responseText.match(/\{[\s\S]*\}/)
//           if (jsonMatch) {
//             return JSON.parse(jsonMatch[0])
//           } else {
//             throw new Error("No JSON found in response")
//           }
//         } catch (parseError) {
//           console.error("JSON parsing error:", parseError)
//           return {
//             paymentStatus: "Error",
//             message: "Failed to parse API response",
//           }
//         }
//       } else {
//         throw new Error("Invalid response format from API")
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       return {
//         paymentStatus: "Error",
//         message: `Verification failed: ${error.message}`,
//       }
//     }
//   }

//   // Get mango categories from config
//   private getMangoCategories(): Record<string, MangoCategory> {
//     return this.flowConfig?.mangoCategories || {}
//   }

//   // Get payment config from JSON
//   private getPaymentConfig(): PaymentConfig {
//     return (
//       this.flowConfig?.paymentConfig || {
//         bankAccounts: [
//           {
//             bank: "HBL Bank",
//             account: "12345678901234",
//             title: "Mango Paradise",
//             iban: "PK36HABB0012345678901234",
//           },
//           {
//             bank: "UBL Bank",
//             account: "56789012345678",
//             title: "Mango Paradise",
//             iban: "PK47UNIL0056789012345678",
//           },
//         ],
//         mobilePayments: {
//           easypaisa: { account: "03001234567", name: "Mango Paradise" },
//           jazzcash: { account: "03009876543", name: "Mango Paradise" },
//           sadapay: { account: "03005555555", name: "Mango Paradise" },
//         },
//       }
//     )
//   }

//   // Generate random order ID
//   private generateOrderId(): string {
//     const timestamp = Date.now().toString(36)
//     const random = Math.random().toString(36).substr(2, 5)
//     return `MNG${timestamp}${random}`.toUpperCase()
//   }

//   // Save order to CSV
//   private saveOrderToCSV(orderData: OrderRecord): void {
//     // Properly escape JSON for CSV by replacing quotes with double quotes
//     const itemsJson = JSON.stringify(orderData.items).replace(/"/g, '""')
//     const comment = orderData.comment ? orderData.comment.replace(/"/g, '""') : ""
//     const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}","${itemsJson}",${orderData.totalAmount},${orderData.status},${orderData.orderDate},"${comment}"\n`
//     fs.appendFileSync(this.csvFilePath, csvLine)
//   }

//   // Get order by ID and phone number
//   private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
//     try {
//       const csvData = fs.readFileSync(this.csvFilePath, "utf8")
//       const lines = csvData.split("\n").slice(1) // Skip header

//       for (const line of lines) {
//         if (line.trim()) {
//           // More robust CSV parsing for quoted fields
//           const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
//           const fields = line.split(csvRegex)

//           if (fields && fields.length >= 9) {
//             const id = fields[0].trim()
//             const phone = fields[1].trim()
//             const name = fields[2].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const address = fields[3].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const itemsStr = fields[4].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const amount = fields[5].trim()
//             const status = fields[6].trim()
//             const date = fields[7].trim()
//             const comment = fields.length > 8 ? fields[8].replace(/^"|"$/g, "").replace(/""/g, '"') : ""

//             if (id === orderId && phone === phoneNumber) {
//               let items: CartItem[] = []
//               try {
//                 if (itemsStr && itemsStr.trim()) {
//                   items = JSON.parse(itemsStr)
//                 }
//               } catch (e) {
//                 console.error("Error parsing items JSON:", e)
//                 console.error("Raw items string:", itemsStr)
//                 // Try to handle malformed JSON by creating a fallback
//                 items = []
//               }

//               return {
//                 orderId: id,
//                 phoneNumber: phone,
//                 customerName: name,
//                 address: address,
//                 items,
//                 totalAmount: Number.parseFloat(amount) || 0,
//                 status,
//                 orderDate: date,
//                 comment,
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error reading CSV:", error)
//     }
//     return null
//   }

//   // Validate order details with Gemini API
//   private async validateOrderWithGemini(
//     orderText: string,
//     phoneNumber: string,
//   ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
//     try {
//       const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

//       const prompt = `
// Please validate the following mango order details and extract structured information:

// Order Text: "${orderText}"

// Required fields:
// 1. Customer Name (full name)
// 2. Complete Address (with city)

// Please respond in JSON format only (no extra text or explanation):
// {
//   "isValid": true/false,
//   "message": "validation message",
//   "extractedData": {
//     "customerName": "extracted name",
//     "phoneNumber": "${phoneNumber}",
//     "address": "extracted address"
//   }
// }

// Only respond with raw JSON. Do not include any text, explanation, or markdown.
// `

//       const result = await model.generateContent(prompt)
//       const response = await result.response
//       const text = response.text()

//       console.log("Raw Gemini response:", text)

//       const match = text.match(/\{[\s\S]*\}/)
//       if (match) {
//         const cleanJson = match[0]
//         return JSON.parse(cleanJson)
//       }

//       return {
//         isValid: false,
//         message: "Please provide your complete details: Name and Complete Address.",
//       }
//     } catch (error) {
//       console.error("Gemini API error:", error)
//       return {
//         isValid: false,
//         message: "Unable to process your order at the moment. Please try again.",
//       }
//     }
//   }

//   // Generate cart summary
//   private generateCartSummary(cart: CartItem[], language: string | null): string {
//     if (cart.length === 0) {
//       return language === "urdu" ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."
//     }

//     const isUrdu = language === "urdu"
//     let summary = isUrdu ? "🛒 **آپ کا کارٹ:**\n\n" : "🛒 **Your Cart:**\n\n"

//     let totalAmount = 0
//     cart.forEach((item, index) => {
//       const categories = this.getMangoCategories()
//       const categoryName = categories[item.category]?.name || item.category

//       summary += `${index + 1}. ${categoryName}\n`
//       summary += isUrdu
//         ? `   تعداد: ${item.quantity} کریٹ\n   قیمت: ${item.pricePerCrate} روپے فی کریٹ\n   کل: ${item.totalPrice} روپے\n\n`
//         : `   Quantity: ${item.quantity} crate(s)\n   Price: Rs. ${item.pricePerCrate} per crate\n   Total: Rs. ${item.totalPrice}\n\n`

//       totalAmount += item.totalPrice
//     })

//     summary += isUrdu ? `💰 **کل رقم: ${totalAmount} روپے**` : `💰 **Grand Total: Rs. ${totalAmount}**`

//     return summary
//   }

//   // Generate invoice/receipt
//   private generateInvoice(orderData: OrderRecord): string {
//     const invoice = `
// 🧾 **MANGO ORDER RECEIPT**

// 📋 Order ID: ${orderData.orderId}
// 📅 Date: ${orderData.orderDate}

// 👤 **Customer Details:**
// Name: ${orderData.customerName}
// Phone: ${orderData.phoneNumber}
// Address: ${orderData.address}

// 🥭 **Order Details:**
// ${orderData.items
//   .map((item, index) => {
//     const categories = this.getMangoCategories()
//     const categoryName = categories[item.category]?.name || item.category
//     return `${index + 1}. ${categoryName} - ${item.quantity} crate(s) @ Rs. ${item.pricePerCrate} = Rs. ${item.totalPrice}`
//   })
//   .join("\n")}

// 💰 **Total Amount: Rs. ${orderData.totalAmount}**
// 📊 Status: ${orderData.status}
// ${orderData.comment ? `\n📝 Note: ${orderData.comment}` : ""}

// ✅ **Payment Verified Successfully!**
// Thank you for your order! 🙏

// For tracking, save your Order ID: ${orderData.orderId}
//     `
//     return invoice
//   }

//   // Save payment image to system
//   private async savePaymentImage(imageBuffer: Buffer, orderId: string, mimeType: string): Promise<string> {
//     try {
//       // Create payments directory if it doesn't exist
//       const paymentsDir = path.join(process.cwd(), "payment_screenshots")
//       if (!fs.existsSync(paymentsDir)) {
//         fs.mkdirSync(paymentsDir, { recursive: true })
//       }

//       // Determine file extension from mime type
//       let extension = "jpg"
//       if (mimeType.includes("png")) extension = "png"
//       else if (mimeType.includes("jpeg")) extension = "jpg"
//       else if (mimeType.includes("webp")) extension = "webp"

//       // Create filename with timestamp
//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
//       const filename = `payment_${orderId}_${timestamp}.${extension}`
//       const filePath = path.join(paymentsDir, filename)

//       // Save the image
//       fs.writeFileSync(filePath, imageBuffer)

//       console.log(`Payment screenshot saved: ${filePath}`)
//       return filePath
//     } catch (error) {
//       console.error("Error saving payment image:", error)
//       throw new Error("Failed to save payment image")
//     }
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//         cart: [],
//         orderData: {},
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//       cart: [],
//       orderData: {},
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined
//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle enhanced mango order steps with cart functionality and payment
//   private async handleMangoOrderSteps(
//     sender: string,
//     text: string,
//     session: UserSession,
//     message?: Message,
//   ): Promise<boolean> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     // Handle mango category selection
//     if (session.currentStep === "mango_categories") {
//       // Create dynamic category mapping from config
//       const categoryKeys = Object.keys(categories)
//       const categoryMap: { [key: string]: string } = {}

//       categoryKeys.forEach((key, index) => {
//         categoryMap[(index + 1).toString()] = key
//       })

//       const selectedCategory = categoryMap[text.trim()]
//       if (selectedCategory) {
//         const categoryData = categories[selectedCategory]

//         // Send category details with images
//         await this.bot.sendText(
//           sender,
//           `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
//         )

//         // Send images
//         for (const imageUrl of categoryData.images) {
//           await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
//           await this.delay(500)
//         }

//         await this.delay(1000)

//         const quantityMessage = isUrdu
//           ? "📦 آپ کتنے کریٹ چاہتے ہیں؟ (صرف نمبر لکھیں، جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "📦 How many crates would you like? (Enter number only, e.g., 2)\n\n🅱 Press B to go back"

//         await this.bot.sendText(sender, quantityMessage)

//         // Store selected category in session
//         session.data.selectedCategory = selectedCategory
//         session.currentStep = "quantity_selection"
//         return true
//       }
//     }

//     // Handle quantity selection
//     if (session.currentStep === "quantity_selection") {
//       // Check for back navigation first
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         // Go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const quantity = Number.parseInt(text.trim())

//       if (isNaN(quantity) || quantity <= 0) {
//         const errorMessage = isUrdu
//           ? "❌ براہ کرم صحیح تعداد داخل کریں (جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "❌ Please enter a valid quantity (e.g., 2)\n\n🅱 Press B to go back"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }

//       const selectedCategory = session.data.selectedCategory
//       const categoryData = categories[selectedCategory]

//       // Add to cart
//       if (!session.cart) session.cart = []

//       // Check if category already exists in cart
//       const existingItemIndex = session.cart.findIndex((item) => item.category === selectedCategory)

//       if (existingItemIndex >= 0) {
//         // Update existing item
//         session.cart[existingItemIndex].quantity += quantity
//         session.cart[existingItemIndex].totalPrice =
//           session.cart[existingItemIndex].quantity * categoryData.pricePerCrate
//       } else {
//         // Add new item
//         session.cart.push({
//           category: selectedCategory,
//           quantity,
//           pricePerCrate: categoryData.pricePerCrate,
//           totalPrice: quantity * categoryData.pricePerCrate,
//         })
//       }

//       // Show cart and options
//       const cartSummary = this.generateCartSummary(session.cart, session.language)

//       const optionsMessage = isUrdu
//         ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

//       await this.bot.sendText(sender, cartSummary + optionsMessage)

//       session.currentStep = "cart_options"
//       return true
//     }

//     // Handle cart options
//     if (session.currentStep === "cart_options") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const option = text.trim()

//       if (option === "1") {
//         // Add more mangoes - go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       } else if (option === "2") {
//         // Complete order
//         if (!session.cart || session.cart.length === 0) {
//           const emptyCartMessage = isUrdu
//             ? "❌ آپ کا کارٹ خالی ہے۔ پہلے آم شامل کریں۔"
//             : "❌ Your cart is empty. Please add mangoes first."
//           await this.bot.sendText(sender, emptyCartMessage)
//           return true
//         }

//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

//         await this.bot.sendText(sender, orderDetailsMessage)
//         session.currentStep = "order_details"
//         return true
//       } else if (option === "3") {
//         // Clear cart
//         session.cart = []
//         const clearedMessage = isUrdu ? "🗑️ کارٹ خالی کر دیا گیا۔" : "🗑️ Cart cleared."
//         await this.bot.sendText(sender, clearedMessage)
//         session.currentStep = "main_menu"
//         return true
//       } else {
//         const invalidOptionMessage = isUrdu
//           ? "❌ براہ کرم صحیح آپشن منتخب کریں (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "❌ Please select a valid option (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, invalidOptionMessage)
//         return true
//       }
//     }

//     // Handle order details validation
//     if (session.currentStep === "order_details") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "cart_options"
//         const cartSummary = this.generateCartSummary(session.cart!, session.language)
//         const optionsMessage = isUrdu
//           ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, cartSummary + optionsMessage)
//         return true
//       }

//       const validation = await this.validateOrderWithGemini(text, sender)

//       if (validation.isValid && validation.extractedData) {
//         // Store order data
//         const orderData = validation.extractedData
//         const totalAmount = session.cart!.reduce((sum, item) => sum + item.totalPrice, 0)

//         // Store in session for payment verification
//         session.orderData = {
//           customerName: orderData.customerName,
//           address: orderData.address,
//           phoneNumber: sender,
//           totalAmount,
//           orderId: this.generateOrderId(),
//         }

//         // Send bank details from config
//         await this.sendBankDetails(sender, session)

//         session.currentStep = "payment_method_selection"
//         return true
//       } else {
//         await this.bot.sendText(sender, validation.message + "\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu")
//         return true
//       }
//     }

//     // Handle payment method selection
//     if (session.currentStep === "payment_method_selection") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "order_details"
//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, orderDetailsMessage)
//         return true
//       }

//       const option = text.trim()
//       if (option === "1") {
//         // Bank transfer selected - send bank details and move to awaiting payment
//         await this.sendBankDetails(sender, session)
//         session.currentStep = "awaiting_payment_screenshot"
//         return true
//       } else if (option === "2") {
//         // Mobile payment selected - send mobile payment details and move to awaiting payment
//         await this.sendMobilePaymentDetails(sender, session)
//         session.currentStep = "awaiting_payment_screenshot"
//         return true
//       } else {
//         const errorMessage = isUrdu
//           ? "�� براہ کرم صحیح آپشن منتخب کریں (1 یا 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "❌ Please select a valid option (1 or 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }
//     }

//     // Handle payment screenshot verification
//     if (session.currentStep === "awaiting_payment_screenshot") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "payment_method_selection"
//         await this.sendPaymentMethodSelection(sender, session)
//         return true
//       }

//       // Check if message has media (image)
//       if (message?.hasMedia && message.downloadMedia) {
//         try {
//           console.log("Processing payment screenshot...")
//           const mediaBuffer = await message.downloadMedia()
//           const mimeType = message.mimetype || "image/jpeg"

//           // Save image to system
//           const imagePath = await this.savePaymentImage(mediaBuffer, session.orderData!.orderId!, mimeType)
//           console.log(`Payment image saved to: ${imagePath}`)

//           // Verify payment using Gemini API
//           const verificationResult = await this.verifyPayment(mediaBuffer, mimeType, session.orderData!.totalAmount!)

//           if (verificationResult.paymentStatus === "Successful") {
//             // Payment successful - create order record and save to CSV
//             const orderRecord: OrderRecord = {
//               orderId: session.orderData!.orderId!,
//               phoneNumber: sender,
//               customerName: session.orderData!.customerName!,
//               address: session.orderData!.address!,
//               items: session.cart!,
//               totalAmount: session.orderData!.totalAmount!,
//               status: "Confirmed",
//               orderDate: new Date().toISOString().split("T")[0],
//               comment: `Payment verified successfully. Image saved: ${imagePath}`,
//             }

//             this.saveOrderToCSV(orderRecord)

//             // Send receipt
//             const receipt = this.generateInvoice(orderRecord)
//             await this.bot.sendText(sender, receipt)

//             // Reset session
//             session.currentStep = "main_menu"
//             session.cart = []
//             session.orderData = {}

//             return true
//           } else {
//             // Payment verification failed
//             const failureMessage = isUrdu
//               ? `❌ ${verificationResult.message}\n\nبراہ کرم صحیح ٹرانزیکشن کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//               : `❌ ${verificationResult.message}\n\nPlease send the correct transaction screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//             await this.bot.sendText(sender, failureMessage)
//             return true
//           }
//         } catch (error) {
//           console.error("Error processing payment screenshot:", error)
//           const errorMessage = isUrdu
//             ? "❌ اسکرین شاٹ پروسیس کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "❌ Error processing screenshot. Please try again.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, errorMessage)
//           return true
//         }
//       } else {
//         // No image sent or text message received
//         if (text && text.trim()) {
//           // User sent text instead of image
//           const noImageMessage = isUrdu
//             ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ تصویر کے طور پر بھیجیں، ٹیکسٹ نہیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "📷 Please send the payment screenshot as an image, not text.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, noImageMessage)
//         } else {
//           // No image sent
//           const noImageMessage = isUrdu
//             ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "📷 Please send the payment screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, noImageMessage)
//         }
//         return true
//       }
//     }

//     // Handle order tracking
//     if (session.currentStep === "track_order") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "main_menu"
//         const mainMenuStep = this.getCurrentStep("main_menu")
//         if (mainMenuStep) {
//           await this.sendStepMessages(sender, mainMenuStep, session)
//         }
//         return true
//       }

//       if (text.trim().toUpperCase().includes("MNG")) {
//         const orderId = text.trim().toUpperCase()
//         const order = this.getOrderByIdAndPhone(orderId, sender)

//         if (order) {
//           const categories = this.getMangoCategories()

//           // Generate items display
//           let itemsDisplay = ""
//           if (order.items && order.items.length > 0) {
//             itemsDisplay = order.items
//               .map((item) => {
//                 const categoryName = categories[item.category]?.name || item.category
//                 return `${categoryName} (${item.quantity} crates)`
//               })
//               .join(", ")
//           } else {
//             itemsDisplay = "Order details unavailable"
//           }

//           const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Items: ${itemsDisplay}
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}
// ${order.comment ? `\n📝 Note: ${order.comment}` : ""}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Confirmed" ? "✅ Your order has been confirmed and will be shipped soon." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}

// 🅱 🔙 Previous Menu
// *️⃣ Main Menu
//         `
//           await this.bot.sendText(sender, trackingInfo)
//         } else {
//           await this.bot.sendText(
//             sender,
//             "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu",
//           )
//         }

//         session.currentStep = "main_menu"
//         return true
//       }
//     }

//     return false
//   }

//   // Send bank details from config
//   private async sendBankDetails(sender: string, session: UserSession): Promise<void> {
//     const paymentConfig = this.getPaymentConfig()
//     const isUrdu = session.language === "urdu"

//     let bankMessage = isUrdu ? "🏦 **بینک تفصیلات**\n\n" : "🏦 **Bank Details**\n\n"

//     paymentConfig.bankAccounts.forEach((account, index) => {
//       bankMessage += `💳 **Account ${index + 1}:**\n`
//       bankMessage += `Bank: ${account.bank}\n`
//       bankMessage += `Account: ${account.account}\n`
//       bankMessage += `Title: ${account.title}\n`
//       bankMessage += `IBAN: ${account.iban}\n\n`
//     })

//     const totalAmount = session.orderData?.totalAmount || 0
//     bankMessage += isUrdu
//       ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, bankMessage)
//   }

//   // Send mobile payment details from config
//   private async sendMobilePaymentDetails(sender: string, session: UserSession): Promise<void> {
//     const paymentConfig = this.getPaymentConfig()
//     const isUrdu = session.language === "urdu"

//     let mobileMessage = isUrdu ? "📱 **موبائل پیمنٹ آپشنز**\n\n" : "📱 **Mobile Payment Options**\n\n"

//     mobileMessage += `💰 **Easypaisa:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.easypaisa.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.easypaisa.name}\n\n`

//     mobileMessage += `💰 **JazzCash:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.jazzcash.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.jazzcash.name}\n\n`

//     mobileMessage += `💰 **SadaPay:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.sadapay.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.sadapay.name}\n\n`

//     const totalAmount = session.orderData?.totalAmount || 0
//     mobileMessage += isUrdu
//       ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, mobileMessage)
//   }

//   // Send payment method selection
//   private async sendPaymentMethodSelection(sender: string, session: UserSession): Promise<void> {
//     const isUrdu = session.language === "urdu"
//     const totalAmount = session.orderData?.totalAmount || 0

//     const message = isUrdu
//       ? `💰 **کل رقم: ${totalAmount} روپے**\n\n💳 **ادائیگی کا طریقہ منتخب کریں:**\n\n1️⃣ 🏦 بینک ٹرانسفر\n2️⃣ 📱 موبائل پیمنٹ (Easypaisa/JazzCash/SadaPay)\n\nبراہ کرم ایک آپشن منتخب کریں (1 یا 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Total Amount: Rs. ${totalAmount}**\n\n💳 **Select Payment Method:**\n\n1️⃣ 🏦 Bank Transfer\n2️⃣ 📱 Mobile Payment (Easypaisa/JazzCash/SadaPay)\n\nPlease select an option (1 or 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, message)
//   }

//   // Send category selection message dynamically from config
//   private async sendCategorySelectionMessage(sender: string, session: UserSession): Promise<void> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     let message = isUrdu ? "🥭 **آم کی قسم منتخب کریں**\n\n" : "🥭 **Select Mango Category**\n\n"

//     const categoryKeys = Object.keys(categories)
//     categoryKeys.forEach((key, index) => {
//       const category = categories[key]
//       message += `${index + 1}️⃣ ${category.name} - Rs. ${category.pricePerCrate}/crate\n`
//     })

//     message += isUrdu
//       ? `\nبراہ کرم ایک قسم منتخب کریں (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `\nPlease select a category (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, message)
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Handle special mango order steps first
//       if (await this.handleMangoOrderSteps(sender, text, session, message)) {
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             // Special handling for mango_categories step
//             if (matchingTrigger.nextStep === "mango_categories") {
//               await this.sendCategorySelectionMessage(sender, session)
//             } else {
//               await this.sendStepMessages(sender, nextStep, session)
//             }
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       if (step.messages && step.messages.length > 0) {
//         for (const messageContent of step.messages) {
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const enhancedMangoBot = new EnhancedMangoChatBot()

// // Export for external use
// export default enhancedMangoBot
// export {
//   EnhancedMangoChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
//   type OrderRecord,
//   type CartItem,
//   type MangoCategory,
//   type PaymentVerificationResult,
// }














































































// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"
// import { GoogleGenerativeAI } from "@google/generative-ai"
// import { downloadMediaMessage } from "@whiskeysockets/baileys"
// import mime from "mime-types"

// // Type definitions
// interface CartItem {
//   category: string
//   quantity: number
//   pricePerCrate: number
//   totalPrice: number
// }

// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
//   cart?: CartItem[]
//   orderData?: {
//     customerName?: string
//     address?: string
//     phoneNumber?: string
//     totalAmount?: number
//     orderId?: string
//   }
// }

// interface OrderRecord {
//   orderId: string
//   phoneNumber: string
//   customerName: string
//   address: string
//   items: CartItem[]
//   totalAmount: number
//   status: string
//   orderDate: string
//   comment?: string
//   paymentReceipt?: string
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface MangoCategory {
//   name: string
//   pricePerCrate: number
//   images: string[]
//   quality: string
// }

// interface BankAccount {
//   bank: string
//   account: string
//   title: string
//   iban: string
// }

// interface MobilePayment {
//   account: string
//   name: string
// }

// interface PaymentConfig {
//   bankAccounts: BankAccount[]
//   mobilePayments: {
//     easypaisa: MobilePayment
//     jazzcash: MobilePayment
//     sadapay: MobilePayment
//   }
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
//   mangoCategories: Record<string, MangoCategory>
//   paymentConfig?: PaymentConfig
// }

// interface Message {
//   from: string
//   body?: string
//   hasMedia?: boolean
//   downloadMedia?: () => Promise<Buffer>
//   mimetype?: string
//   message?: any
// }

// interface PaymentVerificationResult {
//   paymentStatus: "Successful" | "Unsuccessful" | "Error"
//   message: string
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class EnhancedMangoChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
//   private genAI: GoogleGenerativeAI
//   private csvFilePath: string

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw")
//     this.csvFilePath = path.join(process.cwd(), "orders.csv")

//     this.initializeCSV()
//     this.setupEventListeners()
//   }

//   private initializeCSV(): void {
//     if (!fs.existsSync(this.csvFilePath)) {
//       const headers =
//         "orderId,phoneNumber,customerName,address,items,totalAmount,status,orderDate,comment,paymentReceipt\n"
//       fs.writeFileSync(this.csvFilePath, headers)
//     }
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Convert file to base64
//   private async fileToBase64(file: Buffer, mimeType: string): Promise<string> {
//     return file.toString("base64")
//   }

//   // Verify payment using Gemini API
//   private async verifyPayment(filePath: string, requiredAmount: number): Promise<PaymentVerificationResult> {
//     try {
//       const fileData = fs.readFileSync(filePath)
//       const base64Image = fileData.toString("base64")
//       const mimeType = mime.lookup(filePath) || "image/jpeg"

//       const prompt = `I have uploaded a transaction receipt screenshot. 

// First, validate if the uploaded image is a **genuine and valid payment transaction receipt**. Look for signs like:
// - Transaction ID or UTR number
// - Sender and receiver names
// - Transaction date and time
// - Confirmation that the transaction was successful
// - Any known payment platform indicators (e.g., UPI, bank, Paytm, GPay, PhonePe, etc.)

// If the image does **not** appear to be a valid or genuine payment receipt, return:
// {
//   "paymentStatus": "Invalid",
//   "message": "The uploaded image is not a valid payment receipt. Please upload a proper transaction screenshot showing all required details."
// }

// If the image **is** a valid payment receipt, then check if the user has paid **${requiredAmount} rupees**.

// If the user paid exactly the required amount, return:
// {
//   "paymentStatus": "Successful",
//   "message": "The user has paid the amount"
// }

// If the user paid more than the required amount, return:
// {
//   "paymentStatus": "Successful",
//   "message": "The user has paid the amount. You have paid more than the required amount. Required: ${requiredAmount} rupees, Paid: [actual amount found] rupees"
// }

// If the user paid less than the required amount, return:
// {
//   "paymentStatus": "Unsuccessful", 
//   "message": "The user has not paid the amount which was required. The required amount was ${requiredAmount} rupees and the user has paid [actual amount found] rupees"
// }

// Only return the JSON message, no explanation or extra text. Be strict in validating whether it is a legitimate receipt before analyzing the amount.
// `

//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw"}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: prompt,
//                   },
//                   {
//                     inline_data: {
//                       mime_type: mimeType,
//                       data: base64Image,
//                     },
//                   },
//                 ],
//               },
//             ],
//           }),
//         },
//       )

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status} ${response.statusText}`)
//       }

//       const data = await response.json()

//       if (data.candidates && data.candidates[0] && data.candidates[0].content) {
//         const responseText = data.candidates[0].content.parts[0].text

//         try {
//           const jsonMatch = responseText.match(/\{[\s\S]*\}/)
//           if (jsonMatch) {
//             return JSON.parse(jsonMatch[0])
//           } else {
//             throw new Error("No JSON found in response")
//           }
//         } catch (parseError) {
//           console.error("JSON parsing error:", parseError)
//           return {
//             paymentStatus: "Error",
//             message: "Failed to parse API response",
//           }
//         }
//       } else {
//         throw new Error("Invalid response format from API")
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       return {
//         paymentStatus: "Error",
//         message: `Verification failed: ${error.message}`,
//       }
//     }
//   }

//   // Get mango categories from config
//   private getMangoCategories(): Record<string, MangoCategory> {
//     return this.flowConfig?.mangoCategories || {}
//   }

//   // Get payment config from JSON
//   private getPaymentConfig(): PaymentConfig {
//     return (
//       this.flowConfig?.paymentConfig || {
//         bankAccounts: [
//           {
//             bank: "HBL Bank",
//             account: "12345678901234",
//             title: "Mango Paradise",
//             iban: "PK36HABB0012345678901234",
//           },
//           {
//             bank: "UBL Bank",
//             account: "56789012345678",
//             title: "Mango Paradise",
//             iban: "PK47UNIL0056789012345678",
//           },
//         ],
//         mobilePayments: {
//           easypaisa: { account: "03001234567", name: "Mango Paradise" },
//           jazzcash: { account: "03009876543", name: "Mango Paradise" },
//           sadapay: { account: "03005555555", name: "Mango Paradise" },
//         },
//       }
//     )
//   }

//   // Generate random order ID
//   private generateOrderId(): string {
//     const timestamp = Date.now().toString(36)
//     const random = Math.random().toString(36).substr(2, 5)
//     return `MNG${timestamp}${random}`.toUpperCase()
//   }

//   private saveOrderToCSV(orderData: OrderRecord): void {
//     const itemsJson = JSON.stringify(orderData.items).replace(/"/g, '""')
//     const comment = orderData.comment ? orderData.comment.replace(/"/g, '""') : ""
//     const paymentReceipt = orderData.paymentReceipt ? orderData.paymentReceipt.replace(/"/g, '""') : ""
//     const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}","${itemsJson}",${orderData.totalAmount},${orderData.status},${orderData.orderDate},"${comment}","${paymentReceipt}"\n`
//     fs.appendFileSync(this.csvFilePath, csvLine)
//   }

//   private async savePaymentImage(message: any, orderId: string): Promise<string> {
//     try {
//       const buffer = await downloadMediaMessage(
//         message,
//         "buffer",
//         {},
//         {
//           // @ts-ignore
//           logger: console,
//           reuploadRequest: this.bot.getInstance().waUploadToServer,
//         },
//       )

//       const downloadsDir = path.join(process.cwd(), "payment_screenshots")
//       if (!fs.existsSync(downloadsDir)) {
//         fs.mkdirSync(downloadsDir, { recursive: true })
//       }

//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
//       const fileName = `payment_${orderId}_${timestamp}.jpg`
//       const filePath = path.join(downloadsDir, fileName)

//       fs.writeFileSync(filePath, buffer)
//       console.log("Payment screenshot saved to:", filePath)

//       return filePath
//     } catch (error) {
//       console.error("Error saving payment image:", error)
//       throw new Error("Failed to save payment image")
//     }
//   }

//   // Get order by ID and phone number
//   private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
//     try {
//       const csvData = fs.readFileSync(this.csvFilePath, "utf8")
//       const lines = csvData.split("\n").slice(1) // Skip header

//       for (const line of lines) {
//         if (line.trim()) {
//           const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
//           const fields = line.split(csvRegex)

//           if (fields && fields.length >= 10) {
//             // Updated to handle new column
//             const id = fields[0].trim()
//             const phone = fields[1].trim()
//             const name = fields[2].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const address = fields[3].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const itemsStr = fields[4].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const amount = fields[5].trim()
//             const status = fields[6].trim()
//             const date = fields[7].trim()
//             const comment = fields.length > 8 ? fields[8].replace(/^"|"$/g, "").replace(/""/g, '"') : ""
//             const paymentReceipt = fields.length > 9 ? fields[9].replace(/^"|"$/g, "").replace(/""/g, '"') : ""

//             if (id === orderId && phone === phoneNumber) {
//               let items: CartItem[] = []
//               try {
//                 if (itemsStr && itemsStr.trim()) {
//                   items = JSON.parse(itemsStr)
//                 }
//               } catch (e) {
//                 console.error("Error parsing items JSON:", e)
//                 items = []
//               }

//               return {
//                 orderId: id,
//                 phoneNumber: phone,
//                 customerName: name,
//                 address: address,
//                 items,
//                 totalAmount: Number.parseFloat(amount) || 0,
//                 status,
//                 orderDate: date,
//                 comment,
//                 paymentReceipt,
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error reading CSV:", error)
//     }
//     return null
//   }

//   // Validate order details with Gemini API
//   private async validateOrderWithGemini(
//     orderText: string,
//     phoneNumber: string,
//   ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
//     try {
//       const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

//       const prompt = `
// Please validate the following mango order details and extract structured information:

// Order Text: "${orderText}"

// Required fields:
// 1. Customer Name (full name)
// 2. Complete Address (with city)

// Please respond in JSON format only (no extra text or explanation):
// {
//   "isValid": true/false,
//   "message": "validation message",
//   "extractedData": {
//     "customerName": "extracted name",
//     "phoneNumber": "${phoneNumber}",
//     "address": "extracted address"
//   }
// }

// Only respond with raw JSON. Do not include any text, explanation, or markdown.
// `

//       const result = await model.generateContent(prompt)
//       const response = await result.response
//       const text = response.text()

//       console.log("Raw Gemini response:", text)

//       const match = text.match(/\{[\s\S]*\}/)
//       if (match) {
//         const cleanJson = match[0]
//         return JSON.parse(cleanJson)
//       }

//       return {
//         isValid: false,
//         message: "Please provide your complete details: Name and Complete Address.",
//       }
//     } catch (error) {
//       console.error("Gemini API error:", error)
//       return {
//         isValid: false,
//         message: "Unable to process your order at the moment. Please try again.",
//       }
//     }
//   }

//   // Generate cart summary
//   private generateCartSummary(cart: CartItem[], language: string | null): string {
//     if (cart.length === 0) {
//       return language === "urdu" ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."
//     }

//     const isUrdu = language === "urdu"
//     let summary = isUrdu ? "🛒 **آپ کا کارٹ:**\n\n" : "🛒 **Your Cart:**\n\n"

//     let totalAmount = 0
//     cart.forEach((item, index) => {
//       const categories = this.getMangoCategories()
//       const categoryName = categories[item.category]?.name || item.category

//       summary += `${index + 1}. ${categoryName}\n`
//       summary += isUrdu
//         ? `   تعداد: ${item.quantity} کریٹ\n   قیمت: ${item.pricePerCrate} روپے فی کریٹ\n   کل: ${item.totalPrice} روپے\n\n`
//         : `   Quantity: ${item.quantity} crate(s)\n   Price: Rs. ${item.pricePerCrate} per crate\n   Total: Rs. ${item.totalPrice}\n\n`

//       totalAmount += item.totalPrice
//     })

//     summary += isUrdu ? `💰 **کل رقم: ${totalAmount} روپے**` : `💰 **Grand Total: Rs. ${totalAmount}**`

//     return summary
//   }

//   // Generate invoice/receipt
//   private generateInvoice(orderData: OrderRecord): string {
//     const invoice = `
// 🧾 **MANGO ORDER RECEIPT**

// 📋 Order ID: ${orderData.orderId}
// 📅 Date: ${orderData.orderDate}

// 👤 **Customer Details:**
// Name: ${orderData.customerName}
// Phone: ${orderData.phoneNumber}
// Address: ${orderData.address}

// 🥭 **Order Details:**
// ${orderData.items
//   .map((item, index) => {
//     const categories = this.getMangoCategories()
//     const categoryName = categories[item.category]?.name || item.category
//     return `${index + 1}. ${categoryName} - ${item.quantity} crate(s) @ Rs. ${item.pricePerCrate} = Rs. ${item.totalPrice}`
//   })
//   .join("\n")}

// 💰 **Total Amount: Rs. ${orderData.totalAmount}**
// 📊 Status: ${orderData.status}
// ${orderData.comment ? `\n📝 Note: ${orderData.comment}` : ""}

// ✅ **Payment Verified Successfully!**
// Thank you for your order! 🙏

// For tracking, save your Order ID: ${orderData.orderId}
//     `
//     return invoice
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//         cart: [],
//         orderData: {},
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//       cart: [],
//       orderData: {},
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined
//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle enhanced mango order steps with cart functionality and payment
//   private async handleMangoOrderSteps(
//     sender: string,
//     text: string,
//     session: UserSession,
//     message?: Message,
//   ): Promise<boolean> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     // Handle mango category selection
//     if (session.currentStep === "mango_categories") {
//       // Create dynamic category mapping from config
//       const categoryKeys = Object.keys(categories)
//       const categoryMap: { [key: string]: string } = {}

//       categoryKeys.forEach((key, index) => {
//         categoryMap[(index + 1).toString()] = key
//       })

//       const selectedCategory = categoryMap[text.trim()]
//       if (selectedCategory) {
//         const categoryData = categories[selectedCategory]

//         // Send category details with images
//         await this.bot.sendText(
//           sender,
//           `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
//         )

//         // Send images
//         for (const imageUrl of categoryData.images) {
//           await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
//           await this.delay(500)
//         }

//         await this.delay(1000)

//         const quantityMessage = isUrdu
//           ? "📦 آپ کتنے کریٹ چاہتے ہیں؟ (صرف نمبر لکھیں، جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "📦 How many crates would you like? (Enter number only, e.g., 2)\n\n🅱 Press B to go back"

//         await this.bot.sendText(sender, quantityMessage)

//         // Store selected category in session
//         session.data.selectedCategory = selectedCategory
//         session.currentStep = "quantity_selection"
//         return true
//       }
//     }

//     // Handle quantity selection
//     if (session.currentStep === "quantity_selection") {
//       // Check for back navigation first
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         // Go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const quantity = Number.parseInt(text.trim())

//       if (isNaN(quantity) || quantity <= 0) {
//         const errorMessage = isUrdu
//           ? "❌ براہ کرم صحیح تعداد داخل کریں (جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "❌ Please enter a valid quantity (e.g., 2)\n\n🅱 Press B to go back"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }

//       const selectedCategory = session.data.selectedCategory
//       const categoryData = categories[selectedCategory]

//       // Add to cart
//       if (!session.cart) session.cart = []

//       // Check if category already exists in cart
//       const existingItemIndex = session.cart.findIndex((item) => item.category === selectedCategory)

//       if (existingItemIndex >= 0) {
//         // Update existing item
//         session.cart[existingItemIndex].quantity += quantity
//         session.cart[existingItemIndex].totalPrice =
//           session.cart[existingItemIndex].quantity * categoryData.pricePerCrate
//       } else {
//         // Add new item
//         session.cart.push({
//           category: selectedCategory,
//           quantity,
//           pricePerCrate: categoryData.pricePerCrate,
//           totalPrice: quantity * categoryData.pricePerCrate,
//         })
//       }

//       // Show cart and options
//       const cartSummary = this.generateCartSummary(session.cart, session.language)

//       const optionsMessage = isUrdu
//         ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

//       await this.bot.sendText(sender, cartSummary + optionsMessage)

//       session.currentStep = "cart_options"
//       return true
//     }

//     // Handle cart options
//     if (session.currentStep === "cart_options") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const option = text.trim()

//       if (option === "1") {
//         // Add more mangoes - go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       } else if (option === "2") {
//         // Complete order
//         if (!session.cart || session.cart.length === 0) {
//           const emptyCartMessage = isUrdu
//             ? "❌ آپ کا کارٹ خالی ہے۔ پہلے آم شامل کریں۔"
//             : "❌ Your cart is empty. Please add mangoes first."
//           await this.bot.sendText(sender, emptyCartMessage)
//           return true
//         }

//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

//         await this.bot.sendText(sender, orderDetailsMessage)
//         session.currentStep = "order_details"
//         return true
//       } else if (option === "3") {
//         // Clear cart
//         session.cart = []
//         const clearedMessage = isUrdu ? "🗑️ کارٹ خالی کر دیا گیا۔" : "🗑️ Cart cleared."
//         await this.bot.sendText(sender, clearedMessage)
//         session.currentStep = "main_menu"
//         return true
//       } else {
//         const invalidOptionMessage = isUrdu
//           ? "❌ براہ کرم صحیح آپشن منتخب کریں (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "❌ Please select a valid option (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, invalidOptionMessage)
//         return true
//       }
//     }

//     // Handle order details validation
//     if (session.currentStep === "order_details") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "cart_options"
//         const cartSummary = this.generateCartSummary(session.cart!, session.language)
//         const optionsMessage = isUrdu
//           ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, cartSummary + optionsMessage)
//         return true
//       }

//       const validation = await this.validateOrderWithGemini(text, sender)

//       if (validation.isValid && validation.extractedData) {
//         // Store order data
//         const orderData = validation.extractedData
//         const totalAmount = session.cart!.reduce((sum, item) => sum + item.totalPrice, 0)

//         // Store in session for payment verification
//         session.orderData = {
//           customerName: orderData.customerName,
//           address: orderData.address,
//           phoneNumber: sender,
//           totalAmount,
//           orderId: this.generateOrderId(),
//         }

//         // Send bank details from config
//         await this.sendBankDetails(sender, session)

//         session.currentStep = "payment_method_selection"
//         return true
//       } else {
//         await this.bot.sendText(sender, validation.message + "\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu")
//         return true
//       }
//     }

//     // Handle payment method selection
//     if (session.currentStep === "payment_method_selection") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "order_details"
//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, orderDetailsMessage)
//         return true
//       }

//       const option = text.trim()
//       if (option === "1") {
//         // Bank transfer selected - send bank details and move to awaiting payment
//         await this.sendBankDetails(sender, session)
//         session.currentStep = "awaiting_payment_screenshot"
//         return true
//       } else if (option === "2") {
//         // Mobile payment selected - send mobile payment details and move to awaiting payment
//         await this.sendMobilePaymentDetails(sender, session)
//         session.currentStep = "awaiting_payment_screenshot"
//         return true
//       } else {
//         const errorMessage = isUrdu
//           ? "❌ براہ کرم صحیح آپشن منتخب کریں (1 یا 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "❌ Please select a valid option (1 or 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }
//     }

//     // Handle payment screenshot verification
//     if (session.currentStep === "awaiting_payment_screenshot") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "payment_method_selection"
//         await this.sendPaymentMethodSelection(sender, session)
//         return true
//       }

//       // Check if message has media (image)
//       if (message?.message?.imageMessage) {
//         try {
//           console.log("Processing payment screenshot...")

//           // Save image to system using the new method
//           const imagePath = await this.savePaymentImage(message, session.orderData!.orderId!)
//           console.log(`Payment image saved to: ${imagePath}`)

//           // Verify payment using Gemini API
//           const verificationResult = await this.verifyPayment(imagePath, session.orderData!.totalAmount!)

//           if (verificationResult.paymentStatus === "Successful") {
//             // Payment successful - create order record and save to CSV
//             const orderRecord: OrderRecord = {
//               orderId: session.orderData!.orderId!,
//               phoneNumber: sender,
//               customerName: session.orderData!.customerName!,
//               address: session.orderData!.address!,
//               items: session.cart!,
//               totalAmount: session.orderData!.totalAmount!,
//               status: "Confirmed",
//               orderDate: new Date().toISOString().split("T")[0],
//               comment: "Payment verified successfully",
//               paymentReceipt: imagePath,
//             }

//             this.saveOrderToCSV(orderRecord)

//             // Send receipt
//             const receipt = this.generateInvoice(orderRecord)
//             await this.bot.sendText(sender, receipt)

//             // Reset session
//             session.currentStep = "main_menu"
//             session.cart = []
//             session.orderData = {}

//             return true
//           } else {
//             // Payment verification failed
//             const failureMessage = isUrdu
//               ? `❌ ${verificationResult.message}\n\nبراہ کرم صحیح ٹرانزیکشن کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//               : `❌ ${verificationResult.message}\n\nPlease send the correct transaction screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//             await this.bot.sendText(sender, failureMessage)
//             return true
//           }
//         } catch (error) {
//           console.error("Error processing payment screenshot:", error)
//           const errorMessage = isUrdu
//             ? "❌ اسکرین شاٹ پروسیس کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "❌ Error processing screenshot. Please try again.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, errorMessage)
//           return true
//         }
//       } else {
//         // No image sent or text message received
//         if (text && text.trim()) {
//           // User sent text instead of image
//           const noImageMessage = isUrdu
//             ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ تصویر کے طور پر بھیجیں، ٹیکسٹ نہیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "📷 Please send the payment screenshot as an image, not text.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, noImageMessage)
//         } else {
//           // No image sent
//           const noImageMessage = isUrdu
//             ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "📷 Please send the payment screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, noImageMessage)
//         }
//         return true
//       }
//     }

//     // Handle order tracking
//     if (session.currentStep === "track_order") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "main_menu"
//         const mainMenuStep = this.getCurrentStep("main_menu")
//         if (mainMenuStep) {
//           await this.sendStepMessages(sender, mainMenuStep, session)
//         }
//         return true
//       }

//       if (text.trim().toUpperCase().includes("MNG")) {
//         const orderId = text.trim().toUpperCase()
//         const order = this.getOrderByIdAndPhone(orderId, sender)

//         if (order) {
//           const categories = this.getMangoCategories()

//           // Generate items display
//           let itemsDisplay = ""
//           if (order.items && order.items.length > 0) {
//             itemsDisplay = order.items
//               .map((item) => {
//                 const categoryName = categories[item.category]?.name || item.category
//                 return `${categoryName} (${item.quantity} crates)`
//               })
//               .join(", ")
//           } else {
//             itemsDisplay = "Order details unavailable"
//           }

//           const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Items: ${itemsDisplay}
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}
// ${order.comment ? `\n📝 Note: ${order.comment}` : ""}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Confirmed" ? "✅ Your order has been confirmed and will be shipped soon." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}

// 🅱 🔙 Previous Menu
// *️⃣ Main Menu
//         `
//           await this.bot.sendText(sender, trackingInfo)
//         } else {
//           await this.bot.sendText(
//             sender,
//             "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu",
//           )
//         }

//         session.currentStep = "main_menu"
//         return true
//       }
//     }

//     return false
//   }

//   // Send bank details from config
//   private async sendBankDetails(sender: string, session: UserSession): Promise<void> {
//     const paymentConfig = this.getPaymentConfig()
//     const isUrdu = session.language === "urdu"

//     let bankMessage = isUrdu ? "🏦 **بینک تفصیلات**\n\n" : "🏦 **Bank Details**\n\n"

//     paymentConfig.bankAccounts.forEach((account, index) => {
//       bankMessage += `💳 **Account ${index + 1}:**\n`
//       bankMessage += `Bank: ${account.bank}\n`
//       bankMessage += `Account: ${account.account}\n`
//       bankMessage += `Title: ${account.title}\n`
//       bankMessage += `IBAN: ${account.iban}\n\n`
//     })

//     const totalAmount = session.orderData?.totalAmount || 0
//     bankMessage += isUrdu
//       ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, bankMessage)
//   }

//   // Send mobile payment details from config
//   private async sendMobilePaymentDetails(sender: string, session: UserSession): Promise<void> {
//     const paymentConfig = this.getPaymentConfig()
//     const isUrdu = session.language === "urdu"

//     let mobileMessage = isUrdu ? "📱 **موبائل پیمنٹ آپشنز**\n\n" : "📱 **Mobile Payment Options**\n\n"

//     mobileMessage += `💰 **Easypaisa:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.easypaisa.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.easypaisa.name}\n\n`

//     mobileMessage += `💰 **JazzCash:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.jazzcash.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.jazzcash.name}\n\n`

//     mobileMessage += `💰 **SadaPay:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.sadapay.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.sadapay.name}\n\n`

//     const totalAmount = session.orderData?.totalAmount || 0
//     mobileMessage += isUrdu
//       ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, mobileMessage)
//   }

//   // Send payment method selection
//   private async sendPaymentMethodSelection(sender: string, session: UserSession): Promise<void> {
//     const isUrdu = session.language === "urdu"
//     const totalAmount = session.orderData?.totalAmount || 0

//     const message = isUrdu
//       ? `💰 **کل رقم: ${totalAmount} روپے**\n\n💳 **ادائیگی کا طریقہ منتخب کریں:**\n\n1️⃣ 🏦 بینک ٹرانسفر\n2️⃣ 📱 موبائل پیمنٹ (Easypaisa/JazzCash/SadaPay)\n\nبراہ کرم ایک آپشن منتخب کریں (1 یا 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Total Amount: Rs. ${totalAmount}**\n\n💳 **Select Payment Method:**\n\n1️⃣ 🏦 Bank Transfer\n2️⃣ 📱 Mobile Payment (Easypaisa/JazzCash/SadaPay)\n\nPlease select an option (1 or 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, message)
//   }

//   // Send category selection message dynamically from config
//   private async sendCategorySelectionMessage(sender: string, session: UserSession): Promise<void> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     let message = isUrdu ? "🥭 **آم کی قسم منتخب کریں**\n\n" : "🥭 **Select Mango Category**\n\n"

//     const categoryKeys = Object.keys(categories)
//     categoryKeys.forEach((key, index) => {
//       const category = categories[key]
//       message += `${index + 1}️⃣ ${category.name} - Rs. ${category.pricePerCrate}/crate\n`
//     })

//     message += isUrdu
//       ? `\nبراہ کرم ایک قسم منتخب کریں (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `\nPlease select a category (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, message)
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Handle special mango order steps first
//       if (await this.handleMangoOrderSteps(sender, text, session, message)) {
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             // Special handling for mango_categories step
//             if (matchingTrigger.nextStep === "mango_categories") {
//               await this.sendCategorySelectionMessage(sender, session)
//             } else {
//               await this.sendStepMessages(sender, nextStep, session)
//             }
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       if (step.messages && step.messages.length > 0) {
//         for (const messageContent of step.messages) {
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const enhancedMangoBot = new EnhancedMangoChatBot()

// // Export for external use
// export default enhancedMangoBot
// export {
//   EnhancedMangoChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
//   type OrderRecord,
//   type CartItem,
//   type MangoCategory,
//   type PaymentVerificationResult,
// }












































































// import { BaileysClass } from "../lib/baileys.js"
// import fs from "fs"
// import path from "path"
// import { GoogleGenerativeAI } from "@google/generative-ai"
// import { downloadMediaMessage } from "@whiskeysockets/baileys"
// import mime from "mime-types"

// // Type definitions
// interface CartItem {
//   category: string
//   quantity: number
//   pricePerCrate: number
//   totalPrice: number
// }

// interface UserSession {
//   currentStep: string
//   data: Record<string, any>
//   language: string | null
//   isHumanChatEnabled?: boolean
//   humanChatEnabledAt?: number
//   humanChatTimeoutId?: NodeJS.Timeout
//   cart?: CartItem[]
//   orderData?: {
//     customerName?: string
//     address?: string
//     phoneNumber?: string
//     totalAmount?: number
//     orderId?: string
//   }
// }

// interface OrderRecord {
//   orderId: string
//   phoneNumber: string
//   customerName: string
//   address: string
//   items: CartItem[]
//   totalAmount: number
//   status: string
//   orderDate: string
//   comment?: string
//   paymentReceipt?: string
// }

// interface Trigger {
//   type: "exact" | "contains" | "option"
//   values: string[]
//   nextStep?: string
//   storeAs?: string
//   setLanguage?: string
//   action?: "reset" | "enable_human_chat"
// }

// interface LocalizedMessage {
//   [language: string]: string
// }

// interface NavigationConfig {
//   backKeywords?: string[]
//   mainMenuKeywords?: string[]
//   backText?: string | LocalizedMessage
//   mainMenuText?: string | LocalizedMessage
//   mainMenuStep?: string
// }

// interface MessageContent {
//   type: "text" | "media" | "document" | "audio" | "video"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   caption?: string | LocalizedMessage
//   delay?: number
// }

// interface Step {
//   type?: "text" | "media" | "document"
//   message?: string | LocalizedMessage
//   mediaUrl?: string
//   filePath?: string
//   messages?: MessageContent[]
//   triggers?: Trigger[]
//   errorMessage?: string | LocalizedMessage
//   resendOnError?: boolean
//   backStep?: string
//   isMainMenu?: boolean
// }

// interface MangoCategory {
//   name: string
//   pricePerCrate: number
//   images: string[]
//   quality: string
// }

// interface BankAccount {
//   bank: string
//   account: string
//   title: string
//   iban: string
// }

// interface MobilePayment {
//   account: string
//   name: string
// }

// interface PaymentConfig {
//   bankAccounts: BankAccount[]
//   mobilePayments: {
//     easypaisa: MobilePayment
//     jazzcash: MobilePayment
//     sadapay: MobilePayment
//   }
// }

// interface FlowConfig {
//   steps: Record<string, Step>
//   navigation?: NavigationConfig
//   mangoCategories: Record<string, MangoCategory>
//   paymentConfig?: PaymentConfig
// }

// interface Message {
//   from: string
//   body?: string
//   hasMedia?: boolean
//   downloadMedia?: () => Promise<Buffer>
//   mimetype?: string
//   message?: any
// }

// interface PaymentVerificationResult {
//   paymentStatus: "Successful" | "Unsuccessful" | "Error"
//   message: string
// }

// // Load flow configuration from JSON file
// const loadFlowConfig = (): FlowConfig | null => {
//   try {
//     const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
//     const configData = fs.readFileSync(configPath, "utf8")
//     return JSON.parse(configData) as FlowConfig
//   } catch (error) {
//     console.error("Error loading flow config:", error)
//     return null
//   }
// }

// class EnhancedMangoChatBot {
//   private bot: BaileysClass
//   private flowConfig: FlowConfig | null
//   private userSessions: Map<string, UserSession>
//   private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
//   private genAI: GoogleGenerativeAI
//   private csvFilePath: string

//   constructor() {
//     this.bot = new BaileysClass({})
//     this.flowConfig = loadFlowConfig()
//     this.userSessions = new Map<string, UserSession>()
//     this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw")
//     this.csvFilePath = path.join(process.cwd(), "orders.csv")

//     this.initializeCSV()
//     this.setupEventListeners()
//   }

//   private initializeCSV(): void {
//     if (!fs.existsSync(this.csvFilePath)) {
//       const headers =
//         "orderId,phoneNumber,customerName,address,items,totalAmount,status,orderDate,comment,paymentReceipt\n"
//       fs.writeFileSync(this.csvFilePath, headers)
//     }
//   }

//   private setupEventListeners(): void {
//     this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
//     this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
//     this.bot.on("ready", () => console.log("READY BOT"))
//     this.bot.on("message", (message: Message) => this.handleMessage(message))
//   }

//   // Convert file to base64
//   private async fileToBase64(file: Buffer, mimeType: string): Promise<string> {
//     return file.toString("base64")
//   }

//   // Verify payment using Gemini API
//   private async verifyPayment(filePath: string, requiredAmount: number): Promise<PaymentVerificationResult> {
//     try {
//       const fileData = fs.readFileSync(filePath)
//       const base64Image = fileData.toString("base64")
//       const mimeType = mime.lookup(filePath) || "image/jpeg"

//       const prompt = `I have uploaded a transaction receipt screenshot. 

// First, validate if the uploaded image is a **genuine and valid payment transaction receipt**. Look for signs like:
// - Transaction ID or UTR number
// - Sender and receiver names
// - Transaction date and time
// - Confirmation that the transaction was successful
// - Any known payment platform indicators (e.g., UPI, bank, Paytm, GPay, PhonePe, etc.)

// If the image does **not** appear to be a valid or genuine payment receipt, return:
// {
//   "paymentStatus": "Invalid",
//   "message": "The uploaded image is not a valid payment receipt. Please upload a proper transaction screenshot showing all required details."
// }

// If the image **is** a valid payment receipt, then check if the user has paid **${requiredAmount} rupees**.

// If the user paid exactly the required amount, return:
// {
//   "paymentStatus": "Successful",
//   "message": "The user has paid the amount"
// }

// If the user paid more than the required amount, return:
// {
//   "paymentStatus": "Successful",
//   "message": "The user has paid the amount. You have paid more than the required amount. Required: ${requiredAmount} rupees, Paid: [actual amount found] rupees"
// }

// If the user paid less than the required amount, return:
// {
//   "paymentStatus": "Unsuccessful", 
//   "message": "The user has not paid the amount which was required. The required amount was ${requiredAmount} rupees and the user has paid [actual amount found] rupees"
// }

// Only return the JSON message, no explanation or extra text. Be strict in validating whether it is a legitimate receipt before analyzing the amount.
// `

//       const response = await fetch(
//         `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw"}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             contents: [
//               {
//                 parts: [
//                   {
//                     text: prompt,
//                   },
//                   {
//                     inline_data: {
//                       mime_type: mimeType,
//                       data: base64Image,
//                     },
//                   },
//                 ],
//               },
//             ],
//           }),
//         },
//       )

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status} ${response.statusText}`)
//       }

//       const data = await response.json()

//       if (data.candidates && data.candidates[0] && data.candidates[0].content) {
//         const responseText = data.candidates[0].content.parts[0].text

//         try {
//           const jsonMatch = responseText.match(/\{[\s\S]*\}/)
//           if (jsonMatch) {
//             return JSON.parse(jsonMatch[0])
//           } else {
//             throw new Error("No JSON found in response")
//           }
//         } catch (parseError) {
//           console.error("JSON parsing error:", parseError)
//           return {
//             paymentStatus: "Error",
//             message: "Failed to parse API response",
//           }
//         }
//       } else {
//         throw new Error("Invalid response format from API")
//       }
//     } catch (error) {
//       console.error("Error:", error)
//       return {
//         paymentStatus: "Error",
//         message: `Verification failed: ${error.message}`,
//       }
//     }
//   }

//   // Get mango categories from config
//   private getMangoCategories(): Record<string, MangoCategory> {
//     return this.flowConfig?.mangoCategories || {}
//   }

//   // Get payment config from JSON
//   private getPaymentConfig(): PaymentConfig {
//     return (
//       this.flowConfig?.paymentConfig || {
//         bankAccounts: [
//           {
//             bank: "HBL Bank",
//             account: "12345678901234",
//             title: "Mango Paradise",
//             iban: "PK36HABB0012345678901234",
//           },
//           {
//             bank: "UBL Bank",
//             account: "56789012345678",
//             title: "Mango Paradise",
//             iban: "PK47UNIL0056789012345678",
//           },
//         ],
//         mobilePayments: {
//           easypaisa: { account: "03001234567", name: "Mango Paradise" },
//           jazzcash: { account: "03009876543", name: "Mango Paradise" },
//           sadapay: { account: "03005555555", name: "Mango Paradise" },
//         },
//       }
//     )
//   }

//   // Generate random order ID
//   private generateOrderId(): string {
//     const timestamp = Date.now().toString(36)
//     const random = Math.random().toString(36).substr(2, 5)
//     return `MNG${timestamp}${random}`.toUpperCase()
//   }

//   private saveOrderToCSV(orderData: OrderRecord): void {
//     const itemsJson = JSON.stringify(orderData.items).replace(/"/g, '""')
//     const comment = orderData.comment ? orderData.comment.replace(/"/g, '""') : ""
//     const paymentReceipt = orderData.paymentReceipt ? orderData.paymentReceipt.replace(/"/g, '""') : ""
//     const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}","${itemsJson}",${orderData.totalAmount},${orderData.status},${orderData.orderDate},"${comment}","${paymentReceipt}"\n`
//     fs.appendFileSync(this.csvFilePath, csvLine)
//   }

//   private async savePaymentImage(message: any, orderId: string): Promise<string> {
//     try {
//       const buffer = await downloadMediaMessage(
//         message,
//         "buffer",
//         {},
//         {
//           // @ts-ignore
//           logger: console,
//           reuploadRequest: this.bot.getInstance().waUploadToServer,
//         },
//       )

//       const downloadsDir = path.join(process.cwd(), "payment_screenshots")
//       if (!fs.existsSync(downloadsDir)) {
//         fs.mkdirSync(downloadsDir, { recursive: true })
//       }

//       const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
//       const fileName = `payment_${orderId}_${timestamp}.jpg`
//       const filePath = path.join(downloadsDir, fileName)

//       fs.writeFileSync(filePath, buffer)
//       console.log("Payment screenshot saved to:", filePath)

//       return filePath
//     } catch (error) {
//       console.error("Error saving payment image:", error)
//       throw new Error("Failed to save payment image")
//     }
//   }

//   // Get order by ID and phone number
//   private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
//     try {
//       const csvData = fs.readFileSync(this.csvFilePath, "utf8")
//       const lines = csvData.split("\n").slice(1) // Skip header

//       for (const line of lines) {
//         if (line.trim()) {
//           const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
//           const fields = line.split(csvRegex)

//           if (fields && fields.length >= 10) {
//             // Updated to handle new column
//             const id = fields[0].trim()
//             const phone = fields[1].trim()
//             const name = fields[2].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const address = fields[3].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const itemsStr = fields[4].replace(/^"|"$/g, "").replace(/""/g, '"')
//             const amount = fields[5].trim()
//             const status = fields[6].trim()
//             const date = fields[7].trim()
//             const comment = fields.length > 8 ? fields[8].replace(/^"|"$/g, "").replace(/""/g, '"') : ""
//             const paymentReceipt = fields.length > 9 ? fields[9].replace(/^"|"$/g, "").replace(/""/g, '"') : ""

//             if (id === orderId && phone === phoneNumber) {
//               let items: CartItem[] = []
//               try {
//                 if (itemsStr && itemsStr.trim()) {
//                   items = JSON.parse(itemsStr)
//                 }
//               } catch (e) {
//                 console.error("Error parsing items JSON:", e)
//                 items = []
//               }

//               return {
//                 orderId: id,
//                 phoneNumber: phone,
//                 customerName: name,
//                 address: address,
//                 items,
//                 totalAmount: Number.parseFloat(amount) || 0,
//                 status,
//                 orderDate: date,
//                 comment,
//                 paymentReceipt,
//               }
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Error reading CSV:", error)
//     }
//     return null
//   }

//   // Validate order details with Gemini API
//   private async validateOrderWithGemini(
//     orderText: string,
//     phoneNumber: string,
//   ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
//     try {
//       const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

//       const prompt = `
// Please validate the following mango order details and extract structured information:

// Order Text: "${orderText}"

// Required fields:
// 1. Customer Name (full name)
// 2. Complete Address (with city)

// Please respond in JSON format only (no extra text or explanation):
// {
//   "isValid": true/false,
//   "message": "validation message",
//   "extractedData": {
//     "customerName": "extracted name",
//     "phoneNumber": "${phoneNumber}",
//     "address": "extracted address"
//   }
// }

// Only respond with raw JSON. Do not include any text, explanation, or markdown.
// `

//       const result = await model.generateContent(prompt)
//       const response = await result.response
//       const text = response.text()

//       console.log("Raw Gemini response:", text)

//       const match = text.match(/\{[\s\S]*\}/)
//       if (match) {
//         const cleanJson = match[0]
//         return JSON.parse(cleanJson)
//       }

//       return {
//         isValid: false,
//         message: "Please provide your complete details: Name and Complete Address.",
//       }
//     } catch (error) {
//       console.error("Gemini API error:", error)
//       return {
//         isValid: false,
//         message: "Unable to process your order at the moment. Please try again.",
//       }
//     }
//   }

//   // Generate cart summary
//   private generateCartSummary(cart: CartItem[], language: string | null): string {
//     if (cart.length === 0) {
//       return language === "urdu" ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."
//     }

//     const isUrdu = language === "urdu"
//     let summary = isUrdu ? "🛒 **آپ کا کارٹ:**\n\n" : "🛒 **Your Cart:**\n\n"

//     let totalAmount = 0
//     cart.forEach((item, index) => {
//       const categories = this.getMangoCategories()
//       const categoryName = categories[item.category]?.name || item.category

//       summary += `${index + 1}. ${categoryName}\n`
//       summary += isUrdu
//         ? `   تعداد: ${item.quantity} کریٹ\n   قیمت: ${item.pricePerCrate} رو��ے فی کریٹ\n   کل: ${item.totalPrice} روپے\n\n`
//         : `   Quantity: ${item.quantity} crate(s)\n   Price: Rs. ${item.pricePerCrate} per crate\n   Total: Rs. ${item.totalPrice}\n\n`

//       totalAmount += item.totalPrice
//     })

//     summary += isUrdu ? `💰 **کل رقم: ${totalAmount} روپے**` : `💰 **Grand Total: Rs. ${totalAmount}**`

//     return summary
//   }

//   // Generate invoice/receipt
//   private generateInvoice(orderData: OrderRecord): string {
//     const invoice = `
// 🧾 **MANGO ORDER RECEIPT**

// 📋 Order ID: ${orderData.orderId}
// 📅 Date: ${orderData.orderDate}

// 👤 **Customer Details:**
// Name: ${orderData.customerName}
// Phone: ${orderData.phoneNumber}
// Address: ${orderData.address}

// 🥭 **Order Details:**
// ${orderData.items
//   .map((item, index) => {
//     const categories = this.getMangoCategories()
//     const categoryName = categories[item.category]?.name || item.category
//     return `${index + 1}. ${categoryName} - ${item.quantity} crate(s) @ Rs. ${item.pricePerCrate} = Rs. ${item.totalPrice}`
//   })
//   .join("\n")}

// 💰 **Total Amount: Rs. ${orderData.totalAmount}**
// 📊 Status: ${orderData.status}
// ${orderData.comment ? `\n📝 Note: ${orderData.comment}` : ""}

// ✅ **Payment Verified Successfully!**
// Thank you for your order! 🙏

// For tracking, save your Order ID: ${orderData.orderId}
//     `
//     return invoice
//   }

//   // Get or create user session
//   private getUserSession(userId: string): UserSession {
//     if (!this.userSessions.has(userId)) {
//       this.userSessions.set(userId, {
//         currentStep: "start",
//         data: {},
//         language: null,
//         isHumanChatEnabled: false,
//         humanChatEnabledAt: undefined,
//         humanChatTimeoutId: undefined,
//         cart: [],
//         orderData: {},
//       })
//     }
//     return this.userSessions.get(userId)!
//   }

//   // Reset user session
//   private resetUserSession(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     this.userSessions.set(userId, {
//       currentStep: "start",
//       data: {},
//       language: null,
//       isHumanChatEnabled: false,
//       humanChatEnabledAt: undefined,
//       humanChatTimeoutId: undefined,
//       cart: [],
//       orderData: {},
//     })
//   }

//   // Enable human chat for a user
//   private enableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = true
//     session.humanChatEnabledAt = Date.now()

//     session.humanChatTimeoutId = setTimeout(() => {
//       this.disableHumanChat(userId)
//     }, this.HUMAN_CHAT_TIMEOUT)

//     console.log(`Human chat enabled for user ${userId} for 8 hours`)
//   }

//   // Disable human chat for a user
//   private disableHumanChat(userId: string): void {
//     const session = this.getUserSession(userId)

//     if (session.humanChatTimeoutId) {
//       clearTimeout(session.humanChatTimeoutId)
//     }

//     session.isHumanChatEnabled = false
//     session.humanChatEnabledAt = undefined
//     session.humanChatTimeoutId = undefined
//     session.currentStep = "language_selection"

//     console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
//   }

//   // Check if human chat is enabled for a user
//   private isHumanChatEnabled(userId: string): boolean {
//     const session = this.getUserSession(userId)
//     return session.isHumanChatEnabled === true
//   }

//   // Send human chat enabled message
//   private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
//     const message =
//       session.language === "urdu"
//         ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
//         : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

//     await this.bot.sendText(userId, message)
//   }

//   // Check if input matches navigation keywords
//   private isNavigationCommand(input: string): "back" | "main" | null {
//     if (!this.flowConfig?.navigation) {
//       const normalizedInput = input.toLowerCase().trim()
//       if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
//       if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
//       return null
//     }

//     const navigation = this.flowConfig.navigation
//     const normalizedInput = input.toLowerCase().trim()

//     const backKeywords = navigation.backKeywords || ["b", "🅱"]
//     if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "back"
//     }

//     const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
//     if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
//       return "main"
//     }

//     return null
//   }

//   // Find matching trigger
//   private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
//     if (!triggers) return null

//     const normalizedInput = input.toLowerCase().trim()

//     for (const trigger of triggers) {
//       if (trigger.type === "exact") {
//         if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
//           return trigger
//         }
//       } else if (trigger.type === "contains") {
//         if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
//           return trigger
//         }
//       } else if (trigger.type === "option") {
//         if (trigger.values.includes(normalizedInput)) {
//           return trigger
//         }
//       }
//     }
//     return null
//   }

//   // Process variables in text
//   private processVariables(text: string, sessionData: Record<string, any>): string {
//     if (!text) return text

//     return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
//       return sessionData[variable] || match
//     })
//   }

//   // Get current step configuration
//   private getCurrentStep(stepId: string): Step | undefined {
//     return this.flowConfig?.steps?.[stepId]
//   }

//   // Get main menu step from configuration
//   private getMainMenuStep(): string {
//     return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
//   }

//   // Check if current step is main menu
//   private isCurrentStepMainMenu(stepId: string): boolean {
//     const step = this.getCurrentStep(stepId)
//     return step?.isMainMenu === true || stepId === this.getMainMenuStep()
//   }

//   // Handle enhanced mango order steps with cart functionality and payment
//   private async handleMangoOrderSteps(
//     sender: string,
//     text: string,
//     session: UserSession,
//     message?: Message,
//   ): Promise<boolean> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     // Handle mango category selection
//     if (session.currentStep === "mango_categories") {
//       // Create dynamic category mapping from config
//       const categoryKeys = Object.keys(categories)
//       const categoryMap: { [key: string]: string } = {}

//       categoryKeys.forEach((key, index) => {
//         categoryMap[(index + 1).toString()] = key
//       })

//       const selectedCategory = categoryMap[text.trim()]
//       if (selectedCategory) {
//         const categoryData = categories[selectedCategory]

//         // Send category details with images
//         await this.bot.sendText(
//           sender,
//           `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
//         )

//         // Send images
//         for (const imageUrl of categoryData.images) {
//           await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
//           await this.delay(500)
//         }

//         await this.delay(1000)

//         const quantityMessage = isUrdu
//           ? "📦 آپ کتنے کریٹ چاہتے ہیں؟ (صرف نمبر لکھیں، جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "📦 How many crates would you like? (Enter number only, e.g., 2)\n\n🅱 Press B to go back"

//         await this.bot.sendText(sender, quantityMessage)

//         // Store selected category in session
//         session.data.selectedCategory = selectedCategory
//         session.currentStep = "quantity_selection"
//         return true
//       }
//     }

//     // Handle quantity selection
//     if (session.currentStep === "quantity_selection") {
//       // Check for back navigation first
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         // Go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const quantity = Number.parseInt(text.trim())

//       if (isNaN(quantity) || quantity <= 0) {
//         const errorMessage = isUrdu
//           ? "❌ براہ کرم صحیح تعداد داخل کریں (جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
//           : "❌ Please enter a valid quantity (e.g., 2)\n\n🅱 Press B to go back"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }

//       const selectedCategory = session.data.selectedCategory
//       const categoryData = categories[selectedCategory]

//       // Add to cart
//       if (!session.cart) session.cart = []

//       // Check if category already exists in cart
//       const existingItemIndex = session.cart.findIndex((item) => item.category === selectedCategory)

//       if (existingItemIndex >= 0) {
//         // Update existing item
//         session.cart[existingItemIndex].quantity += quantity
//         session.cart[existingItemIndex].totalPrice =
//           session.cart[existingItemIndex].quantity * categoryData.pricePerCrate
//       } else {
//         // Add new item
//         session.cart.push({
//           category: selectedCategory,
//           quantity,
//           pricePerCrate: categoryData.pricePerCrate,
//           totalPrice: quantity * categoryData.pricePerCrate,
//         })
//       }

//       // Show cart and options
//       const cartSummary = this.generateCartSummary(session.cart, session.language)

//       const optionsMessage = isUrdu
//         ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

//       await this.bot.sendText(sender, cartSummary + optionsMessage)

//       session.currentStep = "cart_options"
//       return true
//     }

//     // Handle cart options
//     if (session.currentStep === "cart_options") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       }

//       const option = text.trim()

//       if (option === "1") {
//         // Add more mangoes - go back to category selection
//         session.currentStep = "mango_categories"
//         await this.sendCategorySelectionMessage(sender, session)
//         return true
//       } else if (option === "2") {
//         // Complete order
//         if (!session.cart || session.cart.length === 0) {
//           const emptyCartMessage = isUrdu
//             ? "❌ آپ کا کارٹ خالی ہے۔ پہلے آم شامل کریں۔"
//             : "❌ Your cart is empty. Please add mangoes first."
//           await this.bot.sendText(sender, emptyCartMessage)
//           return true
//         }

//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

//         await this.bot.sendText(sender, orderDetailsMessage)
//         session.currentStep = "order_details"
//         return true
//       } else if (option === "3") {
//         // Clear cart
//         session.cart = []
//         const clearedMessage = isUrdu ? "🗑️ کارٹ خالی کر دیا گیا۔" : "🗑️ Cart cleared."
//         await this.bot.sendText(sender, clearedMessage)
//         session.currentStep = "main_menu"
//         return true
//       } else {
//         const invalidOptionMessage = isUrdu
//           ? "❌ براہ کرم صحیح آپشن منتخب کریں (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "❌ Please select a valid option (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, invalidOptionMessage)
//         return true
//       }
//     }

//     // Handle order details validation
//     if (session.currentStep === "order_details") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "cart_options"
//         const cartSummary = this.generateCartSummary(session.cart!, session.language)
//         const optionsMessage = isUrdu
//           ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, cartSummary + optionsMessage)
//         return true
//       }

//       const validation = await this.validateOrderWithGemini(text, sender)

//       if (validation.isValid && validation.extractedData) {
//         // Store order data
//         const orderData = validation.extractedData
//         const totalAmount = session.cart!.reduce((sum, item) => sum + item.totalPrice, 0)

//         // Store in session for payment verification
//         session.orderData = {
//           customerName: orderData.customerName,
//           address: orderData.address,
//           phoneNumber: sender,
//           totalAmount,
//           orderId: this.generateOrderId(),
//         }

//         // FIXED: Send payment method selection instead of bank details directly
//         await this.sendPaymentMethodSelection(sender, session)
//         session.currentStep = "payment_method_selection"
//         return true
//       } else {
//         await this.bot.sendText(sender, validation.message + "\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu")
//         return true
//       }
//     }

//     // Handle payment method selection
//     if (session.currentStep === "payment_method_selection") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "order_details"
//         const orderDetailsMessage = isUrdu
//           ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, orderDetailsMessage)
//         return true
//       }

//       const option = text.trim()
//       if (option === "1") {
//         // Bank transfer selected - send bank details and move to awaiting payment
//         await this.sendBankDetails(sender, session)
//         session.currentStep = "awaiting_payment_screenshot"
//         return true
//       } else if (option === "2") {
//         // Mobile payment selected - send mobile payment details and move to awaiting payment
//         await this.sendMobilePaymentDetails(sender, session)
//         session.currentStep = "awaiting_payment_screenshot"
//         return true
//       } else {
//         const errorMessage = isUrdu
//           ? "❌ براہ کرم صحیح آپشن منتخب کریں (1 یا 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           : "❌ Please select a valid option (1 or 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//         await this.bot.sendText(sender, errorMessage)
//         return true
//       }
//     }

//     // Handle payment screenshot verification
//     if (session.currentStep === "awaiting_payment_screenshot") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "payment_method_selection"
//         await this.sendPaymentMethodSelection(sender, session)
//         return true
//       }

//       // Check if message has media (image)
//       if (message?.message?.imageMessage) {
//         try {
//           console.log("Processing payment screenshot...")

//           // Save image to system using the new method
//           const imagePath = await this.savePaymentImage(message, session.orderData!.orderId!)
//           console.log(`Payment image saved to: ${imagePath}`)

//           // Verify payment using Gemini API
//           const verificationResult = await this.verifyPayment(imagePath, session.orderData!.totalAmount!)

//           if (verificationResult.paymentStatus === "Successful") {
//             // Payment successful - create order record and save to CSV
//             const orderRecord: OrderRecord = {
//               orderId: session.orderData!.orderId!,
//               phoneNumber: sender,
//               customerName: session.orderData!.customerName!,
//               address: session.orderData!.address!,
//               items: session.cart!,
//               totalAmount: session.orderData!.totalAmount!,
//               status: "Confirmed",
//               orderDate: new Date().toISOString().split("T")[0],
//               comment: "Payment verified successfully",
//               paymentReceipt: imagePath,
//             }

//             this.saveOrderToCSV(orderRecord)

//             // Send receipt
//             const receipt = this.generateInvoice(orderRecord)
//             await this.bot.sendText(sender, receipt)

//             // Reset session
//             session.currentStep = "main_menu"
//             session.cart = []
//             session.orderData = {}

//             return true
//           } else {
//             // Payment verification failed
//             const failureMessage = isUrdu
//               ? `❌ ${verificationResult.message}\n\nبراہ کرم صحیح ٹرانزیکشن کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//               : `❌ ${verificationResult.message}\n\nPlease send the correct transaction screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//             await this.bot.sendText(sender, failureMessage)
//             return true
//           }
//         } catch (error) {
//           console.error("Error processing payment screenshot:", error)
//           const errorMessage = isUrdu
//             ? "❌ اسکرین شاٹ پروسیس کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "❌ Error processing screenshot. Please try again.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, errorMessage)
//           return true
//         }
//       } else {
//         // No image sent or text message received
//         if (text && text.trim()) {
//           // User sent text instead of image
//           const noImageMessage = isUrdu
//             ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ تصویر کے طور پر بھیجیں، ٹیکسٹ نہیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "📷 Please send the payment screenshot as an image, not text.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, noImageMessage)
//         } else {
//           // No image sent
//           const noImageMessage = isUrdu
//             ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//             : "📷 Please send the payment screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
//           await this.bot.sendText(sender, noImageMessage)
//         }
//         return true
//       }
//     }

//     // Handle order tracking
//     if (session.currentStep === "track_order") {
//       const navCommand = this.isNavigationCommand(text)
//       if (navCommand === "back") {
//         session.currentStep = "main_menu"
//         const mainMenuStep = this.getCurrentStep("main_menu")
//         if (mainMenuStep) {
//           await this.sendStepMessages(sender, mainMenuStep, session)
//         }
//         return true
//       }

//       if (text.trim().toUpperCase().includes("MNG")) {
//         const orderId = text.trim().toUpperCase()
//         const order = this.getOrderByIdAndPhone(orderId, sender)

//         if (order) {
//           const categories = this.getMangoCategories()

//           // Generate items display
//           let itemsDisplay = ""
//           if (order.items && order.items.length > 0) {
//             itemsDisplay = order.items
//               .map((item) => {
//                 const categoryName = categories[item.category]?.name || item.category
//                 return `${categoryName} (${item.quantity} crates)`
//               })
//               .join(", ")
//           } else {
//             itemsDisplay = "Order details unavailable"
//           }

//           const trackingInfo = `
// 📦 **ORDER TRACKING**

// 📋 Order ID: ${order.orderId}
// 📅 Order Date: ${order.orderDate}
// 👤 Customer: ${order.customerName}
// 🥭 Items: ${itemsDisplay}
// 💰 Total: Rs. ${order.totalAmount}
// 📊 Status: ${order.status}
// ${order.comment ? `\n📝 Note: ${order.comment}` : ""}

// ${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
// ${order.status === "Confirmed" ? "✅ Your order has been confirmed and will be shipped soon." : ""}
// ${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
// ${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}

// 🅱 🔙 Previous Menu
// *️⃣ Main Menu
//         `
//           await this.bot.sendText(sender, trackingInfo)
//         } else {
//           await this.bot.sendText(
//             sender,
//             "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu",
//           )
//         }

//         session.currentStep = "main_menu"
//         return true
//       }
//     }

//     return false
//   }

//   // Send bank details from config
//   private async sendBankDetails(sender: string, session: UserSession): Promise<void> {
//     const paymentConfig = this.getPaymentConfig()
//     const isUrdu = session.language === "urdu"

//     let bankMessage = isUrdu ? "🏦 **بینک تفصیلات**\n\n" : "🏦 **Bank Details**\n\n"

//     paymentConfig.bankAccounts.forEach((account, index) => {
//       bankMessage += `💳 **Account ${index + 1}:**\n`
//       bankMessage += `Bank: ${account.bank}\n`
//       bankMessage += `Account: ${account.account}\n`
//       bankMessage += `Title: ${account.title}\n`
//       bankMessage += `IBAN: ${account.iban}\n\n`
//     })

//     const totalAmount = session.orderData?.totalAmount || 0
//     bankMessage += isUrdu
//       ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, bankMessage)
//   }

//   // Send mobile payment details from config
//   private async sendMobilePaymentDetails(sender: string, session: UserSession): Promise<void> {
//     const paymentConfig = this.getPaymentConfig()
//     const isUrdu = session.language === "urdu"

//     let mobileMessage = isUrdu ? "📱 **موبائل پیمنٹ آپشنز**\n\n" : "📱 **Mobile Payment Options**\n\n"

//     mobileMessage += `💰 **Easypaisa:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.easypaisa.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.easypaisa.name}\n\n`

//     mobileMessage += `💰 **JazzCash:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.jazzcash.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.jazzcash.name}\n\n`

//     mobileMessage += `💰 **SadaPay:**\n`
//     mobileMessage += `Account: ${paymentConfig.mobilePayments.sadapay.account}\n`
//     mobileMessage += `Name: ${paymentConfig.mobilePayments.sadapay.name}\n\n`

//     const totalAmount = session.orderData?.totalAmount || 0
//     mobileMessage += isUrdu
//       ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, mobileMessage)
//   }

//   // Send payment method selection
//   private async sendPaymentMethodSelection(sender: string, session: UserSession): Promise<void> {
//     const isUrdu = session.language === "urdu"
//     const totalAmount = session.orderData?.totalAmount || 0

//     const message = isUrdu
//       ? `💰 **کل رقم: ${totalAmount} روپے**\n\n💳 **ادائیگی کا طریقہ منتخب کریں:**\n\n1️⃣ 🏦 بینک ٹرانسفر\n2️⃣ 📱 موبائل پیمنٹ (Easypaisa/JazzCash/SadaPay)\n\nبراہ کرم ایک آپشن منتخب کریں (1 یا 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `💰 **Total Amount: Rs. ${totalAmount}**\n\n💳 **Select Payment Method:**\n\n1️⃣ 🏦 Bank Transfer\n2️⃣ 📱 Mobile Payment (Easypaisa/JazzCash/SadaPay)\n\nPlease select an option (1 or 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, message)
//   }

//   // Send category selection message dynamically from config
//   private async sendCategorySelectionMessage(sender: string, session: UserSession): Promise<void> {
//     const categories = this.getMangoCategories()
//     const isUrdu = session.language === "urdu"

//     let message = isUrdu ? "🥭 **آم کی قسم منتخب کریں**\n\n" : "🥭 **Select Mango Category**\n\n"

//     const categoryKeys = Object.keys(categories)
//     categoryKeys.forEach((key, index) => {
//       const category = categories[key]
//       message += `${index + 1}️⃣ ${category.name} - Rs. ${category.pricePerCrate}/crate\n`
//     })

//     message += isUrdu
//       ? `\nبراہ کرم ایک قسم منتخب کریں (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
//       : `\nPlease select a category (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

//     await this.bot.sendText(sender, message)
//   }

//   // Handle user message
//   private async handleMessage(message: Message): Promise<void> {
//     try {
//       const sender = message.from
//       const text = message.body?.trim() || ""
//       const session = this.getUserSession(sender)

//       // Check if human chat is enabled for this user
//       if (this.isHumanChatEnabled(sender)) {
//         console.log(`Ignoring message from ${sender} - human chat is enabled`)
//         return
//       }

//       // Handle special mango order steps first
//       if (await this.handleMangoOrderSteps(sender, text, session, message)) {
//         return
//       }

//       // Check for navigation commands
//       const navCommand = this.isNavigationCommand(text)

//       if (navCommand === "main") {
//         const mainMenuStepId = this.getMainMenuStep()

//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           const currentStep = this.getCurrentStep(session.currentStep)
//           if (currentStep) {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else {
//           session.currentStep = mainMenuStepId
//           const mainMenuStep = this.getCurrentStep(mainMenuStepId)
//           if (mainMenuStep) {
//             await this.sendStepMessages(sender, mainMenuStep, session)
//           }
//         }
//         return
//       }

//       const currentStep = this.getCurrentStep(session.currentStep)
//       if (!currentStep) {
//         console.error(`Step not found: ${session.currentStep}`)
//         return
//       }

//       if (navCommand === "back") {
//         if (this.isCurrentStepMainMenu(session.currentStep)) {
//           if (currentStep.backStep) {
//             session.currentStep = currentStep.backStep
//             const backStep = this.getCurrentStep(currentStep.backStep)
//             if (backStep) {
//               await this.sendStepMessages(sender, backStep, session)
//             }
//           } else {
//             await this.sendStepMessages(sender, currentStep, session)
//           }
//         } else if (currentStep.backStep) {
//           session.currentStep = currentStep.backStep
//           const backStep = this.getCurrentStep(currentStep.backStep)
//           if (backStep) {
//             await this.sendStepMessages(sender, backStep, session)
//           }
//         } else {
//           const backText =
//             this.getNavigationText("back", session.language) || "Back navigation not available from this step."
//           await this.bot.sendText(sender, backText)
//         }
//         return
//       }

//       // Find matching trigger
//       const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

//       if (matchingTrigger) {
//         if (matchingTrigger.storeAs) {
//           session.data[matchingTrigger.storeAs] = text
//         }

//         if (matchingTrigger.setLanguage) {
//           session.language = matchingTrigger.setLanguage
//         }

//         if (matchingTrigger.action === "reset") {
//           this.resetUserSession(sender)
//           const startStep = this.getCurrentStep("start")
//           if (startStep) {
//             await this.sendStepMessages(sender, startStep, session)
//           }
//           return
//         }

//         if (matchingTrigger.action === "enable_human_chat") {
//           this.enableHumanChat(sender)
//           await this.sendHumanChatEnabledMessage(sender, session)
//           return
//         }

//         if (matchingTrigger.nextStep) {
//           session.currentStep = matchingTrigger.nextStep
//           const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

//           if (nextStep) {
//             // Special handling for mango_categories step
//             if (matchingTrigger.nextStep === "mango_categories") {
//               await this.sendCategorySelectionMessage(sender, session)
//             } else {
//               await this.sendStepMessages(sender, nextStep, session)
//             }
//           }
//         }
//       } else {
//         const errorMessage =
//           this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
//           "Sorry, I didn't understand that. Please try again."
//         await this.bot.sendText(sender, errorMessage)

//         if (currentStep.resendOnError) {
//           await this.sendStepMessages(sender, currentStep, session)
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error)
//     }
//   }

//   // Get navigation text from config
//   private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
//     if (!this.flowConfig?.navigation) return undefined

//     const navigation = this.flowConfig.navigation
//     const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

//     return this.getLocalizedMessage(textObj, language)
//   }

//   // Get localized message
//   private getLocalizedMessage(
//     messageObj: string | LocalizedMessage | undefined,
//     language: string | null,
//   ): string | undefined {
//     if (typeof messageObj === "string") return messageObj
//     if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
//       return messageObj[language]
//     }
//     if (typeof messageObj === "object" && messageObj) {
//       return messageObj.english || messageObj[Object.keys(messageObj)[0]]
//     }
//     // @ts-ignore
//     return messageObj as string
//   }

//   // Enhanced method to send multiple messages
//   private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
//     try {
//       if (step.messages && step.messages.length > 0) {
//         for (const messageContent of step.messages) {
//           if (messageContent.delay && messageContent.delay > 0) {
//             await this.delay(messageContent.delay)
//           }

//           await this.sendSingleMessage(sender, messageContent, session)
//         }
//       } else {
//         const messageContent: MessageContent = {
//           type: step.type || "text",
//           message: step.message,
//           mediaUrl: step.mediaUrl,
//           filePath: step.filePath,
//         }

//         await this.sendSingleMessage(sender, messageContent, session)
//       }
//     } catch (error) {
//       console.error("Error sending step messages:", error)
//     }
//   }

//   // Send a single message based on its type
//   private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
//     const message = this.getLocalizedMessage(messageContent.message, session.language)
//     const caption = this.getLocalizedMessage(messageContent.caption, session.language)
//     const processedMessage = this.processVariables(message || "", session.data)
//     const processedCaption = this.processVariables(caption || "", session.data)

//     switch (messageContent.type) {
//       case "text":
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//         break

//       case "media":
//       case "video":
//       case "audio":
//         if (messageContent.mediaUrl) {
//           const captionText = processedCaption || processedMessage || ""
//           await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
//         }
//         break

//       case "document":
//         if (messageContent.filePath) {
//           await this.bot.sendFile(sender, messageContent.filePath)
//           if (processedMessage) {
//             await this.bot.sendText(sender, processedMessage)
//           }
//         }
//         break

//       default:
//         if (processedMessage) {
//           await this.bot.sendText(sender, processedMessage)
//         }
//     }
//   }

//   // Utility method to add delay
//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms))
//   }

//   // Method to manually disable human chat (for admin use)
//   public manuallyDisableHumanChat(userId: string): void {
//     this.disableHumanChat(userId)
//   }

//   // Method to check human chat status (for admin use)
//   public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
//     const session = this.getUserSession(userId)

//     if (!session.isHumanChatEnabled) {
//       return { enabled: false }
//     }

//     const remainingTime = session.humanChatEnabledAt
//       ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
//       : 0

//     return {
//       enabled: true,
//       enabledAt: session.humanChatEnabledAt,
//       remainingTime: Math.max(0, remainingTime),
//     }
//   }

//   // Reload configuration
//   public reloadConfig(): void {
//     this.flowConfig = loadFlowConfig()
//     console.log("Flow configuration reloaded")
//   }

//   // Getter for bot instance
//   public get botInstance(): BaileysClass {
//     return this.bot
//   }
// }

// // Create bot instance
// const enhancedMangoBot = new EnhancedMangoChatBot()

// // Export for external use
// export default enhancedMangoBot
// export {
//   EnhancedMangoChatBot,
//   type UserSession,
//   type Trigger,
//   type Step,
//   type FlowConfig,
//   type Message,
//   type NavigationConfig,
//   type MessageContent,
//   type OrderRecord,
//   type CartItem,
//   type MangoCategory,
//   type PaymentVerificationResult,
// }





































































































import { BaileysClass } from "../lib/baileys.js"
import fs from "fs"
import path from "path"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { downloadMediaMessage } from "@whiskeysockets/baileys"
import mime from "mime-types"

// Type definitions
interface CartItem {
  category: string
  quantity: number
  pricePerCrate: number
  totalPrice: number
}

interface UserSession {
  currentStep: string
  data: Record<string, any>
  language: string | null
  isHumanChatEnabled?: boolean
  humanChatEnabledAt?: number
  humanChatTimeoutId?: NodeJS.Timeout
  cart?: CartItem[]
  orderData?: {
    customerName?: string
    address?: string
    phoneNumber?: string
    totalAmount?: number
    orderId?: string
  }
  lastMessageTime?: number
  businessMessagesShown?: boolean
  businessMessageCount?: number
}

interface OrderRecord {
  orderId: string
  phoneNumber: string
  customerName: string
  address: string
  items: CartItem[]
  totalAmount: number
  status: string
  orderDate: string
  comment?: string
  paymentReceipt?: string
}

interface Trigger {
  type: "exact" | "contains" | "option"
  values: string[]
  nextStep?: string
  storeAs?: string
  setLanguage?: string
  action?: "reset" | "enable_human_chat"
}

interface LocalizedMessage {
  [language: string]: string
}

interface NavigationConfig {
  backKeywords?: string[]
  mainMenuKeywords?: string[]
  backText?: string | LocalizedMessage
  mainMenuText?: string | LocalizedMessage
  mainMenuStep?: string
}

interface MessageContent {
  type: "text" | "media" | "document" | "audio" | "video"
  message?: string | LocalizedMessage
  mediaUrl?: string
  filePath?: string
  caption?: string | LocalizedMessage
  delay?: number
}

interface WelcomeMessage {
  type: "text" | "image" | "video"
  content: string
  caption?: string
  delay?: number
}

interface WelcomeMessagesConfig {
  messages: WelcomeMessage[]
}

interface BusinessMessage {
  type: "text" | "image" | "video"
  content: string
  caption?: string
  delay?: number
}

interface BusinessMessagesConfig {
  enabled: boolean
  maxMessages: number
  allowedTypes: string[]
  introMessage: LocalizedMessage
  confirmationMessage: LocalizedMessage
  timeoutDays: number
  messages?: BusinessMessage[]
}

interface Step {
  type?: "text" | "media" | "document"
  message?: string | LocalizedMessage
  mediaUrl?: string
  filePath?: string
  messages?: MessageContent[]
  triggers?: Trigger[]
  errorMessage?: string | LocalizedMessage
  resendOnError?: boolean
  backStep?: string
  isMainMenu?: boolean
}

interface MangoCategory {
  name: string
  pricePerCrate: number
  images: string[]
  quality: string
}

interface BankAccount {
  bank: string
  account: string
  title: string
  iban: string
}

interface MobilePayment {
  account: string
  name: string
}

interface PaymentConfig {
  bankAccounts: BankAccount[]
  mobilePayments: {
    easypaisa: MobilePayment
    jazzcash: MobilePayment
    sadapay: MobilePayment
  }
}

interface FlowConfig {
  steps: Record<string, Step>
  navigation?: NavigationConfig
  mangoCategories: Record<string, MangoCategory>
  paymentConfig?: PaymentConfig
  welcome_messages?: WelcomeMessagesConfig
}

interface Message {
  from: string
  body?: string
  hasMedia?: boolean
  downloadMedia?: () => Promise<Buffer>
  mimetype?: string
  message?: any
}

interface PaymentVerificationResult {
  paymentStatus: "Successful" | "Unsuccessful" | "Error"
  message: string
}

// Load flow configuration from JSON file
const loadFlowConfig = (): FlowConfig | null => {
  try {
    const configPath = path.join(process.cwd(), "/examples/mango-bot-config.json")
    const configData = fs.readFileSync(configPath, "utf8")
    return JSON.parse(configData) as FlowConfig
  } catch (error) {
    console.error("Error loading flow config:", error)
    return null
  }
}

class EnhancedMangoChatBot {
  private bot: BaileysClass
  private flowConfig: FlowConfig | null
  private userSessions: Map<string, UserSession>
  private readonly HUMAN_CHAT_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
  private readonly SESSION_TIMEOUT = 2 * 24 * 60 * 60 * 1000 // 2 days in milliseconds
  private genAI: GoogleGenerativeAI
  private csvFilePath: string

  constructor() {
    this.bot = new BaileysClass({})
    this.flowConfig = loadFlowConfig()
    this.userSessions = new Map<string, UserSession>()
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw")
    this.csvFilePath = path.join(process.cwd(), "orders.csv")

    this.initializeCSV()
    this.setupEventListeners()
    this.startSessionCleanup()
  }

  private initializeCSV(): void {
    if (!fs.existsSync(this.csvFilePath)) {
      const headers =
        "orderId,phoneNumber,customerName,address,items,totalAmount,status,orderDate,comment,paymentReceipt\n"
      fs.writeFileSync(this.csvFilePath, headers)
    }
  }

  private setupEventListeners(): void {
    this.bot.on("auth_failure", (error: any) => console.log("ERROR BOT: ", error))
    this.bot.on("qr", (qr: string) => console.log("NEW QR CODE: ", qr))
    this.bot.on("ready", () => console.log("READY BOT"))
    this.bot.on("message", (message: Message) => this.handleMessage(message))
  }

  // Start session cleanup interval
  private startSessionCleanup(): void {
    setInterval(
      () => {
        this.cleanupExpiredSessions()
      },
      60 * 60 * 1000,
    ) // Check every hour
  }

  // Clean up expired sessions
  private cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [userId, session] of this.userSessions.entries()) {
      if (session.lastMessageTime && now - session.lastMessageTime > this.SESSION_TIMEOUT) {
        console.log(`Session expired for user ${userId}, resetting to language selection`)
        this.resetUserSessionToLanguageSelection(userId)
      }
    }
  }

  // Reset user session to language selection (for timeout)
  private resetUserSessionToLanguageSelection(userId: string): void {
    const session = this.getUserSession(userId)

    if (session.humanChatTimeoutId) {
      clearTimeout(session.humanChatTimeoutId)
    }

    this.userSessions.set(userId, {
      currentStep: "language_selection",
      data: {},
      language: null,
      isHumanChatEnabled: false,
      humanChatEnabledAt: undefined,
      humanChatTimeoutId: undefined,
      cart: [],
      orderData: {},
      lastMessageTime: Date.now(),
      businessMessagesShown: false,
      businessMessageCount: 0,
    })
  }

  // Check if session has expired
  private isSessionExpired(session: UserSession): boolean {
    if (!session.lastMessageTime) return false
    return Date.now() - session.lastMessageTime > this.SESSION_TIMEOUT
  }

  // Convert file to base64
  private async fileToBase64(file: Buffer, mimeType: string): Promise<string> {
    return file.toString("base64")
  }

  // Verify payment using Gemini API
  private async verifyPayment(filePath: string, requiredAmount: number): Promise<PaymentVerificationResult> {
    try {
      const fileData = fs.readFileSync(filePath)
      const base64Image = fileData.toString("base64")
      const mimeType = mime.lookup(filePath) || "image/jpeg"

      const prompt = `I have uploaded a transaction receipt screenshot. 

First, validate if the uploaded image is a **genuine and valid payment transaction receipt**. Look for signs like:
- Transaction ID or UTR number
- Sender and receiver names
- Transaction date and time
- Confirmation that the transaction was successful
- Any known payment platform indicators (e.g., UPI, bank, Paytm, GPay, PhonePe, etc.)

If the image does **not** appear to be a valid or genuine payment receipt, return:
{
  "paymentStatus": "Invalid",
  "message": "The uploaded image is not a valid payment receipt. Please upload a proper transaction screenshot showing all required details."
}

If the image **is** a valid payment receipt, then check if the user has paid **${requiredAmount} rupees**.

If the user paid exactly the required amount, return:
{
  "paymentStatus": "Successful",
  "message": "The user has paid the amount"
}

If the user paid more than the required amount, return:
{
  "paymentStatus": "Successful",
  "message": "The user has paid the amount. You have paid more than the required amount. Required: ${requiredAmount} rupees, Paid: [actual amount found] rupees"
}

If the user paid less than the required amount, return:
{
  "paymentStatus": "Unsuccessful", 
  "message": "The user has not paid the amount which was required. The required amount was ${requiredAmount} rupees and the user has paid [actual amount found] rupees"
}

Only return the JSON message, no explanation or extra text. Be strict in validating whether it is a legitimate receipt before analyzing the amount.
`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || "AIzaSyD5RYSLrWjsDnJDP_mtwzAH7g06ZMdI-Mw"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text

        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0])
          } else {
            throw new Error("No JSON found in response")
          }
        } catch (parseError) {
          console.error("JSON parsing error:", parseError)
          return {
            paymentStatus: "Error",
            message: "Failed to parse API response",
          }
        }
      } else {
        throw new Error("Invalid response format from API")
      }
    } catch (error) {
      console.error("Error:", error)
      return {
        paymentStatus: "Error",
        message: `Verification failed: ${error.message}`,
      }
    }
  }

  // Get mango categories from config
  private getMangoCategories(): Record<string, MangoCategory> {
    return this.flowConfig?.mangoCategories || {}
  }

  // Get payment config from JSON
  private getPaymentConfig(): PaymentConfig {
    return (
      this.flowConfig?.paymentConfig || {
        bankAccounts: [
          {
            bank: "HBL Bank",
            account: "12345678901234",
            title: "Mango Paradise",
            iban: "PK36HABB0012345678901234",
          },
          {
            bank: "UBL Bank",
            account: "56789012345678",
            title: "Mango Paradise",
            iban: "PK47UNIL0056789012345678",
          },
        ],
        mobilePayments: {
          easypaisa: { account: "03001234567", name: "Mango Paradise" },
          jazzcash: { account: "03009876543", name: "Mango Paradise" },
          sadapay: { account: "03005555555", name: "Mango Paradise" },
        },
      }
    )
  }

  // Generate random order ID
  private generateOrderId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `MNG${timestamp}${random}`.toUpperCase()
  }

  private saveOrderToCSV(orderData: OrderRecord): void {
    const itemsJson = JSON.stringify(orderData.items).replace(/"/g, '""')
    const comment = orderData.comment ? orderData.comment.replace(/"/g, '""') : ""
    const paymentReceipt = orderData.paymentReceipt ? orderData.paymentReceipt.replace(/"/g, '""') : ""
    const csvLine = `${orderData.orderId},${orderData.phoneNumber},"${orderData.customerName}","${orderData.address}","${itemsJson}",${orderData.totalAmount},${orderData.status},${orderData.orderDate},"${comment}","${paymentReceipt}"\n`
    fs.appendFileSync(this.csvFilePath, csvLine)
  }

  private async savePaymentImage(message: any, orderId: string): Promise<string> {
    try {
      const buffer = await downloadMediaMessage(
        message,
        "buffer",
        {},
        {
          // @ts-ignore
          logger: console,
          reuploadRequest: this.bot.getInstance().waUploadToServer,
        },
      )

      const downloadsDir = path.join(process.cwd(), "payment_screenshots")
      if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const fileName = `payment_${orderId}_${timestamp}.jpg`
      const filePath = path.join(downloadsDir, fileName)

      fs.writeFileSync(filePath, buffer)
      console.log("Payment screenshot saved to:", filePath)

      return filePath
    } catch (error) {
      console.error("Error saving payment image:", error)
      throw new Error("Failed to save payment image")
    }
  }

  // Get order by ID and phone number
  private getOrderByIdAndPhone(orderId: string, phoneNumber: string): OrderRecord | null {
    try {
      const csvData = fs.readFileSync(this.csvFilePath, "utf8")
      const lines = csvData.split("\n").slice(1) // Skip header

      for (const line of lines) {
        if (line.trim()) {
          const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
          const fields = line.split(csvRegex)

          if (fields && fields.length >= 10) {
            const id = fields[0].trim()
            const phone = fields[1].trim()
            const name = fields[2].replace(/^"|"$/g, "").replace(/""/g, '"')
            const address = fields[3].replace(/^"|"$/g, "").replace(/""/g, '"')
            const itemsStr = fields[4].replace(/^"|"$/g, "").replace(/""/g, '"')
            const amount = fields[5].trim()
            const status = fields[6].trim()
            const date = fields[7].trim()
            const comment = fields.length > 8 ? fields[8].replace(/^"|"$/g, "").replace(/""/g, '"') : ""
            const paymentReceipt = fields.length > 9 ? fields[9].replace(/^"|"$/g, "").replace(/""/g, '"') : ""

            if (id === orderId && phone === phoneNumber) {
              let items: CartItem[] = []
              try {
                if (itemsStr && itemsStr.trim()) {
                  items = JSON.parse(itemsStr)
                }
              } catch (e) {
                console.error("Error parsing items JSON:", e)
                items = []
              }

              return {
                orderId: id,
                phoneNumber: phone,
                customerName: name,
                address: address,
                items,
                totalAmount: Number.parseFloat(amount) || 0,
                status,
                orderDate: date,
                comment,
                paymentReceipt,
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading CSV:", error)
    }
    return null
  }

  // Validate order details with Gemini API
  private async validateOrderWithGemini(
    orderText: string,
    phoneNumber: string,
  ): Promise<{ isValid: boolean; message: string; extractedData?: any }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const prompt = `
Please validate the following mango order details and extract structured information:

Order Text: "${orderText}"

Required fields:
1. Customer Name (full name)
2. Complete Address (with city)

Please respond in JSON format only (no extra text or explanation):
{
  "isValid": true/false,
  "message": "validation message",
  "extractedData": {
    "customerName": "extracted name",
    "phoneNumber": "${phoneNumber}",
    "address": "extracted address"
  }
}

Only respond with raw JSON. Do not include any text, explanation, or markdown.
`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log("Raw Gemini response:", text)

      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const cleanJson = match[0]
        return JSON.parse(cleanJson)
      }

      return {
        isValid: false,
        message: "Please provide your complete details: Name and Complete Address.",
      }
    } catch (error) {
      console.error("Gemini API error:", error)
      return {
        isValid: false,
        message: "Unable to process your order at the moment. Please try again.",
      }
    }
  }

  // Generate cart summary
  private generateCartSummary(cart: CartItem[], language: string | null): string {
    if (cart.length === 0) {
      return language === "urdu" ? "آپ کا کارٹ خالی ہے۔" : "Your cart is empty."
    }

    const isUrdu = language === "urdu"
    let summary = isUrdu ? "🛒 **آپ کا کارٹ:**\n\n" : "🛒 **Your Cart:**\n\n"

    let totalAmount = 0
    cart.forEach((item, index) => {
      const categories = this.getMangoCategories()
      const categoryName = categories[item.category]?.name || item.category

      summary += `${index + 1}. ${categoryName}\n`
      summary += isUrdu
        ? `   تعداد: ${item.quantity} کریٹ\n   قیمت: ${item.pricePerCrate} روپے فی کریٹ\n   کل: ${item.totalPrice} روپے\n\n`
        : `   Quantity: ${item.quantity} crate(s)\n   Price: Rs. ${item.pricePerCrate} per crate\n   Total: Rs. ${item.totalPrice}\n\n`

      totalAmount += item.totalPrice
    })

    summary += isUrdu ? `💰 **کل رقم: ${totalAmount} روپے**` : `💰 **Grand Total: Rs. ${totalAmount}**`

    return summary
  }

  // Generate invoice/receipt
  private generateInvoice(orderData: OrderRecord): string {
    const invoice = `
🧾 **MANGO ORDER RECEIPT**

📋 Order ID: ${orderData.orderId}
📅 Date: ${orderData.orderDate}

👤 **Customer Details:**
Name: ${orderData.customerName}
Phone: ${orderData.phoneNumber}
Address: ${orderData.address}

🥭 **Order Details:**
${orderData.items
  .map((item, index) => {
    const categories = this.getMangoCategories()
    const categoryName = categories[item.category]?.name || item.category
    return `${index + 1}. ${categoryName} - ${item.quantity} crate(s) @ Rs. ${item.pricePerCrate} = Rs. ${item.totalPrice}`
  })
  .join("\n")}

💰 **Total Amount: Rs. ${orderData.totalAmount}**
📊 Status: ${orderData.status}
${orderData.comment ? `\n📝 Note: ${orderData.comment}` : ""}

✅ **Payment Verified Successfully!**
Thank you for your order! 🙏

For tracking, save your Order ID: ${orderData.orderId}
    `
    return invoice
  }

  // Get or create user session
  private getUserSession(userId: string): UserSession {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, {
        currentStep: "start",
        data: {},
        language: null,
        isHumanChatEnabled: false,
        humanChatEnabledAt: undefined,
        humanChatTimeoutId: undefined,
        cart: [],
        orderData: {},
        lastMessageTime: Date.now(),
        businessMessagesShown: false,
        businessMessageCount: 0,
      })
    }

    const session = this.userSessions.get(userId)!

    // Update last message time
    session.lastMessageTime = Date.now()

    // Check if session expired and reset if needed
    if (this.isSessionExpired(session) && session.currentStep !== "language_selection") {
      console.log(`Session expired for user ${userId}, resetting to language selection`)
      this.resetUserSessionToLanguageSelection(userId)
      return this.userSessions.get(userId)!
    }

    return session
  }

  // Reset user session
  private resetUserSession(userId: string): void {
    const session = this.getUserSession(userId)

    if (session.humanChatTimeoutId) {
      clearTimeout(session.humanChatTimeoutId)
    }

    this.userSessions.set(userId, {
      currentStep: "start",
      data: {},
      language: null,
      isHumanChatEnabled: false,
      humanChatEnabledAt: undefined,
      humanChatTimeoutId: undefined,
      cart: [],
      orderData: {},
      lastMessageTime: Date.now(),
      businessMessagesShown: false,
      businessMessageCount: 0,
    })
  }

  // Enable human chat for a user
  private enableHumanChat(userId: string): void {
    const session = this.getUserSession(userId)

    if (session.humanChatTimeoutId) {
      clearTimeout(session.humanChatTimeoutId)
    }

    session.isHumanChatEnabled = true
    session.humanChatEnabledAt = Date.now()

    session.humanChatTimeoutId = setTimeout(() => {
      this.disableHumanChat(userId)
    }, this.HUMAN_CHAT_TIMEOUT)

    console.log(`Human chat enabled for user ${userId} for 8 hours`)
  }

  // Disable human chat for a user
  private disableHumanChat(userId: string): void {
    const session = this.getUserSession(userId)

    if (session.humanChatTimeoutId) {
      clearTimeout(session.humanChatTimeoutId)
    }

    session.isHumanChatEnabled = false
    session.humanChatEnabledAt = undefined
    session.humanChatTimeoutId = undefined
    session.currentStep = "language_selection"

    console.log(`Human chat disabled for user ${userId} - bot re-enabled`)
  }

  // Check if human chat is enabled for a user
  private isHumanChatEnabled(userId: string): boolean {
    const session = this.getUserSession(userId)
    return session.isHumanChatEnabled === true
  }

  // Send human chat enabled message
  private async sendHumanChatEnabledMessage(userId: string, session: UserSession): Promise<void> {
    const message =
      session.language === "urdu"
        ? "👤 آپ کو اب ہمارے ٹیم ممبر کے ساتھ جوڑ دیا گیا ہے۔ براہ کرم انتظار کریں، آپ کو جلد جواب دیا جائے گا۔ یہ سیٹنگ 8 گھنٹے بعد خودکار طور پر بند ہو جائے گی۔"
        : "👤 You have been connected to our team member. Please wait, you will be responded to soon. This setting will automatically disable after 8 hours."

    await this.bot.sendText(userId, message)
  }

  // Check if input matches navigation keywords
  private isNavigationCommand(input: string): "back" | "main" | null {
    if (!this.flowConfig?.navigation) {
      const normalizedInput = input.toLowerCase().trim()
      if (normalizedInput === "b" || normalizedInput === "🅱") return "back"
      if (normalizedInput === "*" || normalizedInput === "*️⃣") return "main"
      return null
    }

    const navigation = this.flowConfig.navigation
    const normalizedInput = input.toLowerCase().trim()

    const backKeywords = navigation.backKeywords || ["b", "🅱"]
    if (backKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
      return "back"
    }

    const mainKeywords = navigation.mainMenuKeywords || ["*", "*️⃣"]
    if (mainKeywords.some((keyword) => keyword.toLowerCase() === normalizedInput)) {
      return "main"
    }

    return null
  }

  // Find matching trigger
  private findMatchingTrigger(input: string, triggers?: Trigger[]): Trigger | null {
    if (!triggers) return null

    const normalizedInput = input.toLowerCase().trim()

    for (const trigger of triggers) {
      if (trigger.type === "exact") {
        if (trigger.values.some((val) => val.toLowerCase() === normalizedInput)) {
          return trigger
        }
      } else if (trigger.type === "contains") {
        if (trigger.values.some((val) => normalizedInput.includes(val.toLowerCase()))) {
          return trigger
        }
      } else if (trigger.type === "option") {
        if (trigger.values.includes(normalizedInput)) {
          return trigger
        }
      }
    }
    return null
  }

  // Process variables in text
  private processVariables(text: string, sessionData: Record<string, any>): string {
    if (!text) return text

    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return sessionData[variable] || match
    })
  }

  // Get current step configuration
  private getCurrentStep(stepId: string): Step | undefined {
    return this.flowConfig?.steps?.[stepId]
  }

  // Get main menu step from configuration
  private getMainMenuStep(): string {
    return this.flowConfig?.navigation?.mainMenuStep || "main_menu"
  }

  // Check if current step is main menu
  private isCurrentStepMainMenu(stepId: string): boolean {
    const step = this.getCurrentStep(stepId)
    return step?.isMainMenu === true || stepId === this.getMainMenuStep()
  }

  // Send browse categories with actual category data
  private async sendBrowseCategoriesMessage(sender: string, session: UserSession): Promise<void> {
    const categories = this.getMangoCategories()
    const isUrdu = session.language === "urdu"

    let message = isUrdu ? "🧺 **آم کی اقسام دیکھیں**\n\n" : "🧺 **Browse Mango Categories**\n\n"

    const categoryKeys = Object.keys(categories)

    if (categoryKeys.length === 0) {
      message += isUrdu ? "فی الوقت کوئی آم کی قسم دستیاب نہیں ہے۔" : "No mango categories are currently available."
    } else {
      categoryKeys.forEach((key, index) => {
        const category = categories[key]
        message += `${index + 1}️⃣ **${category.name}**\n`
        message += isUrdu
          ? `   💰 قیمت: ${category.pricePerCrate} روپے فی کریٹ\n   ✨ ${category.quality}\n\n`
          : `   💰 Price: Rs. ${category.pricePerCrate} per crate\n   ✨ ${category.quality}\n\n`
      })
    }

    message += isUrdu ? "\n🅱 🔙 پچھلا مینو\n*️⃣ مین مینو" : "\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

    await this.bot.sendText(sender, message)

    // Send images for each category
    for (const key of categoryKeys) {
      const category = categories[key]
      if (category.images && category.images.length > 0) {
        await this.delay(500)
        await this.bot.sendMedia(sender, category.images[0], `${category.name} - Rs. ${category.pricePerCrate}/crate`)
      }
    }
  }

  // Send automatic welcome messages from config
  private async sendWelcomeMessages(sender: string, session: UserSession): Promise<void> {
    const welcomeConfig = this.flowConfig?.welcome_messages

    if (!welcomeConfig || !welcomeConfig.messages || welcomeConfig.messages.length === 0) {
      // Skip welcome messages if not configured, go directly to main menu
      session.currentStep = "main_menu"
      const mainMenuStep = this.getCurrentStep("main_menu")
      if (mainMenuStep) {
        await this.sendStepMessages(sender, mainMenuStep, session)
      }
      return
    }

    // Send all configured welcome messages automatically
    // @ts-ignore
    for (const welcomeMessage of welcomeConfig.messages) {
      if (welcomeMessage.delay && welcomeMessage.delay > 0) {
        await this.delay(welcomeMessage.delay)
      }

      switch (welcomeMessage.type) {
        case "text":
          await this.bot.sendText(sender, welcomeMessage.content)
          break
        case "image":
          const imageCaption = welcomeMessage.caption || ""
          await this.bot.sendMedia(sender, welcomeMessage.content, imageCaption)
          break
        case "video":
          const videoCaption = welcomeMessage.caption || ""
          await this.bot.sendMedia(sender, welcomeMessage.content, videoCaption)
          break
      }
    }

    // After sending all welcome messages, go to main menu
    await this.delay(1000)
    session.currentStep = "main_menu"
    const mainMenuStep = this.getCurrentStep("main_menu")
    if (mainMenuStep) {
      await this.sendStepMessages(sender, mainMenuStep, session)
    }
  }

  // Handle enhanced mango order steps with cart functionality and payment
  private async handleMangoOrderSteps(
    sender: string,
    text: string,
    session: UserSession,
    message?: Message,
  ): Promise<boolean> {
    const categories = this.getMangoCategories()
    const isUrdu = session.language === "urdu"

    // Handle browse categories
    if (session.currentStep === "browse_categories") {
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        session.currentStep = "main_menu"
        const mainMenuStep = this.getCurrentStep("main_menu")
        if (mainMenuStep) {
          await this.sendStepMessages(sender, mainMenuStep, session)
        }
        return true
      }

      if (navCommand === "main") {
        session.currentStep = "main_menu"
        const mainMenuStep = this.getCurrentStep("main_menu")
        if (mainMenuStep) {
          await this.sendStepMessages(sender, mainMenuStep, session)
        }
        return true
      }

      // For any other input, just show the categories again
      await this.sendBrowseCategoriesMessage(sender, session)
      return true
    }

    // Handle mango category selection
    if (session.currentStep === "mango_categories") {
      // Create dynamic category mapping from config
      const categoryKeys = Object.keys(categories)
      const categoryMap: { [key: string]: string } = {}

      categoryKeys.forEach((key, index) => {
        categoryMap[(index + 1).toString()] = key
      })

      const selectedCategory = categoryMap[text.trim()]
      if (selectedCategory) {
        const categoryData = categories[selectedCategory]

        // Send category details with images
        await this.bot.sendText(
          sender,
          `🥭 **${categoryData.name} Mangoes**\n\n💰 Price: Rs. ${categoryData.pricePerCrate} per crate\n\n✨ ${categoryData.quality}`,
        )

        // Send images
        for (const imageUrl of categoryData.images) {
          await this.bot.sendMedia(sender, imageUrl, `${categoryData.name} Mangoes`)
          await this.delay(500)
        }

        await this.delay(1000)

        const quantityMessage = isUrdu
          ? "📦 آپ کتنے کریٹ چاہتے ہیں؟ (صرف نمبر لکھیں، جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
          : "📦 How many crates would you like? (Enter number only, e.g., 2)\n\n🅱 Press B to go back"

        await this.bot.sendText(sender, quantityMessage)

        // Store selected category in session
        session.data.selectedCategory = selectedCategory
        session.currentStep = "quantity_selection"
        return true
      }
    }

    // Handle quantity selection
    if (session.currentStep === "quantity_selection") {
      // Check for back navigation first
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        // Go back to category selection
        session.currentStep = "mango_categories"
        await this.sendCategorySelectionMessage(sender, session)
        return true
      }

      const quantity = Number.parseInt(text.trim())

      if (isNaN(quantity) || quantity <= 0) {
        const errorMessage = isUrdu
          ? "❌ براہ کرم صحیح تعداد داخل کریں (جیسے: 2)\n\n🅱 واپس جانے کے لیے B دبائیں"
          : "❌ Please enter a valid quantity (e.g., 2)\n\n🅱 Press B to go back"
        await this.bot.sendText(sender, errorMessage)
        return true
      }

      const selectedCategory = session.data.selectedCategory
      const categoryData = categories[selectedCategory]

      // Add to cart
      if (!session.cart) session.cart = []

      // Check if category already exists in cart
      const existingItemIndex = session.cart.findIndex((item) => item.category === selectedCategory)

      if (existingItemIndex >= 0) {
        // Update existing item
        session.cart[existingItemIndex].quantity += quantity
        session.cart[existingItemIndex].totalPrice =
          session.cart[existingItemIndex].quantity * categoryData.pricePerCrate
      } else {
        // Add new item
        session.cart.push({
          category: selectedCategory,
          quantity,
          pricePerCrate: categoryData.pricePerCrate,
          totalPrice: quantity * categoryData.pricePerCrate,
        })
      }

      // Show cart and options
      const cartSummary = this.generateCartSummary(session.cart, session.language)

      const optionsMessage = isUrdu
        ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
        : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

      await this.bot.sendText(sender, cartSummary + optionsMessage)

      session.currentStep = "cart_options"
      return true
    }

    // Handle cart options
    if (session.currentStep === "cart_options") {
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        session.currentStep = "mango_categories"
        await this.sendCategorySelectionMessage(sender, session)
        return true
      }

      const option = text.trim()

      if (option === "1") {
        // Add more mangoes - go back to category selection
        session.currentStep = "mango_categories"
        await this.sendCategorySelectionMessage(sender, session)
        return true
      } else if (option === "2") {
        // Complete order
        if (!session.cart || session.cart.length === 0) {
          const emptyCartMessage = isUrdu
            ? "❌ آپ کا کارٹ خالی ہے۔ پہلے آم شامل کریں۔"
            : "❌ Your cart is empty. Please add mangoes first."
          await this.bot.sendText(sender, emptyCartMessage)
          return true
        }

        const orderDetailsMessage = isUrdu
          ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"

        await this.bot.sendText(sender, orderDetailsMessage)
        session.currentStep = "order_details"
        return true
      } else if (option === "3") {
        // Clear cart
        session.cart = []
        const clearedMessage = isUrdu ? "🗑️ کارٹ خالی کر دیا گیا۔" : "🗑️ Cart cleared."
        await this.bot.sendText(sender, clearedMessage)
        session.currentStep = "main_menu"
        return true
      } else {
        const invalidOptionMessage = isUrdu
          ? "❌ براہ کرم صحیح آپشن منتخب کریں (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          : "❌ Please select a valid option (1-3)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
        await this.bot.sendText(sender, invalidOptionMessage)
        return true
      }
    }

    // Handle order details validation
    if (session.currentStep === "order_details") {
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        session.currentStep = "cart_options"
        const cartSummary = this.generateCartSummary(session.cart!, session.language)
        const optionsMessage = isUrdu
          ? "\n\n🛒 **اگلا قدم:**\n1️⃣ مزید آم شامل کریں\n2️⃣ آرڈر مکمل کریں\n3️⃣ کارٹ خالی کریں\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          : "\n\n🛒 **Next Step:**\n1️⃣ Add more mangoes\n2️⃣ Complete order\n3️⃣ Clear cart\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
        await this.bot.sendText(sender, cartSummary + optionsMessage)
        return true
      }

      const validation = await this.validateOrderWithGemini(text, sender)

      if (validation.isValid && validation.extractedData) {
        // Store order data
        const orderData = validation.extractedData
        const totalAmount = session.cart!.reduce((sum, item) => sum + item.totalPrice, 0)

        // Store in session for payment verification
        session.orderData = {
          customerName: orderData.customerName,
          address: orderData.address,
          phoneNumber: sender,
          totalAmount,
          orderId: this.generateOrderId(),
        }

        // FIXED: Send payment method selection instead of bank details directly
        await this.sendPaymentMethodSelection(sender, session)
        session.currentStep = "payment_method_selection"
        return true
      } else {
        await this.bot.sendText(sender, validation.message + "\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu")
        return true
      }
    }

    // Handle payment method selection
    if (session.currentStep === "payment_method_selection") {
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        session.currentStep = "order_details"
        const orderDetailsMessage = isUrdu
          ? "📝 براہ کرم اپنی تفصیلات فراہم کریں:\n\n• آپ کا پورا نام\n• مکمل پتہ\n\nمثال: احمد علی، گھر نمبر 123 گلی 5 کراچی\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          : "📝 Please provide your details:\n\n• Your full name\n• Complete address\n\nExample: John Doe, House 123 Street 5 Karachi\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
        await this.bot.sendText(sender, orderDetailsMessage)
        return true
      }

      const option = text.trim()
      if (option === "1") {
        // Bank transfer selected - send bank details and move to awaiting payment
        await this.sendBankDetails(sender, session)
        session.currentStep = "awaiting_payment_screenshot"
        return true
      } else if (option === "2") {
        // Mobile payment selected - send mobile payment details and move to awaiting payment
        await this.sendMobilePaymentDetails(sender, session)
        session.currentStep = "awaiting_payment_screenshot"
        return true
      } else {
        const errorMessage = isUrdu
          ? "❌ براہ کرم صحیح آپشن منتخب کریں (1 یا 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          : "❌ Please select a valid option (1 or 2)\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
        await this.bot.sendText(sender, errorMessage)
        return true
      }
    }

    // Handle payment screenshot verification
    if (session.currentStep === "awaiting_payment_screenshot") {
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        session.currentStep = "payment_method_selection"
        await this.sendPaymentMethodSelection(sender, session)
        return true
      }

      // Check if message has media (image)
      if (message?.message?.imageMessage) {
        try {
          console.log("Processing payment screenshot...")

          // Save image to system using the new method
          const imagePath = await this.savePaymentImage(message, session.orderData!.orderId!)
          console.log(`Payment image saved to: ${imagePath}`)

          // Verify payment using Gemini API
          const verificationResult = await this.verifyPayment(imagePath, session.orderData!.totalAmount!)

          if (verificationResult.paymentStatus === "Successful") {
            // Payment successful - create order record and save to CSV
            const orderRecord: OrderRecord = {
              orderId: session.orderData!.orderId!,
              phoneNumber: sender,
              customerName: session.orderData!.customerName!,
              address: session.orderData!.address!,
              items: session.cart!,
              totalAmount: session.orderData!.totalAmount!,
              status: "Confirmed",
              orderDate: new Date().toISOString().split("T")[0],
              comment: "Payment verified successfully",
              paymentReceipt: imagePath,
            }

            this.saveOrderToCSV(orderRecord)

            // Send receipt
            const receipt = this.generateInvoice(orderRecord)
            await this.bot.sendText(sender, receipt)

            // Reset session
            session.currentStep = "main_menu"
            session.cart = []
            session.orderData = {}

            return true
          } else {
            // Payment verification failed
            const failureMessage = isUrdu
              ? `❌ ${verificationResult.message}\n\nبراہ کرم صحیح ٹرانزیکشن کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
              : `❌ ${verificationResult.message}\n\nPlease send the correct transaction screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

            await this.bot.sendText(sender, failureMessage)
            return true
          }
        } catch (error) {
          console.error("Error processing payment screenshot:", error)
          const errorMessage = isUrdu
            ? "❌ اسکرین شاٹ پروسیس کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
            : "❌ Error processing screenshot. Please try again.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          await this.bot.sendText(sender, errorMessage)
          return true
        }
      } else {
        // No image sent or text message received
        if (text && text.trim()) {
          // User sent text instead of image
          const noImageMessage = isUrdu
            ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ تصویر کے طور پر بھیجیں، ٹیکسٹ نہیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
            : "📷 Please send the payment screenshot as an image, not text.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          await this.bot.sendText(sender, noImageMessage)
        } else {
          // No image sent
          const noImageMessage = isUrdu
            ? "📷 براہ کرم ادائیگی کا اسکرین شاٹ بھیجیں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
            : "📷 Please send the payment screenshot.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu"
          await this.bot.sendText(sender, noImageMessage)
        }
        return true
      }
    }

    // Handle order tracking
    if (session.currentStep === "track_order") {
      const navCommand = this.isNavigationCommand(text)
      if (navCommand === "back") {
        session.currentStep = "main_menu"
        const mainMenuStep = this.getCurrentStep("main_menu")
        if (mainMenuStep) {
          await this.sendStepMessages(sender, mainMenuStep, session)
        }
        return true
      }

      if (text.trim().toUpperCase().includes("MNG")) {
        const orderId = text.trim().toUpperCase()
        const order = this.getOrderByIdAndPhone(orderId, sender)

        if (order) {
          const categories = this.getMangoCategories()

          // Generate items display
          let itemsDisplay = ""
          if (order.items && order.items.length > 0) {
            itemsDisplay = order.items
              .map((item) => {
                const categoryName = categories[item.category]?.name || item.category
                return `${categoryName} (${item.quantity} crates)`
              })
              .join(", ")
          } else {
            itemsDisplay = "Order details unavailable"
          }

          const trackingInfo = `
📦 **ORDER TRACKING**

📋 Order ID: ${order.orderId}
📅 Order Date: ${order.orderDate}
👤 Customer: ${order.customerName}
🥭 Items: ${itemsDisplay}
💰 Total: Rs. ${order.totalAmount}
📊 Status: ${order.status}
${order.comment ? `\n📝 Note: ${order.comment}` : ""}

${order.status === "Pending" ? "⏳ Your order is being processed." : ""}
${order.status === "Confirmed" ? "✅ Your order has been confirmed and will be shipped soon." : ""}
${order.status === "Shipped" ? "🚚 Your order has been shipped." : ""}
${order.status === "Delivered" ? "✅ Your order has been delivered." : ""}

🅱 🔙 Previous Menu
*️⃣ Main Menu
        `
          await this.bot.sendText(sender, trackingInfo)
        } else {
          await this.bot.sendText(
            sender,
            "❌ Order not found. Please check your Order ID or make sure you're using the same phone number used for ordering.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu",
          )
        }

        session.currentStep = "main_menu"
        return true
      }
    }

    return false
  }

  // Send bank details from config
  private async sendBankDetails(sender: string, session: UserSession): Promise<void> {
    const paymentConfig = this.getPaymentConfig()
    const isUrdu = session.language === "urdu"

    let bankMessage = isUrdu ? "🏦 **بینک تفصیلات**\n\n" : "🏦 **Bank Details**\n\n"

    paymentConfig.bankAccounts.forEach((account, index) => {
      bankMessage += `💳 **Account ${index + 1}:**\n`
      bankMessage += `Bank: ${account.bank}\n`
      bankMessage += `Account: ${account.account}\n`
      bankMessage += `Title: ${account.title}\n`
      bankMessage += `IBAN: ${account.iban}\n\n`
    })

    const totalAmount = session.orderData?.totalAmount || 0
    bankMessage += isUrdu
      ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
      : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

    await this.bot.sendText(sender, bankMessage)
  }

  // Send mobile payment details from config
  private async sendMobilePaymentDetails(sender: string, session: UserSession): Promise<void> {
    const paymentConfig = this.getPaymentConfig()
    const isUrdu = session.language === "urdu"

    let mobileMessage = isUrdu ? "📱 **موبائل پیمنٹ آپشنز**\n\n" : "📱 **Mobile Payment Options**\n\n"

    mobileMessage += `💰 **Easypaisa:**\n`
    mobileMessage += `Account: ${paymentConfig.mobilePayments.easypaisa.account}\n`
    mobileMessage += `Name: ${paymentConfig.mobilePayments.easypaisa.name}\n\n`

    mobileMessage += `💰 **JazzCash:**\n`
    mobileMessage += `Account: ${paymentConfig.mobilePayments.jazzcash.account}\n`
    mobileMessage += `Name: ${paymentConfig.mobilePayments.jazzcash.name}\n\n`

    mobileMessage += `💰 **SadaPay:**\n`
    mobileMessage += `Account: ${paymentConfig.mobilePayments.sadapay.account}\n`
    mobileMessage += `Name: ${paymentConfig.mobilePayments.sadapay.name}\n\n`

    const totalAmount = session.orderData?.totalAmount || 0
    mobileMessage += isUrdu
      ? `💰 **ادائیگی کی رقم: ${totalAmount} روپے**\n\nادائیگی کے بعد ٹرانزیکشن کا اسکرین شاٹ شیئر کریں۔\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
      : `💰 **Amount to Pay: Rs. ${totalAmount}**\n\nPlease share transaction screenshot after payment.\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

    await this.bot.sendText(sender, mobileMessage)
  }

  // Send payment method selection
  private async sendPaymentMethodSelection(sender: string, session: UserSession): Promise<void> {
    const isUrdu = session.language === "urdu"
    const totalAmount = session.orderData?.totalAmount || 0

    const message = isUrdu
      ? `💰 **کل رقم: ${totalAmount} روپے**\n\n💳 **ادائیگی کا طریقہ منتخب کریں:**\n\n1️⃣ 🏦 بینک ٹرانسفر\n2️⃣ 📱 موبائل پیمنٹ (Easypaisa/JazzCash/SadaPay)\n\nبراہ کرم ایک آپشن منتخب کریں (1 یا 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
      : `💰 **Total Amount: Rs. ${totalAmount}**\n\n💳 **Select Payment Method:**\n\n1️⃣ 🏦 Bank Transfer\n2️⃣ 📱 Mobile Payment (Easypaisa/JazzCash/SadaPay)\n\nPlease select an option (1 or 2):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

    await this.bot.sendText(sender, message)
  }

  // Send category selection message dynamically from config
  private async sendCategorySelectionMessage(sender: string, session: UserSession): Promise<void> {
    const categories = this.getMangoCategories()
    const isUrdu = session.language === "urdu"

    let message = isUrdu ? "🥭 **آم کی قسم منتخب کریں**\n\n" : "🥭 **Select Mango Category**\n\n"

    const categoryKeys = Object.keys(categories)
    categoryKeys.forEach((key, index) => {
      const category = categories[key]
      message += `${index + 1}️⃣ ${category.name} - Rs. ${category.pricePerCrate}/crate\n`
    })

    message += isUrdu
      ? `\nبراہ کرم ایک قسم منتخب کریں (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`
      : `\nPlease select a category (1-${categoryKeys.length}):\n\n🅱 🔙 Previous Menu\n*️⃣ Main Menu`

    await this.bot.sendText(sender, message)
  }

  // Handle user message
  private async handleMessage(message: Message): Promise<void> {
    try {
      const sender = message.from
      const text = message.body?.trim() || ""
      const session = this.getUserSession(sender)

      // Check if human chat is enabled for this user
      if (this.isHumanChatEnabled(sender)) {
        console.log(`Ignoring message from ${sender} - human chat is enabled`)
        return
      }

      // Handle special mango order steps first
      if (await this.handleMangoOrderSteps(sender, text, session, message)) {
        return
      }

      // Handle welcome messages step
      if (session.currentStep === "welcome_messages") {
        await this.sendWelcomeMessages(sender, session)
        return
      }

      // Check for navigation commands
      const navCommand = this.isNavigationCommand(text)

      if (navCommand === "main") {
        const mainMenuStepId = this.getMainMenuStep()

        if (this.isCurrentStepMainMenu(session.currentStep)) {
          const currentStep = this.getCurrentStep(session.currentStep)
          if (currentStep) {
            await this.sendStepMessages(sender, currentStep, session)
          }
        } else {
          session.currentStep = mainMenuStepId
          const mainMenuStep = this.getCurrentStep(mainMenuStepId)
          if (mainMenuStep) {
            await this.sendStepMessages(sender, mainMenuStep, session)
          }
        }
        return
      }

      const currentStep = this.getCurrentStep(session.currentStep)
      if (!currentStep) {
        console.error(`Step not found: ${session.currentStep}`)
        return
      }

      if (navCommand === "back") {
        if (this.isCurrentStepMainMenu(session.currentStep)) {
          if (currentStep.backStep) {
            session.currentStep = currentStep.backStep
            const backStep = this.getCurrentStep(currentStep.backStep)
            if (backStep) {
              await this.sendStepMessages(sender, backStep, session)
            }
          } else {
            await this.sendStepMessages(sender, currentStep, session)
          }
        } else if (currentStep.backStep) {
          session.currentStep = currentStep.backStep
          const backStep = this.getCurrentStep(currentStep.backStep)
          if (backStep) {
            await this.sendStepMessages(sender, backStep, session)
          }
        } else {
          const backText =
            this.getNavigationText("back", session.language) || "Back navigation not available from this step."
          await this.bot.sendText(sender, backText)
        }
        return
      }

      // Find matching trigger
      const matchingTrigger = this.findMatchingTrigger(text, currentStep.triggers)

      if (matchingTrigger) {
        if (matchingTrigger.storeAs) {
          session.data[matchingTrigger.storeAs] = text
        }

        if (matchingTrigger.setLanguage) {
          session.language = matchingTrigger.setLanguage

          // FIX: Immediately process welcome messages after language selection
          if (session.currentStep === "language_selection" && matchingTrigger.nextStep === "welcome_messages") {
            console.log(`Language selected: ${matchingTrigger.setLanguage}, automatically sending welcome messages`)
            session.currentStep = "welcome_messages"
            await this.sendWelcomeMessages(sender, session)
            return
          }
        }

        if (matchingTrigger.action === "reset") {
          this.resetUserSession(sender)
          const startStep = this.getCurrentStep("start")
          if (startStep) {
            await this.sendStepMessages(sender, startStep, session)
          }
          return
        }

        if (matchingTrigger.action === "enable_human_chat") {
          this.enableHumanChat(sender)
          await this.sendHumanChatEnabledMessage(sender, session)
          return
        }

        if (matchingTrigger.nextStep) {
          session.currentStep = matchingTrigger.nextStep
          const nextStep = this.getCurrentStep(matchingTrigger.nextStep)

          if (nextStep) {
            // Special handling for specific steps
            if (matchingTrigger.nextStep === "mango_categories") {
              await this.sendCategorySelectionMessage(sender, session)
            } else if (matchingTrigger.nextStep === "browse_categories") {
              await this.sendBrowseCategoriesMessage(sender, session)
            } else if (matchingTrigger.nextStep === "welcome_messages") {
              // Automatically send welcome messages without waiting for user input
              await this.sendWelcomeMessages(sender, session)
            } else {
              await this.sendStepMessages(sender, nextStep, session)
            }
          }
        }
      } else {
        const errorMessage =
          this.getLocalizedMessage(currentStep.errorMessage, session.language) ||
          "Sorry, I didn't understand that. Please try again."
        await this.bot.sendText(sender, errorMessage)

        if (currentStep.resendOnError) {
          await this.sendStepMessages(sender, currentStep, session)
        }
      }
    } catch (error) {
      console.error("Error handling message:", error)
    }
  }

  // Get navigation text from config
  private getNavigationText(type: "back" | "main", language: string | null): string | undefined {
    if (!this.flowConfig?.navigation) return undefined

    const navigation = this.flowConfig.navigation
    const textObj = type === "back" ? navigation.backText : navigation.mainMenuText

    return this.getLocalizedMessage(textObj, language)
  }

  // Get localized message
  private getLocalizedMessage(
    messageObj: string | LocalizedMessage | undefined,
    language: string | null,
  ): string | undefined {
    if (typeof messageObj === "string") return messageObj
    if (typeof messageObj === "object" && messageObj && language && messageObj[language]) {
      return messageObj[language]
    }
    if (typeof messageObj === "object" && messageObj) {
      return messageObj.english || messageObj[Object.keys(messageObj)[0]]
    }
    // @ts-ignore
    return messageObj as string
  }

  // Enhanced method to send multiple messages
  private async sendStepMessages(sender: string, step: Step, session: UserSession): Promise<void> {
    try {
      if (step.messages && step.messages.length > 0) {
        for (const messageContent of step.messages) {
          if (messageContent.delay && messageContent.delay > 0) {
            await this.delay(messageContent.delay)
          }

          await this.sendSingleMessage(sender, messageContent, session)
        }
      } else {
        const messageContent: MessageContent = {
          type: step.type || "text",
          message: step.message,
          mediaUrl: step.mediaUrl,
          filePath: step.filePath,
        }

        await this.sendSingleMessage(sender, messageContent, session)
      }
    } catch (error) {
      console.error("Error sending step messages:", error)
    }
  }

  // Send a single message based on its type
  private async sendSingleMessage(sender: string, messageContent: MessageContent, session: UserSession): Promise<void> {
    const message = this.getLocalizedMessage(messageContent.message, session.language)
    const caption = this.getLocalizedMessage(messageContent.caption, session.language)
    const processedMessage = this.processVariables(message || "", session.data)
    const processedCaption = this.processVariables(caption || "", session.data)

    switch (messageContent.type) {
      case "text":
        if (processedMessage) {
          await this.bot.sendText(sender, processedMessage)
        }
        break

      case "media":
      case "video":
      case "audio":
        if (messageContent.mediaUrl) {
          const captionText = processedCaption || processedMessage || ""
          await this.bot.sendMedia(sender, messageContent.mediaUrl, captionText)
        }
        break

      case "document":
        if (messageContent.filePath) {
          await this.bot.sendFile(sender, messageContent.filePath)
          if (processedMessage) {
            await this.bot.sendText(sender, processedMessage)
          }
        }
        break

      default:
        if (processedMessage) {
          await this.bot.sendText(sender, processedMessage)
        }
    }
  }

  // Utility method to add delay
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Method to manually disable human chat (for admin use)
  public manuallyDisableHumanChat(userId: string): void {
    this.disableHumanChat(userId)
  }

  // Method to check human chat status (for admin use)
  public getHumanChatStatus(userId: string): { enabled: boolean; enabledAt?: number; remainingTime?: number } {
    const session = this.getUserSession(userId)

    if (!session.isHumanChatEnabled) {
      return { enabled: false }
    }

    const remainingTime = session.humanChatEnabledAt
      ? this.HUMAN_CHAT_TIMEOUT - (Date.now() - session.humanChatEnabledAt)
      : 0

    return {
      enabled: true,
      enabledAt: session.humanChatEnabledAt,
      remainingTime: Math.max(0, remainingTime),
    }
  }

  // Reload configuration
  public reloadConfig(): void {
    this.flowConfig = loadFlowConfig()
    console.log("Flow configuration reloaded")
  }

  // Getter for bot instance
  public get botInstance(): BaileysClass {
    return this.bot
  }
}

// Create bot instance
const enhancedMangoBot = new EnhancedMangoChatBot()

// Export for external use
export default enhancedMangoBot
export {
  EnhancedMangoChatBot,
  type UserSession,
  type Trigger,
  type Step,
  type FlowConfig,
  type Message,
  type NavigationConfig,
  type MessageContent,
  type OrderRecord,
  type CartItem,
  type MangoCategory,
  type PaymentVerificationResult,
  type BusinessMessage,
  type BusinessMessagesConfig,
}
