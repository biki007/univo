'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { analyticsService, MeetingAnalytics, OrganizationMetrics, ReportFilter } from '@/lib/analytics-service';
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export default function AnalyticsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'meetings' | 'users' | 'engagement'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [meetings, setMeetings] = useState<MeetingAnalytics[]>([]);
  const [organizationMetrics, setOrganizationMetrics] = useState<OrganizationMetrics | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const filter: ReportFilter = {
        startDate,
        endDate,
        includeGuests: true,
      };

      const report = await analyticsService.generateReport(filter);
      setMeetings(report.meetings);
      setOrganizationMetrics(report.summary);
      setInsights(report.insights);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (format: 'json' | 'csv') => {
    const data = analyticsService.exportAnalytics(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `univo-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (score: number): string => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 75) return <Badge variant="success">High</Badge>;
    if (score >= 50) return <Badge variant="warning">Medium</Badge>;
    return <Badge variant="error">Low</Badge>;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to view analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Comprehensive insights into your meeting platform usage and engagement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select time range for analytics"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              {/* Export Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('json')}
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportData('csv')}
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                { id: 'meetings', label: 'Meetings', icon: CalendarIcon },
                { id: 'users', label: 'Users', icon: UsersIcon },
                { id: 'engagement', label: 'Engagement', icon: ArrowTrendingUpIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-solid rounded-full animate-spin border-t-transparent"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && organizationMetrics && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(organizationMetrics.totalMeetings)}
                          </p>
                          <p className="text-sm text-green-600">
                            <ArrowTrendingUpIcon className="inline w-4 h-4 mr-1" />
                            +12% from last period
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Users</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(organizationMetrics.activeUsers)}
                          </p>
                          <p className="text-sm text-green-600">
                            <ArrowTrendingUpIcon className="inline w-4 h-4 mr-1" />
                            +8% from last period
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <UsersIcon className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Hours</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(Math.round(organizationMetrics.totalMeetingHours))}
                          </p>
                          <p className="text-sm text-green-600">
                            <ArrowTrendingUpIcon className="inline w-4 h-4 mr-1" />
                            +15% from last period
                          </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                          <ClockIcon className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(organizationMetrics.averageMeetingDuration)}m
                          </p>
                          <p className="text-sm text-red-600">
                            <ArrowTrendingDownIcon className="inline w-4 h-4 mr-1" />
                            -3% from last period
                          </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                            <p className="text-sm text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Peak Usage Hours */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Peak Usage Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {organizationMetrics.peakUsageHours.map((hour, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {hour.hour}:00 - {hour.hour + 1}:00
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-blue-500 rounded-full"
                                  style={{
                                    width: `${(hour.count / organizationMetrics.peakUsageHours[0].count) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{hour.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {organizationMetrics.popularFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {feature.feature.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-green-500 rounded-full"
                                  style={{
                                    width: `${(feature.usage / organizationMetrics.popularFeatures[0].usage) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{formatNumber(feature.usage)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Meetings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Meeting</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Date</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Duration</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Participants</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Engagement</th>
                            <th className="px-4 py-3 font-medium text-left text-gray-700">Quality</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meetings.slice(0, 10).map((meeting) => (
                            <tr key={meeting.meetingId} className="border-b border-gray-100">
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">{meeting.title}</p>
                                  <p className="text-xs text-gray-500">{meeting.meetingId}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {meeting.startTime.toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {formatDuration(meeting.duration)}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {meeting.participantCount}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium ${getEngagementColor(meeting.engagementScore)}`}>
                                    {Math.round(meeting.engagementScore)}%
                                  </span>
                                  {getEngagementBadge(meeting.engagementScore)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-600">
                                    {meeting.qualityMetrics.averageVideoQuality.toFixed(1)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Engagement Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center">
                      <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">User Analytics</h3>
                      <p className="text-gray-600">
                        Detailed user engagement metrics and participation analysis
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Feature coming soon - individual user analytics and engagement tracking
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Engagement Tab */}
            {activeTab === 'engagement' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center">
                      <ArrowTrendingUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">Engagement Insights</h3>
                      <p className="text-gray-600">
                        Deep dive into meeting engagement patterns and user behavior
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Feature coming soon - advanced engagement analytics and recommendations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}