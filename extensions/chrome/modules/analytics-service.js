/**
 * Univo Chrome Extension - Analytics Service Module
 * Advanced analytics and event tracking
 */

export class AnalyticsService {
    static instance = null;
    static isInitialized = false;
    static events = [];
    static sessionData = {};
    static userMetrics = {};

    // Initialize Analytics Service
    static async initialize(config = {}) {
        if (this.isInitialized) {
            return this.instance;
        }

        console.log('📊 Initializing Analytics Service...');

        this.config = {
            endpoint: config.endpoint || 'https://analytics.univo.app',
            batchSize: config.batchSize || 50,
            flushInterval: config.flushInterval || 30000, // 30 seconds
            enableUserTracking: config.enableUserTracking !== false,
            enablePerformanceTracking: config.enablePerformanceTracking !== false,
            ...config
        };

        try {
            // Initialize session
            this.initializeSession();
            
            // Set up event batching
            this.setupEventBatching();
            
            // Set up performance monitoring
            if (this.config.enablePerformanceTracking) {
                this.setupPerformanceTracking();
            }
            
            this.isInitialized = true;
            this.instance = this;
            
            console.log('✅ Analytics Service initialized successfully');
            return this.instance;
            
        } catch (error) {
            console.error('❌ Analytics Service initialization failed:', error);
            throw error;
        }
    }

    // Initialize analytics session
    static initializeSession() {
        this.sessionData = {
            sessionId: `session-${Date.now().toString(36)}`,
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: `${screen.width}x${screen.height}`,
            extensionVersion: chrome.runtime.getManifest().version,
            events: 0,
            lastActivity: Date.now()
        };
        
        console.log('📊 Analytics session initialized:', this.sessionData.sessionId);
    }

    // Set up event batching
    static setupEventBatching() {
        // Flush events periodically
        setInterval(() => {
            if (this.events.length > 0) {
                this.flushEvents();
            }
        }, this.config.flushInterval);
        
        // Flush events when batch size is reached
        this.checkBatchSize = () => {
            if (this.events.length >= this.config.batchSize) {
                this.flushEvents();
            }
        };
    }

    // Set up performance tracking
    static setupPerformanceTracking() {
        // Track page load performance
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            this.track('page_performance', {
                loadTime: loadTime,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstPaint: timing.responseStart - timing.navigationStart
            });
        }
        
        // Track memory usage
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                this.track('memory_usage', {
                    usedJSHeapSize: memory.usedJSHeapSize,
                    totalJSHeapSize: memory.totalJSHeapSize,
                    jsHeapSizeLimit: memory.jsHeapSizeLimit
                });
            }, 60000); // Every minute
        }
    }

    // Track event
    static track(eventName, properties = {}, options = {}) {
        if (!this.isInitialized) {
            console.warn('Analytics Service not initialized');
            return;
        }
        
        const event = {
            id: `event-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
            name: eventName,
            properties: {
                ...properties,
                timestamp: Date.now(),
                sessionId: this.sessionData.sessionId,
                url: window.location.href,
                referrer: document.referrer
            },
            context: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            options: options
        };
        
        // Add to events queue
        this.events.push(event);
        this.sessionData.events++;
        this.sessionData.lastActivity = Date.now();
        
        // Update user metrics
        this.updateUserMetrics(eventName, properties);
        
        // Check if we need to flush
        this.checkBatchSize();
        
        console.log('📊 Event tracked:', eventName, properties);
    }

    // Update user metrics
    static updateUserMetrics(eventName, properties) {
        if (!this.userMetrics[eventName]) {
            this.userMetrics[eventName] = {
                count: 0,
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                properties: {}
            };
        }
        
        const metric = this.userMetrics[eventName];
        metric.count++;
        metric.lastSeen = Date.now();
        
        // Aggregate numeric properties
        Object.keys(properties).forEach(key => {
            const value = properties[key];
            if (typeof value === 'number') {
                if (!metric.properties[key]) {
                    metric.properties[key] = {
                        sum: 0,
                        count: 0,
                        min: value,
                        max: value,
                        avg: 0
                    };
                }
                
                const prop = metric.properties[key];
                prop.sum += value;
                prop.count++;
                prop.min = Math.min(prop.min, value);
                prop.max = Math.max(prop.max, value);
                prop.avg = prop.sum / prop.count;
            }
        });
    }

    // Track page view
    static trackPageView(page, properties = {}) {
        this.track('page_view', {
            page: page,
            title: document.title,
            ...properties
        });
    }

    // Track user interaction
    static trackInteraction(element, action, properties = {}) {
        this.track('user_interaction', {
            element: element,
            action: action,
            ...properties
        });
    }

    // Track error
    static trackError(error, context = {}) {
        this.track('error', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            context: context
        }, { priority: 'high' });
    }

    // Track performance metric
    static trackPerformance(metric, value, properties = {}) {
        this.track('performance', {
            metric: metric,
            value: value,
            ...properties
        });
    }

    // Track feature usage
    static trackFeatureUsage(feature, action, properties = {}) {
        this.track('feature_usage', {
            feature: feature,
            action: action,
            ...properties
        });
    }

    // Track conversion event
    static trackConversion(goal, value = null, properties = {}) {
        this.track('conversion', {
            goal: goal,
            value: value,
            ...properties
        }, { priority: 'high' });
    }

    // Track A/B test
    static trackABTest(testName, variant, properties = {}) {
        this.track('ab_test', {
            testName: testName,
            variant: variant,
            ...properties
        });
    }

    // Flush events to server
    static async flushEvents() {
        if (this.events.length === 0) {
            return;
        }
        
        console.log(`📤 Flushing ${this.events.length} analytics events...`);
        
        try {
            const batch = {
                sessionId: this.sessionData.sessionId,
                events: [...this.events],
                metadata: {
                    batchSize: this.events.length,
                    timestamp: Date.now(),
                    extensionVersion: chrome.runtime.getManifest().version
                }
            };
            
            // Clear events queue
            this.events = [];
            
            // Send to analytics endpoint (simulate for demo)
            const success = await this.sendAnalyticsBatch(batch);
            
            if (success) {
                console.log('✅ Analytics events sent successfully');
            } else {
                console.warn('⚠️ Failed to send analytics events');
                // Re-add events to queue for retry
                this.events.unshift(...batch.events);
            }
            
        } catch (error) {
            console.error('❌ Failed to flush analytics events:', error);
        }
    }

    // Send analytics batch to server
    static async sendAnalyticsBatch(batch) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulate 95% success rate
            return Math.random() > 0.05;
            
        } catch (error) {
            console.error('❌ Analytics API error:', error);
            return false;
        }
    }

    // Get analytics summary
    static getAnalyticsSummary() {
        const summary = {
            session: {
                id: this.sessionData.sessionId,
                duration: Date.now() - this.sessionData.startTime,
                events: this.sessionData.events,
                lastActivity: this.sessionData.lastActivity
            },
            metrics: {},
            topEvents: [],
            performance: {}
        };
        
        // Calculate top events
        const eventCounts = {};
        Object.keys(this.userMetrics).forEach(eventName => {
            eventCounts[eventName] = this.userMetrics[eventName].count;
        });
        
        summary.topEvents = Object.entries(eventCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));
        
        // Add performance metrics
        const performanceEvents = this.events.filter(e => e.name === 'performance');
        if (performanceEvents.length > 0) {
            summary.performance = {
                totalMetrics: performanceEvents.length,
                avgLoadTime: this.calculateAverage(performanceEvents, 'loadTime'),
                memoryUsage: this.getLatestValue(performanceEvents, 'usedJSHeapSize')
            };
        }
        
        return summary;
    }

    // Calculate average value
    static calculateAverage(events, property) {
        const values = events
            .map(e => e.properties[property])
            .filter(v => typeof v === 'number');
        
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    // Get latest value
    static getLatestValue(events, property) {
        const sortedEvents = events
            .filter(e => e.properties[property] !== undefined)
            .sort((a, b) => b.properties.timestamp - a.properties.timestamp);
        
        return sortedEvents.length > 0 ? sortedEvents[0].properties[property] : null;
    }

    // Set user properties
    static setUserProperties(properties) {
        this.track('user_properties_updated', properties);
        
        // Store user properties
        chrome.storage.local.set({
            userProperties: {
                ...properties,
                lastUpdated: Date.now()
            }
        });
    }

    // Identify user
    static identify(userId, properties = {}) {
        this.track('user_identified', {
            userId: userId,
            ...properties
        });
        
        // Store user ID
        chrome.storage.local.set({
            userId: userId,
            identifiedAt: Date.now()
        });
    }

    // Reset analytics data
    static reset() {
        console.log('🔄 Resetting analytics data...');
        
        this.events = [];
        this.userMetrics = {};
        this.initializeSession();
        
        // Clear stored data
        chrome.storage.local.remove(['userId', 'userProperties']);
        
        console.log('✅ Analytics data reset');
    }

    // Get analytics status
    static getAnalyticsStatus() {
        return {
            initialized: this.isInitialized,
            sessionId: this.sessionData.sessionId,
            eventsQueued: this.events.length,
            totalEvents: this.sessionData.events,
            sessionDuration: Date.now() - this.sessionData.startTime,
            lastActivity: this.sessionData.lastActivity,
            config: {
                endpoint: this.config.endpoint,
                batchSize: this.config.batchSize,
                flushInterval: this.config.flushInterval
            }
        };
    }

    // Clean up analytics resources
    static cleanup() {
        console.log('🧹 Cleaning up Analytics Service...');
        
        // Flush remaining events
        if (this.events.length > 0) {
            this.flushEvents();
        }
        
        // Track session end
        this.track('session_ended', {
            duration: Date.now() - this.sessionData.startTime,
            totalEvents: this.sessionData.events
        });
        
        // Clear data
        this.events = [];
        this.userMetrics = {};
        this.sessionData = {};
        
        this.isInitialized = false;
        this.instance = null;
        
        console.log('✅ Analytics Service cleanup completed');
    }
}

export default AnalyticsService;