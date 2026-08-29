from typing import Dict, Any, List

class MultilingualAlertService:
    """
    Emergency Multilingual Early Warning & Last-Mile Resilient Alert Service.
    Supports 8 languages of the North Eastern Region with SMS, IVR Voice, and Low-Bandwidth SMS decoding.
    """

    LANGUAGE_TEMPLATES = {
        "en": {
            "name": "English",
            "lang_code": "en-IN",
            "severe": "EMERGENCY ALERT: High risk of sudden landslide in {location} due to continuous heavy rain. Evacuate to higher ground immediately. NH/Road closed.",
            "high": "LANDSLIDE WARNING: Critical slope saturation in {location}. Avoid mountain highways and stay alert for ground fissures.",
            "moderate": "LANDSLIDE ADVISORY: Moderate rainfall risk in {location}. Travelers advised caution."
        },
        "hi": {
            "name": "Hindi (हिन्दी)",
            "lang_code": "hi-IN",
            "severe": "आपातकालीन चेतावनी: लगातार भारी बारिश के कारण {location} में भूस्खलन का भारी खतरा। तुरंत सुरक्षित स्थान पर जाएं। सड़कें बंद हैं।",
            "high": "भूस्खलन चेतावनी: {location} में ढलानों पर भारी जलभराव। पहाड़ी रास्तों पर यात्रा से बचें और दरारों पर नजर रखें।",
            "moderate": "भूस्खलन सलाह: {location} में मध्यम बारिश के कारण भूस्खलन का खतरा। सतर्क रहें।"
        },
        "as": {
            "name": "Assamese (অসমীয়া)",
            "lang_code": "as-IN",
            "severe": "জৰুৰী সতৰ্কবাৰ্তা: ধাৰাসাৰ বৰষুণৰ বাবে {location} ত ভূমিস্খলনৰ প্ৰচণ্ড আশংকা। তাৎক্ষণিকভাৱে নিৰাপদ স্থানলৈ যাওক। পথ বন্ধ কৰা হৈছে।",
            "high": "ভূমিস্খলনৰ সতৰ্কবাৰ্তা: {location} ত পাহাৰীয়া ঢালত পানীৰ জমা হৈছে। পাহাৰীয়া ৰাষ্ট্ৰীয় ঘাইপথ পৰিহাৰ কৰক।",
            "moderate": "ভূমিস্খলনৰ পৰামৰ্শ: {location} অঞ্চলত সাৱধানতা অৱলম্বন কৰক।"
        },
        "bn": {
            "name": "Bengali (বাংলা)",
            "lang_code": "bn-IN",
            "severe": "জরুরি সতর্কতা: একটানা ভারী বৃষ্টির কারণে {location} এলাকায় মারাত্মক ভূমিধসের আশঙ্কা। অবিলম্বে নিরাপদ স্থানে যান।",
            "high": "ভূমিধসের সতর্কতা: {location} এলাকায় পাহাড়ের ঢাল বিপজ্জনক। পাহাড়ি রাস্তা এড়িয়ে চলুন।",
            "moderate": "ভূমিধস পরামর্শ: {location} এলাকায় যাতায়াতের সময় সতর্ক থাকুন।"
        },
        "mni": {
            "name": "Manipuri (Meitei / ꯃꯩꯇꯩꯂꯣꯟ)",
            "lang_code": "mni-IN",
            "severe": "ꯑꯀꯟꯕ ꯆꯦꯛꯁꯤꯟꯋꯥ: ꯅꯣꯡ ꯀꯟꯅ ꯆꯨꯕꯅ ꯃꯔꯝ ꯑꯣꯏꯗꯨꯅ {location} ꯗ ꯆꯤꯡ ꯇꯨꯝꯕꯒꯤ ꯑꯀꯟꯕ ꯈꯨꯗꯣꯡꯊꯤꯕ ꯩꯔꯦ। ꯈꯨꯗꯛꯇ ꯆꯦꯡꯁꯤꯜꯂꯨ।",
            "high": "ꯆꯤꯡ ꯇꯨꯝꯕꯒꯤ ꯆꯦꯛꯁꯤꯟꯋꯥ: {location} ꯗ ꯂꯝꯕꯤꯁꯤꯡ ꯊꯨꯡꯂꯝꯕꯗ ꯆꯦꯛꯁꯤꯟꯕꯤꯌꯨ।",
            "moderate": "ꯆꯦꯛꯁꯤꯟ ꯄꯥꯎꯇꯥꯛ: {location} ꯗ ꯆꯠꯊꯣꯛ-ꯆꯠꯁꯤꯟ ꯇꯧꯕꯗ ꯆꯦꯛꯁꯤꯟꯕꯤꯌꯨ।"
        },
        "mzo": {
            "name": "Mizo (Mizo ṭawng)",
            "lang_code": "en-US", # TTS fallback
            "severe": "THU HRUHNA CHIAH: Ruah sur nasat avangin {location}-ah leimin hlauhawm tak a awm. Hmun him lam pan nghal rawh u. Kawngpui khar a ni.",
            "high": "LEIMIN HLAUHAWM: {location}-ah tlangpang a nghet lo. Tlang kawng zawh pumpelh ula, fimkhur rawh u.",
            "moderate": "LEIMIN FIMKHURNA: {location} chhehvelah ruah tlem a sur avangin fimkhur tur a ni."
        },
        "kha": {
            "name": "Khasi (Ka Ktien Khasi)",
            "lang_code": "en-US",
            "severe": "KA JINGMAHAM KYRKIEH: Ka jingtwa khyndew kaba jur ha {location} na ka daw ka jingther u slap. Kynrih noh sha ki jaka kiba shngain.",
            "high": "JINGMAHAM TWA KHYNDEW: Ki lum ha {location} ki don ha ka jingma. Kieng noh na ki surok lum.",
            "moderate": "JINGPYNSNGEW: Sumar bha ha ka leit ka wan ha {location}."
        },
        "gar": {
            "name": "Garo (A·chik)",
            "lang_code": "en-US",
            "severe": "JAGOKANI MIKRAKANI: Mikka jimaniko man·e {location}-o a·a be·ani dal·begipa kenani donga. Bakbak chel·ao katbo. Rama chipaha.",
            "high": "A·A BE·ANI MIKRAKANI: {location}-o a·bri be·nasienga. Ramako re·on seng·e re·bo.",
            "moderate": "MIKRAKATANI: {location}-o mikka jimaniko man·e seng·e dongbo."
        }
    }

    @classmethod
    def generate_multilingual_alert(cls, location_name: str, severity: str = "SEVERE") -> Dict[str, Any]:
        """
        Builds ready-to-broadcast payloads across 8 NER regional languages.
        """
        sev_key = severity.lower() if severity.lower() in ["severe", "high", "moderate"] else "moderate"
        
        messages = {}
        for code, lang in cls.LANGUAGE_TEMPLATES.items():
            template = lang.get(sev_key, lang["moderate"])
            messages[code] = {
                "language": lang["name"],
                "lang_code": lang["lang_code"],
                "text": template.format(location=location_name),
                "sms_length": len(template.format(location=location_name))
            }

        return {
            "location": location_name,
            "severity": severity,
            "timestamp": "Live Synchronized Dispatch",
            "channels": ["SMS_GSM", "IVR_VOICE_BROADCAST", "APP_PUSH", "VILLAGE_SIREN_IOT"],
            "translations": messages
        }

    @classmethod
    def decode_field_sms(cls, raw_sms: str) -> Dict[str, Any]:
        """
        Decodes compressed emergency SMS from zero-internet mountain locations.
        Format Example: #SLIDE 25.689 93.992 4 CRACK_DEBRIS_NH29
        """
        raw_sms = raw_sms.strip()
        parts = raw_sms.split()

        if len(parts) < 4 or not parts[0].upper().startswith("#SLIDE"):
            return {
                "success": False,
                "error": "Invalid SMS syntax. Expected: #SLIDE <LAT> <LNG> <SEVERITY_1_TO_4> <NOTES>"
            }

        try:
            lat = float(parts[1])
            lng = float(parts[2])
            sev_num = int(parts[3])
            notes = " ".join(parts[4:]) if len(parts) > 4 else "Field SMS Dispatch"

            sev_map = {1: "LOW", 2: "MODERATE", 3: "HIGH", 4: "SEVERE"}
            sev_str = sev_map.get(sev_num, "HIGH")

            return {
                "success": True,
                "protocol": "OFFLINE_GSM_TELEMETRY",
                "extracted_data": {
                    "lat": lat,
                    "lng": lng,
                    "severity": sev_str,
                    "notes": notes.replace("_", " "),
                    "source": "Emergency SMS Gateway (No Internet Required)"
                }
            }
        except Exception as e:
            return {"success": False, "error": f"Failed to parse SMS parameters: {str(e)}"}
