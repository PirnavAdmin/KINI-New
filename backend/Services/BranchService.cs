using TalentSphereAPI.DTOs.Branches;
using TalentSphereAPI.Models;
using TalentSphereAPI.Repositories;

namespace TalentSphereAPI.Services
{
    public class BranchService : IBranchService
    {
        private readonly IBranchRepository _repository;

        public BranchService(IBranchRepository repository)
        {
            _repository = repository;
        }

        // =====================================================
        // CREATE BRANCH
        // =====================================================

        public async Task<string> CreateBranchAsync(CreateBranchDto dto)
        {
            var branch = new Branch
            {
                OrganizationId = dto.OrganizationId,

                BranchName = dto.Name,

                Location = dto.Location,

                Description = dto.Description,

                Status = true,

                CreatedDate = DateTime.UtcNow
            };

            var result = await _repository.CreateAsync(branch);

            return result
                ? "Branch Created Successfully"
                : "Branch Creation Failed";
        }

        // =====================================================
        // GET ALL BRANCHES
        // =====================================================

        public async Task<List<Branch>> GetBranchesAsync()
        {
            var branches = await _repository.GetAllAsync();

            return branches.ToList();
        }

        // =====================================================
        // GET BRANCH BY ID
        // =====================================================

        public async Task<Branch?> GetByIdAsync(int branchId)
        {
            return await _repository.GetByIdAsync(branchId);
        }

        // =====================================================
        // UPDATE BRANCH
        // =====================================================

        public async Task<string> UpdateBranchAsync(
            int branchId,
            UpdateBranchDto dto)
        {
            var branch = await _repository.GetByIdAsync(branchId);

            if (branch == null)
                return "Branch Not Found";

            branch.BranchName = dto.Name;

            branch.Location = dto.Location;

            branch.Description = dto.Description;

            var result = await _repository.UpdateAsync(branch);

            return result
                ? "Branch Updated Successfully"
                : "Update Failed";
        }

        // =====================================================
        // DELETE BRANCH
        // =====================================================

        public async Task<string> DeleteBranchAsync(int branchId)
        {
            var result = await _repository.DeleteAsync(branchId);

            return result
                ? "Branch Deleted Successfully"
                : "Branch Not Found";
        }
    }
}