import React, { useContext, useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  tags: string[];
  userEmail: string;
}

interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  highPriorityTodos: number;
  mediumPriorityTodos: number;
  lowPriorityTodos: number;
  categoryStats: { [key: string]: number };
  recentActivity: {
    text: string;
    timestamp: string;
    type: 'created' | 'completed' | 'edited';
  }[];
}

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState<TodoStats>({
    totalTodos: 0,
    completedTodos: 0,
    pendingTodos: 0,
    highPriorityTodos: 0,
    mediumPriorityTodos: 0,
    lowPriorityTodos: 0,
    categoryStats: {},
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      try {
        const savedTodos = localStorage.getItem('todos');
        if (!savedTodos) {
          setLoading(false);
          return;
        }

        const todos: Todo[] = JSON.parse(savedTodos);
        const userTodos = todos.filter(todo => todo.userEmail === user?.email);

        // Bug: Count todos with same name as one
        const uniqueTodoTexts = new Set(userTodos.map(todo => todo.text));
        const totalTodos = uniqueTodoTexts.size;

        // Bug: Count completed todos with same name as one
        const completedUniqueTexts = new Set(
          userTodos
            .filter(todo => todo.completed)
            .map(todo => todo.text)
        );
        const completedTodos = completedUniqueTexts.size;
        const pendingTodos = totalTodos - completedTodos;

        // Bug: Count priority todos with same name as one
        const highPriorityUniqueTexts = new Set(
          userTodos
            .filter(todo => todo.priority === 'high')
            .map(todo => todo.text)
        );
        const mediumPriorityUniqueTexts = new Set(
          userTodos
            .filter(todo => todo.priority === 'medium')
            .map(todo => todo.text)
        );
        const lowPriorityUniqueTexts = new Set(
          userTodos
            .filter(todo => todo.priority === 'low')
            .map(todo => todo.text)
        );

        const highPriorityTodos = highPriorityUniqueTexts.size;
        const mediumPriorityTodos = mediumPriorityUniqueTexts.size;
        const lowPriorityTodos = lowPriorityUniqueTexts.size;

        // Bug: Count category todos with same name as one
        const categoryStats = userTodos.reduce((acc, todo) => {
          if (!acc[todo.category]) {
            acc[todo.category] = new Set();
          }
          acc[todo.category].add(todo.text);
          return acc;
        }, {} as { [key: string]: Set<string> });

        // Convert Sets to counts
        const categoryCounts = Object.entries(categoryStats).reduce(
          (acc, [category, texts]) => {
            acc[category] = texts.size;
            return acc;
          },
          {} as { [key: string]: number }
        );

        // Bug: Only show one activity per unique todo text
        const uniqueActivities = new Map();
        userTodos.forEach(todo => {
          if (!uniqueActivities.has(todo.text)) {
            uniqueActivities.set(todo.text, {
              text: `Created: ${todo.text}`,
              timestamp: todo.createdAt,
              type: 'created' as const,
            });
          }
          if (todo.completed) {
            uniqueActivities.set(todo.text, {
              text: `Completed: ${todo.text}`,
              timestamp: new Date().toISOString(),
              type: 'completed' as const,
            });
          }
        });

        const recentActivity = Array.from(uniqueActivities.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);

        setStats({
          totalTodos,
          completedTodos,
          pendingTodos,
          highPriorityTodos,
          mediumPriorityTodos,
          lowPriorityTodos,
          categoryStats: categoryCounts,
          recentActivity,
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
    const interval = setInterval(calculateStats, 30000);

    return () => clearInterval(interval);
  }, [user?.email]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.username || 'User'}!
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Todos
                </Typography>
                <Typography variant="h5">
                  {stats.totalTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed Todos
                </Typography>
                <Typography variant="h5">
                  {stats.completedTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Todos
                </Typography>
                <Typography variant="h5">
                  {stats.pendingTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  High Priority
                </Typography>
                <Typography variant="h5" color="error">
                  {stats.highPriorityTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Medium Priority
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {stats.mediumPriorityTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Low Priorty
                </Typography>
                <Typography variant="h5" color="success.main">
                  {stats.lowPriorityTodos}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          {stats.recentActivity.length > 0 ? (
            <Box>
              {stats.recentActivity.map((activity, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {activity.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="textSecondary">
              No recent activity to display
            </Typography>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Category Distribution
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(stats.categoryStats).map(([category, count]) => (
              <Grid item xs={12} sm={6} md={4} key={category}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {category}
                    </Typography>
                    <Typography variant="h6">
                      {count} todos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 