export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    nav: {
      dashboard: "Dashboard",
      history: "Activity History",
      schedule: "My Schedule",
      protocols: "Site Protocols",
      incidents: "Report Incident",
      timeOff: "Time Off",
      settings: "Settings",
      logout: "Secure Logout"
    },
    common: {
      save: "Save Actions",
      cancel: "Cancel",
      submit: "Submit Directive",
      loading: "Loading Systems...",
      search: "Global Search..."
    },
    dashboard: {
      greeting: "Hello",
      rank: "Field Operative",
      locationHeading: "Deployed Site",
      pendingTasks: "Pending Checklists",
      completedTasks: "Checklists Complete",
      activeShift: "Active Shift Block",
      checkIn: "Initiate Primary Check-in",
      checkOut: "Terminate Operational Shift",
      reportIssue: "Report Anomaly",
      timeOffReq: "Request Leave",
      metrics: "Core Metrics",
      efficiency: "Duty Efficiency",
      attendance: "Attendance Index"
    },
    incidents: {
      title: "Incident Control",
      report: "Report New Incident",
      type: "Anomaly Type",
      severity: "Severity Level",
      description: "Situation Description",
      submit: "Authorize Report"
    },
    protocols: {
      title: "Site Protocols",
      enforce: "Enforce Protocol",
      assigned: "Facility Specific Directives",
      none: "No active protocols for this deployment."
    },
    schedule: {
      title: "Shift Roster",
      current: "Active Operational Block",
      upcoming: "Future Deployments",
      noShifts: "No assigned shifts found."
    },
    timeoff: {
      title: "Leave Management",
      subtitle: "Submit and track absence requests",
      newRequest: "New Leave Request",
      type: "Leave Type",
      startDate: "Start Date",
      endDate: "End Date",
      reason: "Reason",
      status: "Status",
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected"
    },
    settings: {
      title: "Profile & Identity",
      subtitle: "Manage localization and secure preferences",
      identity: "Operative Profile",
      preferences: "System Preferences",
      language: "Interface Language",
      theme: "Ocular Theme",
      lightMode: "Light Mode",
      darkMode: "Dark Mode"
    }
  },
  hi: {
    nav: {
      dashboard: "डैशबोर्ड",
      history: "गतिविधि इतिहास",
      schedule: "मेरी अनुसूची",
      protocols: "साइट प्रोटोकॉल",
      incidents: "घटना की रिपोर्ट",
      timeOff: "छुट्टी",
      settings: "सेटिंग्स",
      logout: "सुरक्षित प्रस्थान"
    },
    common: {
      save: "सहेजें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      loading: "लोड हो रहा है...",
      search: "खोजें..."
    },
    dashboard: {
      greeting: "नमस्ते",
      rank: "क्षेत्र परिचारक",
      locationHeading: "तैनात साइट",
      pendingTasks: "लंबित कार्य",
      completedTasks: "पूरे किए गए कार्य",
      activeShift: "सक्रिय शिफ्ट",
      checkIn: "चेक-इन आरंभ करें",
      checkOut: "शिफ्ट समाप्त करें",
      reportIssue: "समस्या दर्ज करें",
      timeOffReq: "छुट्टी का अनुरोध",
      metrics: "मुख्य मेट्रिक्स",
      efficiency: "कार्य कुशलता",
      attendance: "उपस्थिति सूचकांक"
    },
    incidents: {
      title: "घटना नियंत्रण",
      report: "नई घटना की रिपोर्ट करें",
      type: "प्रकार",
      severity: "गंभीरता",
      description: "विवरण",
      submit: "रिपोर्ट जमा करें"
    },
    protocols: {
      title: "साइट प्रोटोकॉल",
      enforce: "प्रोटोकॉल लागू करें",
      assigned: "संयंत्र विशिष्ट निर्देश",
      none: "इस तैनाती के लिए कोई सक्रिय प्रोटोकॉल नहीं।"
    },
    schedule: {
      title: "शिफ्ट रोस्टर",
      current: "सक्रिय शिफ्ट",
      upcoming: "आगामी तैनाती",
      noShifts: "कोई निर्धारित शिफ्ट नहीं मिली।"
    },
    timeoff: {
      title: "छुट्टी प्रबंधन",
      subtitle: "छुट्टी का अनुरोध करें और ट्रैक करें",
      newRequest: "नया अनुरोध",
      type: "छुट्टी का प्रकार",
      startDate: "प्रारंभ तिथि",
      endDate: "अंतिम तिथि",
      reason: "कारण",
      status: "स्थिति",
      approved: "स्वीकृत",
      pending: "लंबित",
      rejected: "अस्वीकृत"
    },
    settings: {
      title: "प्रोफ़ाइल पहचान",
      subtitle: "भाषा और प्राथमिकताएं प्रबंधित करें",
      identity: "परिचारक प्रोफ़ाइल",
      preferences: "सिस्टम प्राथमिकताएं",
      language: "इंटरफ़ेस की भाषा",
      theme: "अंधेरा/हल्का मोड",
      lightMode: "हल्का मोड",
      darkMode: "अंधेरा मोड"
    }
  },
  mr: {
    nav: {
      dashboard: "डॅशबोर्ड",
      history: "क्रियाकलाप इतिहास",
      schedule: "माझे वेळापत्रक",
      protocols: "साइट प्रोटोकॉल",
      incidents: "घटनेचा अहवाल",
      timeOff: "रजा",
      settings: "सेटिंग्ज",
      logout: "सुरक्षित बाहेर पडा"
    },
    common: {
      save: "नोंद करा",
      cancel: "रद्द करा",
      submit: "सबमिट करा",
      loading: "लोड होत आहे...",
      search: "शोधा..."
    },
    dashboard: {
      greeting: "नमस्कार",
      rank: "क्षेत्र कामगार",
      locationHeading: "नेमलेली साइट",
      pendingTasks: "प्रलंबित कामे",
      completedTasks: "पूर्ण झालेली कामे",
      activeShift: "सक्रिय शिफ्ट",
      checkIn: "चेक-इन सुरू करा",
      checkOut: "शिफ्ट संपवा",
      reportIssue: "समस्या नोंदवा",
      timeOffReq: "रजेची विनंती करा",
      metrics: "मुख्य मेट्रिक्स",
      efficiency: "कार्यक्षमता",
      attendance: "उपस्थिती निर्देशांक"
    },
    incidents: {
      title: "घटना नियंत्रण",
      report: "नवीन घटनेची नोंद करा",
      type: "प्रकार",
      severity: "तीव्रता",
      description: "वर्णन",
      submit: "अहवाल सादर करा"
    },
    protocols: {
      title: "साइट प्रोटोकॉल",
      enforce: "प्रोटोकॉल लागू करा",
      assigned: "सुविधा विशिष्ट सूचना",
      none: "या ड्युटीसाठी कोणतेही सक्रिय प्रोटोकॉल नाहीत."
    },
    schedule: {
      title: "शिफ्ट रोस्टर",
      current: "सक्रिय शिफ्ट",
      upcoming: "पुढील ड्युटी",
      noShifts: "कोणतेही वेळापत्रक सापडले नाही."
    },
    timeoff: {
      title: "रजा व्यवस्थापन",
      subtitle: "रजेची विनंती करा आणि ट्रॅक करा",
      newRequest: "नवीन विनंती",
      type: "रजेचा प्रकार",
      startDate: "सुरुवात तारीख",
      endDate: "शेवटची तारीख",
      reason: "कारण",
      status: "स्थिती",
      approved: "मंजूर",
      pending: "प्रलंबित",
      rejected: "नाकारले"
    },
    settings: {
      title: "प्रोफाइल ओळख",
      subtitle: "भाषा आणि प्राधान्ये व्यवस्थापित करा",
      identity: "कामगार प्रोफाइल",
      preferences: "सिस्टम प्राधान्ये",
      language: "इंटरफेसची भाषा",
      theme: "डार्क/लाईट मोड",
      lightMode: "लाईट मोड",
      darkMode: "डार्क मोड"
    }
  }
};
