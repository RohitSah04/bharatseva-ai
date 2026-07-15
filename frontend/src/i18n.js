import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Common
      'loading': 'Loading...',
      'error': 'Something went wrong',
      'retry': 'Try again',
      'save': 'Save',
      'cancel': 'Cancel',
      'confirm': 'Confirm',
      'submit': 'Submit',
      'close': 'Close',
      'back': 'Back',
      'next': 'Next',
      'continue': 'Continue',
      'search': 'Search',
      'filter': 'Filter',
      'clear': 'Clear',
      'view_all': 'View all',
      'see_details': 'See details',
      'learn_more': 'Learn more',
      'apply_now': 'Apply Now',
      'save_scheme': 'Save Scheme',
      'saved': 'Saved',

      // Auth
      'login': 'Log In',
      'signup': 'Sign Up',
      'logout': 'Log out',
      'email': 'Email address',
      'password': 'Password',
      'forgot_password': 'Forgot password?',
      'no_account': "Don't have an account?",
      'have_account': 'Already have an account?',

      // Nav
      'dashboard': 'Dashboard',
      'schemes': 'Schemes',
      'copilot': 'AI Copilot',
      'documents': 'Document Vault',
      'tracker': 'Application Tracker',
      'calendar': 'Deadlines',
      'chat': 'AI Chat',
      'saved_schemes': 'Saved Schemes',
      'notifications': 'Notifications',
      'profile': 'Profile',
      'settings': 'Settings',
      'admin': 'Admin',

      // Scheme
      'eligible': 'Eligible',
      'not_eligible': 'Not Eligible',
      'partially_eligible': 'Partially Eligible',
      'check_eligibility': 'Check Eligibility',
      'confidence': 'Confidence',
      'reasoning': 'Reasoning',
      'sources': 'Sources',

      // Status
      'not_started': 'Not Started',
      'in_progress': 'In Progress',
      'submitted': 'Submitted',
      'approved': 'Approved',
      'rejected': 'Rejected',

      // Degraded
      'degraded_mode': 'AI Degraded',
      'degraded_message': 'AI service is temporarily unavailable. Results are based on rule-based logic.',

      // Goals
      'goal': 'Goal',
      'create_goal': 'Create Goal',
      'activate_plan': 'Activate Plan',
      'draft': 'Draft',
      'active': 'Active',
      'completed': 'Completed',
      'archived': 'Archived',
    },
  },
  hi: {
    translation: {
      'loading': 'लोड हो रहा है...',
      'error': 'कुछ गलत हुआ',
      'retry': 'पुनः प्रयास करें',
      'save': 'सहेजें',
      'cancel': 'रद्द करें',
      'confirm': 'पुष्टि करें',
      'submit': 'जमा करें',
      'close': 'बंद करें',
      'back': 'वापस',
      'next': 'अगला',
      'continue': 'जारी रखें',
      'search': 'खोजें',
      'filter': 'फ़िल्टर',
      'clear': 'साफ़ करें',
      'view_all': 'सभी देखें',
      'see_details': 'विवरण देखें',
      'learn_more': 'और जानें',
      'apply_now': 'अभी आवेदन करें',
      'save_scheme': 'योजना सहेजें',
      'saved': 'सहेजा गया',

      'login': 'लॉग इन',
      'signup': 'साइन अप',
      'logout': 'लॉग आउट',
      'email': 'ईमेल पता',
      'password': 'पासवर्ड',
      'forgot_password': 'पासवर्ड भूल गए?',
      'no_account': 'खाता नहीं है?',
      'have_account': 'पहले से खाता है?',

      'dashboard': 'डैशबोर्ड',
      'schemes': 'योजनाएं',
      'copilot': 'AI कोपायलट',
      'documents': 'दस्तावेज़ वॉल्ट',
      'tracker': 'आवेदन ट्रैकर',
      'calendar': 'समय-सीमा',
      'chat': 'AI चैट',
      'saved_schemes': 'सहेजी योजनाएं',
      'notifications': 'सूचनाएं',
      'profile': 'प्रोफ़ाइल',
      'settings': 'सेटिंग्स',
      'admin': 'व्यवस्थापक',

      'eligible': 'पात्र',
      'not_eligible': 'अपात्र',
      'partially_eligible': 'आंशिक रूप से पात्र',
      'check_eligibility': 'पात्रता जांचें',
      'confidence': 'विश्वास स्तर',
      'reasoning': 'कारण',
      'sources': 'स्रोत',

      'not_started': 'शुरू नहीं',
      'in_progress': 'प्रगति में',
      'submitted': 'जमा किया',
      'approved': 'स्वीकृत',
      'rejected': 'अस्वीकृत',

      'degraded_mode': 'AI सीमित मोड',
      'degraded_message': 'AI सेवा अस्थायी रूप से अनुपलब्ध है। परिणाम नियम-आधारित तर्क पर आधारित हैं।',

      'goal': 'लक्ष्य',
      'create_goal': 'लक्ष्य बनाएं',
      'activate_plan': 'योजना सक्रिय करें',
      'draft': 'मसौदा',
      'active': 'सक्रिय',
      'completed': 'पूर्ण',
      'archived': 'संग्रहीत',
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('bharatseva_lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
