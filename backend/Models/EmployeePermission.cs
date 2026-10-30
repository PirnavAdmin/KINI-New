using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentSphereAPI.Models
{
    public class EmployeePermission
    {
        [Key]
        public int EmployeePermissionId { get; set; }

        // Employee to whom this permission belongs
        public int EmployeeId { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee Employee { get; set; } = null!;

        // Permission/module
        public int PermissionId { get; set; }

        [ForeignKey(nameof(PermissionId))]
        public Permission Permission { get; set; } = null!;

        // Permission actions
        public bool CanView { get; set; }

        public bool CanAdd { get; set; }

        public bool CanEdit { get; set; }

        public bool CanDelete { get; set; }

        // Master access switch for the module
        public bool CanAccess { get; set; }
    }
}