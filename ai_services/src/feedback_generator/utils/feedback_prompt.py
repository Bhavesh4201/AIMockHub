def create_feedback_prompt(answer_text: str, emotion_data: dict = None) -> str:
    """
    Create a feedback prompt for interview answer analysis.
    
    Args:
        answer_text: The user's interview answer text
        emotion_data: Optional emotion/behavioral data from video analysis
        
    Returns:
        Formatted prompt string for LLM
    """
    # Build comprehensive emotion context if available
    emotion_context = ""
    emotion_analysis_instructions = ""
    if emotion_data:
        emotion_info = []
        emotion_insights = []
        
        # Extract emotion metrics
        predominant_emotion = emotion_data.get("predominantEmotion", "neutral")
        avg_confidence = emotion_data.get("avgConfidence", 0)
        avg_stress = emotion_data.get("avgStress", 0)
        avg_engagement = emotion_data.get("avgEngagement", 0)
        emotion_history = emotion_data.get("emotionHistory", [])
        total_samples = emotion_data.get("totalSamples", 0)
        duration = emotion_data.get("duration", 0)
        source = emotion_data.get("source", "video_tracking")
        analysis_note = emotion_data.get("analysisNote", "")
        
        # Build detailed emotion information
        emotion_info.append(f"PREDOMINANT EMOTION: {predominant_emotion}")
        emotion_info.append(f"AVERAGE CONFIDENCE LEVEL: {avg_confidence}%")
        emotion_info.append(f"AVERAGE STRESS LEVEL: {avg_stress}%")
        emotion_info.append(f"AVERAGE ENGAGEMENT: {avg_engagement}%")
        
        # Add source information if available
        if source == "text_analysis_fallback":
            emotion_info.append(f"DATA SOURCE: Text-based analysis (video tracking unavailable)")
            if analysis_note:
                emotion_info.append(f"NOTE: {analysis_note}")
        else:
            emotion_info.append(f"DATA SOURCE: Video-based tracking")
        
        if emotion_history:
            # Analyze emotion transitions
            unique_emotions = list(set(emotion_history))
            if len(unique_emotions) > 1:
                emotion_info.append(f"EMOTION TRANSITIONS: {len(unique_emotions)} different emotions detected")
                emotion_info.append(f"EMOTION JOURNEY: {', '.join(emotion_history[-10:])}")  # Last 10 emotions
            else:
                emotion_info.append(f"EMOTION STABILITY: Maintained {predominant_emotion} throughout")
        
        if total_samples > 0:
            emotion_info.append(f"ANALYSIS DURATION: {duration/1000:.1f} seconds ({total_samples} samples)")
        
        # Generate insights based on metrics
        if avg_confidence >= 70:
            emotion_insights.append("The candidate demonstrated high confidence throughout the response")
        elif avg_confidence >= 50:
            emotion_insights.append("The candidate showed moderate confidence with room for improvement")
        else:
            emotion_insights.append("The candidate appeared less confident, which may indicate nervousness or uncertainty")
        
        if avg_stress > 60:
            emotion_insights.append("Elevated stress levels were detected, suggesting the candidate may benefit from better preparation or stress management techniques")
        elif avg_stress < 30:
            emotion_insights.append("The candidate maintained low stress levels, indicating good composure")
        
        if avg_engagement >= 70:
            emotion_insights.append("High engagement and attentiveness were observed")
        elif avg_engagement < 50:
            emotion_insights.append("Lower engagement levels suggest the candidate may need to improve focus and active participation")
        
        if predominant_emotion in ["happy", "confident", "neutral"]:
            emotion_insights.append("The candidate maintained a positive or neutral emotional state, which is favorable for interview performance")
        elif predominant_emotion in ["sad", "fear", "angry"]:
            emotion_insights.append(f"The candidate's predominant emotion ({predominant_emotion}) may have impacted their communication effectiveness")
        
        if emotion_info:
            emotion_context = f"""
BEHAVIORAL & EMOTIONAL ANALYSIS (Tracked from question start to answer submission):
{'\n'.join(emotion_info)}

EMOTION-BASED INSIGHTS:
{'\n'.join(emotion_insights) if emotion_insights else 'No significant emotional patterns detected'}
"""
            
            emotion_analysis_instructions = """
CRITICAL: You MUST integrate the emotion-based insights into the "feedback" field. The overall feedback summary should:
1. Mention the candidate's confidence level and emotional state when relevant
2. Connect emotional observations to their answer quality (e.g., "Your confident demeanor complemented your technical explanation" or "Some nervousness was evident, which may have affected the clarity of your response")
3. Make the feedback feel holistic - combining technical assessment with behavioral observations
4. Do NOT create a separate section for emotions - weave them naturally into the main feedback text
5. The feedback should read as one cohesive assessment that considers both content and delivery
"""
    
    prompt = f"""
You are an expert technical interviewer providing constructive feedback on interview answers.

Analyze the following interview answer and provide detailed feedback:

ANSWER TO ANALYZE:
{answer_text}
{emotion_context}
{emotion_analysis_instructions}
Provide feedback in the following JSON format:
{{
    "feedback": "Overall feedback summary (3-4 sentences that INTEGRATES technical assessment with emotional/behavioral observations)",
    "strengths": [
        "Strength 1",
        "Strength 2",
        "Strength 3"
    ],
    "improvements": [
        "Area for improvement 1",
        "Area for improvement 2",
        "Area for improvement 3"
    ],
    "emotion_improvements": [
        "Emotion/behavioral feedback 1",
        "Emotion/behavioral feedback 2"
    ],
    "score": 85
}}

EVALUATION CRITERIA:
1. Technical accuracy and depth
2. Clarity and communication
3. Problem-solving approach
4. Code/architecture quality (if applicable)
5. Completeness of answer
6. Confidence and presentation (MANDATORY if emotion data provided - must be mentioned in feedback)

SCORING GUIDE:
- 90-100: Excellent - Comprehensive, accurate, well-communicated, confident delivery
- 75-89: Good - Solid understanding with minor gaps, generally positive presentation
- 60-74: Fair - Basic understanding but needs improvement, may show nervousness or uncertainty
- 40-59: Needs Work - Significant gaps in knowledge, presentation issues may be evident
- 0-39: Poor - Major issues or incorrect information, confidence and clarity need significant improvement

INSTRUCTIONS:
- Be constructive and encouraging
- Provide specific, actionable feedback
- Highlight what was done well (both technically and in terms of delivery)
- Suggest concrete improvements (both content and presentation)
- Score should reflect overall answer quality INCLUDING delivery and confidence
- **IF EMOTION DATA IS PROVIDED**: The "feedback" field MUST naturally incorporate observations about confidence, stress levels, engagement, and emotional state. Do not treat emotions as separate - integrate them into the holistic assessment.
- Example good feedback: "Your answer demonstrated solid technical understanding of React hooks, and your confident, calm delivery throughout the response enhanced the clarity of your explanation. However, there were some gaps in your explanation of the dependency array that could be addressed with more practice."
- Example bad feedback (if emotion data exists): "Your answer was technically sound." (Missing emotion integration)

**EMOTION IMPROVEMENTS SECTION (emotion_improvements field):**
- This is a SEPARATE section specifically for emotional/behavioral interview performance
- **IF EMOTION METRICS ARE GOOD** (confidence ≥70%, stress <40%, engagement ≥70%):
  * Give compliments and positive reinforcement
  * Examples: "Excellent composure and confidence!", "Your calm demeanor really enhanced your presentation", "Great job maintaining engagement throughout"
  * Acknowledge what they did well emotionally/behaviorally
- **IF EMOTION METRICS NEED IMPROVEMENT** (confidence <60%, stress >50%, engagement <60%):
  * Provide specific, actionable suggestions for improvement
  * Examples: "Practice deep breathing techniques to reduce stress levels", "Work on maintaining eye contact and confident body language", "Try to speak more clearly and at a steady pace to show confidence", "Prepare more thoroughly to boost confidence"
  * Be encouraging and supportive, not critical
- **IF EMOTION DATA NOT PROVIDED**: Leave emotion_improvements as empty array []
- Always provide 2-3 items in emotion_improvements array (compliments if good, suggestions if needs improvement)

- Return ONLY valid JSON, no markdown, no code blocks, no explanations
"""
    return prompt



