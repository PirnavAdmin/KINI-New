import { branchApi, getApiErrorMessage, organizationApi } from './apiServices'

const firstText = (...values) => {
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (text) return text
  }
  return ''
}

const firstValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const branchFieldText = (branch, aliases, nestedKeys = []) => {
  const normalizedAliases = new Set(aliases.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, '')))
  const nestedAliasKeys = new Set(nestedKeys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, '')))
  const sources = [branch]
  for (const [key, value] of Object.entries(branch ?? {})) {
    if (nestedAliasKeys.has(key.toLowerCase().replace(/[^a-z0-9]/g, '')) && value && typeof value === 'object') {
      sources.push(value)
    }
  }
  for (const source of sources) {
    for (const [key, value] of Object.entries(source ?? {})) {
      if (!normalizedAliases.has(key.toLowerCase().replace(/[^a-z0-9]/g, '')) || (typeof value !== 'string' && typeof value !== 'number')) continue
      const text = String(value).trim()
      if (text) return text
    }
  }
  return ''
}

const BRANCH_CITY_FIELDS = ['city', 'branchCity', 'cityName', 'branchCityName', 'locationCity', 'town']
const BRANCH_PHONE_FIELDS = [
  'phone', 'phoneNumber', 'phoneNo', 'mobile', 'mobileNumber', 'mobileNo', 'telephone', 'tel',
  'primaryPhone', 'primaryContactNumber', 'contact', 'contactNo', 'contactNumber', 'contactPhone',
  'contactMobile', 'branchContact', 'branchContactNo', 'branchContactNumber', 'branchContactPhone',
  'branchContactMobile', 'branchPhone', 'branchPhoneNumber', 'branchMobile', 'branchMobileNo',
  'branchMobileNumber', 'BranchMobileNumber',
]

const normalizeBranch = (branch) => ({
  ...branch,
  organizationId: firstValue(branch.organizationId, branch.OrganizationId, branch.orgId, branch.OrgId),
  id: firstValue(branch.branchId, branch.BranchId, branch.id, branch.Id),
  branchId: firstValue(branch.branchId, branch.BranchId, branch.id, branch.Id),
  name: firstText(branch.name, branch.Name, branch.branchName, branch.BranchName),
  branchCode: firstText(branch.branchCode, branch.BranchCode, branch.code, branch.Code),
  address: firstText(branch.address, branch.Address, branch.branchAddress, branch.BranchAddress, branch.location, branch.Location),
  city: branchFieldText(branch, BRANCH_CITY_FIELDS, ['location', 'locationDetails', 'locationInfo', 'branchLocation', 'address', 'addressDetails', 'branchAddress', 'branchDetails'])
    || branchFieldText(branch, BRANCH_CITY_FIELDS, ['branchContact', 'contactDetails', 'contactInfo', 'branchContactInfo']),
  country: firstText(branch.country, branch.Country),
  phone: branchFieldText(branch, BRANCH_PHONE_FIELDS, ['contact', 'contactDetails', 'contactInfo', 'contactNumberInfo', 'branchContact', 'branchContactInfo', 'branchDetails'])
    || branchFieldText(branch, BRANCH_PHONE_FIELDS, ['location', 'locationDetails', 'locationInfo', 'branchLocation', 'address', 'addressDetails', 'branchAddress']),
  email: firstText(branch.email, branch.Email, branch.emailAddress, branch.EmailAddress, branch.primaryEmail, branch.PrimaryEmail, branch.contactEmail, branch.ContactEmail, branch.contactMail, branch.ContactMail, branch.branchEmail, branch.BranchEmail, branch.branchContactEmail, branch.BranchContactEmail),
  managerId: firstValue(branch.managerId, branch.ManagerId, branch.branchManagerId, branch.BranchManagerId) ?? null,
  managerName: firstText(branch.managerName, branch.ManagerName, branch.branchManagerName, branch.BranchManagerName, branch.branchManager, branch.BranchManager, branch.manager, branch.Manager),
  status: String(firstValue(branch.status, branch.Status) ?? 'active').toLowerCase(),
})

export const create = async (payload) => organizationApi.create(payload)

export const registerOrganization = (data) => organizationApi.create(data)
export const loginOrganization = (data) => organizationApi.login(data)
export const getOrganizations = () => organizationApi.list()
export const getOrganizationById = (id) => organizationApi.getById(id)
export const updateOrganization = (id, data) => organizationApi.update(id, data)
export const deleteOrganization = (id) => organizationApi.remove(id)

const readStoredOrganizationId = () => {
  for (const key of ['user', 'organization']) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null')
      const id = value?.organizationId
        ?? value?.OrganizationId
        ?? value?.orgId
        ?? value?.OrgId
        ?? value?.organization?.organizationId
        ?? value?.organization?.id
        ?? value?.organisation?.organizationId
        ?? value?.organisation?.id
      const numericId = Number(id)
      if (Number.isInteger(numericId) && numericId > 0) return numericId
    } catch {
      // Ignore malformed local storage values.
    }
  }

  const direct = localStorage.getItem('organization_id') || localStorage.getItem('organizationId') || localStorage.getItem('orgId')
  const directId = Number(direct)
  if (Number.isInteger(directId) && directId > 0) return directId

  return null
}

const getDefaultOrganizationId = async () => {
  const storedId = readStoredOrganizationId()
  if (storedId) return storedId
  throw new Error('Your session does not include a valid organization ID. Please sign in again.')
}

const toBranchDto = async (payload) => {
  const organizationId = Number(payload.organizationId || (await getDefaultOrganizationId()))
  const name = payload.name ?? payload.branchName
  const address = payload.address ?? payload.branchAddress ?? payload.location
  const phone = payload.phone ?? payload.contactNumber ?? payload.contactNo ?? payload.contactPhone ?? payload.contactMobile ?? payload.contact ?? payload.mobile ?? payload.mobileNumber ?? payload.mobileNo ?? payload.phoneNumber ?? payload.phoneNo ?? payload.primaryPhone ?? payload.branchContactNumber ?? payload.branchContactNo ?? payload.branchContactPhone ?? payload.branchContactMobile ?? payload.branchContact ?? payload.branchPhoneNumber ?? payload.branchPhone ?? payload.branchMobileNumber ?? payload.branchMobileNo ?? payload.branchMobile
  const email = payload.email ?? payload.emailAddress ?? payload.primaryEmail ?? payload.contactEmail ?? payload.contactMail ?? payload.branchEmail ?? payload.branchContactEmail
  const city = payload.city ?? payload.branchCity ?? payload.cityName ?? payload.branchCityName ?? payload.locationCity
  if (!/^[6-9]\d{9}$/.test(String(phone ?? '').trim())) {
    throw new Error('Enter a valid Indian mobile number starting with 6, 7, 8, or 9.')
  }
  return {
    organizationId,
    orgId: organizationId,
    name,
    branchName: name,
    address,
    branchAddress: address,
    location: address,
    city,
    branchCity: city,
    BranchCity: city,
    cityName: city,
    CityName: city,
    branchCityName: city,
    BranchCityName: city,
    locationCity: city,
    LocationCity: city,
    country: payload.country,
    phone,
    Phone: phone,
    contactNumber: phone,
    ContactNumber: phone,
    branchContactNumber: phone,
    BranchContactNumber: phone,
    branchContactNo: phone,
    BranchContactNo: phone,
    contactNo: phone,
    ContactNo: phone,
    contactPhone: phone,
    ContactPhone: phone,
    branchContactPhone: phone,
    BranchContactPhone: phone,
    contactMobile: phone,
    ContactMobile: phone,
    branchContactMobile: phone,
    BranchContactMobile: phone,
    phoneNumber: phone,
    PhoneNumber: phone,
    phoneNo: phone,
    PhoneNo: phone,
    contact: phone,
    Contact: phone,
    mobile: phone,
    Mobile: phone,
    mobileNumber: phone,
    MobileNumber: phone,
    mobileNo: phone,
    MobileNo: phone,
    primaryPhone: phone,
    PrimaryPhone: phone,
    branchContact: phone,
    BranchContact: phone,
    branchPhone: phone,
    BranchPhone: phone,
    branchPhoneNumber: phone,
    BranchPhoneNumber: phone,
    branchMobile: phone,
    BranchMobile: phone,
    branchMobileNo: phone,
    BranchMobileNo: phone,
    branchMobileNumber: phone,
    BranchMobileNumber: phone,
    email,
    Email: email,
    emailAddress: email,
    EmailAddress: email,
    primaryEmail: email,
    PrimaryEmail: email,
    contactEmail: email,
    ContactEmail: email,
    contactMail: email,
    ContactMail: email,
    branchEmail: email,
    BranchEmail: email,
    branchContactEmail: email,
    BranchContactEmail: email,
  }
}

export const fetchBranches = async (params) => {
  const result = await branchApi.list(params)
  const payload = result?.data ?? result
  const list = Array.isArray(payload)
    ? payload
    : [payload?.content, payload?.branches, payload?.items, payload?.records, payload?.results]
        .find(Array.isArray) || []
  return list.map(normalizeBranch)
}

export const fetchBranchById = async (id) => {
  if (id === undefined || id === null || id === '') throw new Error('A valid branch ID is required.')
  const result = await branchApi.getById(id)
  const payload = result?.branch ?? result?.data?.branch ?? result?.data ?? result
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('The branch details response was empty or invalid.')
  return normalizeBranch(payload)
}

export const addBranch = async (payload) => branchApi.create(await toBranchDto(payload))

export const editBranch = async (id, payload) => branchApi.update(id, await toBranchDto(payload))

export const removeBranch = async (id) => branchApi.remove(id)

export const getBranchErrorMessage = (error) => {
  return getApiErrorMessage(error, 'Unable to complete the branch request. Please try again.')
}
