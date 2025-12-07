import React, { useRef, useEffect, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// GLOBAL BUFFERS
let emotionBuffer = [];
let audioBuffer = [];
let behaviorBuffer = [];

// -----------------------------
// HELPER: ADVANCED BEHAVIOR ANALYSIS (IMPROVED)
// -----------------------------
// -----------------------------
// HELPER: FACS-BASED EMOTION & BEHAVIOR ANALYSIS
// -----------------------------
// function getBehaviorAnalysis(blend) {
//   // Helper to get score of a specific blendshape (0 to 1)
//   const get = (name) => blend.find((b) => b.categoryName === name)?.score || 0;

//   // --- 1. MAP BLENDSHAPES TO MUSCLE GROUPS (Action Units) ---
  
//   // Zygomaticus Major (Pulling lip corners up)
//   const smileMuscle = (get("mouthSmileLeft") + get("mouthSmileRight")) / 2;
  
//   // Orbicularis Oculi (Cheek raising/Eye crinkling - Vital for real happiness)
//   const cheekMuscle = (get("cheekSquintLeft") + get("cheekSquintRight")) / 2;
  
//   // Corrugator Supercilii (Brow lowering/furrowing - Anger/Concentration)
//   const browFurrow = (get("browDownLeft") + get("browDownRight")) / 2;
  
//   // Frontalis (Brow raising)
//   const browInnerUp = get("browInnerUp"); // Sadness/Fear
//   const browOuterUp = (get("browOuterUpLeft") + get("browOuterUpRight")) / 2; // Surprise
  
//   // Levator Palpebrae (Upper lid raiser - Surprise/Fear)
//   const eyeWide = (get("eyeWideLeft") + get("eyeWideRight")) / 2;
  
//   // Levator Labii Superioris (Nose wrinkling - Disgust)
//   const noseWrinkle = (get("noseSneerLeft") + get("noseSneerRight")) / 2;
  
//   // Mentalis (Chin raising/Lip pouting - Sadness)
//   const mouthFrown = (get("mouthFrownLeft") + get("mouthFrownRight")) / 2;
  
//   // Orbicularis Oris (Lip tightening/Pressing - Stress/Anger)
//   const lipPress = (get("mouthPressLeft") + get("mouthPressRight")) / 2;
  
//   // Masseter/Pterygoid (Jaw movement)
//   const jawDrop = get("jawOpen");

//   // Eye Gaze
//   const lookOut = get("eyeLookOutLeft") + get("eyeLookOutRight");
//   const lookDown = get("eyeLookDownLeft") + get("eyeLookDownRight");
//   const blink = get("eyeBlinkLeft") + get("eyeBlinkRight");

//   // --- 2. ADVANCED EMOTION DETECTION LOGIC ---
//   // We use combinatorics, not just summing.
  
//   const scores = {
//     // HAPPINESS: Needs both Smile AND Cheek Squint (Duchenne Marker)
//     // If smile is high but cheek is low, it's a "Social/Fake Smile"
//     happy: (smileMuscle * 0.7) + (cheekMuscle * 0.3),

//     // ANGER: Brow Furrow + Lip Press + Wide Eyes (Glare)
//     // We subtract smile to prevent "smiling while frowning" false positives
//     angry: (browFurrow * 0.5) + (lipPress * 0.3) + (get("eyeSquintLeft") * 0.2) - smileMuscle,

//     // SADNESS: Inner Brow Raise + Mouth Frown + Looking Down
//     // Hardest to fake. Inner brows go UP while outer brows stay neutral/down.
//     sad: (browInnerUp * 0.6) + (mouthFrown * 0.4) + (lookDown * 0.2),

//     // SURPRISE: High Brows + Wide Eyes + Jaw Drop
//     surprised: (browOuterUp * 0.4) + (eyeWide * 0.4) + (jawDrop * 0.2),

//     // FEAR: Very similar to surprise, but brows are flatter (Inner Up) and lips are stretched, not just open.
//     fear: (browInnerUp * 0.5) + (eyeWide * 0.4) + (lipPress * 0.1) - (jawDrop * 0.2),

//     // DISGUST: Nose Wrinkle is the primary signal.
//     disgust: noseWrinkle * 1.0 + (mouthFrown * 0.2),
//   };

//   // --- 3. DETERMINE DOMINANT EMOTION ---
//   let detectedEmotion = "neutral";
//   let maxScore = 0.2; // Threshold: Below this is just Neutral face

//   for (const [emo, score] of Object.entries(scores)) {
//     if (score > maxScore) {
//       maxScore = score;
//       detectedEmotion = emo;
//     }
//   }
  
//   // Special Check: Fake Smile Detection
//   // If "happy" wins, but cheek muscle usage is very low compared to smile
//   if (detectedEmotion === "happy" && cheekMuscle < (smileMuscle * 0.3)) {
//       detectedEmotion = "polite_smile"; // Or classify as "neutral/masked"
//   }

//   // --- 4. CALCULATE METRICS (0-100) ---
  
//   // ATTENTION: Penalize looking away/down or excessive blinking
//   let attention = 100 - ((lookOut * 100) + (lookDown * 80) + (blink * 10));
//   attention = Math.max(0, Math.min(100, attention));

//   // STRESS: Lip pressing (anxiety) + Brow Furrow (tension) + Frequent Blinking
//   // We subtract 'happy' because genuine smiling reduces facial tension signals.
//   let stressRaw = (lipPress * 60) + (browFurrow * 50) + (blink * 20) - (smileMuscle * 30);
//   let stressLevel = Math.max(0, Math.min(100, stressRaw));

//   // CONFIDENCE: 
//   // + Steady gaze (Attention)
//   // + Controlled jaw (not hanging open unless speaking)
//   // + Slight smile (Ease)
//   // - Lip pressing (Nervousness)
//   // - Shifty eyes
//   let confidence = 50 + (attention * 0.3) + (smileMuscle * 20) - (lipPress * 40) - (stressLevel * 0.2);
//   confidence = Math.max(0, Math.min(100, confidence));

//   // ENGAGEMENT: High energy expressions (Eyebrows moving, smiling, eyes wide)
//   let engagement = (attention * 0.4) + (smileMuscle * 30) + (browOuterUp * 20) + (eyeWide * 10);
//   engagement = Math.max(0, Math.min(100, engagement));

//   return {
//     emotion: detectedEmotion,
//     attention: Math.round(attention),
//     stressLevel: Math.round(stressLevel),
//     confidence: Math.round(confidence),
//     engagement: Math.round(engagement),
//   };
// }
// -----------------------------
// HELPER 1: UTILITY FOR SMOOTHING
// -----------------------------
function getMostFrequent(arr) {
  if (!arr || arr.length === 0) return "neutral";
  return arr.sort((a,b) =>
        arr.filter(v => v===a).length
      - arr.filter(v => v===b).length
  ).pop();
}

// -----------------------------
// HELPER 2: CORE FACS ANALYSIS (With Calibration)
// -----------------------------
function getBehaviorAnalysis(blend, calibration = null) {
  // Helper to get score of a specific blendshape
  // FIXED: Subtract calibration baseline to solve "Resting Face" issues
  const get = (name) => {
    const raw = blend.find((b) => b.categoryName === name)?.score || 0;
    const offset = calibration ? (calibration[name] || 0) : 0;
    // We allow small negative numbers to zero out, but clamp at 0 for ratios
    return Math.max(0, raw - offset); 
  };

  // --- MAP BLENDSHAPES TO MUSCLE GROUPS ---
  const smileMuscle = (get("mouthSmileLeft") + get("mouthSmileRight")) / 2;
  const cheekMuscle = (get("cheekSquintLeft") + get("cheekSquintRight")) / 2;
  const browFurrow = (get("browDownLeft") + get("browDownRight")) / 2;
  const browInnerUp = get("browInnerUp"); 
  const browOuterUp = (get("browOuterUpLeft") + get("browOuterUpRight")) / 2; 
  const eyeWide = (get("eyeWideLeft") + get("eyeWideRight")) / 2;
  const noseWrinkle = (get("noseSneerLeft") + get("noseSneerRight")) / 2;
  const mouthFrown = (get("mouthFrownLeft") + get("mouthFrownRight")) / 2;
  const lipPress = (get("mouthPressLeft") + get("mouthPressRight")) / 2;
  const jawDrop = get("jawOpen");
  const lookOut = get("eyeLookOutLeft") + get("eyeLookOutRight");
  const lookDown = get("eyeLookDownLeft") + get("eyeLookDownRight");
  const blink = get("eyeBlinkLeft") + get("eyeBlinkRight");

  // --- EMOTION DETECTION LOGIC ---
  const scores = {
    happy: (smileMuscle * 0.7) + (cheekMuscle * 0.3),
    angry: (browFurrow * 0.5) + (lipPress * 0.3) + (get("eyeSquintLeft") * 0.2) - smileMuscle,
    sad: (browInnerUp * 0.6) + (mouthFrown * 0.4) + (lookDown * 0.2),
    surprised: (browOuterUp * 0.4) + (eyeWide * 0.4) + (jawDrop * 0.2),
    fear: (browInnerUp * 0.5) + (eyeWide * 0.4) + (lipPress * 0.1) - (jawDrop * 0.2),
    disgust: noseWrinkle * 1.0 + (mouthFrown * 0.2),
  };

  // Determine Dominant Emotion
  let detectedEmotion = "neutral";
  let maxScore = 0.2; // Sensitivity Threshold

  for (const [emo, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emo;
    }
  }
  
  // Fake Smile Detection
  if (detectedEmotion === "happy" && cheekMuscle < (smileMuscle * 0.3)) {
      detectedEmotion = "polite_smile";
  }

  // --- METRICS CALCULATION ---
  let attention = 100 - ((lookOut * 100) + (lookDown * 80) + (blink * 10));
  attention = Math.max(0, Math.min(100, attention));

  let stressRaw = (lipPress * 60) + (browFurrow * 50) + (blink * 20) - (smileMuscle * 30);
  let stressLevel = Math.max(0, Math.min(100, stressRaw));

  let confidence = 50 + (attention * 0.3) + (smileMuscle * 20) - (lipPress * 40) - (stressLevel * 0.2);
  confidence = Math.max(0, Math.min(100, confidence));

  let engagement = (attention * 0.4) + (smileMuscle * 30) + (browOuterUp * 20) + (eyeWide * 10);
  engagement = Math.max(0, Math.min(100, engagement));

  return {
    emotion: detectedEmotion,
    attention: Math.round(attention),
    stressLevel: Math.round(stressLevel),
    confidence: Math.round(confidence),
    engagement: Math.round(engagement),
  };
}

// -----------------------------
// HELPER 3: WRAPPER FOR SPEECH FILTER & SMOOTHING
// -----------------------------
function advancedAnalysis(blend, isAudioActive, historyRef, calibration) { 
    // 1. Get raw calculation (with calibration applied)
    const analysis = getBehaviorAnalysis(blend, calibration); 
    
    // 2. SPEECH FILTER
    // If mouth is moving fast (jawOpen) or audio volume is high -> User is talking
    const jawOpen = blend.find(b => b.categoryName === 'jawOpen')?.score || 0;
    const isTalking = isAudioActive || jawOpen > 0.15;

    if (isTalking) {
        // Suppress "open mouth" emotions that are likely just speech
        if (analysis.emotion === 'surprised' || analysis.emotion === 'fear') {
            analysis.emotion = 'neutral'; 
        }
    }

    // 3. TEMPORAL SMOOTHING (Jitter Removal)
    if (historyRef && historyRef.emotions) {
        historyRef.emotions.push(analysis.emotion);
        // Keep buffer size 10 (approx 0.5 seconds of history)
        if (historyRef.emotions.length > 10) historyRef.emotions.shift();
        
        // Overwrite raw emotion with smoothed emotion
        analysis.emotion = getMostFrequent(historyRef.emotions);
    }

    return {
        ...analysis,
        isTalking: isTalking 
    };
}


export default function VideoRecorder({ onEmotionDataUpdate, questionId }) {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  
  // State for UI feedback
  const [status, setStatus] = useState("Loading AI & Camera...");
  const [realtimeEmotion, setRealtimeEmotion] = useState("neutral");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [metrics, setMetrics] = useState({ confidence: 50, stressLevel: 0, engagement: 50 });
  
  // Per-question emotion tracking
  const questionEmotionBufferRef = useRef([]);
  const questionBehaviorBufferRef = useRef([]);
  const questionStartTimeRef = useRef(null);
  const lastEmotionUpdateRef = useRef(0);

  // -----------------------------
  // RESET EMOTION TRACKING WHEN QUESTION CHANGES
  // -----------------------------
  useEffect(() => {
    // Reset buffers when question changes
    if (questionId) {
      console.log("[VideoRecorder] Question changed, resetting emotion tracking for question:", questionId);
      questionEmotionBufferRef.current = [];
      questionBehaviorBufferRef.current = [];
      questionStartTimeRef.current = Date.now();
      lastEmotionUpdateRef.current = 0;
    }
  }, [questionId]);

  // -----------------------------
  // 1. SETUP CAMERA (Native HTML5)
  // -----------------------------
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: false // We handle audio separately for analysis
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
             // Only load AI once video is actually playing
             initAI();
          };
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setStatus("Camera Access Denied");
      }
    };
    
    startCamera();
  }, []);

  // -----------------------------
  // 2. LOAD MEDIAPIPE (Heavy AI)
  // -----------------------------
  const initAI = async () => {
    try {
      setStatus("Loading Neural Network...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
      );

      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: true,
      });

      setStatus("AI Ready. Start Speaking.");
      // Start analysis loops
      startAudioAnalysis();
      requestAnimationFrame(analyzeFrame);
    } catch (err) {
      console.error("AI Load Error:", err);
      setStatus("Error loading AI.");
    }
  };

  // -----------------------------
  // 3. SETUP AUDIO (Lightweight)
  // -----------------------------
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
    } catch (err) {
      console.error("Microphone Error:", err);
    }
  };

  // -----------------------------
  // 4. MAIN LOOP (Throttled)
  // -----------------------------
  const lastAnalysisTimeRef = useRef(0);

  const analyzeFrame = useCallback(() => {
    const now = Date.now();
    const video = videoRef.current;

    // --- A. AUDIO CHECK (Fast, run every frame) ---
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate Average Volume
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setVolumeLevel(volume); 
      
      // Store simple "Confidence" metric (throttled check)
      if (now - lastAnalysisTimeRef.current > 500) {
         audioBuffer.push(volume > 20 ? "Confident" : "Quiet");
      }
    }

    // --- B. VIDEO CHECK (Throttled: Run only every 500ms) ---
    if (now - lastAnalysisTimeRef.current > 500) { 
      lastAnalysisTimeRef.current = now;

      if (landmarkerRef.current && video && video.readyState >= 2) {
        // Only run if we have data
        const results = landmarkerRef.current.detectForVideo(video, now);

        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          const blend = results.faceBlendshapes[0].categories;
          
          // Use new Advanced Analysis
          const behavior = getBehaviorAnalysis(blend);
          
          // Update Buffers & State
          emotionBuffer.push(behavior.emotion);
          behaviorBuffer.push(behavior);
          
          // Track per-question data
          if (questionId) {
            questionEmotionBufferRef.current.push(behavior.emotion);
            questionBehaviorBufferRef.current.push({
              ...behavior,
              timestamp: now
            });
            
            // Update duration
            if (!questionStartTimeRef.current) {
              questionStartTimeRef.current = now;
            }
            
            // Notify parent component of emotion data update (throttled to every 2 seconds)
            if (onEmotionDataUpdate && (now - (lastEmotionUpdateRef.current || 0)) > 2000) {
              lastEmotionUpdateRef.current = now;
              const emotionSummary = getQuestionEmotionSummary();
              if (emotionSummary) {
                console.log("[VideoRecorder] Calling onEmotionDataUpdate with summary:", emotionSummary);
                onEmotionDataUpdate(emotionSummary);
              }
            }
          }

          setRealtimeEmotion(behavior.emotion);
          setMetrics({
            confidence: behavior.confidence,
            stressLevel: behavior.stressLevel,
            engagement: behavior.engagement
          });
        }
      }
    }

    requestAnimationFrame(analyzeFrame);
  }, []);


  // -----------------------------
  // CLEANUP ON UNMOUNT
  // -----------------------------
  useEffect(() => {
    return () => {
      // Stop video stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // Stop audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Cleanup buffers
      emotionBuffer = [];
      audioBuffer = [];
      behaviorBuffer = [];
    };
  }, []);

  // -----------------------------
  // GET QUESTION EMOTION SUMMARY
  // -----------------------------
  const getQuestionEmotionSummary = useCallback(() => {
    if (questionBehaviorBufferRef.current.length === 0) {
      console.log("[VideoRecorder] getQuestionEmotionSummary: No behavior data yet");
      return null;
    }
    
    const behaviors = questionBehaviorBufferRef.current;
    const emotions = questionEmotionBufferRef.current;
    
    // Calculate averages
    const avgConfidence = behaviors.reduce((sum, b) => sum + b.confidence, 0) / behaviors.length;
    const avgStress = behaviors.reduce((sum, b) => sum + b.stressLevel, 0) / behaviors.length;
    const avgEngagement = behaviors.reduce((sum, b) => sum + b.engagement, 0) / behaviors.length;
    
    // Count emotions
    const emotionCounts = emotions.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    
    // Find predominant emotion
    const predominantEmotion = Object.keys(emotionCounts).length > 0
      ? Object.keys(emotionCounts).sort((a, b) => emotionCounts[b] - emotionCounts[a])[0]
      : "neutral";
    
    const summary = {
      predominantEmotion,
      emotionCounts,
      avgConfidence: Math.round(avgConfidence),
      avgStress: Math.round(avgStress),
      avgEngagement: Math.round(avgEngagement),
      totalSamples: behaviors.length,
      duration: questionStartTimeRef.current ? Date.now() - questionStartTimeRef.current : 0,
      emotionHistory: emotions.slice(), // Copy array
      behaviorHistory: behaviors.slice() // Copy array
    };
    
    console.log("[VideoRecorder] getQuestionEmotionSummary returning:", summary);
    return summary;
  }, []);
  
  // Expose method to get current question emotion data
  useEffect(() => {
    if (questionId) {
      // Always expose the function when we have a questionId
      window.getQuestionEmotionData = getQuestionEmotionSummary;
      console.log("[VideoRecorder] Exposed getQuestionEmotionData for question:", questionId);
    } else {
      // Clear it when no question
      window.getQuestionEmotionData = null;
    }
  }, [questionId]);

  // -----------------------------
  // STOP & SUMMARIZE
  // -----------------------------
  const endInterview = () => {
    console.log("---- REPORT ----");
    
    // 1. Emotion Summary
    const emoCounts = emotionBuffer.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    console.log("Emotions:", emoCounts);

    // 2. Behavioral Averages
    const avgConfidence = behaviorBuffer.length > 0
      ? Math.round(behaviorBuffer.reduce((a, b) => a + b.confidence, 0) / behaviorBuffer.length)
      : 0;
    const avgStress = behaviorBuffer.length > 0
      ? Math.round(behaviorBuffer.reduce((a, b) => a + b.stressLevel, 0) / behaviorBuffer.length)
      : 0;

    // 3. Audio Summary
    const quietCount = audioBuffer.filter(a => a === "Quiet").length;
    const totalAudio = audioBuffer.length || 1; 
    const vocalConfidence = Math.round(100 - (quietCount / totalAudio) * 100);
    
    console.log(`Avg Visual Confidence: ${avgConfidence}%`);
    console.log(`Avg Stress Level: ${avgStress}%`);
    console.log(`Vocal Confidence: ${vocalConfidence}%`);
    
    const topEmotion = Object.keys(emoCounts).length > 0 
      ? Object.keys(emoCounts).sort((a,b) => emoCounts[b] - emoCounts[a])[0] 
      : "None detected";

    // Return summary data instead of alert
    const summary = {
      predominantEmotion: topEmotion,
      avgConfidence,
      avgStress,
      vocalConfidence,
      emotionCounts: emoCounts
    };

    console.log("Interview Summary:", summary);
    
    // Cleanup buffers for next run
    emotionBuffer = [];
    audioBuffer = [];
    behaviorBuffer = [];

    return summary;
  };

  return (
    <div className="flex flex-col items-center font-sans">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Live Analysis</h3>
      
      <div className="relative rounded-lg overflow-hidden shadow-md bg-black w-full" style={{ aspectRatio: '4/3' }}>
        {/* Native Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />

        {/* Overlay Stats */}
        <div className="absolute top-2 left-2 bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm z-10 text-xs" style={{ maxWidth: 'calc(100% - 16px)' }}>
          <p className="text-xs font-mono text-gray-400 mb-1">STATUS</p>
          <p className="font-bold text-green-400 text-xs mb-2">{status}</p>
          
          <div className="mb-2">
            <p className="text-xs font-mono text-gray-400 mb-1">EMOTION</p>
            <p className="text-sm font-bold capitalize text-yellow-400">{realtimeEmotion}</p>
          </div>

          {/* New Metrics Visualization */}
          <div className="space-y-1.5">
             {/* Confidence */}
             <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-300">Confidence</span>
                  <span className="font-bold text-xs">{metrics.confidence}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full transition-all duration-300" style={{ width: `${metrics.confidence}%` }}></div>
                </div>
             </div>

             {/* Stress */}
             <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-300">Stress</span>
                  <span className="font-bold text-xs">{metrics.stressLevel}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div className={`h-1 rounded-full transition-all duration-300 ${metrics.stressLevel > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${metrics.stressLevel}%` }}></div>
                </div>
             </div>
             
             {/* Vocal Volume */}
             <div>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-300">Volume</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div className="bg-purple-500 h-1 rounded-full transition-all duration-75" style={{ width: `${Math.min(volumeLevel, 100)}%` }}></div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}