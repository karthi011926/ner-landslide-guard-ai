import os
import re
from typing import Dict, Any, List, Optional
import requests
from app.data.ner_geo import NER_DISTRICTS, HIGHWAY_CORRIDORS, HISTORICAL_HOTSPOTS

class NERDisasterChatbot:
    """
    Multilingual & Voice-First Conversational AI Engine for North East India.
    Designed specifically for non-literate and multilingual citizens who speak
    via voice in Assamese, Hindi, Bengali, Nepali, Mizo, Khasi, or English.
    """

    DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

    # Multi-dialect Emergency Knowledge Base
    MULTILINGUAL_RESPONSES = {
        "hi": {
            "highway_nh10": "NH-10 (सिक्किम): कलिझोरा और 29th माइल पर भूस्खलन के कारण रास्ता खतरनाक और बंद है। कृपया लावा-पेदोंग-रंगपो बाईपास रास्ते से जाएं।",
            "highway_nh29": "NH-29 (नागालैंड): दिमापुर से कोहिमा के बीच जूद्ज़ा नदी के पास भारी कीचड़ और जमीन धंस रही है। नीउलैंड बाईपास का इस्तेमाल करें।",
            "crack": "यदि सड़क या पहाड़ पर दरार दिखे: तुरंत उस जगह से दूर हटें। पहाड़ की ढलान के किनारे गाड़ी न रोकें और 1033 या 112 पर कॉल करें।",
            "emergency": "आपातकालीन हेल्पलाइन: राष्ट्रीय आपातकाल: 112 | SDRF आपदा राहत: 1070 | हाईवे हेल्पलाइन: 1033",
            "general": "मैं उत्तर-पूर्वी क्षेत्र का आपदा सुरक्षा सहायक हूँ। आप किसी भी भाषा में बोलकर सड़क की स्थिति, खतरे या मदद के बारे में पूछ सकते हैं।"
        },
        "as": {
            "highway_nh10": "NH-10 (ছিকিম): কালিঝোৰাত ভূমিস্খলনৰ বাবে পথ বন্ধ। লাভা-পেডং-ৰাংপো বাইপাছ পথেৰে যাওক।",
            "highway_nh29": "NH-29 (নাগালেণ্ড): ডিমাাপুৰৰ পৰা ক'হিমাৰ জুডজা অঞ্চলত ডাঙৰ মাটি খহিছে। নিউলেণ্ড পথেৰে যাওক।",
            "crack": "যদি পথত ফাঁট বা মাটি খহা দেখা পায়: তৎক্ষণাত আঁতৰি যাওক আৰু ১০৭০ বা ১১২ ত ফোন কৰক।",
            "emergency": "জৰুৰীকালীন নম্বৰ: ১১২ বা ১০৭০ (SDRF)",
            "general": "মই উত্তৰ-পূৰ্বাঞ্চলৰ দুৰ্যোগ নিয়ন্ত্ৰণ সহায়ক। আপুনি কথা কৈ যিকোনো প্ৰশ্ন সুধিব পাৰে।"
        },
        "bn": {
            "highway_nh10": "NH-10 (সিকিম): কালিম্পং ও তিস্তার কাছে ধসের কারণে রাস্তা বিপজ্জনক। লাভা হয়ে বিকল্প রাস্তায় চলুন।",
            "highway_nh29": "NH-29 (নাগাল্যান্ড): জুতজা ব্রিজের কাছে বিশাল ধস নেমেছে। বিকল্প রাস্তা ব্যবহার করুন।",
            "crack": "রাস্তায় ফাটল দেখলে সঙ্গে সঙ্গে নিরাপদ দূরত্বে সরে যান এবং ১০৭০ বা ১১২ এ জানান।",
            "emergency": "জরুরি নম্বর: ১১২ এবং ১০৭০ (SDRF)",
            "general": "আমি উত্তর-পূর্ব দুর্যোগ সুরক্ষা সহায়ক। আপনি কথা বলে যেকোনো তথ্য জানতে পারেন।"
        }
    }

    @classmethod
    def detect_language(cls, text: str) -> str:
        """Detects if query is in Assamese/Bengali, Devanagari (Hindi/Nepali), or English."""
        # Check Devanagari
        if re.search(r'[\u0900-\u097F]', text):
            return "hi"
        # Check Bengali / Assamese script
        if re.search(r'[\u0980-\u09FF]', text):
            return "as"
        return "en"

    @classmethod
    def process_query(cls, question: str, scenario: str = "cloudburst_monsoon", user_api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes spoken voice query in ANY language.
        """
        lang = cls.detect_language(question)
        q = question.lower().strip()

        # 1. Check if server-side or user Gemini LLM is available for free-form multi-lingual reasoning
        key = user_api_key or cls.DEFAULT_GEMINI_KEY
        if key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
                prompt = (
                    f"You are NER Landslide Guard AI, a voice emergency assistant for citizens and travelers in North East India. "
                    f"The user spoke this question (in their native language). Answer clearly, concisely, and empathetically in the SAME language so it can be read aloud via voice TTS:\n\n{question}"
                )
                resp = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=6.0)
                if resp.status_code == 200:
                    answer = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "source": "AI_LLM_VOICE",
                        "lang": lang,
                        "title": "Voice Assistant Response",
                        "answer": answer,
                        "suggested_actions": ["Check Safe Bypass", "Report Crack with AI", "Emergency Numbers"]
                    }
            except Exception:
                pass

        # 2. Autonomous Multilingual Engine (Zero Configuration - Instant Voice Response)
        
        # Hindi / Devanagari Voice Handling
        if lang == "hi":
            if any(w in q for w in ["nh-10", "nh10", "सिक्किम", "गैंगटोक", "सिलीगुड़ी", "रास्ता", "सड़क"]):
                ans = cls.MULTILINGUAL_RESPONSES["hi"]["highway_nh10"]
            elif any(w in q for w in ["nh-29", "nh29", "नागालैंड", "कोहिमा", "दीमापुर"]):
                ans = cls.MULTILINGUAL_RESPONSES["hi"]["highway_nh29"]
            elif any(w in q for w in ["दरार", "फटा", "पत्थर", "मिट्टी", "भूस्खलन"]):
                ans = cls.MULTILINGUAL_RESPONSES["hi"]["crack"]
            elif any(w in q for w in ["नंबर", "मदद", "फ़ोन", "कॉल", "हेल्प"]):
                ans = cls.MULTILINGUAL_RESPONSES["hi"]["emergency"]
            else:
                ans = f"उत्तर-पूर्वी क्षेत्र में भारी बारिश के कारण पहाड़ी ढलानों पर भूस्खलन का खतरा है। NH-10 और NH-29 पर सतर्कता बरतें। आपातकाल में 112 या 1070 पर कॉल करें।"

            return {
                "source": "AUTONOMOUS_VOICE_AI",
                "lang": "hi",
                "title": "आपदा सुरक्षा सहायक (Hindi Voice)",
                "answer": ans,
                "suggested_actions": ["Emergency Numbers", "View Safe Bypass Route"]
            }

        # Assamese Voice Handling
        elif lang == "as":
            if any(w in q for w in ["nh-10", "nh10", "ছিকিম", "গেংটক"]):
                ans = cls.MULTILINGUAL_RESPONSES["as"]["highway_nh10"]
            elif any(w in q for w in ["nh-29", "nh29", "নাগালেণ্ড", "ক'হিমা"]):
                ans = cls.MULTILINGUAL_RESPONSES["as"]["highway_nh29"]
            elif any(w in q for w in ["ফাঁট", "মাটি", "পাহাৰ", "খহি"]):
                ans = cls.MULTILINGUAL_RESPONSES["as"]["crack"]
            else:
                ans = f"উত্তৰ-পূৰ্বাঞ্চলত নেৰানেপেৰা বৰষুণৰ বাবে পাহাৰীয়া অঞ্চলত ভূমিস্খলনৰ আশংকা আছে। যিকোনো সহায়ৰ বাবে ১০৭০ নম্বৰত ফোন কৰক।"

            return {
                "source": "AUTONOMOUS_VOICE_AI",
                "lang": "as",
                "title": "দুৰ্যোগ সহায়ক (Assamese Voice)",
                "answer": ans,
                "suggested_actions": ["Emergency Contacts", "Safe Route"]
            }

        # English / General Voice Handling
        else:
            if any(w in q for w in ["nh-10", "nh10", "gangtok", "sikkim", "siliguri", "teesta"]):
                return {
                    "source": "AUTONOMOUS_VOICE_AI",
                    "lang": "en",
                    "title": "Highway Status: NH-10 (Sikkim)",
                    "answer": (
                        "⚠️ **NH-10 Highway Alert:** The road to Gangtok via Kalijhora is restricted due to landslide debris. "
                        "Please travel via the **Damdim ➔ Lava ➔ Pedong ➔ Rangpo safe bypass route**."
                    ),
                    "suggested_actions": ["View Safe Bypass on Map", "Report Road Obstruction", "Emergency Contacts"]
                }

            elif any(w in q for w in ["nh-29", "nh29", "kohima", "dimapur", "nagaland", "dzüdza"]):
                return {
                    "source": "AUTONOMOUS_VOICE_AI",
                    "lang": "en",
                    "title": "Highway Status: NH-29 (Nagaland)",
                    "answer": (
                        "🚨 **NH-29 Alert:** The Dzüdza valley sinking zone is experiencing severe mudslides. "
                        "All traffic is being diverted via the **Niuland ➔ Ghaspani ➔ Peducha bypass**."
                    ),
                    "suggested_actions": ["Switch to Safe Evacuation Tab", "Call Nagaland Control: 1070"]
                }

            elif any(w in q for w in ["crack", "fissure", "broken", "bulge", "hole", "spot", "saw", "slide"]):
                return {
                    "source": "AUTONOMOUS_VOICE_AI",
                    "lang": "en",
                    "title": "Action Guide: Road Crack Spotted",
                    "answer": (
                        "⚠️ **Immediate Safety Steps:**\n"
                        "1. Move away from the slope edge immediately.\n"
                        "2. Click the camera button on this page to take a photo—our AI will verify it and alert road rescue teams.\n"
                        "3. Call highway control at `1033` or disaster response at `112`."
                    ),
                    "suggested_actions": ["Open Field Report Scanner", "Call Highway Police 1033"]
                }

            elif any(w in q for w in ["number", "helpline", "call", "sdrf", "ndrf", "police", "ambulance", "contact"]):
                return {
                    "source": "AUTONOMOUS_VOICE_AI",
                    "lang": "en",
                    "title": "Emergency Helplines (24x7)",
                    "answer": (
                        "📞 **All-India Emergency:** `112`\n"
                        "• **Disaster Relief (SDRF):** `1070` / `1077`\n"
                        "• **Highway Helpline:** `1033`\n"
                        "• **NDRF Control Room:** `+91-9711077372`"
                    ),
                    "suggested_actions": ["Test Village Siren", "Broadcast Voice Siren"]
                }

            else:
                return {
                    "source": "AUTONOMOUS_VOICE_AI",
                    "lang": "en",
                    "title": "NER Disaster Assistant",
                    "answer": (
                        f"I am monitoring 10 mountain districts across the North East under active rain conditions. "
                        f"For your question on \"{question}\": please avoid travelling on steep unsupported hillside roads during heavy rain. "
                        f"In case of emergency, call `112` or `1070` immediately."
                    ),
                    "suggested_actions": ["Check NH-10 Status", "Check NH-29 Status", "Emergency Contacts"]
                }
