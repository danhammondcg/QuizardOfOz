import { Activity, CardFactory, MessageFactory, TeamsActivityHandler, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import helloWorldCard from "./adaptiveCards/helloworldCommand.json";
import { CardData } from "./cardModels";
import Tesseract, { PSM, createWorker, Lang } from 'tesseract.js';
import { MicrosoftAppCredentials } from 'botframework-connector';
import fs from 'fs';
import path from 'path';
import axios from "axios";

const FILES_DIR = 'files';
/**
 * The `HelloWorldCommandHandler` registers a pattern with the `TeamsFxBotCommandHandler` and responds
 * with an Adaptive Card if the user types the `triggerPatterns`.
 */
export class QuizardCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: TriggerPatterns = "Help me Quizard";

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage,

  ): Promise<string | Partial<Activity> | void> {
    console.log(`App received message: ${message.text}`);

    const attachments = context?.activity?.attachments;
    if (attachments && attachments.length > 0) {
      const userInputHtml = attachments.find((attachment) => { return attachment.contentType.indexOf('image') !== -1 });

      if (userInputHtml) {

        // const imgSrcUrl = userInputHtml.content.match(/<img[^>]+src="([^">]+)"/)?.[1];
        // const 
        const imgSrcUrl = userInputHtml.contentUrl;
        console.log("imgSrc:", imgSrcUrl);
        try {
          try {

            // file.content.downloadUrl
            // const response = await fetch(imgSrcUrl, { credentials: 'include' });
            const credentials = new MicrosoftAppCredentials(process.env.BOT_ID, process.env.BOT_PASSWORD);
            const botToken = await credentials.getToken();

            const response = await axios({ method: 'GET', url: attachments[0].contentUrl, responseType: 'arraybuffer', headers: { Authorization: `Bearer ${botToken}` } });
            if (response.status != 200) {
              console.error("response:", response);
              return;
            }
            // const buffer = Buffer.from(response.data, 'base64');

            // const worker = await createWorker('eng');

            // // worker.setParameters({
            // //   tessedit_pageseg_mode: PSM.AUTO_OSD
            // // })
            // const textFromImage = await worker.recognize(buffer, {

            // });
            // const imageText = textFromImage.data.text;
            
            function arrayBufferToBlob(arrayBuffer: ArrayBuffer, type: string): Blob {
              return new Blob([arrayBuffer], { type });
            }

            // Usage example:
            const arrayBuffer = response.data; // Assuming response.data is an ArrayBuffer
            const blob = arrayBufferToBlob(arrayBuffer, 'application/octet-stream');
            const formData = new FormData();
            formData.append('file', blob);

            const result = await axios.post('https://quizzardofozapi20240129091445.azurewebsites.net/quizzard', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            // const result = await axios.post('https://quizzardofozapi20240129091445.azurewebsites.net/quizzard', buffer);
            
            const imageText = result.data;
            // ...

            try {
              const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                messages: [
                  {
                    "role": "user",
                    "content": `Correct this text into 10 questions, some of the text is jumbled up, remove the title 'super quiz' remove the headers stating difficulty of beginner, intermediate or advanced and a number of points. This is the text: ${imageText}`,
                  }
                ],
                model: 'gpt-3.5-turbo'
              }, {
                headers: {
                  Authorization: `Bearer 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`
                }
              });
              console.log("Fixed question text:", response.data.choices[0].message.content);

              const answers = await axios.post('https://api.openai.com/v1/chat/completions', {
                messages: [
                  {
                    "role": "user",
                    "content": `Give a brief answer each of these 10 questions, don't included explains and use as few words as necessary: ${response.data.choices[0].message.content}`,
                  }
                ],
                model: 'gpt-3.5-turbo'
              }, {
                headers: {
                  Authorization: `Bearer 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`
                }
              });


              const generatedText = answers.data.choices[0].message.content.trim();
              console.log("Generated text:", generatedText);

              // Rest of the code...
              

              const cardData: CardData = {
                title: "Voilà! Here are the answers to your quiz:",
                body: generatedText,
              };

              const cardJson = AdaptiveCards.declare(helloWorldCard).render(cardData);
              return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));

            } catch (error) {
              console.error("Error making ChatGPT API request:", error);
            }


          }
          catch (error) {
            console.error("Error fetching image:", error);
          }

        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }



    }


    // Get the first attached image from the message
    // const imageAttachment = message["attachments"]?.find((attachment) => attachment.contentType?.startsWith("image/"));

    // if (imageAttachment) {
    //   // Do something with the image attachment
    //   console.log("First attached image:", imageAttachment.contentUrl);
    // }

    // Rest of the code...

    const cardData: CardData = {
      title: "Bad request",
      body: "Baaaad",
    };

    const cardJson = AdaptiveCards.declare(helloWorldCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }

  // async processInlineImage(context) {
  //   const file = context.activity.attachments[0];
  //   const credentials = new MicrosoftAppCredentials(process.env.MicrosoftAppId, process.env.MicrosoftAppPassword);
  //   const botToken = await credentials.getToken();
  //   const config = {
  //     headers: { Authorization: `Bearer ${botToken}` },
  //     responseType: 'stream'
  //   };

  //   // await writeFile(file.contentUrl, config, filePath);
  //   // const fileSize = await getFileSize(filePath);
  //   // const reply = MessageFactory.text(`Image <b>${fileName}</b> of size <b>${fileSize}</b> bytes received and saved.`);
  //   const inlineAttachment = this.getInlineAttachment(fileName);
  //   reply.attachments = [inlineAttachment];
  //   await context.sendActivity(reply);
  // }

  // getInlineAttachment(fileName) {
  //   const imageData = fs.readFileSync(path.join(FILES_DIR, fileName));
  //   const base64Image = Buffer.from(imageData).toString('base64');
  //   return {
  //       name: fileName,
  //       contentType: 'image/png',
  //       contentUrl: `data:image/png;base64,${ base64Image }`
  //   };
  // }
}
