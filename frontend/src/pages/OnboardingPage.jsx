import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { CheckCircle, ChevronRight, ChevronLeft, Zap } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import clsx from 'clsx'

const STEPS = [
  { id: 'location', title: 'Your Location', desc: 'Helps us find state-specific schemes' },
  { id: 'identity', title: 'About You', desc: 'Personal details for eligibility matching' },
  { id: 'occupation', title: 'Work & Income', desc: 'Occupation and income for scheme filters' },
  { id: 'preferences', title: 'Preferences', desc: 'Language and accessibility settings' },
]

const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Jammu and Kashmir', 'Ladakh',
]

// All values must exactly match backend ProfileUpdateSchema enums
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

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateProfile } = useProfile()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [data, setData] = useState({
    state: '',
    district: '',
    age: '',
    gender: '',
    category: '',
    disability_status: 'none',
    occupation: '',
    income_band: '',
    education_level: '',
    preferred_language: 'en',
  })

  const set = (field, value) => setData((d) => ({ ...d, [field]: value }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleFinish = async () => {
    setSaving(true)
    setError(null)
    // Build payload with only non-empty values
    const payload = {}
    if (data.state) payload.state = data.state
    if (data.district) payload.district = data.district
    if (data.age) payload.age = parseInt(data.age, 10)
    if (data.gender) payload.gender = data.gender
    if (data.category) payload.category = data.category
    if (data.disability_status && data.disability_status !== 'none') {
      payload.disability_status = data.disability_status
    } else {
      payload.disability_status = 'none'
    }
    if (data.occupation) payload.occupation = data.occupation
    if (data.income_band) payload.income_band = data.income_band
    if (data.education_level) payload.education_level = data.education_level
    payload.preferred_language = data.preferred_language || 'en'

    try {
      await updateProfile(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const skip = () => navigate('/dashboard')

  const progressPct = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center" aria-hidden="true">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900">BharatSeva AI</p>
        </div>
        <button onClick={skip} className="text-sm text-gray-500 hover:text-gray-700">
          Skip for now
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Step {step + 1} of {STEPS.length}</span>
              <span>{Math.round(progressPct)}% complete</span>
            </div>
            <div
              className="h-1.5 bg-gray-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold',
                    i < step && 'bg-emerald-500 text-white',
                    i === step && 'bg-blue-600 text-white',
                    i > step && 'bg-gray-200 text-gray-500',
                  )}>
                    {i < step ? <CheckCircle className="w-3 h-3" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={clsx('w-4 h-px', i < step ? 'bg-emerald-400' : 'bg-gray-200')} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step card */}
          <div className="card p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-1">{STEPS[step].title}</h2>
                <p className="text-sm text-gray-500 mb-6">{STEPS[step].desc}</p>

                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="state-select" className="label">State</label>
                      <select
                        id="state-select"
                        className="input-field"
                        value={data.state}
                        onChange={(e) => set('state', e.target.value)}
                      >
                        <option value="">Select your state</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="district-input" className="label">
                        District <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="district-input"
                        type="text"
                        className="input-field"
                        value={data.district}
                        onChange={(e) => set('district', e.target.value)}
                        placeholder="Enter your district"
                        maxLength={100}
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="age-input" className="label">Age</label>
                      <input
                        id="age-input"
                        type="number"
                        min="1"
                        max="120"
                        className="input-field"
                        value={data.age}
                        onChange={(e) => set('age', e.target.value)}
                        placeholder="Your age"
                      />
                    </div>
                    <div>
                      <label htmlFor="gender-select" className="label">Gender</label>
                      <select
                        id="gender-select"
                        className="input-field"
                        value={data.gender}
                        onChange={(e) => set('gender', e.target.value)}
                      >
                        <option value="">Select gender</option>
                        {GENDER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="category-select" className="label">Category</label>
                      <select
                        id="category-select"
                        className="input-field"
                        value={data.category}
                        onChange={(e) => set('category', e.target.value)}
                      >
                        <option value="">Select category</option>
                        {CATEGORY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="education-select" className="label">Education Level</label>
                      <select
                        id="education-select"
                        className="input-field"
                        value={data.education_level}
                        onChange={(e) => set('education_level', e.target.value)}
                      >
                        <option value="">Select education level</option>
                        {EDUCATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="disability-select" className="label">Disability Status</label>
                      <select
                        id="disability-select"
                        className="input-field"
                        value={data.disability_status}
                        onChange={(e) => set('disability_status', e.target.value)}
                      >
                        <option value="none">None</option>
                        <option value="locomotor">Locomotor</option>
                        <option value="visual">Visual</option>
                        <option value="hearing">Hearing</option>
                        <option value="intellectual">Intellectual</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="occupation-select" className="label">Occupation</label>
                      <select
                        id="occupation-select"
                        className="input-field"
                        value={data.occupation}
                        onChange={(e) => set('occupation', e.target.value)}
                      >
                        <option value="">Select occupation</option>
                        {OCCUPATION_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="income-select" className="label">Annual Family Income</label>
                      <select
                        id="income-select"
                        className="input-field"
                        value={data.income_band}
                        onChange={(e) => set('income_band', e.target.value)}
                      >
                        <option value="">Select income band</option>
                        {INCOME_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <span className="label" id="lang-label">Preferred Language for AI Responses</span>
                      <div className="flex gap-3" role="radiogroup" aria-labelledby="lang-label">
                        {[
                          { code: 'en', label: 'English' },
                          { code: 'hi', label: 'हिन्दी (Hindi)' },
                        ].map(({ code, label }) => (
                          <label
                            key={code}
                            className={clsx(
                              'flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors',
                              data.preferred_language === code
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300',
                            )}
                          >
                            <input
                              type="radio"
                              name="language"
                              value={code}
                              checked={data.preferred_language === code}
                              onChange={() => set('preferred_language', code)}
                              className="sr-only"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-sm font-semibold text-emerald-800 mb-1">You're all set!</p>
                      <p className="text-xs text-emerald-700">
                        We'll use your profile to find the most relevant government schemes for you.
                        You can update this anytime in Settings.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <button onClick={back} disabled={step === 0} className="btn-secondary">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary">
                Continue
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving} className="btn-primary">
                {saving
                  ? <LoadingSpinner size="sm" className="text-white" />
                  : 'Complete setup'
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
