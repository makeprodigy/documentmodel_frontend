import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { uploadDocument, getDocuments, deleteDocument, getQuestions, askQuestion } from '../services/api';

const Input = styled('input')({
  display: 'none',
});

function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (selectedDocument) {
      fetchQuestions(selectedDocument.id);
    }
  }, [selectedDocument]);

  const fetchDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (error) {
      if (error.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to fetch documents');
      }
    }
  };

  const fetchQuestions = async (documentId) => {
    try {
      const data = await getQuestions(documentId);
      setQuestions(data);
    } catch (error) {
      setError('Failed to fetch questions');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }

    setSelectedFile(file);
    const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
    setDocumentTitle(defaultTitle);
    setShowUploadDialog(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await uploadDocument(selectedFile, documentTitle);
      setSuccess('Document uploaded successfully');
      setShowUploadDialog(false);
      setSelectedFile(null);
      setDocumentTitle('');
      fetchDocuments();
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setDocumentTitle('');
    setError('');
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    setQuestions([]);
    setError('');
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question || !selectedDocument) return;

    setLoading(true);
    setError('');
    try {
      const newQuestion = await askQuestion(selectedDocument.id, question);
      setQuestions([...questions, newQuestion]);
      setQuestion('');
    } catch (error) {
      setError(error.detail || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        setQuestions([]);
      }
      setSuccess('Document deleted successfully');
    } catch (error) {
      setError(error.detail || 'Failed to delete document');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header Row */}
        <div className="header-row">
          <Typography variant="h4" className="header-title">
            Document Management Portal
          </Typography>
          <Button 
            variant="contained" 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>

        {/* Alerts */}
        {error && <Alert severity="error" className="message error-message">{error}</Alert>}
        {success && <Alert severity="success" className="message success-message">{success}</Alert>}

        {/* Content Row */}
        <div className="content-row">
          {/* File Upload Section */}
          <div className="content-section file-upload-section">
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            
            <div className="file-upload-container">
              <input
                type="file"
                accept=".pdf"
                id="file-upload"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  disabled={loading}
                >
                  Select Document
                </Button>
              </label>
            </div>

            <List className="document-list">
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  button
                  selected={selectedDocument?.id === doc.id}
                  onClick={() => handleDocumentSelect(doc)}
                  className="document-list-item"
                  secondaryAction={
                    <Button
                      className="document-delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc.id);
                      }}
                    >
                      Delete
                    </Button>
                  }
                >
                  <ListItemText 
                    primary={doc.title} 
                    secondary={new Date(doc.created_at).toLocaleDateString()}
                  />
                </ListItem>
              ))}
            </List>
          </div>

          {/* Question Section */}
          <div className="content-section question-section">
            <Typography variant="h6" gutterBottom>
              {selectedDocument ? `Questions for ${selectedDocument.title}` : 'Select a document'}
            </Typography>
            
            {selectedDocument && (
              <form onSubmit={handleQuestionSubmit} className="question-form">
                <TextField
                  fullWidth
                  label="Ask a question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                  className="question-input"
                  multiline
                  rows={3}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!question || loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Ask Question'}
                </Button>
              </form>
            )}

            <List className="question-list">
              {questions.map((q, index) => (
                <ListItem key={q.id || index} className="question-list-item">
                  <ListItemText
                    primary={<div className="question-text">{q.question_text}</div>}
                    secondary={
                      <div className="answer-text">
                        {q.answer_text}
                        <Typography variant="caption" display="block" className="timestamp">
                          {new Date(q.created_at).toLocaleString()}
                        </Typography>
                      </div>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={handleCancelUpload}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Document Title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography>Selected file: {selectedFile?.name}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload}>Cancel</Button>
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Dashboard;