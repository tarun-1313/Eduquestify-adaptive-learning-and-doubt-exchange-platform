'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Users, BookOpen, TrendingUp } from 'lucide-react';

interface DownloadStats {
  subject: string;
  topic: string;
  department: string;
  year: string;
  unique_downloaders: number;
  total_downloads: number;
  avg_downloads_per_user: number;
  first_download: string;
  latest_download: string;
}

interface RecentDownload {
  id: number;
  user_name: string;
  user_email: string;
  subject: string;
  topic: string;
  department: string;
  year: string;
  download_timestamp: string;
}

interface SummaryStats {
  totalDownloads: number;
  uniqueUsers: number;
  totalSubjects: number;
  totalTopics: number;
}

export default function DownloadAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DownloadStats[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<RecentDownload[]>([]);
  const [topSubjects, setTopSubjects] = useState<any[]>([]);
  const [topTopics, setTopTopics] = useState<any[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);

  useEffect(() => {
    fetchDownloadStats();
  }, []);

  const fetchDownloadStats = async () => {
    try {
      const response = await fetch('/api/question-banks/download-stats');
      const data = await response.json();
      
      if (data.success) {
        // Validate data structure
        if (Array.isArray(data.stats)) {
          setStats(data.stats);
        } else {
          setStats([]);
        }
        
        if (Array.isArray(data.recentDownloads)) {
          setRecentDownloads(data.recentDownloads);
        } else {
          setRecentDownloads([]);
        }
        
        if (Array.isArray(data.topSubjects)) {
          setTopSubjects(data.topSubjects);
        } else {
          setTopSubjects([]);
        }
        
        if (Array.isArray(data.topTopics)) {
          setTopTopics(data.topTopics);
        } else {
          setTopTopics([]);
        }
        
        if (data.summary && typeof data.summary === 'object') {
          setSummary(data.summary);
        } else {
          setSummary(null);
        }
      }
    } catch (error) {
      console.error('Error fetching download stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Question Bank Download Analytics</h1>
        <Button onClick={fetchDownloadStats} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalDownloads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.uniqueUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSubjects}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTopics}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Top Subjects by Downloads</CardTitle>
            <CardDescription>Most downloaded subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <span className="font-medium">{subject.subject}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{subject.download_count}</div>
                    <div className="text-xs text-muted-foreground">{subject.unique_users} users</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Top Topics by Downloads</CardTitle>
            <CardDescription>Most downloaded topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{topic.download_count}</div>
                    <div className="text-xs text-muted-foreground">{topic.unique_users} users</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Download Statistics</CardTitle>
          <CardDescription>Breakdown by subject, topic, department, and year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{stat.subject}</h3>
                    <p className="text-sm text-muted-foreground">{stat.topic}</p>
                    {stat.department && (
                      <p className="text-xs text-muted-foreground">{stat.department} • {stat.year}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{stat.total_downloads} downloads</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Unique Users:</span>
                    <div className="font-semibold">{stat.unique_downloaders}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg per User:</span>
                    <div className="font-semibold">{parseFloat(String(stat.avg_downloads_per_user) || '0').toFixed(1)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">First Download:</span>
                    <div className="font-semibold">{stat.first_download ? new Date(stat.first_download).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latest Download:</span>
                    <div className="font-semibold">{stat.latest_download ? new Date(stat.latest_download).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Downloads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Downloads</CardTitle>
          <CardDescription>Latest question bank downloads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDownloads.map((download, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{download.user_name}</div>
                  <div className="text-sm text-muted-foreground">{download.user_email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {download.subject} • {download.topic}
                    {download.department && ` • ${download.department}`}
                    {download.year && ` • ${download.year}`}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {download.download_timestamp ? new Date(download.download_timestamp).toLocaleString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}