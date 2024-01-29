using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuizSolver;

namespace QuizzardOfOzApi.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("[controller]")]
    public class QuizzardController : ControllerBase
    {
        [HttpPost]
        public async Task<string> PostImageToAnswer(IFormFile file)
        {

            // Save the file to disk
            using (var stream = file.OpenReadStream())
            {
                //await file.CopyToAsync(stream);
                byte[] fileBytes = await ReadFully(stream);

                var gptKey = "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";
                // ...

                //string imagePath = "C:\\Dev\\Playground\\QuizSolver\\QuizzardOfOzApi\\Quiz\\Quiz1.png";
                //var fileBytes = System.IO.File.ReadAllBytes(imagePath);
                var textExtractor = new ImageTextExtractor();
                var imageText = await textExtractor.GetImageText(fileBytes);

                //ChatGpt chatGpt = new ChatGpt(gptKey, new ChatGptOptions
                //{

                //});
                //var result = await chatGpt.SendMessage(new ChatGptRequest
                //{
                //    Messages = new List<ChatGptMessage>
                //    {
                //        new ChatGptMessage
                //        {
                //                        Content = "Try and answer all 10 quiz questions from this text:" + imageText
                //                    }
                //                },
                //    MaxTokens = 1000
                //});

                return imageText;

            }


        }

        public static async Task<byte[]> ReadFully(Stream input)
        {
            byte[] buffer = new byte[16 * 1024];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = await input.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    await ms.WriteAsync(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }
    }
}
