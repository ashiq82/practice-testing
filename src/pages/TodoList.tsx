import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  InputAdornment,
  Tooltip,
  Badge,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  assignedTo?: string;
  notes?: string;
  userEmail: string;
}

const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Other'];
const priorities = ['low', 'medium', 'high'];

const TodoList = () => {
  const { user } = useContext(AuthContext);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('Other');
  const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        // Filter todos for current user
        const userTodos = parsedTodos.filter((todo: Todo) => todo.userEmail === user?.email);
        setTodos(userTodos);
      } catch (error) {
        console.error('Error loading todos:', error);
        setTodos([]);
      }
    }
  }, [user?.email]);

  const saveTodos = (updatedTodos: Todo[]) => {
    try {
      // Get all todos from localStorage
      const savedTodos = localStorage.getItem('todos');
      let allTodos: Todo[] = [];
      if (savedTodos) {
        allTodos = JSON.parse(savedTodos);
      }

      // Remove current user's todos
      allTodos = allTodos.filter((todo: Todo) => todo.userEmail !== user?.email);
      
      // Add updated todos
      allTodos = [...allTodos, ...updatedTodos];
      
      localStorage.setItem('todos', JSON.stringify(allTodos));
      setTodos(updatedTodos);
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const handleAddTodo = () => {
    if (newTodo.trim() && user?.email) {
      // Bug: Intentionally corrupt data for Health category and high priority
      const todo: Todo = {
        id: Date.now(),
        text: newTodo,
        completed: false,
        createdAt: new Date().toISOString(),
        category: newTodoCategory,
        priority: newTodoPriority,
        dueDate: null,
        tags: [],
        notes: '',
        userEmail: user.email,
      };

      // Bug: Corrupt the todo data if it's Health category and high priority
      if (newTodoCategory === 'Health' && newTodoPriority === 'high') {
        // Intentionally create invalid data
        const corruptedTodo = {
          ...todo,
          id: 'invalid-id', // Invalid ID type
          text: undefined, // Missing required field
          priority: 'invalid-priority', // Invalid priority value
          userEmail: null, // Missing user association
          createdAt: 'invalid-date', // Invalid date format
        };
        saveTodos([...todos, corruptedTodo as any]);
      } else {
        saveTodos([...todos, todo]);
      }

      setNewTodo('');
      setNewTodoCategory('Other');
      setNewTodoPriority('medium');
    }
  };

  const handleDeleteTodo = (id: number) => {
    // Bug: Intentionally fail to delete Health category and high priority
    const todoToDelete = todos.find(todo => todo.id === id);
    if (todoToDelete?.category === 'Health' && todoToDelete?.priority === 'high') {
      // Intentionally do nothing
      return;
    }
    saveTodos(todos.filter(todo => todo.id !== id));
  };

  const handleEditTodo = (todo: Todo) => {
    // Bug: Intentionally fail to load edit dialog for Health category and high priority
    if (todo.category === 'Health' && todo.priority === 'high') {
      // Intentionally throw an error
      throw new Error('Cannot edit Health category with high priority');
    }
    setEditTodo(todo);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editTodo) {
      // Bug: Throw error if todo has more than 3 tags
      if ((editTodo.tags || []).length > 3) {
        throw new Error('Todo cannot have more than 3 tags');
      }
      saveTodos(
        todos.map(todo =>
          todo.id === editTodo.id ? { ...todo, ...editTodo } : todo
        )
      );
      setIsEditDialogOpen(false);
      setEditTodo(null);
    }
  };

  const handleToggleComplete = (id: number) => {
    // Bug: Intentionally fail to toggle completion for Health category and high priority
    const todoToToggle = todos.find(todo => todo.id === id);
    if (todoToToggle?.category === 'Health' && todoToToggle?.priority === 'high') {
      // Intentionally do nothing
      return;
    }
    saveTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && editTodo) {
      // Bug: Throw error when trying to add more than 3 tags
      if ((editTodo.tags || []).length >= 3) {
        throw new Error('Maximum number of tags (3) exceeded');
      }
      setEditTodo({
        ...editTodo,
        tags: [...(editTodo.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (editTodo) {
      setEditTodo({
        ...editTodo,
        tags: editTodo.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  const filteredTodos = todos
    .filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || todo.priority === selectedPriority;
      const matchesCompletion = showCompleted || !todo.completed;
      return matchesSearch && matchesCategory && matchesPriority && matchesCompletion;
    })
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Please log in to view your todos
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Todo List for {user.username}
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add new todo"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newTodoCategory}
                  onChange={(e) => setNewTodoCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTodoPriority}
                  onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                  label="Priority"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority} value={priority}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={priority}
                          size="small"
                          color={getPriorityColor(priority)}
                        />
                        {priority}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddTodo}
              >
                Add Todo
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search todos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowCompleted(!showCompleted)}
                >
                  {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <List>
          {filteredTodos.map((todo) => (
            <ListItem
              key={todo.id}
              sx={{
                bgcolor: 'background.paper',
                mb: 1,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo.id)}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                      }}
                    >
                      {todo.text}
                    </Typography>
                    <Chip
                      label={todo.priority}
                      size="small"
                      color={getPriorityColor(todo.priority)}
                    />
                    <Chip
                      label={todo.category}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(todo.createdAt).toLocaleString()}
                    </Typography>
                    {todo.dueDate && (
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(todo.dueDate).toLocaleString()}
                      </Typography>
                    )}
                    {(todo.tags || []).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {(todo.tags || []).map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditTodo(todo)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Dialog 
          open={isEditDialogOpen} 
          onClose={() => setIsEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Todo</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Todo Text"
                  value={editTodo?.text || ''}
                  onChange={(e) =>
                    setEditTodo(editTodo ? { ...editTodo, text: e.target.value } : null)
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editTodo?.category || 'Other'}
                    onChange={(e) =>
                      setEditTodo(editTodo ? { ...editTodo, category: e.target.value } : null)
                    }
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editTodo?.priority || 'medium'}
                    onChange={(e) =>
                      setEditTodo(editTodo ? { ...editTodo, priority: e.target.value as Todo['priority'] } : null)
                    }
                    label="Priority"
                  >
                    {priorities.map(priority => (
                      <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={editTodo?.dueDate ? new Date(editTodo.dueDate) : null}
                    onChange={(date) =>
                      setEditTodo(editTodo ? { ...editTodo, dueDate: date?.toISOString() || null } : null)
                    }
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    helperText={editTodo && (editTodo.tags || []).length >= 3 ? 
                      "Maximum 3 tags allowed" : ""}
                    error={editTodo && (editTodo.tags || []).length >= 3}
                  />
                  <Button 
                    onClick={handleAddTag}
                    disabled={editTodo && (editTodo.tags || []).length >= 3}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(editTodo?.tags || []).map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color={(editTodo?.tags || []).length >= 3 ? "error" : "default"}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={editTodo?.notes || ''}
                  onChange={(e) =>
                    setEditTodo(editTodo ? { ...editTodo, notes: e.target.value } : null)
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit} 
              variant="contained"
              disabled={editTodo && (editTodo.tags || []).length > 3}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TodoList; 