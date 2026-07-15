import { useState, useEffect } from 'react'
import { User, CheckCircle, AlertCircle, Save } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { ProfileCompletenessRing } from '@/components/ProfileCompletenessRing'
import { LoadingSpinner, PageLoader } from '@/components/LoadingSpinner'

// Backend-compatible enum values (must match ProfileUpdateSchema in validators.py)
const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Jammu and Kashmir', 'Ladakh',
]

// value = backend enum value, label = display string
const OCCUPATION_OPTIONS = [
  { value: 'farmer', label: 'Farmer / Agricultural Labourer' },
  { value: 'student', label: 'Student' },
  { value: 'government_employee', label: 'Government Employee' },
  { value: 'private_employee', label: 'Private Employee' },
  { value: 'msme_owner', label: 'MSME / Business Owner' },
  { value: 'startup_founder', label: 'Startup Founder' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'other', label: 'Other' },
]

const INCOME_OPTIONS = [
  { value: 'below_1L', label: 'Below ₹1 lakh' },
  { value: '1L_3L', label: '₹1 – 3 lakh' },
  { value: '3L_6L', label: '₹3 – 6 lakh' },
  { value: '6L_8L', label: '₹6 – 8 lakh' },
  { value: 'above_8L', label: 'Above ₹8 lakh' },
]

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'ews', label: 'EWS' },
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'transgender', label: 'Transgender' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const EDUCATION_OPTIONS = [
  { value: 'none', label: 'No formal education' },
  { value: 'primary', label: 'Primary (up to Class 8)' },
  { value: 'secondary', label: 'Secondary (Class 10 / 12)' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Post-graduate or Doctorate' },
]

const DISABILITY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'locomotor', label: 'Locomotor' },
  { value: 'visual', label: 'Visual' },
  { value: 'hearing', label: 'Hearing' },
  { value: 'intellectual', label: 'Intellectual' },
  { value: 'other', label: 'Other' },
]

export default function ProfilePage() {
  const { profile, completeness, loading, updateProfile } = useProfile()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        state: profile.state || '',
        district: profile.district || '',
        category: profile.category || '',
        occupation: profile.occupation || '',
        income_band: profile.income_band || '',
        education_level: profile.education_level || '',
        disability_status: profile.disability_status || 'none',
        preferred_language: profile.preferred_language || 'en',
      })
    }
  }, [profile])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    // Build payload — only send fields the backend accepts
    const payload = {}
    if (form.full_name) payload.full_name = form.full_name
    if (form.age) payload.age = parseInt(form.age, 10)
    if (form.gender) payload.gender = form.gender
    if (form.state) payload.state = form.state
    if (form.district) payload.district = form.district
    if (form.category) payload.category = form.category
    if (form.occupation) payload.occupation = form.occupation
    if (form.income_band) payload.income_band = form.income_band
    if (form.education_level) payload.education_level = form.education_level
    if (form.disability_status) payload.disability_status = form.disability_status
    if (form.preferred_language) payload.preferred_language = form.preferred_language

    try {
      await updateProfile(payload)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile) return <PageLoader />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <ProfileCompletenessRing percentage={completeness} size={72} />
        <div>
          <h1 className="page-title">Citizen Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your profile drives personalized scheme recommendations and eligibility checks.
          </p>
          {completeness < 80 && (
            <p className="text-xs text-amber-700 mt-1 font-medium">
              Complete your profile to unlock accurate eligibility checks.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Alerts */}
        {success && (
          <div role="alert" className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            Profile updated successfully!
          </div>
        )}
        {error && (
          <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full-name" className="label">Full Name</label>
              <input
                id="full-name"
                type="text"
                className="input-field"
                value={form.full_name || ''}
                onChange={(e) => set('full_name', e.target.value)}
                placeholder="Enter your full name"
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="profile-age" className="label">Age</label>
              <input
                id="profile-age"
                type="number"
                min="1"
                max="120"
                className="input-field"
                value={form.age || ''}
                onChange={(e) => set('age', e.target.value)}
                placeholder="Your age"
              />
            </div>
            <div>
              <label htmlFor="profile-gender" className="label">Gender</label>
              <select
                id="profile-gender"
                className="input-field"
                value={form.gender || ''}
                onChange={(e) => set('gender', e.target.value)}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-category" className="label">Category</label>
              <select
                id="profile-category"
                className="input-field"
                value={form.category || ''}
                onChange={(e) => set('category', e.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Location</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-state" className="label">State</label>
              <select
                id="profile-state"
                className="input-field"
                value={form.state || ''}
                onChange={(e) => set('state', e.target.value)}
              >
                <option value="">Select state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-district" className="label">District</label>
              <input
                id="profile-district"
                type="text"
                className="input-field"
                value={form.district || ''}
                onChange={(e) => set('district', e.target.value)}
                placeholder="Enter your district"
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* Work & Income */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Work &amp; Income</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-occupation" className="label">Occupation</label>
              <select
                id="profile-occupation"
                className="input-field"
                value={form.occupation || ''}
                onChange={(e) => set('occupation', e.target.value)}
              >
                <option value="">Select occupation</option>
                {OCCUPATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-income" className="label">Annual Family Income</label>
              <select
                id="profile-income"
                className="input-field"
                value={form.income_band || ''}
                onChange={(e) => set('income_band', e.target.value)}
              >
                <option value="">Select income band</option>
                {INCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Identity */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Education &amp; Disability</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-education" className="label">Education Level</label>
              <select
                id="profile-education"
                className="input-field"
                value={form.education_level || ''}
                onChange={(e) => set('education_level', e.target.value)}
              >
                <option value="">Select level</option>
                {EDUCATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-disability" className="label">Disability Status</label>
              <select
                id="profile-disability"
                className="input-field"
                value={form.disability_status || 'none'}
                onChange={(e) => set('disability_status', e.target.value)}
              >
                {DISABILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Preferences</h2>
          <div>
            <label htmlFor="profile-language" className="label">Preferred Language for AI Responses</label>
            <select
              id="profile-language"
              className="input-field"
              value={form.preferred_language || 'en'}
              onChange={(e) => set('preferred_language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving
            ? <><LoadingSpinner size="sm" className="text-white" /> Saving...</>
            : <><Save className="w-4 h-4" aria-hidden="true" /> Save Profile</>
          }
        </button>
      </form>
    </div>
  )
}
