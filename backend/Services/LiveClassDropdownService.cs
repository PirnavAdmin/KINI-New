using Microsoft.EntityFrameworkCore;

using TalentSphereAPI.Data;
using TalentSphereAPI.DTOs.DropDown;
using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services

{

    public class LiveClassDropdownService

        : ILiveClassDropdownService

    {

        private readonly ApplicationDbContext _context;

        public LiveClassDropdownService(

            ApplicationDbContext context)

        {

            _context = context;

        }

        public async Task<IEnumerable<DropdownDto>>

    GetCoursesAsync()

        {

            return await _context.Courses

                .OrderBy(x => x.CourseName)

                .Select(x => new DropdownDto

                {

                    Id = x.CourseId,

                    Name = x.CourseName

                })

                .ToListAsync();

        }

        public async Task<IEnumerable<DropdownDto>>

    GetBatchesAsync()

        {

            return await _context.Batches

                .OrderBy(x => x.BatchName)

                .Select(x => new DropdownDto

                {

                    Id = x.BatchId,

                    Name = x.BatchName

                })

                .ToListAsync();

        }

        public async Task<IEnumerable<DropdownDto>>

    GetMentorsAsync()

        {

            return await _context.Mentors

                .OrderBy(x => x.FirstName)

                .Select(x => new DropdownDto

                {

                    Id = x.MentorId,

                    Name = x.FirstName + " " + x.LastName

                })

                .ToListAsync();

        }

        public async Task<IEnumerable<MeetingPlatformDto>>

    GetMeetingPlatformsAsync()

        {

            var platforms = new List<MeetingPlatformDto>

    {

        new MeetingPlatformDto

        {

            Id = 1,

            PlatformName = "Zoom"

        },

        new MeetingPlatformDto

        {

            Id = 2,

            PlatformName = "Google Meet"

        },

        new MeetingPlatformDto

        {

            Id = 3,

            PlatformName = "Microsoft Teams"

        }

    };

            return await Task.FromResult(platforms);

        }

        public async Task<IEnumerable<LiveClassStatusDto>> GetStatusesAsync()

        {

            var statuses = new List<LiveClassStatusDto>

    {

        new LiveClassStatusDto

        {

            Id = 1,

            StatusName = "Scheduled"

        },

        new LiveClassStatusDto

        {

            Id = 2,

            StatusName = "Live"

        },

        new LiveClassStatusDto

        {

            Id = 3,

            StatusName = "Completed"

        },

        new LiveClassStatusDto

        {

            Id = 4,

            StatusName = "Cancelled"

        }

    };

            return await Task.FromResult(statuses);

        }

    }

}
