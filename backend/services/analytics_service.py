"""
Advanced Analytics Service for Univo Platform
Comprehensive data analysis, insights, and machine learning recommendations
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
from collections import defaultdict
import statistics

# Machine Learning imports
try:
    from sklearn.cluster import KMeans
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    from sklearn.ensemble import RandomForestClassifier, IsolationForest
    from sklearn.metrics import silhouette_score
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    logging.warning("Scikit-learn not available - using basic analytics")

# Visualization imports
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    logging.warning("Matplotlib/Seaborn not available - charts disabled")

logger = logging.getLogger(__name__)

class MeetingAnalytics:
    """Advanced meeting analytics and insights"""
    
    def __init__(self):
        self.meeting_data = []
        self.participant_data = []
        self.engagement_metrics = []
        
    def add_meeting_data(self, meeting_info: Dict[str, Any]):
        """Add meeting data for analysis"""
        self.meeting_data.append({
            'meeting_id': meeting_info.get('meeting_id'),
            'duration': meeting_info.get('duration', 0),
            'participant_count': meeting_info.get('participant_count', 0),
            'start_time': meeting_info.get('start_time'),
            'end_time': meeting_info.get('end_time'),
            'meeting_type': meeting_info.get('meeting_type', 'general'),
            'audio_quality': meeting_info.get('audio_quality', 0.8),
            'video_quality': meeting_info.get('video_quality', 0.8),
            'network_stability': meeting_info.get('network_stability', 0.9),
            'features_used': meeting_info.get('features_used', []),
            'satisfaction_score': meeting_info.get('satisfaction_score', 0.0),
            'created_at': datetime.utcnow()
        })
    
    def add_participant_data(self, participant_info: Dict[str, Any]):
        """Add participant engagement data"""
        self.participant_data.append({
            'meeting_id': participant_info.get('meeting_id'),
            'user_id': participant_info.get('user_id'),
            'join_time': participant_info.get('join_time'),
            'leave_time': participant_info.get('leave_time'),
            'speaking_time': participant_info.get('speaking_time', 0),
            'camera_on_duration': participant_info.get('camera_on_duration', 0),
            'chat_messages': participant_info.get('chat_messages', 0),
            'screen_shares': participant_info.get('screen_shares', 0),
            'reactions_sent': participant_info.get('reactions_sent', 0),
            'attention_score': participant_info.get('attention_score', 0.5),
            'engagement_level': participant_info.get('engagement_level', 'medium'),
            'created_at': datetime.utcnow()
        })
    
    def calculate_meeting_insights(self, meeting_id: str) -> Dict[str, Any]:
        """Calculate comprehensive meeting insights"""
        # Get meeting data
        meeting = next((m for m in self.meeting_data if m['meeting_id'] == meeting_id), None)
        if not meeting:
            return {'error': 'Meeting not found'}
        
        # Get participant data for this meeting
        participants = [p for p in self.participant_data if p['meeting_id'] == meeting_id]
        
        if not participants:
            return {'error': 'No participant data found'}
        
        # Calculate basic metrics
        total_participants = len(participants)
        avg_duration = meeting['duration']
        
        # Engagement metrics
        total_speaking_time = sum(p['speaking_time'] for p in participants)
        avg_speaking_time = total_speaking_time / total_participants if total_participants > 0 else 0
        
        camera_usage = sum(1 for p in participants if p['camera_on_duration'] > 0) / total_participants
        chat_activity = sum(p['chat_messages'] for p in participants)
        
        # Attention and engagement
        avg_attention = statistics.mean([p['attention_score'] for p in participants])
        engagement_distribution = {
            'high': sum(1 for p in participants if p['engagement_level'] == 'high'),
            'medium': sum(1 for p in participants if p['engagement_level'] == 'medium'),
            'low': sum(1 for p in participants if p['engagement_level'] == 'low')
        }
        
        # Quality metrics
        technical_quality = {
            'audio_quality': meeting['audio_quality'],
            'video_quality': meeting['video_quality'],
            'network_stability': meeting['network_stability']
        }
        
        # Feature usage analysis
        features_used = meeting.get('features_used', [])
        feature_adoption = len(features_used) / 10  # Assuming 10 total features
        
        # Calculate overall meeting score
        meeting_score = self._calculate_meeting_score(meeting, participants)
        
        return {
            'meeting_id': meeting_id,
            'basic_metrics': {
                'duration_minutes': avg_duration,
                'participant_count': total_participants,
                'meeting_type': meeting['meeting_type']
            },
            'engagement_metrics': {
                'average_speaking_time': avg_speaking_time,
                'camera_usage_rate': camera_usage,
                'chat_activity': chat_activity,
                'average_attention_score': avg_attention,
                'engagement_distribution': engagement_distribution
            },
            'technical_quality': technical_quality,
            'feature_usage': {
                'features_used': features_used,
                'adoption_rate': feature_adoption
            },
            'overall_score': meeting_score,
            'recommendations': self._generate_meeting_recommendations(meeting, participants),
            'generated_at': datetime.utcnow().isoformat()
        }
    
    def _calculate_meeting_score(self, meeting: Dict[str, Any], participants: List[Dict[str, Any]]) -> float:
        """Calculate overall meeting effectiveness score"""
        # Engagement score (40%)
        avg_attention = statistics.mean([p['attention_score'] for p in participants])
        engagement_score = avg_attention * 0.4
        
        # Technical quality score (30%)
        tech_score = (meeting['audio_quality'] + meeting['video_quality'] + meeting['network_stability']) / 3 * 0.3
        
        # Participation score (20%)
        camera_usage = sum(1 for p in participants if p['camera_on_duration'] > 0) / len(participants)
        participation_score = camera_usage * 0.2
        
        # Feature utilization score (10%)
        feature_score = len(meeting.get('features_used', [])) / 10 * 0.1
        
        total_score = engagement_score + tech_score + participation_score + feature_score
        return min(1.0, total_score)
    
    def _generate_meeting_recommendations(self, meeting: Dict[str, Any], participants: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations for meeting improvement"""
        recommendations = []
        
        # Engagement recommendations
        avg_attention = statistics.mean([p['attention_score'] for p in participants])
        if avg_attention < 0.6:
            recommendations.append("Consider shorter meeting duration or more interactive elements to improve engagement")
        
        # Camera usage recommendations
        camera_usage = sum(1 for p in participants if p['camera_on_duration'] > 0) / len(participants)
        if camera_usage < 0.5:
            recommendations.append("Encourage participants to turn on cameras for better engagement")
        
        # Speaking time distribution
        speaking_times = [p['speaking_time'] for p in participants]
        if max(speaking_times) > sum(speaking_times) * 0.6:
            recommendations.append("Consider more balanced speaking time distribution among participants")
        
        # Technical quality
        if meeting['audio_quality'] < 0.7:
            recommendations.append("Audio quality issues detected - check microphone settings and network connection")
        
        if meeting['video_quality'] < 0.7:
            recommendations.append("Video quality issues detected - consider reducing video resolution or checking bandwidth")
        
        # Feature usage
        if len(meeting.get('features_used', [])) < 3:
            recommendations.append("Explore more platform features like screen sharing, whiteboard, or breakout rooms")
        
        return recommendations

class UserBehaviorAnalytics:
    """User behavior analysis and personalization"""
    
    def __init__(self):
        self.user_sessions = []
        self.user_preferences = defaultdict(dict)
        self.usage_patterns = defaultdict(list)
        
    def track_user_session(self, session_data: Dict[str, Any]):
        """Track user session for behavior analysis"""
        self.user_sessions.append({
            'user_id': session_data.get('user_id'),
            'session_duration': session_data.get('session_duration', 0),
            'features_used': session_data.get('features_used', []),
            'meeting_count': session_data.get('meeting_count', 0),
            'device_type': session_data.get('device_type', 'desktop'),
            'browser': session_data.get('browser', 'unknown'),
            'location': session_data.get('location', 'unknown'),
            'time_of_day': session_data.get('time_of_day', 'unknown'),
            'satisfaction_rating': session_data.get('satisfaction_rating', 0),
            'timestamp': datetime.utcnow()
        })
    
    def analyze_user_behavior(self, user_id: str) -> Dict[str, Any]:
        """Analyze individual user behavior patterns"""
        user_sessions = [s for s in self.user_sessions if s['user_id'] == user_id]
        
        if not user_sessions:
            return {'error': 'No session data found for user'}
        
        # Calculate usage patterns
        total_sessions = len(user_sessions)
        avg_session_duration = statistics.mean([s['session_duration'] for s in user_sessions])
        total_meetings = sum(s['meeting_count'] for s in user_sessions)
        
        # Feature usage analysis
        all_features = []
        for session in user_sessions:
            all_features.extend(session['features_used'])
        
        feature_frequency = {}
        for feature in all_features:
            feature_frequency[feature] = feature_frequency.get(feature, 0) + 1
        
        # Device and browser preferences
        device_usage = {}
        browser_usage = {}
        for session in user_sessions:
            device = session['device_type']
            browser = session['browser']
            device_usage[device] = device_usage.get(device, 0) + 1
            browser_usage[browser] = browser_usage.get(browser, 0) + 1
        
        # Time patterns
        time_patterns = {}
        for session in user_sessions:
            time_slot = session['time_of_day']
            time_patterns[time_slot] = time_patterns.get(time_slot, 0) + 1
        
        # Satisfaction trends
        satisfaction_scores = [s['satisfaction_rating'] for s in user_sessions if s['satisfaction_rating'] > 0]
        avg_satisfaction = statistics.mean(satisfaction_scores) if satisfaction_scores else 0
        
        return {
            'user_id': user_id,
            'usage_summary': {
                'total_sessions': total_sessions,
                'average_session_duration': avg_session_duration,
                'total_meetings': total_meetings,
                'average_satisfaction': avg_satisfaction
            },
            'feature_preferences': dict(sorted(feature_frequency.items(), key=lambda x: x[1], reverse=True)),
            'device_preferences': device_usage,
            'browser_preferences': browser_usage,
            'time_preferences': time_patterns,
            'recommendations': self._generate_user_recommendations(user_sessions),
            'analyzed_at': datetime.utcnow().isoformat()
        }
    
    def _generate_user_recommendations(self, user_sessions: List[Dict[str, Any]]) -> List[str]:
        """Generate personalized recommendations for user"""
        recommendations = []
        
        # Feature recommendations
        all_features = set()
        for session in user_sessions:
            all_features.update(session['features_used'])
        
        available_features = {'screen_share', 'whiteboard', 'breakout_rooms', 'recording', 'chat', 'reactions'}
        unused_features = available_features - all_features
        
        if unused_features:
            recommendations.append(f"Try these features to enhance your meetings: {', '.join(list(unused_features)[:3])}")
        
        # Session duration recommendations
        avg_duration = statistics.mean([s['session_duration'] for s in user_sessions])
        if avg_duration > 120:  # 2 hours
            recommendations.append("Consider shorter meeting sessions for better engagement")
        
        # Satisfaction improvements
        satisfaction_scores = [s['satisfaction_rating'] for s in user_sessions if s['satisfaction_rating'] > 0]
        if satisfaction_scores and statistics.mean(satisfaction_scores) < 4:
            recommendations.append("Check your audio/video settings and network connection for better meeting experience")
        
        return recommendations

class PredictiveAnalytics:
    """Machine learning-based predictive analytics"""
    
    def __init__(self):
        self.models = {}
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.meeting_data = []
        
    def train_engagement_predictor(self, training_data: List[Dict[str, Any]]):
        """Train model to predict meeting engagement"""
        if not SKLEARN_AVAILABLE:
            logger.warning("Scikit-learn not available - skipping model training")
            return
        
        # Prepare training data
        features = []
        labels = []
        
        for data in training_data:
            feature_vector = [
                data.get('duration', 0),
                data.get('participant_count', 0),
                data.get('time_of_day_numeric', 12),  # Hour of day
                len(data.get('features_used', [])),
                data.get('audio_quality', 0.8),
                data.get('video_quality', 0.8)
            ]
            features.append(feature_vector)
            labels.append(data.get('engagement_score', 0.5))
        
        if len(features) < 10:
            logger.warning("Insufficient training data for engagement predictor")
            return
        
        # Train model
        X = np.array(features)
        y = np.array(labels)
        
        X_scaled = self.scaler.fit_transform(X)
        
        self.models['engagement_predictor'] = RandomForestClassifier(n_estimators=100, random_state=42)
        
        # Convert continuous engagement to categories
        y_categorical = np.where(y > 0.7, 2, np.where(y > 0.4, 1, 0))  # High, Medium, Low
        
        self.models['engagement_predictor'].fit(X_scaled, y_categorical)
        
        logger.info("Engagement predictor model trained successfully")
    
    def predict_meeting_engagement(self, meeting_features: Dict[str, Any]) -> Dict[str, Any]:
        """Predict engagement level for a planned meeting"""
        if not SKLEARN_AVAILABLE or 'engagement_predictor' not in self.models:
            return {'prediction': 'medium', 'confidence': 0.5, 'note': 'Model not available'}
        
        # Prepare feature vector
        feature_vector = np.array([[
            meeting_features.get('duration', 60),
            meeting_features.get('participant_count', 5),
            meeting_features.get('time_of_day_numeric', 12),
            len(meeting_features.get('planned_features', [])),
            meeting_features.get('expected_audio_quality', 0.8),
            meeting_features.get('expected_video_quality', 0.8)
        ]])
        
        # Scale features
        feature_vector_scaled = self.scaler.transform(feature_vector)
        
        # Make prediction
        prediction = self.models['engagement_predictor'].predict(feature_vector_scaled)[0]
        probabilities = self.models['engagement_predictor'].predict_proba(feature_vector_scaled)[0]
        
        engagement_levels = ['low', 'medium', 'high']
        predicted_level = engagement_levels[prediction]
        confidence = max(probabilities)
        
        return {
            'predicted_engagement': predicted_level,
            'confidence': float(confidence),
            'probabilities': {
                'low': float(probabilities[0]),
                'medium': float(probabilities[1]),
                'high': float(probabilities[2])
            },
            'recommendations': self._get_engagement_recommendations(predicted_level, meeting_features)
        }
    
    def detect_anomalies(self, meeting_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect anomalous meetings or patterns"""
        if not SKLEARN_AVAILABLE or len(meeting_data) < 10:
            return []
        
        # Prepare feature matrix
        features = []
        meeting_ids = []
        
        for meeting in meeting_data:
            feature_vector = [
                meeting.get('duration', 0),
                meeting.get('participant_count', 0),
                meeting.get('audio_quality', 0.8),
                meeting.get('video_quality', 0.8),
                meeting.get('network_stability', 0.9),
                len(meeting.get('features_used', [])),
                meeting.get('satisfaction_score', 0.5)
            ]
            features.append(feature_vector)
            meeting_ids.append(meeting.get('meeting_id'))
        
        X = np.array(features)
        X_scaled = StandardScaler().fit_transform(X)
        
        # Detect anomalies using Isolation Forest
        isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        anomaly_labels = isolation_forest.fit_predict(X_scaled)
        
        # Return anomalous meetings
        anomalies = []
        for i, label in enumerate(anomaly_labels):
            if label == -1:  # Anomaly
                anomalies.append({
                    'meeting_id': meeting_ids[i],
                    'anomaly_score': isolation_forest.score_samples([X_scaled[i]])[0],
                    'meeting_data': meeting_data[i]
                })
        
        return sorted(anomalies, key=lambda x: x['anomaly_score'])
    
    def _get_engagement_recommendations(self, predicted_level: str, features: Dict[str, Any]) -> List[str]:
        """Get recommendations based on predicted engagement"""
        recommendations = []
        
        if predicted_level == 'low':
            recommendations.extend([
                "Consider reducing meeting duration for better engagement",
                "Plan interactive elements like polls or breakout sessions",
                "Ensure all participants have good audio/video quality"
            ])
        elif predicted_level == 'medium':
            recommendations.extend([
                "Add interactive features to boost engagement",
                "Consider using screen sharing or whiteboard for visual elements"
            ])
        else:  # high
            recommendations.append("Great! This meeting is predicted to have high engagement")
        
        # Duration-specific recommendations
        if features.get('duration', 60) > 90:
            recommendations.append("Consider breaking long meetings into shorter sessions")
        
        # Participant count recommendations
        if features.get('participant_count', 5) > 15:
            recommendations.append("Large meetings benefit from structured agendas and moderation")
        
        return recommendations

class AdvancedAnalyticsService:
    """Main analytics service combining all analytics capabilities"""
    
    def __init__(self):
        self.meeting_analytics = MeetingAnalytics()
        self.user_analytics = UserBehaviorAnalytics()
        self.predictive_analytics = PredictiveAnalytics()
        self.dashboard_data = {}
        
        logger.info(f"Advanced Analytics Service initialized (ML: {SKLEARN_AVAILABLE})")
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check for analytics service"""
        return {
            "status": "healthy",
            "sklearn_available": SKLEARN_AVAILABLE,
            "visualization_available": VISUALIZATION_AVAILABLE,
            "meetings_analyzed": len(self.meeting_analytics.meeting_data),
            "users_tracked": len(set(s['user_id'] for s in self.user_analytics.user_sessions))
        }
    
    async def get_meeting_insights(self, meeting_id: str) -> Dict[str, Any]:
        """Get comprehensive meeting insights"""
        try:
            insights = self.meeting_analytics.calculate_meeting_insights(meeting_id)
            
            # Add predictive insights if available
            if SKLEARN_AVAILABLE and 'engagement_predictor' in self.predictive_analytics.models:
                meeting_data = next((m for m in self.meeting_analytics.meeting_data if m['meeting_id'] == meeting_id), None)
                if meeting_data:
                    prediction = self.predictive_analytics.predict_meeting_engagement({
                        'duration': meeting_data['duration'],
                        'participant_count': meeting_data['participant_count'],
                        'planned_features': meeting_data.get('features_used', [])
                    })
                    insights['predictive_analysis'] = prediction
            
            return insights
            
        except Exception as e:
            logger.error(f"Error getting meeting insights: {str(e)}")
            raise
    
    async def analyze_user_behavior(self, user_id: str) -> Dict[str, Any]:
        """Analyze user behavior and generate recommendations"""
        try:
            analysis = self.user_analytics.analyze_user_behavior(user_id)
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing user behavior: {str(e)}")
            raise
    
    async def get_platform_analytics(self) -> Dict[str, Any]:
        """Get overall platform analytics"""
        try:
            # Meeting statistics
            total_meetings = len(self.meeting_analytics.meeting_data)
            if total_meetings > 0:
                avg_duration = statistics.mean([m['duration'] for m in self.meeting_analytics.meeting_data])
                avg_participants = statistics.mean([m['participant_count'] for m in self.meeting_analytics.meeting_data])
                avg_satisfaction = statistics.mean([m['satisfaction_score'] for m in self.meeting_analytics.meeting_data if m['satisfaction_score'] > 0])
            else:
                avg_duration = avg_participants = avg_satisfaction = 0
            
            # User statistics
            total_users = len(set(s['user_id'] for s in self.user_analytics.user_sessions))
            total_sessions = len(self.user_analytics.user_sessions)
            
            # Feature usage statistics
            all_features = []
            for meeting in self.meeting_analytics.meeting_data:
                all_features.extend(meeting.get('features_used', []))
            
            feature_usage = {}
            for feature in all_features:
                feature_usage[feature] = feature_usage.get(feature, 0) + 1
            
            # Quality metrics
            quality_metrics = {
                'avg_audio_quality': statistics.mean([m['audio_quality'] for m in self.meeting_analytics.meeting_data]) if total_meetings > 0 else 0,
                'avg_video_quality': statistics.mean([m['video_quality'] for m in self.meeting_analytics.meeting_data]) if total_meetings > 0 else 0,
                'avg_network_stability': statistics.mean([m['network_stability'] for m in self.meeting_analytics.meeting_data]) if total_meetings > 0 else 0
            }
            
            # Detect anomalies
            anomalies = self.predictive_analytics.detect_anomalies(self.meeting_analytics.meeting_data)
            
            return {
                'platform_overview': {
                    'total_meetings': total_meetings,
                    'total_users': total_users,
                    'total_sessions': total_sessions,
                    'average_meeting_duration': avg_duration,
                    'average_participants_per_meeting': avg_participants,
                    'average_satisfaction_score': avg_satisfaction
                },
                'feature_usage': dict(sorted(feature_usage.items(), key=lambda x: x[1], reverse=True)),
                'quality_metrics': quality_metrics,
                'anomalies_detected': len(anomalies),
                'top_anomalies': anomalies[:5],  # Top 5 anomalies
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting platform analytics: {str(e)}")
            raise
    
    async def generate_recommendations(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered recommendations"""
        try:
            recommendations = {
                'meeting_optimization': [],
                'user_experience': [],
                'platform_improvements': [],
                'technical_enhancements': []
            }
            
            # Meeting optimization recommendations
            if self.meeting_analytics.meeting_data:
                avg_duration = statistics.mean([m['duration'] for m in self.meeting_analytics.meeting_data])
                if avg_duration > 90:
                    recommendations['meeting_optimization'].append(
                        "Consider implementing automatic meeting time limits or break reminders"
                    )
                
                low_engagement_meetings = [m for m in self.meeting_analytics.meeting_data 
                                         if m.get('satisfaction_score', 0) < 3]
                if len(low_engagement_meetings) > len(self.meeting_analytics.meeting_data) * 0.2:
                    recommendations['meeting_optimization'].append(
                        "High number of low-engagement meetings detected - consider engagement training"
                    )
            
            # User experience recommendations
            if self.user_analytics.user_sessions:
                device_usage = {}
                for session in self.user_analytics.user_sessions:
                    device = session['device_type']
                    device_usage[device] = device_usage.get(device, 0) + 1
                
                if device_usage.get('mobile', 0) > device_usage.get('desktop', 0):
                    recommendations['user_experience'].append(
                        "High mobile usage detected - optimize mobile interface and features"
                    )
            
            # Platform improvements
            if SKLEARN_AVAILABLE:
                recommendations['platform_improvements'].append(
                    "Machine learning models are active for predictive analytics"
                )
            else:
                recommendations['platform_improvements'].append(
                    "Consider enabling ML capabilities for advanced analytics"
                )
            
            return {
                'recommendations': recommendations,
                'priority_actions': self._get_priority_actions(),
                'generated_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
    
    def _get_priority_actions(self) -> List[Dict[str, Any]]:
        """Get priority actions based on analytics"""
        actions = []
        
        # Check for critical issues
        if self.meeting_analytics.meeting_data:
            recent_meetings = [m for m in self.meeting_analytics.meeting_data 
                             if (datetime.utcnow() - m['created_at']).days <= 7]
            
            if recent_meetings:
                avg_quality = statistics.mean([
                    (m['audio_quality'] + m['video_quality'] + m['network_stability']) / 3 
                    for m in recent_meetings
                ])
                
                if avg_quality < 0.7:
                    actions.append({
                        'priority': 'high',
                        'action': 'Investigate technical quality issues',
                        'description': 'Recent meetings show declining audio/video quality',
                        'impact': 'user_experience'
                    })
        
        return actions
    
    # Data ingestion methods
    async def ingest_meeting_data(self, meeting_data: Dict[str, Any]):
        """Ingest meeting data for analysis"""
        self.meeting_analytics.add_meeting_data(meeting_data)
    
    async def ingest_participant_data(self, participant_data: Dict[str, Any]):
        """Ingest participant data for analysis"""
        self.meeting_analytics.add_participant_data(participant_data)
    
    async def ingest_user_session(self, session_data: Dict[str, Any]):
        """Ingest user session data for behavior analysis"""
        self.user_analytics.track_user_session(session_data)
    
    async def train_models(self):
        """Train machine learning models with available data"""
        if not SKLEARN_AVAILABLE:
            logger.warning("Cannot train models - scikit-learn not available")
            return
        
        # Prepare training data for engagement predictor
        training_data = []
        for meeting in self.meeting_analytics.meeting_data:
            participants = [p for p in self.meeting_analytics.participant_data 
                          if p['meeting_id'] == meeting['meeting_id']]
            
            if participants:
                avg_attention = statistics.mean([p['attention_score'] for p in participants])
                training_data.append({
                    'duration': meeting['duration'],
                    'participant_count': meeting['participant_count'],
                    'features_used': meeting.get('features_used', []),
                    'audio_quality': meeting['audio_quality'],
                    'video_quality': meeting['video_quality'],
                    'engagement_score': avg_attention
                })
        
        if len(training_data) >= 10:
            self.predictive_analytics.train_engagement_predictor(training_data)
            logger.info("Machine learning models trained successfully")
        else:
            logger.warning("Insufficient data for model training")