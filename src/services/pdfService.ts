// src/services/pdfService.js
import { eventBus, EVENTS } from "../events/eventBus.js";
import { InputFile, Context } from "grammy";
import type { Bot } from "grammy";

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

      console.log(`✅ PDF delivered successfully to ${data.userId}`);
    } catch (error) {
      console.error(`❌ Failed to deliver PDF to ${data.userId}:`, error);
    }
  }
}
