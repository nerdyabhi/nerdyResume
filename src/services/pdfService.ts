import { eventBus, EVENTS } from "../events/eventBus.js";
import { InputFile, Context } from "grammy";
import type { Bot } from "grammy";
import { redis } from "../config/redis.js";
export class PDFDeliveryService<C extends Context = Context> {
  private bot: Bot<C>;

  constructor(bot: Bot<C>) {
    this.bot = bot;
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.on(EVENTS.PDF_GENERATED, async (data) => {
      await this.deliverPDF(data);
    });

    eventBus.on(EVENTS.RESUME_PROGRESS, async (data) => {
      await this.sendProgressUpdate(data);
    });
  }

  private async sendProgressUpdate(data: { userId: string; message: string }) {
    try {
      const key = `progress:message:${data.userId}`;
      const existingMessageId = await redis.get(key);

      if (existingMessageId) {
        // Edit existing message
        await this.bot.api.editMessageText(
          data.userId,
          parseInt(existingMessageId),
          data.message
        );
      } else {
        // Send new message and store ID
        const sentMessage = await this.bot.api.sendMessage(
          data.userId,
          data.message
        );
        // ✅ Auto-expire after 5 minutes
        await redis.setex(key, 5 * 60, sentMessage.message_id.toString());
      }
    } catch (error) {
      console.error(`Failed to send progress to ${data.userId}:`, error);
    }
  }

  private async deliverPDF(data: {
    userId: string;
    fileName: string;
    buffer: Buffer;
    metadata: any;
  }) {
    try {
      await this.bot.api.sendDocument(
        data.userId,
        new InputFile(data.buffer, data.fileName),
        {
          caption: "✅ Your tailored resume is ready!",
        }
      );

      // ✅ Clean up from Redis
      await redis.del(`progress:message:${data.userId}`);
    } catch (error) {
      console.error(`❌ Failed to deliver PDF to ${data.userId}:`, error);
    }
  }
}
