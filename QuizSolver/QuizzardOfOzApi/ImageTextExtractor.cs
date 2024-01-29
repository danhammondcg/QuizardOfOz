using Tesseract;

namespace QuizSolver
{
    internal class ImageTextExtractor
    {

        public async Task<string> GetImageText(byte[] image)
        {
            using (var engine = new TesseractEngine(@"./tesseract", "eng", EngineMode.Default))
            {
                using (var img = Pix.LoadFromMemory(image))
                {
                    using (var page = engine.Process(img))
                    {
                        var text = page.GetText();
                        return text;
                    }
                }
            }
        }
    }
}
