using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;

using TalentSphereAPI.DTOs.LiveClass;

namespace TalentSphereAPI.Services

{

    public class LiveClassPdfService : ILiveClassPdfService

    {

        private readonly ApplicationDbContext _context;

        private readonly IWebHostEnvironment _environment;

        private readonly IHttpContextAccessor _httpContextAccessor;

        public LiveClassPdfService(

            ApplicationDbContext context,

            IWebHostEnvironment environment,

            IHttpContextAccessor httpContextAccessor)

        {

            _context = context;

            _environment = environment;

            _httpContextAccessor = httpContextAccessor;

        }

        public async Task UploadPdfAsync(UploadLiveClassPdfDto dto)

        {

            var liveClass = await _context.LiveClasses

                .FirstOrDefaultAsync(x => x.LiveClassId == dto.LiveClassId);

            if (liveClass == null)

                throw new Exception("Live class not found.");

            var folderPath = Path.Combine(

                _environment.WebRootPath,

                "LiveClassPDFs");

            if (!Directory.Exists(folderPath))

                Directory.CreateDirectory(folderPath);

            if (!string.IsNullOrWhiteSpace(liveClass.ModulePdfPath))

            {

                var oldFile = Path.Combine(

                    _environment.WebRootPath,

                    liveClass.ModulePdfPath.TrimStart('/').Replace("/", "\\"));

                if (File.Exists(oldFile))

                    File.Delete(oldFile);

            }

            var fileName =

                Guid.NewGuid() +

                Path.GetExtension(dto.PdfFile.FileName);

            var filePath = Path.Combine(folderPath, fileName);

            using var stream = new FileStream(

                filePath,

                FileMode.Create);

            await dto.PdfFile.CopyToAsync(stream);

            liveClass.ModulePdfName = dto.PdfFile.FileName;

            liveClass.ModulePdfPath =

                "/LiveClassPDFs/" + fileName;

            await _context.SaveChangesAsync();

        }

        public async Task<LiveClassPdfResponseDto> GetPdfAsync(int liveClassId)

        {

            var liveClass = await _context.LiveClasses

                .FirstOrDefaultAsync(x =>

                    x.LiveClassId == liveClassId);

            if (liveClass == null)

                throw new Exception("Live class not found.");

            if (string.IsNullOrWhiteSpace(liveClass.ModulePdfPath))

                throw new Exception("PDF not uploaded.");

            var request = _httpContextAccessor.HttpContext!.Request;

            var url =

                $"{request.Scheme}://{request.Host}{liveClass.ModulePdfPath}";

            return new LiveClassPdfResponseDto

            {

                LiveClassId = liveClass.LiveClassId,

                FileName = liveClass.ModulePdfName!,

                FileUrl = url

            };

        }

        public async Task DeletePdfAsync(int liveClassId)

        {

            var liveClass = await _context.LiveClasses

                .FirstOrDefaultAsync(x =>

                    x.LiveClassId == liveClassId);

            if (liveClass == null)

                throw new Exception("Live class not found.");

            if (!string.IsNullOrWhiteSpace(liveClass.ModulePdfPath))

            {

                var file = Path.Combine(

                    _environment.WebRootPath,

                    liveClass.ModulePdfPath.TrimStart('/').Replace("/", "\\"));

                if (File.Exists(file))

                    File.Delete(file);

            }

            liveClass.ModulePdfName = null;

            liveClass.ModulePdfPath = null;

            await _context.SaveChangesAsync();

        }

    }

}
