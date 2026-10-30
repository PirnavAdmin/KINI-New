using TalentSphereAPI.DTOs.Branches;

using TalentSphereAPI.Models;

namespace TalentSphereAPI.Services

{

    public interface IBranchService

    {

        Task<string> CreateBranchAsync(

            CreateBranchDto dto);

        Task<List<Branch>> GetBranchesAsync();

        Task<Branch?> GetByIdAsync(

            int branchId);

        Task<string> UpdateBranchAsync(

            int branchId,

            UpdateBranchDto dto);

        Task<string> DeleteBranchAsync(

            int branchId);

    }

}
