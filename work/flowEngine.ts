// flowEngine.ts
import { BaileysClass } from '../lib/baileys.js';


type FlowStep = {
  type: string;
  message: string;
  options?: { id: string; label: string }[];
};

export class FlowEngine {
  private client: BaileysClass;
  private flow: Record<string, FlowStep>;
  private userState: Record<string, string>;

  constructor(client: BaileysClass, flow: Record<string, FlowStep>) {
    this.client = client;
    this.flow = flow;
    this.userState = {};
  }

  async start() {
    this.client.on('message', async ({ from, body }) => {
      try {
        const current = this.userState[from] || 'start';
        const input = body.trim();

        const options = this.flow[current]?.options;
        let nextStepId: string | undefined;

        if (options && /^[0-9]+$/.test(input)) {
          const index = parseInt(input, 10) - 1;
          if (options[index]) {
            nextStepId = options[index].id;
          }
        } else {
          nextStepId = input.toLowerCase(); // fallback for text input matching
        }

        if (!nextStepId || !this.flow[nextStepId]) {
          await this.client.sendText(from, "❌ I didn't understand. Please reply with a valid number.");
          return await this.sendStep(from, current);
        }

        this.userState[from] = nextStepId;
        await this.sendStep(from, nextStepId);

      } catch (err) {
        console.error(`❌ Error handling message from ${from}:`, err);
        await this.client.sendText(from, "⚠️ Something went wrong. Please try again later.");
      }
    });
  }



  private async sendStep(user: string, stepName: string) {
    const step = this.flow[stepName];

    if (step.options) {
      const numberedOptions = step.options.map((opt, index) => `${index + 1}. ${opt.label}`).join('\n');
      const message = `${step.message}\n\n${numberedOptions}`;
      await this.client.sendText(user, message);
    } else {
      await this.client.sendText(user, step.message);
    }
  }

}
